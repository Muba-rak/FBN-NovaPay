import React from 'react';
import { LayoutDashboard, Receipt, Send, Sliders } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileNavProps {
  activeTab: 'dashboard' | 'transactions';
  onSelectTab: (tab: 'dashboard' | 'transactions') => void;
  onOpenSendMoney: () => void;
  onToggleDevControls: () => void;
}

export function MobileNav({
  activeTab,
  onSelectTab,
  onOpenSendMoney,
  onToggleDevControls,
}: MobileNavProps) {
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#001A3A]/95 border-t border-slate-200 dark:border-slate-800 backdrop-blur-md px-2 py-1.5 transition-colors"
      aria-label="Mobile Bottom Navigation"
    >
      <div className="grid grid-cols-4 items-center justify-around">
        
        {/* Dashboard Tab */}
        <button
          type="button"
          onClick={() => onSelectTab('dashboard')}
          className={cn(
            'flex flex-col items-center justify-center py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer min-h-[44px]',
            activeTab === 'dashboard'
              ? 'text-[#002D62] dark:text-[#D4AF37]'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          )}
          aria-current={activeTab === 'dashboard' ? 'page' : undefined}
        >
          <LayoutDashboard className="h-5 w-5 mb-0.5" />
          <span>Dashboard</span>
        </button>

        {/* Transactions Tab */}
        <button
          type="button"
          onClick={() => onSelectTab('transactions')}
          className={cn(
            'flex flex-col items-center justify-center py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer min-h-[44px]',
            activeTab === 'transactions'
              ? 'text-[#002D62] dark:text-[#D4AF37]'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          )}
          aria-current={activeTab === 'transactions' ? 'page' : undefined}
        >
          <Receipt className="h-5 w-5 mb-0.5" />
          <span>Ledger</span>
        </button>

        {/* Send Money Button */}
        <button
          type="button"
          onClick={onOpenSendMoney}
          className="flex flex-col items-center justify-center py-1.5 text-xs font-medium rounded-lg text-slate-900 transition-colors cursor-pointer min-h-[44px]"
        >
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-[#D4AF37] text-slate-950 shadow-sm mb-0.5">
            <Send className="h-3.5 w-3.5" />
          </div>
          <span className="font-semibold text-slate-800 dark:text-amber-400">Transfer</span>
        </button>

        {/* Simulation / Dev Controls */}
        <button
          type="button"
          onClick={onToggleDevControls}
          className="flex flex-col items-center justify-center py-1.5 text-xs font-medium rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer min-h-[44px]"
        >
          <Sliders className="h-5 w-5 mb-0.5" />
          <span>Dev MSW</span>
        </button>

      </div>
    </nav>
  );
}
