import axios from 'axios';

const api = axios.create({
    baseURL: window.location.origin + '/api',
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
    r => r,
    err => Promise.reject(new Error(
        err?.response?.data?.error || err?.message || 'Błąd sieci'
    ))
);

export const getRates     = (date)                  => api.get('/rates', { params: { date } }).then(r => r.data);
export const getHistory   = (code, date, days=14)   => api.get(`/rates/${code}/history`, { params: { date, days } }).then(r => r.data);
export const getSupported = ()                      => api.get('/meta/supported').then(r => r.data);

export default api;
