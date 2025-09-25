import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import { getHistory } from '../api/client';
import Sparkline from './Sparkline';

const useQuery = () => new URLSearchParams(useLocation().search);

export default function CurrencyDetails() {
    const { code } = useParams();
    const q = useQuery();

    const [endDate, setEndDate] = useState(q.get('date') || new Date().toISOString().slice(0,10));
    const [days, setDays]       = useState(14);
    const [metric, setMetric]   = useState('sell');            // 'sell' | 'mid' | 'buy'
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr]         = useState('');

    const hasBuy = useMemo(() => ['EUR','USD'].includes(String(code).toUpperCase()), [code]);

    useEffect(() => {
        setLoading(true); setErr('');
        getHistory(code, endDate, days)
            .then(d => setHistory(d.history || []))
            .catch(e => setErr(e.message))
            .finally(() => setLoading(false));
    }, [code, endDate, days]);

    // prikładamy metrykę do pola `sell`, bo Sparkline czyta `sell`
    const plotData = useMemo(() => {
        if (!history.length) return [];
        const pick = r => metric === 'sell' ? r.sell : (metric === 'mid' ? r.mid : r.buy ?? null);
        return history.map(r => ({ ...r, sell: pick(r) })).filter(r => typeof r.sell === 'number');
    }, [history, metric]);

    const title = `${metric === 'sell' ? 'Sprzedaż' : metric === 'mid' ? 'Średni' : 'Kupno'} (PLN)`;
    const from = history[0]?.date || '—';
    const to   = history[history.length-1]?.date || '—';

    return (
        <div className="container my-4">
            <div className="d-flex align-items-center gap-2 mb-3">
                <Link to="/" className="btn btn-outline-secondary btn-sm">← Wróć</Link>
                <h3 className="h5 mb-0">Szczegóły: {code}</h3>
            </div>

            {/* Toolbar */}
            <div className="row g-2 align-items-end mb-3">
                <div className="col-auto">
                    <label className="form-label mb-1">Data końcowa</label>
                    <input type="date" className="form-control" value={endDate} onChange={e=>setEndDate(e.target.value)} />
                </div>
                <div className="col-auto">
                    <label className="form-label mb-1">Okno</label>
                    <select className="form-select" value={days} onChange={e=>setDays(Number(e.target.value))}>
                        <option value={7}>7 dni</option>
                        <option value={14}>14 dni</option>
                        <option value={30}>30 dni</option>
                    </select>
                </div>
                <div className="col-auto">
                    <label className="form-label mb-1">Metryka</label>
                    <div className="btn-group">
                        <button className={`btn btn-sm ${metric==='sell' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={()=>setMetric('sell')}>Sprzedaż</button>
                        <button className={`btn btn-sm ${metric==='mid'  ? 'btn-primary' : 'btn-outline-primary'}`} onClick={()=>setMetric('mid')}>Średni</button>
                        <button className={`btn btn-sm ${metric==='buy'  ? 'btn-primary' : 'btn-outline-primary'}`} onClick={()=>hasBuy && setMetric('buy')} disabled={!hasBuy} title={!hasBuy ? 'Dla tej waluty kantor nie prowadzi skupu' : ''}>Kupno</button>
                    </div>
                </div>
            </div>

            {err && <div className="alert alert-danger py-2">{err}</div>}

            {loading ? (
                <div className="skeleton" style={{height:180, borderRadius:8}}/>
            ) : (
                <>
                    <div className="card shadow-sm mb-3">
                        <div className="card-body">
                            <Sparkline
                                data={plotData}
                                title={title}
                                height={160}                // mniejszy, subtelny
                                width={720}
                                pad={{ t:18, r:14, b:28, l:68 }}  // większy lewy padding => brak kolizji z osią Y
                                color="#0d6efd"
                            />
                            <div className="d-flex flex-wrap justify-content-between text-muted small mt-2">
                                <span>Zakres: {from} → {to} (ostatnie {days} sesji NBP)</span>
                                <span>Reguły: EUR/USD kupno = mid − 0.15, sprzedaż = mid + 0.11; inne: tylko sprzedaż = mid + 0.20</span>
                            </div>
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="table table-sm align-middle">
                            <thead className="table-light">
                            <tr>
                                <th>Data</th><th>Średni</th><th>Kupno</th><th>Sprzedaż</th>
                            </tr>
                            </thead>
                            <tbody className="mono">
                            {history.map(r=>(
                                <tr key={r.date}>
                                    <td>{r.date}</td>
                                    <td>{r.mid?.toFixed(4)}</td>
                                    <td>{r.buy?.toFixed ? r.buy.toFixed(4) : '—'}</td>
                                    <td>{r.sell?.toFixed(4)}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}
