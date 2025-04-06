
import { Process, SchedulingAlgorithm } from "../types/process";

export const getNextProcess = (
  readyQueue: Process[],
  algorithm: SchedulingAlgorithm,
  currentTime: number,
  quantumTime: number
): { process: Process | null; newQuantumLeft: number } => {
  if (readyQueue.length === 0) {
    return { process: null, newQuantumLeft: quantumTime };
  }

  let selectedProcess: Process | null = null;
  let selectedIndex = -1;

  switch (algorithm) {
    case "FCFS":
      // First-Come-First-Served - select the process that arrived first
      selectedProcess = [...readyQueue].sort((a, b) => 
        a.arrivalTime === b.arrivalTime ? a.id.localeCompare(b.id) : a.arrivalTime - b.arrivalTime
      )[0];
      break;
      
    case "SJF":
      // Shortest Job First - select the process with the shortest burst time
      selectedProcess = [...readyQueue].sort((a, b) => 
        a.burstTime === b.burstTime 
          ? (a.arrivalTime === b.arrivalTime 
              ? a.id.localeCompare(b.id) 
              : a.arrivalTime - b.arrivalTime)
          : a.burstTime - b.burstTime
      )[0];
      break;
      
    case "SRTF":
      // Shortest Remaining Time First - select the process with the shortest remaining time
      selectedProcess = [...readyQueue].sort((a, b) => 
        a.remainingTime === b.remainingTime 
          ? (a.arrivalTime === b.arrivalTime 
              ? a.id.localeCompare(b.id) 
              : a.arrivalTime - b.arrivalTime)
          : a.remainingTime - b.remainingTime
      )[0];
      break;
      
    case "Priority":
      // Priority Scheduling - select the process with the highest priority (lower number = higher priority)
      selectedProcess = [...readyQueue].sort((a, b) => 
        a.priority === b.priority 
          ? (a.arrivalTime === b.arrivalTime 
              ? a.id.localeCompare(b.id) 
              : a.arrivalTime - b.arrivalTime)
          : a.priority - b.priority
      )[0];
      break;
      
    case "RoundRobin":
      // Round Robin - select the first process in the ready queue
      selectedProcess = readyQueue[0];
      break;
      
    default:
      console.error("Unknown scheduling algorithm:", algorithm);
      selectedProcess = readyQueue[0];
  }

  // If we found a process to run, return it with a full quantum
  return { 
    process: selectedProcess, 
    newQuantumLeft: quantumTime 
  };
};

export const calculateProcessMetrics = (processes: Process[]): {
  averageWaitingTime: number;
  averageTurnaroundTime: number;
  averageResponseTime: number;
  throughput: number;
} => {
  // Skip calculation if no processes
  if (processes.length === 0) {
    return {
      averageWaitingTime: 0,
      averageTurnaroundTime: 0,
      averageResponseTime: 0,
      throughput: 0
    };
  }

  let totalWaitingTime = 0;
  let totalTurnaroundTime = 0;
  let totalResponseTime = 0;
  let maxCompletionTime = 0;

  processes.forEach(process => {
    if (process.waitingTime !== undefined) {
      totalWaitingTime += process.waitingTime;
    }
    
    if (process.turnaroundTime !== undefined) {
      totalTurnaroundTime += process.turnaroundTime;
      maxCompletionTime = Math.max(maxCompletionTime, process.arrivalTime + process.turnaroundTime);
    }
    
    if (process.responseTime !== undefined) {
      totalResponseTime += process.responseTime;
    }
  });

  // Calculate averages
  const count = processes.length;
  const throughput = maxCompletionTime > 0 ? count / maxCompletionTime : 0;

  return {
    averageWaitingTime: totalWaitingTime / count,
    averageTurnaroundTime: totalTurnaroundTime / count,
    averageResponseTime: totalResponseTime / count,
    throughput
  };
};

export const getRandomColor = (): string => {
  const colors = [
    "bg-blue-200 border-blue-400",
    "bg-green-200 border-green-400",
    "bg-purple-200 border-purple-400",
    "bg-pink-200 border-pink-400",
    "bg-yellow-200 border-yellow-400",
    "bg-indigo-200 border-indigo-400",
    "bg-red-200 border-red-400",
    "bg-orange-200 border-orange-400",
    "bg-teal-200 border-teal-400",
  ];
  
  return colors[Math.floor(Math.random() * colors.length)];
};
