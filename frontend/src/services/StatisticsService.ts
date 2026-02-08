import axios from 'axios';

const API_BASE = 'http://localhost:8080/api/statistics';

export interface CodeStatistics {
  totalLines: number;
  codeLines: number;
  commentLines: number;
  blankLines: number;
  methodCount: number;
  classCount: number;
  interfaceCount: number;
  recordCount: number;
  packageCount: number;
}

export async function getFileStatistics(path: string): Promise<CodeStatistics> {
  const response = await axios.get(`${API_BASE}/file`, {
    params: { path }
  });
  return response.data;
}

export async function getDirectoryStatistics(path: string): Promise<CodeStatistics> {
  const response = await axios.get(`${API_BASE}/directory`, {
    params: { path }
  });
  return response.data;
}
