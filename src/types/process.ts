
export interface Process {
  id: string;
  name: string;
  arrivalTime: number;
  burstTime: number;
  priority: number;
  color: string;
  remainingTime: number;
  startTime?: number;
  finishTime?: number;
  waitingTime?: number;
  turnaroundTime?: number;
  responseTime?: number;
  isRunning?: boolean;
}

export type SchedulingAlgorithm = 
  | "FCFS" 
  | "SJF" 
  | "SRTF" 
  | "Priority" 
  | "RoundRobin";

export interface SchedulerState {
  processes: Process[];
  readyQueue: Process[];
  completedProcesses: Process[];
  currentProcess: Process | null;
  currentTime: number;
  quantumTime: number;
  quantumLeft: number;
  isRunning: boolean;
  algorithm: SchedulingAlgorithm;
}
