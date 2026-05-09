'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { SUBJECT_INFO, CLASSES } from '@/lib/subjects';
import MaterialCard from '@/components/ui/MaterialCard';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const SUBJECT_IMAGES: Record<string, string> = {
  'Hisabati':          'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80',
  'Sayansi':           'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&q=80',
  'Kiingereza':        'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80',
  'Kiswahili':         'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80',
  'Historia':          'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=800&q=80',
  'Jiografia':         'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80',
  'Biologia':          'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800&q=80',
  'Kemia':             'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=800&q=80',
  'Fizikia':           'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=800&q=80',
  'Muziki':            'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=800&q=80',
  'Kompyuta':          'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80',
  'Sanaa':             'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&q=80',
  'Hadithi za Watoto': 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80',
  'Nyimbo za Watoto':  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80',
  'Michezo':           'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80',
};

const PAGE_SIZE = 20;

export default function SubjectPage() {
  const params = useParams();
  const subjectName = decodeURIComponent(params.name as string);
  const info = SUBJECT_INFO[subjectName];
  const bgImg = SUBJECT_IMAGES[subjectName];

  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [classFilter, setClassFilter] = useState('');
  const [ageMin, setAgeMin] = useState('');
  const [ageMax, setAgeMax] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const load = useCallback(async (pg: number) => {
    setLoading(true);
    try {
      const p: any = { subject: subjectName, page: pg, limit: PAGE_SIZE };
      if (classFilter) p.classLevel = classFilter;
      if (ageMin)      p.ageMin = ageMin;
      if (ageMax)      p.ageMax = ageMax;
      if (typeFilter)  p.type = typeFilter;
      const r = await api.get('/materials', { params: p });
      setMaterials(r.data.data);
      setTotal(r.data.pagination.total);
    } catch { } finally { setLoading(false); }
  }, [subjectName, classFilter, ageMin, ageMax, typeFilter]);

  useEffect(() => { setPage(1); load(1); }, [load]);

  const pages = Math.ceil(total / PAGE_SIZE);
  const color = info?.color || 'var(--green-mid)';

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--cream)' }}>
      <Navbar />

      {/* Subject Header */}
      <div style={{ position: 'relative', height: 240, overflow: 'hidden' }}>
        {bgImg ? (
          <img src={bgImg} alt={subjectName} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={e => { (e.target as HTMLImageElement).style.background = color; }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: color }} />
        )}
        {/* Overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.35) 100%)' }} />
        <div className="absolute inset-0 flex items-end px-6 pb-8 max-w-5xl mx-auto w-full" style={{ left: '50%', transform: 'translateX(-50%)' }}>
          <div>
            <div style={{ fontFamily: "'Playfair Display',serif", color: 'white', fontSize: 'clamp(24px,3.5vw,40px)', fontWeight: 700, marginBottom: 6 }}>
              {subjectName}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>
              {info?.description} &nbsp;·&nbsp; {total} materials
            </div>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div style={{ background: 'white', borderBottom: '1px solid rgba(0,0,0,0.07)', position: 'sticky', top: 64, zIndex: 10 }}>
        <div className="max-w-5xl mx-auto px-5 py-3 flex items-center gap-4 flex-wrap">
          <button onClick={() => setShowFilters(!showFilters)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500, color: 'var(--text-mid)', background: showFilters ? '#f3f4f6' : 'transparent', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 7, padding: '6px 14px', cursor: 'pointer' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
            Filters
          </button>

          {showFilters && (
            <>
              <select value={classFilter} onChange={e => setClassFilter(e.target.value)}
                style={{ border: '1px solid rgba(0,0,0,0.12)', borderRadius: 7, padding: '6px 12px', fontSize: 13, color: 'var(--text-dark)', background: 'white' }}>
                <option value="">All classes</option>
                {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
                style={{ border: '1px solid rgba(0,0,0,0.12)', borderRadius: 7, padding: '6px 12px', fontSize: 13, color: 'var(--text-dark)', background: 'white' }}>
                <option value="">All types</option>
                <option value="book">Book</option>
                <option value="video">Video</option>
                <option value="story">Story</option>
                <option value="audio">Audio</option>
              </select>
              <input type="number" placeholder="Min age" value={ageMin} onChange={e => setAgeMin(e.target.value)}
                style={{ border: '1px solid rgba(0,0,0,0.12)', borderRadius: 7, padding: '6px 12px', fontSize: 13, width: 90, background: 'white' }} />
              <input type="number" placeholder="Max age" value={ageMax} onChange={e => setAgeMax(e.target.value)}
                style={{ border: '1px solid rgba(0,0,0,0.12)', borderRadius: 7, padding: '6px 12px', fontSize: 13, width: 90, background: 'white' }} />
            </>
          )}
          <span style={{ fontSize: 13, color: 'var(--text-light)', marginLeft: 'auto' }}>{total} results</span>
        </div>
      </div>

      {/* Grid */}
      <main className="flex-1 max-w-5xl mx-auto px-5 py-10 w-full">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ height: 280, background: '#f3f4f6', borderRadius: 14 }} className="animate-pulse" />
            ))}
          </div>
        ) : materials.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, color: 'var(--text-mid)', marginBottom: 8 }}>No materials yet</div>
            <p style={{ color: 'var(--text-light)', fontSize: 14 }}>The admin has not added content for this subject yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {materials.map(m => <MaterialCard key={m._id} mat={m} />)}
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 48 }}>
            {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => { setPage(p); load(p); }}
                style={{
                  width: 36, height: 36, borderRadius: 8, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
                  background: p === page ? 'var(--green-mid)' : '#f3f4f6',
                  color: p === page ? 'white' : 'var(--text-mid)',
                }}>
                {p}
              </button>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
