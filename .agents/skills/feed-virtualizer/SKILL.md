---
name: feed-virtualizer
description: 60fps high-performance feed virtualization using react-window for 1,000+ to 10,000+ transaction rows.
---

# Feed Virtualization & 1,000+ Row Performance Guide

This skill describes how to achieve 60fps scrolling and memory-efficient rendering for 1,000+ to 10,000+ transaction rows using `react-window`.

---

## 1. Why Virtualization is Mandatory

Rendering 1,000+ complex DOM nodes simultaneously causes:
- Memory bloat on low-end Android mobile devices (360px width, 2-3GB RAM).
- Dropped frames (jank) during rapid scrolling.
- Slow filter and search re-renders.

`react-window` only renders the items currently visible inside the viewport (plus a small overscan buffer), maintaining constant DOM size (~15-20 nodes) regardless of total transaction count.

---

## 2. Implementation Pattern (`List`)

```tsx
import React, { useMemo } from 'react';
import { List } from 'react-window';
import { Transaction } from '../types';
import { TransactionRow } from './TransactionRow';

interface TransactionListProps {
  transactions: Transaction[];
  onSelectTransaction: (tx: Transaction) => void;
  height?: number;
}
```

---

## 3. Performance Best Practices

1. **`React.memo` on `TransactionRow`**: Wrap the row component in `React.memo` to eliminate re-renders when other list items update.
2. **Tabular Numeric Font**: Use `font-variant-numeric: tabular-nums` or `font-mono` on all amounts so numbers don't jitter during updates.
3. **Debounced Search Input**: Debounce the filter query by 250ms to prevent expensive re-filtering calculations on every keystroke.
