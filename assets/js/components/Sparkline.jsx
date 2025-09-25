import React, { useMemo, useRef, useState } from 'react';

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const fmtDate = iso => {
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}`;
};
const fmt4 = n => (typeof n === 'number' ? n.toFixed(4) : '—');

export default function Sparkline({
                                      data,
                                      title = 'Wartość (PLN)',
                                      width = 720,
                                      height = 160,
                                      pad = { t: 18, r: 14, b: 36, l: 64 }, // większy bottom na podpis „Data”
                                      color = '#1f6feb',
                                      xLabel = 'Data',
                                      yLabel = 'Cena (PLN)',
                                  }) {
    const svgRef = useRef(null);
    const [hover, setHover] = useState(null);

    const model = useMemo(() => {
        if (!data || data.length === 0) return null;

        const rows = [...data].sort((a,b)=> new Date(a.date) - new Date(b.date));
        const xs = rows.map(r => new Date(r.date).getTime());
        const ys = rows.map(r => r.sell);

        const yMin0 = Math.min(...ys), yMax0 = Math.max(...ys);
        const yr = yMax0 - yMin0 || 1;
        const yMin = yMin0 - yr * 0.04;
        const yMax = yMax0 + yr * 0.04;

        const W = width - pad.l - pad.r;
        const H = height - pad.t - pad.b;

        const X = t => pad.l + ((t - xs[0]) / (xs[xs.length-1] - xs[0] || 1)) * W;
        const Y = v => pad.t + H - ((v - yMin) / (yMax - yMin || 1)) * H;

        const pts = rows.map(r => ({ x: X(new Date(r.date).getTime()), y: Y(r.sell) }));

        const line = pts.map((p,i)=>`${i?'L':'M'}${p.x},${p.y}`).join(' ');
        const area = `M${pts[0].x},${pad.t+H} ${pts.map(p=>`L${p.x},${p.y}`).join(' ')} L${pts.at(-1).x},${pad.t+H} Z`;

        // 3 ticki Y (mniejsze, subtelne)
        const yTicks = Array.from({length:3}, (_,i)=>{
            const v = yMin + (i/2)*(yMax-yMin);
            return { v, y: Y(v) };
        });

        // 3 ticki X: start / środek / koniec
        const xIdx = [0, Math.round((rows.length-1)/2), rows.length-1];
        const xTicks = xIdx.map((i,k)=>({ date: rows[i].date, x: pts[i].x, pos: k }));

        return { rows, pts, line, area, yTicks, xTicks, pad, W, H };
    }, [data, width, height, pad]);

    if (!model) return <div className="text-muted small">Brak danych.</div>;
    const { rows, pts, line, area, yTicks, xTicks, pad: P } = model;

    const onMove = (e) => {
        const svg = svgRef.current; if (!svg) return;
        const r = svg.getBoundingClientRect();
        const localX = ((e.clientX - r.left) / r.width) * width;
        let best=Infinity, hi=0;
        for (let i=0;i<pts.length;i++){
            const d = Math.abs(localX - pts[i].x);
            if (d<best){best=d;hi=i;}
        }
        setHover({ i: hi, ...rows[hi], ...pts[hi] });
    };
    const onLeave = () => setHover(null);

    const tipW = 128, tipH = 40;
    const tipX = hover ? clamp(hover.x + 10, P.l, width - P.r - tipW) : 0;
    const tipY = hover ? clamp(hover.y - 46, P.t, height - P.b - tipH) : 0;

    return (
        <svg
            ref={svgRef}
            width="100%"
            viewBox={`0 0 ${width} ${height}`}
            role="img"
            aria-label={title}
            onMouseMove={onMove}
            onMouseLeave={onLeave}
            style={{ borderRadius: 12, background: '#fff', cursor: 'crosshair' }}
        >
            <defs>
                <linearGradient id="sArea" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.18"/>
                    <stop offset="100%" stopColor={color} stopOpacity="0.04"/>
                </linearGradient>
            </defs>

            {/* Tytuł */}
            <text x={P.l} y={P.t - 6} className="small" fill="#0f172a">{title}</text>

            {/* Siatka Y + ticki (mniejsze) */}
            {yTicks.map((t, i)=>(
                <g key={`y${i}`}>
                    <line x1={P.l} y1={t.y} x2={width-P.r} y2={t.y} stroke="#eef2f7" strokeWidth="1"/>
                    <text x={P.l-10} y={t.y} textAnchor="end" dominantBaseline="central"
                          className="axis-tick mono" fill="#a3aab3">
                        {fmt4(t.v)}
                    </text>
                </g>
            ))}

            {/* Oś X – podpisy dat */}
            {xTicks.map(t=>(
                <text
                    key={`${t.date}`}
                    x={t.pos===0 ? P.l : (t.pos===2 ? (width-P.r) : t.x)}
                    y={height-P.b+14}
                    textAnchor={t.pos===0 ? 'start' : (t.pos===2 ? 'end' : 'middle')}
                    className="axis-tick mono"
                    fill="#98a2b3"
                >
                    {fmtDate(t.date)}
                </text>
            ))}

            {/* Wypełnienie + linia */}
            <path d={area} fill="url(#sArea)"/>
            <path d={line} fill="none" stroke={color} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round"/>

            {/* Punkty */}
            {pts.map((p,i)=>(
                <circle key={`p${i}`} cx={p.x} cy={p.y} r="1.6" fill={color} opacity="0.5"/>
            ))}

            {/* Hover */}
            {hover && (
                <>
                    <line x1={hover.x} y1={P.t-3} x2={hover.x} y2={height-P.b+3} stroke="#cbd5e1" strokeDasharray="3 3"/>
                    <circle cx={hover.x} cy={pts[hover.i].y} r="4" fill={color}/>
                    <g transform={`translate(${tipX},${tipY})`}>
                        <rect width={tipW} height={tipH} rx="8" ry="8" fill="#fff" stroke="#e5e7eb"/>
                        <text x="10" y="18" className="mono" fill="#0f172a">{fmtDate(hover.date)}</text>
                        <text x="10" y="32" className="mono" fill={color}>{fmt4(hover.sell)} PLN</text>
                    </g>
                </>
            )}

            {/* Podpis osi Y (rotacja) */}
            <text
                x={12}
                y={P.t + (height - P.t - P.b) / 2}
                transform={`rotate(-90, 12, ${P.t + (height - P.t - P.b) / 2})`}
                className="axis-label"
                fill="#64748b"
            >
                {yLabel}
            </text>

            {/* Podpis osi X */}
            <text
                x={(width) / 2}
                y={height - 6}
                textAnchor="middle"
                className="axis-label"
                fill="#64748b"
            >
                {xLabel}
            </text>
        </svg>
    );
}
