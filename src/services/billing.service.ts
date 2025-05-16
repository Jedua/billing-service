import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const METRIC_API = process.env.METRIC_API || 'http://localhost:8041';

export class BillingService {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  async getCpuUsage(instanceId: string): Promise<any> {
    try {
      const response = await axios.get(`${METRIC_API}/v1/resource/${instanceId}/metric/cpu`, {
        headers: {
          'X-Auth-Token': this.token
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching CPU usage:', error);
      throw new Error('Error fetching CPU usage');
    }
  }

  async calculateBilling(instanceId: string): Promise<number> {
    const cpuData = await this.getCpuUsage(instanceId);
    const usage = cpuData?.measures?.reduce((acc: number, entry: any) => acc + entry[2], 0) || 0;
    const costPerCpuUnit = 0.05; // Example cost
    return usage * costPerCpuUnit;
  }
}