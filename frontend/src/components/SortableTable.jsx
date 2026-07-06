import { useState, useMemo } from 'react';

// Client-side sorting shared by every table so all listings support
// ascending/descending sorting on key fields.
export function useSort(items, initialKey = null) {
  const [sortKey, setSortKey] = useState(initialKey);
  const [sortDir, setSortDir] = useState('asc');

  const sorted = useMemo(() => {
    if (!sortKey) return items;
    const copy = [...items];
    copy.sort((a, b) => {
      let x = a[sortKey];
      let y = b[sortKey];
      // Nulls sort last.
      if (x == null) return 1;
      if (y == null) return -1;
      if (typeof x === 'string' && typeof y === 'string') {
        x = x.toLowerCase();
        y = y.toLowerCase();
      }
      if (x < y) return sortDir === 'asc' ? -1 : 1;
      if (x > y) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return copy;
  }, [items, sortKey, sortDir]);

  function toggle(key) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  return { sorted, sortKey, sortDir, toggle };
}

// A sortable table header cell.
export function Th({ label, sortKey, state }) {
  const active = state.sortKey === sortKey;
  return (
    <th className="sortable" onClick={() => state.toggle(sortKey)}>
      {label}
      {active && <span className="sort-arrow"> {state.sortDir === 'asc' ? '▲' : '▼'}</span>}
    </th>
  );
}
