
import React, { useState } from "react";
import { useScheduler } from "../context/SchedulerContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Process } from "../types/process";
import { useToast } from "@/components/ui/use-toast";

type ProcessFormProps = {
  editProcess?: Process;
  onComplete?: () => void;
};

const ProcessForm: React.FC<ProcessFormProps> = ({ editProcess, onComplete }) => {
  const { dispatch } = useScheduler();
  const { toast } = useToast();
  const [name, setName] = useState(editProcess?.name || `P${Math.floor(Math.random() * 1000)}`);
  const [arrivalTime, setArrivalTime] = useState(editProcess?.arrivalTime.toString() || "0");
  const [burstTime, setBurstTime] = useState(editProcess?.burstTime.toString() || "1");
  const [priority, setPriority] = useState(editProcess?.priority.toString() || "1");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    if (!name.trim()) {
      toast({
        variant: "destructive",
        title: "Invalid Input",
        description: "Process name cannot be empty",
      });
      return;
    }

    if (parseInt(burstTime) <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid Input",
        description: "Burst time must be greater than 0",
      });
      return;
    }

    const process: Process = {
      id: editProcess?.id || Date.now().toString(),
      name: name.trim(),
      arrivalTime: parseInt(arrivalTime) || 0,
      burstTime: parseInt(burstTime) || 1,
      priority: parseInt(priority) || 1,
      color: editProcess?.color || "",
      remainingTime: parseInt(burstTime) || 1,
    };

    if (editProcess) {
      dispatch({ type: "EDIT_PROCESS", process });
      toast({
        title: "Process Updated",
        description: `Process ${name} has been updated.`,
      });
    } else {
      dispatch({ type: "ADD_PROCESS", process });
      toast({
        title: "Process Added",
        description: `Process ${name} has been added to the queue.`,
      });
    }

    // Reset form if not editing
    if (!editProcess) {
      setName(`P${Math.floor(Math.random() * 1000)}`);
      setArrivalTime("0");
      setBurstTime("1");
      setPriority("1");
    }

    if (onComplete) {
      onComplete();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Process Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Process Name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="arrivalTime">Arrival Time</Label>
          <Input
            id="arrivalTime"
            type="number"
            min="0"
            value={arrivalTime}
            onChange={(e) => setArrivalTime(e.target.value)}
            placeholder="Arrival Time"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="burstTime">Burst Time</Label>
          <Input
            id="burstTime"
            type="number"
            min="1"
            value={burstTime}
            onChange={(e) => setBurstTime(e.target.value)}
            placeholder="Burst Time"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="priority">Priority (Lower is Higher)</Label>
          <Input
            id="priority"
            type="number"
            min="1"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            placeholder="Priority"
          />
        </div>
      </div>
      <Button type="submit" className="w-full">
        {editProcess ? "Update Process" : "Add Process"}
      </Button>
    </form>
  );
};

export default ProcessForm;
