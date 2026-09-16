# Feed Virtualization & 1,000+ Row Performance Guide

This guide describes how to achieve 60fps scrolling and memory-efficient rendering for 1,000+ to 10,000+ transaction rows using `react-window`.

---

## 1. Why Virtualization is Mandatory

Rendering 1,000+ complex DOM nodes simultaneously causes:
- Memory bloat on low-end Android mobile devices (360px width, 2-3GB RAM).
- Dropped frames (jank) during rapid scrolling.
- Slow filter and search re-renders.

`react-window` only renders the items currently visible inside the viewport (plus a small overscan buffer), maintaining constant DOM size (~15-20 nodes) regardless of total transaction count.

---

## 2. Implementation Pattern (`FixedSizeList`)

```tsx
import React, { useMemo } from 'react';
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';
import { Transaction } from '../types';
import { TransactionRow } from './TransactionRow';

interface TransactionListProps {
  transactions: Transaction[];
  onSelectTransaction: (tx: Transaction) => void;
  height: number;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onSelectTransaction,
  height,
}) => {
  // Memoize itemData to prevent re-rendering all rows on parent re-renders
  const itemData = useMemo(() => ({
    items: transactions,
    onSelect: onSelectTransaction,
  }), [transactions, onSelectTransaction]);

  const Row = ({ index, style, data }: ListChildComponentProps<{
    items: Transaction[];
    onSelect: (tx: Transaction) => void;
  }>) => {
    const tx = data.items[index];
    if (!tx) return null;

    return (
      <div style={style} className="px-1 py-1">
        <TransactionRow transaction={tx} onSelect={() => data.onSelect(tx)} />
      </div>
    );
  };

  return (
    <List
      height={height}
      itemCount={transactions.length}
      itemSize={76} // Fixed accessible row height (px)
      width="100%"
      itemData={itemData}
      overscanCount={5}
    >
      {Row}
    </List>
  );
};
```

---

## 3. Performance Best Practices

1. **`React.memo` on `TransactionRow`**:
   Wrap the row component in `React.memo` with custom comparison if needed to eliminate re-renders when other list items update.
2. **Tabular Numeric Font**:
   Use `font-variant-numeric: tabular-nums` or `font-mono` on all amounts so numbers don't jitter during updates.
3. **Debounced Search Input**:
   Debounce the filter query by 250ms to prevent expensive re-filtering calculations on every keystroke.
