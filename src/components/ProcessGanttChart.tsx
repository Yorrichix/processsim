
import React from "react";
import { useScheduler } from "../context/SchedulerContext";
import { Process } from "../types/process";

interface CpuTimelineEntry {
  time: number;
  processes: (Process | null)[];
}

const ProcessGanttChart: React.FC = () => {
  const { state } = useScheduler();
  const timelineRef = React.useRef<HTMLDivElement>(null);
  
  // Track execution history for Gantt chart
  const [executionHistory, setExecutionHistory] = React.useState<CpuTimelineEntry[]>([]);
  
  // Combine all processes that are relevant for visualization
  const relevantProcesses = [
    ...state.completedProcesses,
    ...state.currentProcesses.filter((p): p is Process => p !== null),
  ];
  
  // Update execution history when time or current processes change
  React.useEffect(() => {
    if (state.currentTime > executionHistory.length) {
      setExecutionHistory(prev => [
        ...prev, 
        {
          time: state.currentTime - 1,
          processes: [...state.currentProcesses]
        }
      ]);
    } else if (state.currentTime === 0) {
      setExecutionHistory([]);
    }
  }, [state.currentTime, state.currentProcesses]);
  
  // Scroll to end of timeline when it updates
  React.useEffect(() => {
    if (timelineRef.current) {
      timelineRef.current.scrollLeft = timelineRef.current.scrollWidth;
    }
  }, [executionHistory.length]);
  
  if (executionHistory.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-4 mt-4">
        <h2 className="text-xl font-semibold mb-4">Gantt Chart</h2>
        <div className="text-center py-8 text-gray-500">
          Start the simulation to see the Gantt chart.
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow p-4 mt-4">
      <h2 className="text-xl font-semibold mb-4">Gantt Chart</h2>
      
      <div 
        ref={timelineRef}
        className="overflow-x-auto pb-4"
        style={{ maxWidth: "100%" }}
      >
        <div className="inline-flex min-w-full flex-col">
          {/* CPU Labels */}
          <div className="flex border-b mb-2">
            <div className="w-16 flex-shrink-0"></div>
            {Array.from({ length: state.cpuCount }).map((_, i) => (
              <div key={i} className="font-medium px-2 py-1 text-center" style={{ minWidth: "40px" }}>
                CPU {i + 1}
              </div>
            ))}
          </div>
          
          {/* Time rows */}
          {executionHistory.map((entry, timeIndex) => (
            <div key={timeIndex} className="flex items-center mb-1">
              <div className="w-16 flex-shrink-0 text-right pr-2 text-sm font-medium">
                Time {entry.time}
              </div>
              
              {/* Processes for each CPU at this time */}
              {Array.from({ length: state.cpuCount }).map((_, cpuIndex) => {
                const process = cpuIndex < entry.processes.length ? entry.processes[cpuIndex] : null;
                return (
                  <div 
                    key={cpuIndex} 
                    className={`h-10 w-10 border border-gray-300 flex items-center justify-center ${
                      process ? process.color || 'bg-blue-100' : 'bg-gray-100'
                    }`}
                    style={{ minWidth: "40px" }}
                  >
                    {process ? process.name : '—'}
                  </div>
                );
              })}
            </div>
          ))}
          
          {/* Current time indicator */}
          <div className="flex items-center">
            <div className="w-16 flex-shrink-0 text-right pr-2 text-sm font-medium">
              Time {state.currentTime}
            </div>
            {Array.from({ length: state.cpuCount }).map((_, i) => (
              <div 
                key={i} 
                className="h-10 w-10 border border-dashed border-gray-400 flex items-center justify-center bg-transparent"
                style={{ minWidth: "40px" }}
              ></div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Legend */}
      {relevantProcesses.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">Legend:</h3>
          <div className="flex flex-wrap gap-2">
            {Array.from(new Set(relevantProcesses.map(p => p.id))).map(id => {
              const process = relevantProcesses.find(p => p.id === id);
              return process ? (
                <div 
                  key={process.id} 
                  className={`px-2 py-1 rounded-md text-xs ${process.color || 'bg-blue-100'}`}
                >
                  {process.name}
                </div>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcessGanttChart;
