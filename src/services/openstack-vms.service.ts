import axios from 'axios';
import { getOpenstackToken } from '../utils/openstack';

export async function getVmsUptime() {
  const novaUrl = process.env.OPENSTACK_COMPUTE_URL + '/servers/detail';
  const token = await getOpenstackToken();
  const response = await axios.get(novaUrl, {
    headers: { 'X-Auth-Token': token }
  });

  const now = new Date();
  return response.data.servers.map((vm: any) => {
    const launchedAt = vm['OS-SRV-USG:launched_at'] ? new Date(vm['OS-SRV-USG:launched_at']) : null;
    const terminatedAt = vm['OS-SRV-USG:terminated_at'] ? new Date(vm['OS-SRV-USG:terminated_at']) : null;

    let uptimeMs = 0;
    if (launchedAt) {
      if (!terminatedAt && vm.status === 'ACTIVE' && vm['OS-EXT-STS:power_state'] === 1) {
        uptimeMs = now.getTime() - launchedAt.getTime();
      } else if (terminatedAt) {
        uptimeMs = terminatedAt.getTime() - launchedAt.getTime();
      }
    }

    // Formato legible
    const uptimeHours = Math.floor(uptimeMs / 1000 / 60 / 60);
    const uptimeMins = Math.floor((uptimeMs / 1000 / 60) % 60);

    return {
      id: vm.id,
      name: vm.name,
      status: vm.status,
      launchedAt: vm['OS-SRV-USG:launched_at'],
      terminatedAt: vm['OS-SRV-USG:terminated_at'],
      uptimeMs,
      uptimeHuman: `${uptimeHours}h ${uptimeMins}m`
    };
  });
}
