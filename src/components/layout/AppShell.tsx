import React from "react";
import { Header } from "./Header";
import { MobileNav } from "./MobileNav";
import { SimulationBar } from "./SimulationBar";
import { Toaster } from "@/components/ui/toaster";

interface AppShellProps {
  children: React.ReactNode;
  activeTab: "dashboard" | "transactions";
  onSelectTab: (tab: "dashboard" | "transactions") => void;
  onOpenSendMoney: () => void;
}

export function AppShell({
  children,
  activeTab,
  onSelectTab,
  onOpenSendMoney,
}: AppShellProps) {
  const [isSimBarOpen, setIsSimBarOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 flex flex-col font-sans">
      {/* Top Header */}
      <Header onOpenSendMoney={onOpenSendMoney} />

      {/* Main App Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-28 md:pb-20">
        {children}
      </main>

      {/* Interactive Simulation & Network Tester Toolbar */}
      <SimulationBar
        isOpen={isSimBarOpen}
        onToggle={() => setIsSimBarOpen((prev) => !prev)}
      />

      {/* Bottom Navigation for Mobile Devices */}
      <MobileNav
        activeTab={activeTab}
        onSelectTab={onSelectTab}
        onOpenSendMoney={onOpenSendMoney}
        onToggleDevControls={() => setIsSimBarOpen((prev) => !prev)}
      />

      {/* Global ARIA Toast Announcements */}
      <Toaster />
    </div>
  );
}
