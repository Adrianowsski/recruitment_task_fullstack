import React, { useMemo, useState } from 'react';

const fmt = (n, d = 2) =>
    typeof n === 'number'
        ? n.toLocaleString('pl-PL', { minimumFractionDigits: d, maximumFractionDigits: d })
        : '—';

const f4 = (n) => (typeof n === 'number' ? n.toFixed(4) : '—');

/** PLN→FX (sprzedaż) dla wszystkich; FX→PLN (kupno) tylko EUR/USD. */
export default function Calculator({ rates }) {
    const [mode, setMode] = useState('PLN→FX');
    const [code, setCode] = useState('EUR');
    const [amt, setAmt] = useState(1000);

    const rate = useMemo(() => rates.find((r) => r.code === code), [rates, code]);
    const hasBuy = useMemo(() => ['EUR', 'USD'].includes(code), [code]);

    const model = useMemo(() => {
        if (!rate || !amt) {
            return { label: '—', used: null, perUnit: null, txn: null, legend: '', note: '' };
        }

        const { mid, sell, buy } = rate;

        if (mode === 'PLN→FX') {
            const units = sell ? amt / sell : 0;
            const perUnit = sell && mid ? (sell - mid) : null;
            const txn = perUnit != null ? perUnit * units : null;

            return {
                label: `${fmt(units, 2)} ${code}`,
                used: sell,
                perUnit,
                txn,
                legend: 'sprzedaż',
                note: '',
            };
        }

        // FX→PLN
        if (!hasBuy || !buy) {
            return {
                label: '—',
                used: null,
                perUnit: null,
                txn: null,
                legend: 'kupno',
                note: 'Kantor nie kupuje tej waluty (dostępne: EUR, USD).',
            };
        }

        const pln = amt * buy;
        const perUnit = mid ? (mid - buy) : null;
        const txn = perUnit != null ? perUnit * amt : null;

        return {
            label: `${fmt(pln, 2)} PLN`,
            used: buy,
            perUnit,
            txn,
            legend: 'kupno',
            note: '',
        };
    }, [mode, amt, rate, code, hasBuy]);

    return (
        <div className="card shadow-sm">
            <div className="card-header"><strong>Kalkulator wymiany</strong></div>

            <div className="card-body row g-3">
                <div className="col-6 col-md-3">
                    <label className="form-label">Kierunek</label>
                    <select className="form-select" value={mode} onChange={(e) => setMode(e.target.value)}>
                        <option>PLN→FX</option>
                        <option>FX→PLN</option>
                    </select>
                </div>

                <div className="col-6 col-md-3">
                    <label className="form-label">Waluta</label>
                    <select className="form-select" value={code} onChange={(e) => setCode(e.target.value)}>
                        {rates.map((r) => (
                            <option key={r.code} value={r.code}>{r.code}</option>
                        ))}
                    </select>
                </div>

                <div className="col-12 col-md-3">
                    <label className="form-label">Kwota</label>
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="form-control"
                        value={amt}
                        onChange={(e) => setAmt(Number(e.target.value) || 0)}
                    />
                    <div className="d-flex gap-2 mt-2">
                        {[100, 500, 1000].map((v) => (
                            <button key={v} className="btn btn-sm btn-outline-secondary" onClick={() => setAmt(v)}>
                                {v}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="col-12 col-md-3 d-flex align-items-end">
                    <div className="w-100 text-end">
                        <div className="text-muted small">
                            Kurs: {model.used != null ? f4(model.used) : '—'} ({model.legend})
                        </div>
                        {model.perUnit != null && (
                            <div className="text-muted small">
                                Marża: {model.perUnit >= 0 ? '+' : ''}
                                {f4(model.perUnit)} PLN (vs NBP)
                            </div>
                        )}
                        <div className="fs-4 mono">{model.label}</div>
                        {model.txn != null && (
                            <div className="text-muted small">
                                Marża z transakcji: {fmt(model.txn, 2)} PLN
                            </div>
                        )}
                        {model.note && <div className="text-warning small">{model.note}</div>}
                    </div>
                </div>
            </div>
        </div>
    );
}
