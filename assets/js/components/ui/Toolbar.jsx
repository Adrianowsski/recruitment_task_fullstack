import React from 'react';

export default function Toolbar({ children, right }) {
    return (
        <div className="row g-2 align-items-end mb-3">
            <div className="col">{children}</div>
            <div className="col text-end">{right}</div>
        </div>
    );
}
