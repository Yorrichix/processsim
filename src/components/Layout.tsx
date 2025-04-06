
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-slate-50">
      <Toaster />
      <Sonner />
      <main className="py-8">{children}</main>
    </div>
  );
};

export default Layout;
