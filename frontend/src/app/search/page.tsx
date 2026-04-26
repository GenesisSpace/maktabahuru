'use client';
import { Suspense, useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { CLASSES, SUBJECT_INFO } from '@/lib/subjects';
import MaterialCard from '@/components/ui/MaterialCard';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

function SearchContent() {
  const sp = useSearchParams();
  const router = useRouter();
  const [q, setQ] = useState(sp.get('q') || '');
  const [results, setResults] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState('');
  const [classLevel, setClassLevel] = useState('');
  const [type, setType] = useState('');

  const doSearch = useCallback(async (query: string) => {
    setLoading(true);
    try {
      const params: any = { limit: 36 };
      if (query)      params.search = query;
      if (subject)    params.subject = subject;
      if (classLevel) params.classLevel = classLevel;
      if (type)       params.type = type;
      const r = await api.get('/materials', { params });
      setResults(r.data.data);
      setTotal(r.data.pagination.total);
    } catch { setResults([]); } finally { setLoading(false); }
  }, [subject, classLevel, type]);

  useEffect(() => {
    const q2 = sp.get('q') || '';
    setQ(q2);
    doSearch(q2);
  }, [sp, doSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(q.trim() ? `/search?q=${encodeURIComponent(q.trim())}` : '/search');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar />

      {/* Search header */}
      <div style={{ background: '#0d3d26', padding: '40px 20px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", color: 'white', fontSize: 28, marginBottom: 20 }}>
            Search the Library
          </h1>
          <form onSubmit={handleSubmit}
            style={{ display: 'flex', background: 'white', borderRadius: 10, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
            <input value={q} onChange={e => setQ(e.target.value)}
              placeholder="Search by title, subject, or author..."
              style={{ flex: 1, padding: '14px 18px', fontSize: 14, outline: 'none', border: 'none', color: '#111' }} />
            <button type="submit"
              style={{ background: '#1a7a4a', color: 'white', padding: '0 24px', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Filter row */}
      <div style={{ background: 'white', borderBottom: '1px solid rgba(0,0,0,0.07)', padding: '12px 20px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
          <select value={subject} onChange={e => setSubject(e.target.value)}
            style={{ border: '1px solid #e5e7eb', borderRadius: 7, padding: '7px 12px', fontSize: 13, background: 'white' }}>
            <option value="">All subjects</option>
            {Object.keys(SUBJECT_INFO).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={classLevel} onChange={e => setClassLevel(e.target.value)}
            style={{ border: '1px solid #e5e7eb', borderRadius: 7, padding: '7px 12px', fontSize: 13, background: 'white' }}>
            <option value="">All classes</option>
            {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={type} onChange={e => setType(e.target.value)}
            style={{ border: '1px solid #e5e7eb', borderRadius: 7, padding: '7px 12px', fontSize: 13, background: 'white' }}>
            <option value="">All types</option>
            <option value="book">Book</option>
            <option value="video">Video</option>
            <option value="story">Story</option>
            <option value="audio">Audio</option>
          </select>
          <span style={{ fontSize: 13, color: '#999', marginLeft: 'auto' }}>
            {loading ? 'Searching...' : `${total} results`}
          </span>
        </div>
      </div>

      {/* Results */}
      <main style={{ flex: 1, maxWidth: 1100, margin: '0 auto', padding: '32px 20px', width: '100%' }}>
        {q && !loading && (
          <p style={{ fontSize: 14, color: '#888', marginBottom: 20 }}>
            {total} result{total !== 1 ? 's' : ''} for <strong style={{ color: '#111' }}>"{q}"</strong>
          </p>
        )}

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ height: 280, background: '#f3f4f6', borderRadius: 12 }} className="animate-pulse" />
            ))}
          </div>
        ) : results.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: '#888', marginBottom: 8 }}>
              {q ? `No results for "${q}"` : 'Start searching'}
            </div>
            <p style={{ color: '#aaa', fontSize: 14 }}>Try a different keyword or browse by subject from the home page.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
            {results.map(m => <MaterialCard key={m._id} mat={m} />)}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif", color: '#888' }}>
        Loading...
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}