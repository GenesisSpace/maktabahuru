'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import MaterialCard from '@/components/ui/MaterialCard';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const AGE_GROUPS = [
  { label: 'All Ages', min: 0, max: 99 },
  { label: 'Under 3', min: 0, max: 2 },
  { label: '3 – 4 years', min: 3, max: 4 },
  { label: '4 – 5 years', min: 4, max: 5 },
  { label: '5 – 6 years', min: 5, max: 6 },
];

const CATS = [
  { label: 'All', subject: '' },
  { label: 'Stories', subject: 'Hadithi za Watoto' },
  { label: 'Songs', subject: 'Nyimbo za Watoto' },
  { label: 'Sports & Play', subject: 'Michezo' },
];

export default function KidsPage() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [ageGroup, setAgeGroup] = useState(AGE_GROUPS[0]);
  const [subject, setSubject] = useState('');

  useEffect(() => {
    setLoading(true);
    const params: any = { isForKids: true, limit: 24 };
    if (ageGroup.max < 99) { params.ageMin = ageGroup.min; params.ageMax = ageGroup.max; }
    if (subject) params.subject = subject;
    api.get('/materials', { params })
      .then(r => { setMaterials(r.data.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [ageGroup, subject]);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--cream)' }}>
      <Navbar />

      {/* Hero */}
      <div style={{ background: 'var(--green-deep)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="max-w-5xl mx-auto px-5 py-14 grid md:grid-cols-2 gap-10 items-center relative">
          <div>
            <div style={{ display: 'inline-block', background: 'rgba(200,146,42,0.2)', border: '1px solid rgba(200,146,42,0.4)', borderRadius: 20, padding: '4px 14px', marginBottom: 20 }}>
              <span style={{ color: 'var(--gold-light)', fontSize: 12, fontWeight: 500 }}>For children under 6 years</span>
            </div>
            <h1 style={{ fontFamily: "'Playfair Display',serif", color: 'white', fontSize: 'clamp(28px,4vw,44px)', lineHeight: 1.2, marginBottom: 16 }}>
              Kids Corner
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 15, lineHeight: 1.75, marginBottom: 24 }}>
              Stories, songs and videos made for young learners. Simple, fun, and completely free.
            </p>
            <Link href="/" style={{ display: 'inline-block', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '10px 22px', borderRadius: 8, fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>
              Back to Library
            </Link>
          </div>
          <div style={{ borderRadius: 16, overflow: 'hidden', height: 260 }} className="hidden md:block">
            <img src="/pupils.jpg" alt="Young children learning" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ background: 'white', borderBottom: '1px solid rgba(0,0,0,0.07)', position: 'sticky', top: 64, zIndex: 10 }}>
        <div className="max-w-5xl mx-auto px-5 py-4 flex flex-wrap items-center gap-6">
          <div className="flex flex-wrap gap-2">
            <span style={{ fontSize: 12, color: 'var(--text-light)', fontWeight: 500, alignSelf: 'center' }}>Type:</span>
            {CATS.map(c => (
              <button key={c.label} onClick={() => setSubject(c.subject === subject ? '' : c.subject)}
                style={{
                  padding: '6px 14px', borderRadius: 7, fontSize: 13, fontWeight: 500, border: 'none', cursor: 'pointer',
                  background: subject === c.subject ? 'var(--green-mid)' : '#f3f4f6',
                  color: subject === c.subject ? 'white' : 'var(--text-mid)',
                  transition: 'all 0.15s',
                }}>
                {c.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <span style={{ fontSize: 12, color: 'var(--text-light)', fontWeight: 500, alignSelf: 'center' }}>Age:</span>
            {AGE_GROUPS.map(g => (
              <button key={g.label} onClick={() => setAgeGroup(g)}
                style={{
                  padding: '6px 14px', borderRadius: 7, fontSize: 13, fontWeight: 500, border: `1.5px solid ${ageGroup.label === g.label ? 'var(--green-mid)' : 'transparent'}`,
                  background: ageGroup.label === g.label ? 'var(--green-mid)' : '#f3f4f6',
                  color: ageGroup.label === g.label ? 'white' : 'var(--text-mid)',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}>
                {g.label}
              </button>
            ))}
          </div>
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
            <p style={{ color: 'var(--text-light)', fontSize: 14 }}>The admin has not added content for this section yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {materials.map(m => <MaterialCard key={m._id} mat={m} />)}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
