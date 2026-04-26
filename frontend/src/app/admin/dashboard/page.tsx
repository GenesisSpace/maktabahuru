'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { SUBJECT_INFO } from '@/lib/subjects';
import AddMaterialModal from '@/components/admin/AddMaterialModal';

interface Material {
  _id: string; title: string; subject: string; type: string;
  isPublished: boolean; views: number; downloads: number;
  classes: string[]; createdAt: string;
}
interface Stats { total: number; published: number; kids: number; bySubject: any[]; }

export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<'materials' | 'stats'>('materials');
  const [materials, setMaterials] = useState<Material[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [filterSubject, setFilterSubject] = useState('');
  const [filterType, setFilterType] = useState('');
  const [search, setSearch] = useState('');
  const [admin, setAdmin] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) { router.push('/admin/login'); return; }
    const a = localStorage.getItem('adminUser');
    if (a) setAdmin(JSON.parse(a));
    loadData();
  }, []); // eslint-disable-line

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [mRes, sRes] = await Promise.all([
        api.get('/admin/materials', { params: { limit: 100 } }),
        api.get('/admin/stats'),
      ]);
      setMaterials(mRes.data.data);
      setStats(sRes.data.data);
    } catch (err: any) {
      if (err.response?.status === 401) { localStorage.clear(); router.push('/admin/login'); }
    } finally { setLoading(false); }
  }, [router]);

  const togglePublish = async (id: string, current: boolean) => {
    await api.put(`/admin/materials/${id}`, { isPublished: !current });
    setMaterials(prev => prev.map(m => m._id === id ? { ...m, isPublished: !current } : m));
  };

  const deleteMat = async (id: string) => {
    if (!confirm('Delete this material?')) return;
    await api.delete(`/admin/materials/${id}`);
    setMaterials(prev => prev.filter(m => m._id !== id));
  };

  const logout = () => { localStorage.clear(); router.push('/admin/login'); };

  const filtered = materials.filter(m => {
    if (filterSubject && m.subject !== filterSubject) return false;
    if (filterType && m.type !== filterType) return false;
    if (search && !m.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const S = { fontFamily: "'DM Sans', sans-serif" };

  return (
    <div style={{ minHeight: '100vh', background: '#f8f7f4', ...S }}>

      {/* Top bar */}
      <div style={{ background: '#0d3d26', padding: '0 20px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src="/logo.png" alt="Logo" style={{ height: 32, objectFit: 'contain' }} />
          <span style={{ fontFamily: "'Playfair Display', serif", color: 'white', fontSize: 16, fontWeight: 700 }}>Maktaba Huru — Admin</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {admin && <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>{admin.name}</span>}
          <button onClick={() => router.push('/')}
            style={{ color: 'rgba(255,255,255,0.7)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>
            View Site
          </button>
          <button onClick={logout}
            style={{ color: 'rgba(255,255,255,0.7)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>
            Sign Out
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 20px' }}>

        {/* Stats cards */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
            {[
              { label: 'Total Materials', value: stats.total, color: '#1d4ed8', bg: '#eff6ff' },
              { label: 'Published', value: stats.published, color: '#166534', bg: '#f0fdf4' },
              { label: 'Kids Materials', value: stats.kids, color: '#9d174d', bg: '#fdf2f8' },
            ].map(s => (
              <div key={s.label} style={{ background: s.bg, borderRadius: 12, padding: '18px 20px', border: `1px solid ${s.color}22` }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: s.color, fontFamily: "'Playfair Display', serif" }}>{s.value}</div>
                <div style={{ fontSize: 13, color: s.color + 'aa', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tab bar + Add button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          {(['materials', 'stats'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', background: tab === t ? '#0d3d26' : 'white', color: tab === t ? 'white' : '#555', boxShadow: tab === t ? 'none' : '0 1px 4px rgba(0,0,0,0.08)' }}>
              {t === 'materials' ? 'All Materials' : 'Statistics'}
            </button>
          ))}
          <button onClick={() => { setEditItem(null); setShowModal(true); }}
            style={{ marginLeft: 'auto', background: '#c8922a', color: 'white', padding: '8px 20px', borderRadius: 8, fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
            Add Material
          </button>
        </div>

        {/* Materials tab */}
        {tab === 'materials' && (
          <>
            {/* Filter row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
              <div style={{ position: 'relative' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}>
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search title..."
                  style={{ paddingLeft: 30, paddingRight: 12, paddingTop: 8, paddingBottom: 8, border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', width: 180 }} />
              </div>
              <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)}
                style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 12px', fontSize: 13, background: 'white' }}>
                <option value="">All subjects</option>
                {Object.keys(SUBJECT_INFO).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={filterType} onChange={e => setFilterType(e.target.value)}
                style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 12px', fontSize: 13, background: 'white' }}>
                <option value="">All types</option>
                <option value="book">Book</option>
                <option value="video">Video</option>
                <option value="story">Story</option>
                <option value="audio">Audio</option>
              </select>
              <span style={{ fontSize: 13, color: '#999', alignSelf: 'center' }}>{filtered.length} items</span>
            </div>

            {/* Table */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: 60, color: '#999' }}>Loading...</div>
            ) : (
              <div style={{ background: 'white', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#f9fafb', borderBottom: '1px solid #f3f4f6' }}>
                      {['Title', 'Subject', 'Type', 'Status', 'Views', 'Actions'].map(h => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#555', fontSize: 12 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 && (
                      <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#bbb' }}>No materials found</td></tr>
                    )}
                    {filtered.map(m => (
                      <tr key={m._id} style={{ borderBottom: '1px solid #f9fafb' }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#fafafa')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'white')}>
                        <td style={{ padding: '12px 16px', maxWidth: 220 }}>
                          <div style={{ fontWeight: 600, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.title}</div>
                          <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>{m.classes?.slice(0, 2).join(', ')}</div>
                        </td>
                        <td style={{ padding: '12px 16px', color: '#555' }}>{m.subject}</td>
                        <td style={{ padding: '12px 16px', color: '#555', textTransform: 'capitalize' }}>{m.type}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: m.isPublished ? '#dcfce7' : '#fef9c3', color: m.isPublished ? '#166534' : '#854d0e' }}>
                            {m.isPublished ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', color: '#999' }}>{m.views}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            {/* Toggle publish */}
                            <button onClick={() => togglePublish(m._id, m.isPublished)} title={m.isPublished ? 'Unpublish' : 'Publish'}
                              style={{ padding: '5px 8px', borderRadius: 6, border: 'none', cursor: 'pointer', background: m.isPublished ? '#dcfce7' : '#f3f4f6', color: m.isPublished ? '#166534' : '#555' }}>
                              {m.isPublished
                                ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                              }
                            </button>
                            {/* Edit */}
                            <button onClick={() => { setEditItem(m); setShowModal(true); }}
                              style={{ padding: '5px 8px', borderRadius: 6, border: 'none', cursor: 'pointer', background: '#eff6ff', color: '#1d4ed8' }}>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            </button>
                            {/* Delete */}
                            <button onClick={() => deleteMat(m._id)}
                              style={{ padding: '5px 8px', borderRadius: 6, border: 'none', cursor: 'pointer', background: '#fef2f2', color: '#dc2626' }}>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* Stats tab */}
        {tab === 'stats' && stats && (
          <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, marginBottom: 20 }}>Materials by Subject</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {stats.bySubject.map((s: any) => (
                <div key={s._id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ width: 150, fontSize: 13, color: '#444', flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s._id}</span>
                  <div style={{ flex: 1, background: '#f3f4f6', borderRadius: 4, height: 10, overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: '#1a7a4a', borderRadius: 4, width: `${Math.min(100, (s.count / (stats.total || 1)) * 100)}%` }} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#333', width: 30, textAlign: 'right' }}>{s.count}</span>
                  <span style={{ fontSize: 12, color: '#aaa', width: 60 }}>{s.views} views</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <AddMaterialModal
          item={editItem}
          onClose={() => { setShowModal(false); setEditItem(null); }}
          onSaved={() => { setShowModal(false); setEditItem(null); loadData(); }}
        />
      )}
    </div>
  );
}