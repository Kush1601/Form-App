"use client";
import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

const API = "http://127.0.0.1:5001/api/admin";
const card = "bg-white/5 border border-white/10 rounded-2xl";
const tipStyle = { background: '#111', border: '1px solid #333', borderRadius: '8px' };
const axis = { fill: '#ffffff50', fontSize: 11 };

export default function AdminDashboard() {
    /**
     * ADMIN DASHBOARD ARCHITECTURE (5 Key Sections):
     * 1. Data State: holds the rows, pagination, and filter values directly in React memory.
     * 2. Data Loader: fetches paginated rows from the Flask API based on current filters.
     * 3. React Effects: auto-runs the loaders when variables (like page or filters) change.
     * 4. Delete Function: removes a row instantly from the UI and tells Flask to delete it.
     * 5. Chart Data Prep: formats the raw numbers so Recharts can draw the Pie and Bar graphs.
     */

    {/*  Data State (Holds rows, pagination, and filter values) */ }
    const [data, setData] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(1);
    const [stats, setStats] = useState({ complete: 0, incomplete: 0 });
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [timeline, setTimeline] = useState<any[]>([]);

    {/*  Data Loader (Fetches paginated rows from Flask API */ }
    const load = async (p = 1) => {
        let url = `${API}/responses?page=${p}&status=${statusFilter}`;
        if (dateFrom) url += `&from=${dateFrom}`;
        if (dateTo) url += `&to=${dateTo}`;

        const res = await fetch(url).then(r => r.json());
        setData(res.data);
        setTotal(res.total);
        setPages(res.pages);

        let c = 0, inc = 0;
        res.data.forEach((r: any) => r.status === 'COMPLETE' ? c++ : inc++);
        setStats({ complete: c, incomplete: inc });
    };

    {/*  Auto-run the loaders */ }
    useEffect(() => { load(page); }, [page, statusFilter, dateFrom, dateTo]);
    useEffect(() => { fetch(`${API}/analytics`).then(r => r.json()).then(setTimeline); }, []);

    {/*  Delete Function (Removes a row instantly) */ }
    const drop = async (id: number) => {
        await fetch(`${API}/responses/${id}`, { method: 'DELETE' });
        setData(prev => prev.filter(r => r.id !== id));
        setTotal(t => t - 1);
    };

    const pieData = [{ name: 'Complete', value: stats.complete, color: '#10b981' }, { name: 'Dropped', value: stats.incomplete, color: '#ef4444' }];
    const pct = stats.complete + stats.incomplete > 0 ? Math.round((stats.complete / (stats.complete + stats.incomplete)) * 100) : 0;
    const pctTimeline = timeline.map(d => ({ date: d.date, dropoutPct: d.complete + d.incomplete > 0 ? Math.round((d.incomplete / (d.complete + d.incomplete)) * 100) : 0 }));
    const clearFilters = () => { setDateFrom(""); setDateTo(""); setStatusFilter("ALL"); setPage(1); };
    const hasFilters = dateFrom || dateTo || statusFilter !== 'ALL';

    return (
        <div className="min-h-screen bg-black text-white p-8 font-sans">
            <h1 className="text-3xl font-light mb-2">Admin Dashboard</h1>
            <p className="text-white/40 mb-8 text-sm">{total} total responses across {pages} pages</p>

            <div className="grid grid-cols-3 gap-4 mb-8">
                <div className={`${card} p-5`}><p className="text-white/40 text-xs mb-1">Total</p><p className="text-2xl font-light">{total}</p></div>
                <div className={`${card} p-5`}><p className="text-white/40 text-xs mb-1">Completion Rate</p><p className="text-2xl font-light text-emerald-400">{pct}%</p></div>
                <div className={`${card} p-5`}><p className="text-white/40 text-xs mb-1">Dropped</p><p className="text-2xl font-light text-red-400">{stats.incomplete}</p></div>
            </div>


            <div className="flex gap-4 mb-8 items-end flex-wrap">
                <div><label className="text-white/40 text-xs block mb-1">From</label>
                    <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none" /></div>
                <div><label className="text-white/40 text-xs block mb-1">To</label>
                    <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none" /></div>
                <div><label className="text-white/40 text-xs block mb-1">Status</label>
                    <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none">
                        <option value="ALL">All</option><option value="COMPLETE">Complete</option><option value="INCOMPLETE">Incomplete</option>
                    </select></div>
                {hasFilters && <button onClick={clearFilters} className="text-white/40 hover:text-white text-sm underline">Clear filters</button>}
            </div>

            {/* Pie chart */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                <div className={`${card} p-6 h-72 flex flex-col`}>
                    <h3 className="text-white/50 text-sm mb-4">Completion Breakdown</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart><Pie data={pieData} innerRadius={55} outerRadius={75} paddingAngle={5} dataKey="value">
                            {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}</Pie><Tooltip contentStyle={tipStyle} /></PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Table */}
                <div className={`col-span-2 ${card} flex flex-col`}>
                    <div className="overflow-auto flex-1 p-6">
                        <table className="w-full text-left text-sm">
                            <thead><tr className="text-white/40 border-b border-white/10">
                                {['ID', 'Name', 'Status', 'Date', 'Feedback', ''].map((h, i) => <th key={i} className={`pb-3 font-medium ${h === 'Feedback' ? 'px-4' : ''}`}>{h}</th>)}
                            </tr></thead>
                            <tbody>{data.map(row => (
                                <tr key={row.id} className="border-b border-white/5 hover:bg-white/5 transition">
                                    <td className="py-3 text-white/40">#{row.id}</td>
                                    <td className="py-3">{row.first_name} {row.last_name}</td>
                                    <td className="py-3"><span className={`px-2 py-1 text-xs rounded-full ${row.status === 'COMPLETE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>{row.status}</span></td>
                                    <td className="py-3 text-white/40 text-xs">{row.created_at ? new Date(row.created_at).toLocaleDateString() : '—'}</td>
                                    <td className="py-3 px-4 text-white/60 truncate max-w-[200px]">{row.feedback_text || '—'}</td>
                                    <td className="py-3 text-right"><button onClick={() => drop(row.id)} className="text-white/20 hover:text-red-400 transition"><Trash2 size={15} /></button></td>
                                </tr>))}</tbody>
                        </table>
                    </div>
                    <div className="border-t border-white/10 px-6 py-3 flex items-center justify-between text-sm">
                        <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="text-white/40 hover:text-white disabled:opacity-30">← Prev</button>
                        <span className="text-white/30">Page {page} of {pages}</span>
                        <button disabled={page >= pages} onClick={() => setPage(p => p + 1)} className="text-white/40 hover:text-white disabled:opacity-30">Next →</button>
                    </div>
                </div>
            </div>

            {/* Bar chart */}
            <div className={`${card} p-6`}>
                <h3 className="text-white/50 text-sm mb-6">Response Frequency (Last 14 Days)</h3>
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={timeline}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                        <XAxis dataKey="date" tick={axis} tickFormatter={v => v.slice(5)} /><YAxis tick={axis} /><Tooltip contentStyle={tipStyle} />
                        <Bar dataKey="complete" fill="#10b981" radius={[4, 4, 0, 0]} name="Complete" />
                        <Bar dataKey="incomplete" fill="#ef4444" radius={[4, 4, 0, 0]} name="Incomplete" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Line chart */}
            <div className={`${card} p-6 mt-8`}>
                <h3 className="text-white/50 text-sm mb-6">Dropout Rate Over Time (%)</h3>
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={pctTimeline}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                        <XAxis dataKey="date" tick={axis} tickFormatter={v => v.slice(5)} /><YAxis tick={axis} unit="%" /><Tooltip contentStyle={tipStyle} formatter={(v) => `${v}%`} />
                        <Bar dataKey="dropoutPct" fill="#f97316" radius={[4, 4, 0, 0]} name="Dropout %" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
