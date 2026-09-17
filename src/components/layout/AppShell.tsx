import React from "react";
import { Header } from "./Header";
import { MobileNav } from "./MobileNav";
import { SimulationBar } from "./SimulationBar";
import { MockApiDrawer } from "./MockApiDrawer";
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
  const [isMockApiOpen, setIsMockApiOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#060e1f] text-slate-950 dark:text-slate-50 flex flex-col font-sans transition-colors duration-200">
      {/* Top Header */}
      <Header
        onOpenSendMoney={onOpenSendMoney}
        onOpenMockApi={() => setIsMockApiOpen(true)}
      />

      {/* Main App Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-28 md:pb-20">
        {children}
      </main>

      {/* Right-Side Mock API Controls Drawer (Matching Media) */}
      <MockApiDrawer
        isOpen={isMockApiOpen}
        onClose={() => setIsMockApiOpen(false)}
      />

      {/* Interactive Simulation & Network Tester Toolbar Under (Kept Intact) */}
      <SimulationBar
        isOpen={isSimBarOpen}
        onToggle={() => setIsSimBarOpen((prev) => !prev)}
      />

      {/* Bottom Navigation for Mobile Devices */}
      <MobileNav
        activeTab={activeTab}
        onSelectTab={onSelectTab}
        onOpenSendMoney={onOpenSendMoney}
        onToggleDevControls={() => setIsMockApiOpen(true)}
      />

      {/* Global ARIA Toast Announcements */}
      <Toaster />
    </div>
  );
}

