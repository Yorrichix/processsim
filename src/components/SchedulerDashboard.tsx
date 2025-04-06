
import React from "react";
import ProcessForm from "./ProcessForm";
import ProcessList from "./ProcessList";
import SimulationControls from "./SimulationControls";
import ProcessGanttChart from "./ProcessGanttChart";
import ProcessStatistics from "./ProcessStatistics";

const SchedulerDashboard: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Process Scheduling Simulator</h1>
        <p className="text-gray-600">
          Visualize and compare different CPU scheduling algorithms
        </p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="md:col-span-2">
          <ProcessList />
        </div>
        <div>
          <SimulationControls />
        </div>
      </div>
      
      <ProcessGanttChart />
      <ProcessStatistics />
    </div>
  );
};

export default SchedulerDashboard;
