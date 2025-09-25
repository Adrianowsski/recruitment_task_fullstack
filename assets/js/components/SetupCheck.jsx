import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function SetupCheck() {
    const [loading, setLoading] = useState(true);
    const [ok, setOk] = useState(false);

    useEffect(() => {
        axios.get(`${window.location.origin}/api/setup-check?testParam=1`)
            .then(res => setOk(res.data && res.data.testParam === 1))
            .catch(() => setOk(false))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="alert alert-secondary">Sprawdzanie konfiguracji…</div>;
    return ok
        ? <div className="alert alert-success py-2">API działa poprawnie ✔</div>
        : <div className="alert alert-danger py-2">Błąd: API niedostępne ✖</div>;
}
