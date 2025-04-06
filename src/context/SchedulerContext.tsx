
import React, { createContext, useContext, useReducer } from "react";
import { Process, SchedulerState, SchedulingAlgorithm } from "../types/process";
import { getNextProcess, getRandomColor } from "../utils/schedulingAlgorithms";
import { useToast } from "@/components/ui/use-toast";

type SchedulerAction =
  | { type: "ADD_PROCESS"; process: Process }
  | { type: "RESET_SIMULATION" }
  | { type: "START_SIMULATION" }
  | { type: "PAUSE_SIMULATION" }
  | { type: "STEP_SIMULATION" }
  | { type: "SET_ALGORITHM"; algorithm: SchedulingAlgorithm }
  | { type: "SET_QUANTUM_TIME"; quantumTime: number }
  | { type: "SET_CPU_COUNT"; cpuCount: number }
  | { type: "TICK" }
  | { type: "REMOVE_PROCESS"; processId: string }
  | { type: "EDIT_PROCESS"; process: Process };

const initialState: SchedulerState = {
  processes: [],
  readyQueue: [],
  completedProcesses: [],
  currentProcesses: [null],
  cpuCount: 1,
  currentTime: 0,
  quantumTime: 2,
  quantumLeft: [2],
  isRunning: false,
  algorithm: "FCFS",
};

const SchedulerContext = createContext<{
  state: SchedulerState;
  dispatch: React.Dispatch<SchedulerAction>;
}>({
  state: initialState,
  dispatch: () => {},
});

