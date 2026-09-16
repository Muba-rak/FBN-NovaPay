import React, { useMemo } from 'react';
import { List } from 'react-window';
import { Transaction } from '../types';
import { TransactionRow } from './TransactionRow';

interface TransactionListProps {
  transactions: Transaction[];
  onSelectTransaction: (tx: Transaction) => void;
  height?: number;
}

interface RowProps {
  items: Transaction[];
  onSelect: (tx: Transaction) => void;
}

const Row = ({
  index,
  style,
  items,
  onSelect,
}: {
  ariaAttributes: {
    "aria-posinset": number;
    "aria-setsize": number;
    role: "listitem";
  };
  index: number;
  style: React.CSSProperties;
} & RowProps) => {
  const tx = items[index];
  if (!tx) return null;

  return (
    <div style={style} className="px-1 py-1.5">
      <TransactionRow transaction={tx} onSelect={onSelect} />
    </div>
  );
};

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onSelectTransaction,
  height = 580,
}) => {
  const rowProps = useMemo<RowProps>(
    () => ({
      items: transactions,
      onSelect: onSelectTransaction,
    }),
    [transactions, onSelectTransaction]
  );

  return (
    <div
      role="region"
      aria-label="Virtualized transaction history list"
      className="w-full rounded-2xl border border-slate-200/80 bg-slate-50/50 p-2.5"
    >
      <List
        rowCount={transactions.length}
        rowHeight={86}
        rowComponent={Row}
        rowProps={rowProps}
        defaultHeight={height}
        overscanCount={6}
        style={{ height: `${height}px`, width: '100%' }}
      />
    </div>
  );
};
