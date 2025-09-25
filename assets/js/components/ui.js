import React from 'react';

export const Panel = ({ className='', children }) =>
    <div className={`panel p-3 p-md-4 ${className}`}>{children}</div>;

export const Toolbar = ({ children }) =>
    <div className="row g-2 align-items-end mb-3">{children}</div>;

export const Field = ({ label, children, className='col-auto' }) =>
    <div className={className}><label className="form-label">{label}</label>{children}</div>;

export const Skeleton = ({ h=24 }) =>
    <div className="skeleton" style={{height:h, borderRadius:8}} />;

export const ErrorAlert = ({ msg }) =>
    msg ? <div className="alert alert-danger py-2">{msg}</div> : null;

export const Mono = ({ children }) =>
    <span className="mono">{children}</span>;
