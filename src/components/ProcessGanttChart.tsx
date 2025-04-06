
import React from "react";
import { useScheduler } from "../context/SchedulerContext";
import { Process } from "../types/process";

const ProcessGanttChart: React.FC = () => {
  const { state } = useScheduler();
  const timelineRef = React.useRef<HTMLDivElement>(null);
  
  // Combine completed and current processes for timeline
  const relevantProcesses = [
    ...state.completedProcesses,
    ...(state.currentProcess ? [state.currentProcess] : []),
  ];
  
  // Track execution history for Gantt chart
  const [executionHistory, setExecutionHistory] = React.useState<(Process | null)[]>([]);
  
  // Update execution history when time changes
  React.useEffect(() => {
    if (state.currentTime > executionHistory.length) {
      setExecutionHistory(prev => [
        ...prev, 
        state.currentProcess
      ]);
    } else if (state.currentTime === 0) {
      setExecutionHistory([]);
    }
  }, [state.currentTime, state.currentProcess]);
  
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
  
  // Find processes that were executed at each time unit
  const timelineBlocks = executionHistory.map((process, timeIndex) => ({
    time: timeIndex,
    process,
  }));
  
  return (
    <div className="bg-white rounded-lg shadow p-4 mt-4">
      <h2 className="text-xl font-semibold mb-4">Gantt Chart</h2>
      
      <div 
        ref={timelineRef}
        className="overflow-x-auto pb-4"
        style={{ maxWidth: "100%" }}
      >
        <div className="inline-flex min-w-full">
          {/* Gantt chart blocks */}
          <div className="flex">
            {timelineBlocks.map((block, index) => (
              <div key={index} className="flex flex-col items-center" style={{ minWidth: "40px" }}>
                <div 
                  className={`h-12 w-10 border border-gray-300 flex items-center justify-center ${
                    block.process ? block.process.color || 'bg-blue-100' : 'bg-gray-100'
                  }`}
                >
                  {block.process ? block.process.name : '—'}
                </div>
                <div className="text-xs mt-1">{block.time}</div>
              </div>
            ))}
            {/* Current time indicator */}
            <div className="flex flex-col items-center" style={{ minWidth: "40px" }}>
              <div className="h-12 w-10 border border-dashed border-gray-400 flex items-center justify-center bg-transparent">
              </div>
              <div className="text-xs mt-1">{state.currentTime}</div>
            </div>
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
