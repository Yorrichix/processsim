
import React from "react";
import { Button } from "@/components/ui/button";
import { useScheduler } from "../context/SchedulerContext";
import { SchedulingAlgorithm } from "../types/process";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SimulationControls: React.FC = () => {
  const { state, dispatch } = useScheduler();
  const [quantumInput, setQuantumInput] = React.useState(state.quantumTime.toString());
  const [cpuCountInput, setCpuCountInput] = React.useState(state.cpuCount.toString());

  const handleAlgorithmChange = (value: string) => {
    dispatch({ type: "SET_ALGORITHM", algorithm: value as SchedulingAlgorithm });
  };

  const handleQuantumChange = () => {
    const quantum = parseInt(quantumInput);
    if (quantum > 0) {
      dispatch({ type: "SET_QUANTUM_TIME", quantumTime: quantum });
    }
  };

  const handleCpuCountChange = () => {
    const cpuCount = parseInt(cpuCountInput);
    if (cpuCount > 0 && cpuCount <= 8) {  // Limit to 8 CPUs for UI reasons
      dispatch({ type: "SET_CPU_COUNT", cpuCount });
    }
  };

  const handleStartStop = () => {
    if (state.processes.length === 0) {
      return; // Don't start if there are no processes
    }
    
    if (state.isRunning) {
      dispatch({ type: "PAUSE_SIMULATION" });
    } else {
      dispatch({ type: "START_SIMULATION" });
    }
  };

  const handleStep = () => {
    if (state.processes.length === 0) {
      return; // Don't step if there are no processes
    }
    
    dispatch({ type: "STEP_SIMULATION" });
  };

  const handleReset = () => {
    dispatch({ type: "RESET_SIMULATION" });
  };

  const isSimulationActive = state.currentTime > 0 || state.isRunning;
  const allProcessesComplete = 
    state.processes.length > 0 && 
    state.completedProcesses.length === state.processes.length;

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-xl font-semibold mb-4">Simulation Controls</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="space-y-2">
          <Label htmlFor="algorithm">Scheduling Algorithm</Label>
          <Select 
            disabled={isSimulationActive}
            onValueChange={handleAlgorithmChange} 
            value={state.algorithm}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select algorithm" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="FCFS">First Come First Served (FCFS)</SelectItem>
              <SelectItem value="SJF">Shortest Job First (SJF)</SelectItem>
              <SelectItem value="SRTF">Shortest Remaining Time First (SRTF)</SelectItem>
              <SelectItem value="Priority">Priority Scheduling</SelectItem>
              <SelectItem value="RoundRobin">Round Robin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="cpuCount">Number of CPUs</Label>
          <div className="flex space-x-2">
            <Input
              id="cpuCount"
              type="number"
              min="1"
              max="8"
              value={cpuCountInput}
              onChange={(e) => setCpuCountInput(e.target.value)}
              disabled={isSimulationActive}
              className="flex-1"
            />
            <Button onClick={handleCpuCountChange} disabled={isSimulationActive}>
              Set
            </Button>
          </div>
        </div>
        
        {state.algorithm === "RoundRobin" && (
          <div className="space-y-2">
            <Label htmlFor="quantum">Time Quantum</Label>
            <div className="flex space-x-2">
              <Input
                id="quantum"
                type="number"
                min="1"
                value={quantumInput}
                onChange={(e) => setQuantumInput(e.target.value)}
                disabled={isSimulationActive}
                className="flex-1"
              />
              <Button onClick={handleQuantumChange} disabled={isSimulationActive}>
                Set
              </Button>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex space-x-2 mb-4">
        <Button 
          onClick={handleStartStop} 
          disabled={state.processes.length === 0 || allProcessesComplete}
          variant={state.isRunning ? "destructive" : "default"}
          className="flex-1"
        >
          {state.isRunning ? "Pause" : "Start"}
        </Button>
        <Button 
          onClick={handleStep} 
          disabled={state.isRunning || state.processes.length === 0 || allProcessesComplete}
          variant="outline"
          className="flex-1"
        >
          Step
        </Button>
        <Button 
          onClick={handleReset} 
          variant="outline" 
          className="flex-1"
        >
          Reset
        </Button>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="text-center text-xl font-semibold">
          Current Time: {state.currentTime}
        </div>
        <div className="text-center text-lg">
          Active CPUs: {state.currentProcesses.filter(p => p !== null).length}/{state.cpuCount}
        </div>
      </div>
    </div>
  );
};

export default SimulationControls;
