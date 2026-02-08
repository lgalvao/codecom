import axios from 'axios';

const API_BASE = '/api';

export interface StateNode {
  id: string;
  label: string;
  line: number;
  sourceType: string; // "ENUM" or "UNION"
}

export interface StateTransition {
  id: string;
  from: string;
  to: string;
  trigger: string;
  line: number;
}

export interface StateMachineInfo {
  variableName: string;
  variableType: string;
  states: StateNode[];
  transitions: StateTransition[];
  filePath: string;
  declarationLine: number;
}

export const StateMachineService = {
  async getStateMachines(filePath: string): Promise<StateMachineInfo[]> {
    const response = await axios.get(`${API_BASE}/state-machines`, {
      params: { path: filePath }
    });
    return response.data;
  }
};