const schedulerReducer = (state: SchedulerState, action: SchedulerAction): SchedulerState => {
  switch (action.type) {
    case "ADD_PROCESS": {
      const newProcess: Process = {
        ...action.process,
        remainingTime: action.process.burstTime,
        color: getRandomColor(),
      };
      return {
        ...state,
        processes: [...state.processes, newProcess],
      };
    }

    case "REMOVE_PROCESS": {
      return {
        ...state,
        processes: state.processes.filter(p => p.id !== action.processId),
        readyQueue: state.readyQueue.filter(p => p.id !== action.processId),
        currentProcesses: state.currentProcesses.map(p => 
          p?.id === action.processId ? null : p
        ),
      };
    }

    case "EDIT_PROCESS": {
      const updatedProcess: Process = {
        ...action.process,
        remainingTime: action.process.burstTime,
      };
      
      return {
        ...state,
        processes: state.processes.map(p => 
          p.id === updatedProcess.id ? updatedProcess : p
        ),
        readyQueue: state.readyQueue.map(p => 
          p.id === updatedProcess.id ? updatedProcess : p
        ),
        currentProcesses: state.currentProcesses.map(p => 
          p?.id === updatedProcess.id ? updatedProcess : p
        ),
      };
    }

    case "SET_CPU_COUNT": {
      const newCpuCount = action.cpuCount;
      
      // Adjust currentProcesses and quantumLeft arrays to match the new CPU count
      let currentProcesses = [...state.currentProcesses];
      let quantumLeft = [...state.quantumLeft];
      
      // If increasing CPU count, add nulls and full quantum times
      if (newCpuCount > state.cpuCount) {
        for (let i = state.cpuCount; i < newCpuCount; i++) {
          currentProcesses.push(null);
          quantumLeft.push(state.quantumTime);
        }
      } 
      // If decreasing CPU count, remove elements and put running processes back in the ready queue
      else if (newCpuCount < state.cpuCount) {
        const removedProcesses = currentProcesses.splice(newCpuCount)
          .filter((p): p is Process => p !== null);
        
        quantumLeft.splice(newCpuCount);
        
        // Put removed running processes back in the ready queue
        return {
          ...state,
          cpuCount: newCpuCount,
          currentProcesses,
          quantumLeft,
          readyQueue: [...state.readyQueue, ...removedProcesses],
        };
      }
      
      return {
        ...state,
        cpuCount: newCpuCount,
        currentProcesses,
        quantumLeft,
      };
    }

    case "RESET_SIMULATION": {
      // Reset processes to initial state
      const resetProcesses = state.processes.map(process => ({
        ...process,
        remainingTime: process.burstTime,
        startTime: undefined,
        finishTime: undefined,
        waitingTime: undefined,
        turnaroundTime: undefined,
        responseTime: undefined,
        isRunning: false,
        cpuId: undefined,
      }));
      
      return {
        ...state,
        processes: resetProcesses,
        readyQueue: [],
        completedProcesses: [],
        currentProcesses: Array(state.cpuCount).fill(null),
        quantumLeft: Array(state.cpuCount).fill(state.quantumTime),
        currentTime: 0,
        isRunning: false,
      };
    }

    case "START_SIMULATION": {
      return {
        ...state,
        isRunning: true,
      };
    }

    case "PAUSE_SIMULATION": {
      return {
        ...state,
        isRunning: false,
      };
    }

    case "SET_ALGORITHM": {
      return {
        ...state,
        algorithm: action.algorithm,
      };
    }

    case "SET_QUANTUM_TIME": {
      return {
        ...state,
        quantumTime: action.quantumTime,
        quantumLeft: Array(state.cpuCount).fill(action.quantumTime),
      };
    }

    case "STEP_SIMULATION":
    case "TICK": {
      const newTime = state.currentTime + 1;
      
      // Find processes that have arrived at the current time
      const newArrivals = state.processes.filter(
        p => p.arrivalTime === newTime && 
        !state.readyQueue.some(rp => rp.id === p.id) && 
        !state.completedProcesses.some(cp => cp.id === p.id) &&
        !state.currentProcesses.some(cp => cp?.id === p.id)
      );
      
      // Add newly arrived processes to the ready queue
      let updatedReadyQueue = [...state.readyQueue, ...newArrivals];
      
      // Create copies of current processes and quantum left arrays
      let updatedCurrentProcesses = [...state.currentProcesses];
      let updatedCompletedProcesses = [...state.completedProcesses];
      let newQuantumLeft = [...state.quantumLeft];
      
      // Process each CPU
      for (let cpuId = 0; cpuId < state.cpuCount; cpuId++) {
        // Get the current process for this CPU
        let currentProcess = updatedCurrentProcesses[cpuId];
        
        if (currentProcess) {
          // Decrease remaining time by 1
          currentProcess = { 
            ...currentProcess, 
            remainingTime: currentProcess.remainingTime - 1
          };
          
          // Update the current process in the array
          updatedCurrentProcesses[cpuId] = currentProcess;
          
          // Decrease quantum left for this CPU
          newQuantumLeft[cpuId] = newQuantumLeft[cpuId] - 1;
          
          // If process is complete
          if (currentProcess.remainingTime <= 0) {
            // Mark completion time
            currentProcess.finishTime = newTime;
            currentProcess.turnaroundTime = newTime - currentProcess.arrivalTime;
            currentProcess.waitingTime = currentProcess.turnaroundTime - currentProcess.burstTime;
            
            // Add to completed processes
            updatedCompletedProcesses.push(currentProcess);
            updatedCurrentProcesses[cpuId] = null;
            newQuantumLeft[cpuId] = state.quantumTime;
          } 
          // If using Round Robin and quantum is expired
          else if (state.algorithm === "RoundRobin" && newQuantumLeft[cpuId] <= 0) {
            // Move current process back to ready queue (at the end)
            updatedReadyQueue.push(currentProcess);
            updatedCurrentProcesses[cpuId] = null;
            newQuantumLeft[cpuId] = state.quantumTime;
          }
        }
      }
      
      // For each CPU that doesn't have a process, select a new one
      for (let cpuId = 0; cpuId < state.cpuCount; cpuId++) {
        if (!updatedCurrentProcesses[cpuId] && updatedReadyQueue.length > 0) {
          const { process: nextProcess, newQuantumLeft: quantum } = getNextProcess(
            updatedReadyQueue,
            state.algorithm,
            newTime,
            state.quantumTime
          );
          
          if (nextProcess) {
            // Remove the selected process from ready queue
            updatedReadyQueue = updatedReadyQueue.filter(p => p.id !== nextProcess.id);
            
            // If this is the first time this process starts running, set its start time
            if (nextProcess.startTime === undefined) {
              nextProcess.startTime = newTime;
              nextProcess.responseTime = newTime - nextProcess.arrivalTime;
            }
            
            nextProcess.isRunning = true;
            nextProcess.cpuId = cpuId;  // Assign CPU ID to the process
            
            updatedCurrentProcesses[cpuId] = nextProcess;
            newQuantumLeft[cpuId] = quantum;
          }
        }
      }
      
      return {
        ...state,
        currentTime: newTime,
        readyQueue: updatedReadyQueue,
        currentProcesses: updatedCurrentProcesses,
        completedProcesses: updatedCompletedProcesses,
        quantumLeft: newQuantumLeft,
        isRunning: action.type === "TICK" ? state.isRunning : false, // Stop after STEP
      };
    }

    default:
      return state;
  }
};

export const SchedulerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(schedulerReducer, initialState);
  const { toast } = useToast();

  // Listen for simulation completion
  React.useEffect(() => {
    const allProcessesComplete = 
      state.processes.length > 0 && 
      state.completedProcesses.length === state.processes.length;
    
    if (allProcessesComplete && state.isRunning) {
      dispatch({ type: "PAUSE_SIMULATION" });
      toast({
        title: "Simulation Complete",
        description: "All processes have completed execution.",
      });
    }
  }, [state.completedProcesses.length, state.processes.length, state.isRunning]);

  // Timer tick effect when simulation is running
  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (state.isRunning) {
      timer = setInterval(() => {
        dispatch({ type: "TICK" });
      }, 1000); // 1 second intervals
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [state.isRunning]);

  return (
    <SchedulerContext.Provider value={{ state, dispatch }}>
      {children}
    </SchedulerContext.Provider>
  );
};

export const useScheduler = () => useContext(SchedulerContext);
