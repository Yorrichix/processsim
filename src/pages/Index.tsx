
import React from "react";
import Layout from "@/components/Layout";
import SchedulerDashboard from "@/components/SchedulerDashboard";
import { SchedulerProvider } from "@/context/SchedulerContext";

const Index = () => {
  return (
    <Layout>
      <SchedulerProvider>
        <SchedulerDashboard />
      </SchedulerProvider>
    </Layout>
  );
};

export default Index;
