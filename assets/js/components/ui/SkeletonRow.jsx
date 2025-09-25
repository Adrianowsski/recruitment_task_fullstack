import React from 'react';
export default function SkeletonRow({ cols=5 }) {
    return (
        <tr><td colSpan={cols}>
            <div className="skeleton" style={{height:24,borderRadius:8}}/>
        </td></tr>
    );
}
