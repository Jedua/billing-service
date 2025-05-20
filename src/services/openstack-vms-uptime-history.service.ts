import axios from 'axios';
import { getOpenstackToken } from '../utils/openstack';

// OpenStack UTC parser
function parseOpenStackDate(dateStr: string) {
  return new Date(dateStr.replace(' ', 'T') + 'Z');
}

interface InstanceAction {
  action: string;
  start_time: string;
}

interface PeriodBlock {
  start: Date;
  end: Date | null;
  usedStart: Date;  // start (cortado al rango solicitado)
  usedEnd: Date;    // end (cortado al rango solicitado, o now/to)
  durationMs: number;
}

export async function getVmsUptimeHistory({ from, to }: { from: Date; to: Date }) {
  const fromUTC = from;
  const toUTC = to;

  const novaUrl = process.env.OPENSTACK_COMPUTE_URL + '/servers/detail';
  const token = await getOpenstackToken();
  const serversResp = await axios.get(novaUrl, { headers: { 'X-Auth-Token': token } });
  const servers = serversResp.data.servers;

  const results = [];

  for (const vm of servers) {
    const actionsUrl = `${process.env.OPENSTACK_COMPUTE_URL}/servers/${vm.id}/os-instance-actions`;
    const actionsResp = await axios.get(actionsUrl, { headers: { 'X-Auth-Token': token } });
    const actions: InstanceAction[] = actionsResp.data.instanceActions || [];

    actions.sort((a, b) =>
      parseOpenStackDate(a.start_time).getTime() - parseOpenStackDate(b.start_time).getTime()
    );

    let periods: Array<{ start: Date; end: Date | null }> = [];
    let currentStart: Date | null = null;

    for (const action of actions) {
      const actionTime = parseOpenStackDate(action.start_time);
      const upperAction = action.action.toUpperCase();

      if (['CREATE', 'POWER_ON', 'UNPAUSE', 'RESUME', 'START'].includes(upperAction)) {
        if (!currentStart) currentStart = actionTime;
      }

      if (['STOP', 'DELETE', 'SOFT_POWER_OFF', 'PAUSE', 'SUSPEND', 'SHELVE_OFFLOAD'].includes(upperAction)) {
        if (currentStart) {
          periods.push({ start: currentStart, end: actionTime });
          currentStart = null;
        }
      }
    }

    if (currentStart) {
      periods.push({ start: currentStart, end: null });
    }

    if (periods.length === 0) {
      const launchedAt = vm['OS-SRV-USG:launched_at'] ? parseOpenStackDate(vm['OS-SRV-USG:launched_at']) : null;
      const terminatedAt = vm['OS-SRV-USG:terminated_at'] ? parseOpenStackDate(vm['OS-SRV-USG:terminated_at']) : null;

      if (launchedAt) {
        periods.push({
          start: launchedAt,
          end: terminatedAt || (vm.status === 'SHUTOFF' ? terminatedAt : null)
        });
      }
    }

    let totalMs = 0;
    const blocks: PeriodBlock[] = [];
    for (const period of periods) {
      // Cortar cada bloque al rango solicitado
      const usedStart = period.start < fromUTC ? fromUTC : period.start;
      const usedEnd = period.end
        ? (period.end > toUTC ? toUTC : period.end)
        : (vm.status === 'ACTIVE' ? toUTC : new Date());

      const durationMs = (usedEnd > usedStart) ? (usedEnd.getTime() - usedStart.getTime()) : 0;
      if (durationMs > 0) {
        totalMs += durationMs;
        blocks.push({
          start: period.start,
          end: period.end,
          usedStart,
          usedEnd,
          durationMs,
        });
      }
    }

    const uptimeHours = Math.floor(totalMs / 1000 / 60 / 60);
    const uptimeMins = Math.floor((totalMs / 1000 / 60) % 60);

    results.push({
      id: vm.id,
      name: vm.name,
      uptimeMs: totalMs,
      uptimeUsed: `${uptimeHours}h ${uptimeMins}m`,
      status: vm.status,
      periods: blocks.map(b => ({
        start: b.start.toISOString(),
        end: b.end ? b.end.toISOString() : null,
        usedStart: b.usedStart.toISOString(),
        usedEnd: b.usedEnd.toISOString(),
        durationMs: b.durationMs,
        durationHuman: `${Math.floor(b.durationMs / 1000 / 60 / 60)}h ${Math.floor((b.durationMs / 1000 / 60) % 60)}m`
      }))
    });
  }

  return results;
}
