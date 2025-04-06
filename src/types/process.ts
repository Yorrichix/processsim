
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
  cpuId?: number; // Track which CPU is running this process
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
  currentProcesses: (Process | null)[];  // Array of currently running processes, one per CPU
  cpuCount: number;                     // Number of available CPUs
  currentTime: number;
  quantumTime: number;
  quantumLeft: number[];                // Array of quantum time left per CPU
  isRunning: boolean;
  algorithm: SchedulingAlgorithm;
}
