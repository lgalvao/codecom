import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StateMachineService } from '../StateMachineService';
import axios from 'axios';

vi.mock('axios');

describe('StateMachineService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getStateMachines', () => {
    it('calls the correct API endpoint', async () => {
      const mockResponse = { data: [] };
      axios.get.mockResolvedValue(mockResponse);

      await StateMachineService.getStateMachines('/test/File.java');

      expect(axios.get).toHaveBeenCalledWith('/api/state-machines', {
        params: { path: '/test/File.java' }
      });
    });

    it('returns state machines data', async () => {
      const mockData = [
        {
          variableName: 'status',
          variableType: 'Status',
          states: [
            { id: 'PENDING', label: 'PENDING', line: 2, sourceType: 'ENUM' }
          ],
          transitions: [],
          filePath: '/test/File.java',
          declarationLine: 5
        }
      ];
      
      axios.get.mockResolvedValue({ data: mockData });

      const result = await StateMachineService.getStateMachines('/test/File.java');

      expect(result).toEqual(mockData);
      expect(result[0].variableName).toBe('status');
      expect(result[0].states).toHaveLength(1);
    });

    it('returns empty array when no state machines found', async () => {
      axios.get.mockResolvedValue({ data: [] });

      const result = await StateMachineService.getStateMachines('/test/Simple.java');

      expect(result).toEqual([]);
    });

    it('handles API errors', async () => {
      axios.get.mockRejectedValue(new Error('Network error'));

      await expect(
        StateMachineService.getStateMachines('/test/File.java')
      ).rejects.toThrow('Network error');
    });

    it('encodes file path correctly', async () => {
      axios.get.mockResolvedValue({ data: [] });

      await StateMachineService.getStateMachines('/test/File with spaces.java');

      expect(axios.get).toHaveBeenCalledWith('/api/state-machines', {
        params: { path: '/test/File with spaces.java' }
      });
    });

    it('returns multiple state machines', async () => {
      const mockData = [
        {
          variableName: 'status',
          variableType: 'Status',
          states: [],
          transitions: [],
          filePath: '/test/File.java',
          declarationLine: 5
        },
        {
          variableName: 'phase',
          variableType: 'Phase',
          states: [],
          transitions: [],
          filePath: '/test/File.java',
          declarationLine: 10
        }
      ];
      
      axios.get.mockResolvedValue({ data: mockData });

      const result = await StateMachineService.getStateMachines('/test/File.java');

      expect(result).toHaveLength(2);
      expect(result[0].variableName).toBe('status');
      expect(result[1].variableName).toBe('phase');
    });

    it('preserves state node properties', async () => {
      const mockData = [
        {
          variableName: 'status',
          variableType: 'Status',
          states: [
            { id: 'ACTIVE', label: 'ACTIVE', line: 3, sourceType: 'ENUM' }
          ],
          transitions: [],
          filePath: '/test/File.java',
          declarationLine: 5
        }
      ];
      
      axios.get.mockResolvedValue({ data: mockData });

      const result = await StateMachineService.getStateMachines('/test/File.java');

      expect(result[0].states[0].id).toBe('ACTIVE');
      expect(result[0].states[0].label).toBe('ACTIVE');
      expect(result[0].states[0].line).toBe(3);
      expect(result[0].states[0].sourceType).toBe('ENUM');
    });

    it('preserves transition properties', async () => {
      const mockData = [
        {
          variableName: 'status',
          variableType: 'Status',
          states: [],
          transitions: [
            {
              id: 't1',
              from: 'PENDING',
              to: 'ACTIVE',
              trigger: 'activate',
              line: 10
            }
          ],
          filePath: '/test/File.java',
          declarationLine: 5
        }
      ];
      
      axios.get.mockResolvedValue({ data: mockData });

      const result = await StateMachineService.getStateMachines('/test/File.java');

      expect(result[0].transitions[0].from).toBe('PENDING');
      expect(result[0].transitions[0].to).toBe('ACTIVE');
      expect(result[0].transitions[0].trigger).toBe('activate');
      expect(result[0].transitions[0].line).toBe(10);
    });
  });
});
