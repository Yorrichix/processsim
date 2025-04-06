
import React from "react";
import { useScheduler } from "../context/SchedulerContext";
import { calculateProcessMetrics } from "../utils/schedulingAlgorithms";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const ProcessStatistics: React.FC = () => {
  const { state } = useScheduler();
  
  const metrics = calculateProcessMetrics(state.completedProcesses);
  
  // Format number to 2 decimal places
  const formatNumber = (num: number) => {
    return num.toFixed(2);
  };
  
  if (state.completedProcesses.length === 0) {
    return null;
  }
  
  return (
    <div className="bg-white rounded-lg shadow p-4 mt-4">
      <h2 className="text-xl font-semibold mb-4">Process Statistics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-medium text-blue-900 mb-1">Avg. Waiting Time</h3>
          <p className="text-2xl font-bold text-blue-700">{formatNumber(metrics.averageWaitingTime)}</p>
        </div>
        
        <div className="p-4 bg-purple-50 rounded-lg">
          <h3 className="text-sm font-medium text-purple-900 mb-1">Avg. Turnaround Time</h3>
          <p className="text-2xl font-bold text-purple-700">{formatNumber(metrics.averageTurnaroundTime)}</p>
        </div>
        
        <div className="p-4 bg-green-50 rounded-lg">
          <h3 className="text-sm font-medium text-green-900 mb-1">Avg. Response Time</h3>
          <p className="text-2xl font-bold text-green-700">{formatNumber(metrics.averageResponseTime)}</p>
        </div>
        
        <div className="p-4 bg-amber-50 rounded-lg">
          <h3 className="text-sm font-medium text-amber-900 mb-1">Throughput</h3>
          <p className="text-2xl font-bold text-amber-700">{formatNumber(metrics.throughput)}</p>
        </div>
      </div>
      
      {state.completedProcesses.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-2">Completed Processes</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Arrival</TableHead>
                  <TableHead>Burst</TableHead>
                  <TableHead>Start</TableHead>
                  <TableHead>Finish</TableHead>
                  <TableHead>Response</TableHead>
                  <TableHead>Waiting</TableHead>
                  <TableHead>Turnaround</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {state.completedProcesses.map((process) => (
                  <TableRow key={process.id}>
                    <TableCell className="font-medium">{process.name}</TableCell>
                    <TableCell>{process.arrivalTime}</TableCell>
                    <TableCell>{process.burstTime}</TableCell>
                    <TableCell>{process.startTime}</TableCell>
                    <TableCell>{process.finishTime}</TableCell>
                    <TableCell>{process.responseTime}</TableCell>
                    <TableCell>{process.waitingTime}</TableCell>
                    <TableCell>{process.turnaroundTime}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcessStatistics;
