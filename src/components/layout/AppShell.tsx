import React from 'react';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { SimulationBar } from './SimulationBar';
import { Toaster } from '@/components/ui/toaster';

interface AppShellProps {
  children: React.ReactNode;
  activeTab: 'dashboard' | 'transactions';
  onSelectTab: (tab: 'dashboard' | 'transactions') => void;
  onOpenSendMoney: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export function AppShell({
  children,
  activeTab,
  onSelectTab,
  onOpenSendMoney,
  isDarkMode,
  onToggleDarkMode,
}: AppShellProps) {
  const [isSimBarOpen, setIsSimBarOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-[#070D18] dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      
      {/* Top Header */}
      <Header
        onOpenSendMoney={onOpenSendMoney}
        isDarkMode={isDarkMode}
        onToggleDarkMode={onToggleDarkMode}
      />

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
