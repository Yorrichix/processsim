
import React from "react";
import { Process } from "../types/process";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useScheduler } from "../context/SchedulerContext";
import ProcessForm from "./ProcessForm";

const ProcessList: React.FC = () => {
  const { state, dispatch } = useScheduler();
  const [editingProcess, setEditingProcess] = React.useState<Process | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const handleEditClick = (process: Process) => {
    setEditingProcess(process);
    setDialogOpen(true);
  };

  const handleEditComplete = () => {
    setEditingProcess(null);
    setDialogOpen(false);
  };

  const handleRemoveProcess = (id: string) => {
    dispatch({ type: "REMOVE_PROCESS", processId: id });
  };

  // Filter out completed processes if simulation is running or has started
  const displayProcesses = state.currentTime === 0 
    ? state.processes 
    : state.processes.filter(p => !state.completedProcesses.some(cp => cp.id === p.id));

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Process List</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">Add Process</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingProcess ? "Edit Process" : "Add New Process"}</DialogTitle>
            </DialogHeader>
            <ProcessForm 
              editProcess={editingProcess || undefined} 
              onComplete={handleEditComplete} 
            />
          </DialogContent>
        </Dialog>
      </div>

      {displayProcesses.length > 0 ? (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Arrival</TableHead>
                <TableHead>Burst</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>CPU</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayProcesses.map((process) => {
                // Determine process status
                let status = "Waiting";
                let statusClass = "text-gray-500";
                let cpuDisplay = "-";
                
                // Find if this process is currently running on any CPU
                const runningProcess = state.currentProcesses.find(p => p?.id === process.id);
                
                if (runningProcess) {
                  status = "Running";
                  statusClass = "text-green-600 font-medium";
                  cpuDisplay = `CPU ${runningProcess.cpuId !== undefined ? runningProcess.cpuId + 1 : '?'}`;
                } else if (state.readyQueue.some(p => p.id === process.id)) {
                  status = "Ready";
                  statusClass = "text-blue-600";
                } else if (state.completedProcesses.some(p => p.id === process.id)) {
                  status = "Completed";
                  statusClass = "text-gray-400";
                } else if (process.arrivalTime > state.currentTime) {
                  status = "Not Arrived";
                  statusClass = "text-orange-500";
                }

                return (
                  <TableRow key={process.id} className={runningProcess ? "bg-gray-50" : ""}>
                    <TableCell className="font-medium">{process.name}</TableCell>
                    <TableCell>{process.arrivalTime}</TableCell>
                    <TableCell>{process.burstTime}</TableCell>
                    <TableCell>{process.priority}</TableCell>
                    <TableCell className={statusClass}>{status}</TableCell>
                    <TableCell>{cpuDisplay}</TableCell>
                    <TableCell className="text-right">
                      {state.currentTime === 0 && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditClick(process)}
                            className="mr-2"
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveProcess(process.id)}
                          >
                            Remove
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No processes added yet. Click "Add Process" to get started.
        </div>
      )}
    </div>
  );
};

export default ProcessList;
