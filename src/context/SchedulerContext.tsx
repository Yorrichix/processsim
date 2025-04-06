
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
  | { type: "TICK" }
  | { type: "REMOVE_PROCESS"; processId: string }
  | { type: "EDIT_PROCESS"; process: Process };

const initialState: SchedulerState = {
  processes: [],
  readyQueue: [],
  completedProcesses: [],
  currentProcess: null,
  currentTime: 0,
  quantumTime: 2,
  quantumLeft: 2,
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
        currentProcess: state.currentProcess?.id === action.processId ? null : state.currentProcess,
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
        currentProcess: state.currentProcess?.id === updatedProcess.id 
          ? updatedProcess 
          : state.currentProcess,
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
      }));
      
      return {
        ...state,
        processes: resetProcesses,
        readyQueue: [],
        completedProcesses: [],
        currentProcess: null,
        currentTime: 0,
        quantumLeft: state.quantumTime,
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
        quantumLeft: action.quantumTime,
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
        p.id !== state.currentProcess?.id
      );
      
      // Add newly arrived processes to the ready queue
      let updatedReadyQueue = [...state.readyQueue, ...newArrivals];
      
      let updatedCurrentProcess = { ...state.currentProcess } as Process | null;
      let updatedCompletedProcesses = [...state.completedProcesses];
      let newQuantumLeft = state.quantumLeft;
      
      // If there's a current process running
      if (updatedCurrentProcess) {
        // Decrease remaining time by 1
        updatedCurrentProcess.remainingTime -= 1;
        newQuantumLeft -= 1;
        
        // If process is complete
        if (updatedCurrentProcess.remainingTime <= 0) {
          // Mark completion time
          updatedCurrentProcess.finishTime = newTime;
          updatedCurrentProcess.turnaroundTime = newTime - updatedCurrentProcess.arrivalTime;
          updatedCurrentProcess.waitingTime = updatedCurrentProcess.turnaroundTime - updatedCurrentProcess.burstTime;
          
          // Add to completed processes
          updatedCompletedProcesses.push(updatedCurrentProcess);
          updatedCurrentProcess = null;
          newQuantumLeft = state.quantumTime;
        } 
        // If using Round Robin and quantum is expired
        else if (state.algorithm === "RoundRobin" && newQuantumLeft <= 0) {
          // Move current process back to ready queue (at the end)
          updatedReadyQueue.push(updatedCurrentProcess);
          updatedCurrentProcess = null;
          newQuantumLeft = state.quantumTime;
        }
      }
      
      // If there's no current process, select a new one
      if (!updatedCurrentProcess && updatedReadyQueue.length > 0) {
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
          updatedCurrentProcess = nextProcess;
          newQuantumLeft = quantum;
        }
      }
      
      return {
        ...state,
        currentTime: newTime,
        readyQueue: updatedReadyQueue,
        currentProcess: updatedCurrentProcess,
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
