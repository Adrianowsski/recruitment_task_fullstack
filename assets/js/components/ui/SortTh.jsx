import React from 'react';

export default function SortTh({ label, by, sort, setSort }) {
    const is = sort.by === by;
    const arrow = is ? (sort.dir === 'asc' ? '▲' : '▼') : '';
    return (
        <th role="button" onClick={() => setSort(s => ({ by, dir: is && s.dir==='asc' ? 'desc' : 'asc' }))}>
            {label} {arrow}
        </th>
    );
}
