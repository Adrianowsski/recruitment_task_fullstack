import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getRates, getSupported } from '../api/client';
import SortTh from './ui/SortTh';
import SkeletonRow from './ui/SkeletonRow';
import Calculator from './Calculator';

export default function Dashboard() {
    const [date, setDate] = useState(new Date().toISOString().slice(0,10));
    const [supported, setSupported] = useState([]);
    const [rates, setRates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState('');
    const [filter, setFilter] = useState('');
    const [sort, setSort] = useState({ by:'code', dir:'asc' });

    useEffect(() => { getSupported().then(d => setSupported(d.supported || [])); }, []);

    const fetchRates = async () => {
        setLoading(true); setErr('');
        try {
            const d = await getRates(date);
            setRates(d.rates || []);
        } catch (e) { setErr(e.message); }
        finally { setLoading(false); }
    };
    useEffect(() => { fetchRates(); }, [date]);

    const rows = useMemo(() => {
        let r = [...rates];
        if (filter) {
            const q = filter.toLowerCase();
            r = r.filter(x => x.code.toLowerCase().includes(q) || x.name.toLowerCase().includes(q));
        }
        r.sort((a,b) => {
            const va = a[sort.by] ?? 0, vb = b[sort.by] ?? 0;
            return (va>vb?1:va<vb?-1:0) * (sort.dir==='asc'?1:-1);
        });
        return r;
    }, [rates, filter, sort]);

    return (
        <div className="container my-4">
            <div className="row g-2 align-items-end mb-3">
                <div className="col-auto">
                    <label className="form-label">Data</label>
                    <input type="date" className="form-control" value={date} onChange={e=>setDate(e.target.value)} />
                </div>
                <div className="col-auto">
                    <label className="form-label">Szukaj</label>
                    <input className="form-control" placeholder="EUR / euro…" value={filter} onChange={e=>setFilter(e.target.value)} />
                </div>
                <div className="col-auto">
                    <label className="form-label d-block">&nbsp;</label>
                    <button className="btn btn-primary" onClick={fetchRates} disabled={loading}>
                        {loading ? 'Ładowanie…' : 'Odśwież'}
                    </button>
                </div>
                <div className="col text-end">
                    <small className="text-muted">Obsługiwane: {supported.join(', ') || '—'}</small>
                </div>
            </div>

            {err && <div className="alert alert-danger py-2">{err}</div>}

            <div className="card shadow-sm">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <strong>Kursy sprzedaży/kupna</strong>
                    <small className="text-muted">PLN ↔ waluta</small>
                </div>
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                        <tr>
                            <SortTh label="Kod" by="code" sort={sort} setSort={setSort}/>
                            <SortTh label="Nazwa" by="name" sort={sort} setSort={setSort}/>
                            <SortTh label="Średni" by="mid"  sort={sort} setSort={setSort}/>
                            <SortTh label="Kupno"  by="buy"  sort={sort} setSort={setSort}/>
                            <th>Marża kupna</th>
                            <SortTh label="Sprzedaż" by="sell" sort={sort} setSort={setSort}/>
                            <th>Marża sprzedaży</th>
                            <th></th>
                        </tr>
                        </thead>
                        <tbody className="mono">
                        {loading && Array.from({length:5}).map((_,i)=> <SkeletonRow key={i} cols={8}/>)}
                        {!loading && rows.map(r=>{
                            const mBuy  = (r.buy  ?? null) !== null ? (r.buy  - r.mid) : null; // EUR/USD tylko
                            const mSell = r.sell - r.mid;
                            return (
                                <tr key={r.code}>
                                    <td className="fw-semibold">{r.code}</td>
                                    <td>{r.name}</td>
                                    <td>{r.mid?.toFixed(4)}</td>
                                    <td>{r.buy?.toFixed ? r.buy.toFixed(4) : '—'}</td>
                                    <td>{mBuy !== null ? (mBuy>0?'+':'') + mBuy.toFixed(4) : '—'}</td>
                                    <td>{r.sell?.toFixed(4)}</td>
                                    <td>{(mSell>0?'+':'') + mSell.toFixed(4)}</td>
                                    <td className="text-end">
                                        <Link className="btn btn-sm btn-outline-secondary" to={`/currency/${r.code}?date=${date}`}>
                                            Historia 14 dni
                                        </Link>
                                    </td>
                                </tr>
                            );
                        })}
                        {!loading && rows.length===0 && (
                            <tr><td colSpan="8" className="text-center text-muted py-4">Brak danych.</td></tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-3"><Calculator rates={rates} /></div>
        </div>
    );
}
