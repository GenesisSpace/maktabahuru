'use client';
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { CLASSES, SUBJECT_INFO } from '@/lib/subjects';
import MaterialCard from '@/components/ui/MaterialCard';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function SearchPage() {
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
      if (query)     params.search = query;
      if (subject)   params.subject = subject;
      if (classLevel) params.classLevel = classLevel;
      if (type)      params.type = type;
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
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--cream)' }}>
      <Navbar />

      {/* Search header */}
      <div style={{ background: 'var(--green-deep)' }} className="px-5 py-10">
        <div className="max-w-3xl mx-auto">
          <h1 style={{ fontFamily: "'Playfair Display',serif", color: 'white', fontSize: 28, marginBottom: 20 }}>
            Search the Library
          </h1>
          <form onSubmit={handleSubmit}
            style={{ display: 'flex', background: 'white', borderRadius: 10, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by title, subject, or author..."
              style={{ flex: 1, padding: '14px 18px', fontSize: 14, outline: 'none', border: 'none', color: 'var(--text-dark)' }} />
            <button type="submit"
              style={{ background: 'var(--green-mid)', color: 'white', padding: '0 24px', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Filter row */}
      <div style={{ background: 'white', borderBottom: '1px solid rgba(0,0,0,0.07)' }} className="px-5 py-3">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center gap-3">
          <select value={subject} onChange={e => setSubject(e.target.value)}
            style={{ border: '1px solid rgba(0,0,0,0.12)', borderRadius: 7, padding: '7px 12px', fontSize: 13, background: 'white' }}>
            <option value="">All subjects</option>
            {Object.keys(SUBJECT_INFO).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={classLevel} onChange={e => setClassLevel(e.target.value)}
            style={{ border: '1px solid rgba(0,0,0,0.12)', borderRadius: 7, padding: '7px 12px', fontSize: 13, background: 'white' }}>
            <option value="">All classes</option>
            {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={type} onChange={e => setType(e.target.value)}
            style={{ border: '1px solid rgba(0,0,0,0.12)', borderRadius: 7, padding: '7px 12px', fontSize: 13, background: 'white' }}>
            <option value="">All types</option>
            <option value="book">Book</option>
            <option value="video">Video</option>
            <option value="story">Story</option>
            <option value="audio">Audio</option>
          </select>
          <span style={{ fontSize: 13, color: 'var(--text-light)', marginLeft: 'auto' }}>
            {loading ? 'Searching...' : `${total} results`}
          </span>
        </div>
      </div>

      <main className="flex-1 max-w-5xl mx-auto px-5 py-10 w-full">
        {q && !loading && (
          <p style={{ fontSize: 14, color: 'var(--text-light)', marginBottom: 20 }}>
            {total} result{total !== 1 ? 's' : ''} for <strong style={{ color: 'var(--text-dark)' }}>"{q}"</strong>
          </p>
        )}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ height: 280, background: '#f3f4f6', borderRadius: 14 }} className="animate-pulse" />
            ))}
          </div>
        ) : results.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, color: 'var(--text-mid)', marginBottom: 8 }}>
              {q ? `No results for "${q}"` : 'Start searching'}
            </div>
            <p style={{ color: 'var(--text-light)', fontSize: 14 }}>Try a different keyword or browse by subject from the home page.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {results.map(m => <MaterialCard key={m._id} mat={m} />)}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
