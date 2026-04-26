'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { SUBJECT_INFO } from '@/lib/subjects';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

interface SubjectCount { name: string; count: number; }

export default function HomePage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<SubjectCount[]>([]);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/subjects').then(r => {
      setSubjects(r.data.data);
      setTotal(r.data.data.reduce((s: number, x: SubjectCount) => s + x.count, 0));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) router.push(`/search?q=${encodeURIComponent(search.trim())}`);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar />

      {/* ── HERO ────────────────────────────────────────────── */}
      <section style={{ background: '#0d3d26', position: 'relative', overflow: 'hidden' }}>
        {/* Subtle dot pattern */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

        <div style={{ maxWidth: 1152, margin: '0 auto', padding: '64px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center', position: 'relative' }}
          className="!grid-cols-1 md:!grid-cols-2">

          {/* Left */}
          <div className="fade-up">
            <div style={{ display: 'inline-block', background: 'rgba(200,146,42,0.18)', border: '1px solid rgba(200,146,42,0.35)', borderRadius: 20, padding: '5px 15px', marginBottom: 24 }}>
              <span style={{ color: '#e8b04a', fontSize: 12, fontWeight: 600, letterSpacing: '0.04em' }}> KANISA LA BIBLIA MASASI(MKUTI)</span>
            </div>

            <h1 style={{ fontFamily: "'Playfair Display', serif", color: 'white', fontSize: 'clamp(30px, 4.5vw, 52px)', lineHeight: 1.18, marginBottom: 18 }}>
              HUDUMA YA MTOTO NA KIJANA(TZ0693)<br />
              <span style={{ color: '#e8b04a' }}>E-LIBARY</span>
            </h1>

            <p style={{ color: 'rgba(255,255,255,0.62)', fontSize: 15.5, lineHeight: 1.78, marginBottom: 32, maxWidth: 430 }}>
              Books, videos and stories for students from Standard 1 to Form 4 — and a special Kids Corner for children under 6. Free, forever.
            </p>

            {/* Search */}
            <form onSubmit={handleSearch}
              style={{ display: 'flex', background: 'white', borderRadius: 10, overflow: 'hidden', boxShadow: '0 8px 36px rgba(0,0,0,0.25)', maxWidth: 460 }}>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search a book, subject or class..."
                style={{ flex: 1, padding: '14px 18px', fontSize: 14, outline: 'none', border: 'none', color: '#111' }} />
              <button type="submit"
                style={{ background: '#1a7a4a', color: 'white', padding: '0 22px', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                Search
              </button>
            </form>

            {/* Stats */}
            <div style={{ display: 'flex', gap: 32, marginTop: 28 }}>
              {[
                { val: `${total}+`, label: 'Materials' },
                { val: '18', label: 'Subjects' },
                { val: 'Free', label: 'Always' },
              ].map(s => (
                <div key={s.label}>
                  <div style={{ fontFamily: "'Playfair Display', serif", color: '#e8b04a', fontSize: 22, fontWeight: 700 }}>{s.val}</div>
                  <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — photos */}
          <div className="fade-up d2" style={{ position: 'relative', height: 380, display: 'none' }} id="hero-images">
            <div style={{ position: 'absolute', right: 0, top: 0, width: 270, height: 330, borderRadius: 14, overflow: 'hidden', boxShadow: '0 20px 56px rgba(0,0,0,0.4)' }}>
              <img src="/pupils2.jpg" alt="Students in class" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ position: 'absolute', left: 0, bottom: 0, width: 210, height: 250, borderRadius: 14, overflow: 'hidden', boxShadow: '0 20px 56px rgba(0,0,0,0.4)', border: '3px solid #0d3d26' }}>
              <img src="/pupils.jpg" alt="Children reading" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ position: 'absolute', right: -6, bottom: 60, width: 52, height: 52, borderRadius: 10, background: '#c8922a', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(200,146,42,0.4)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
            </div>
          </div>

          {/* Show images on md+ */}
          <style>{`@media(min-width:768px){#hero-images{display:block !important;}}`}</style>
        </div>
      </section>

      {/* ── KIDS CORNER BANNER ─────────────────────────────── */}
      <section style={{ background: '#fff8f0', borderBottom: '1px solid #ffe4b8' }}>
        <div style={{ maxWidth: 1152, margin: '0 auto', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}>
              <img src="/pupils.jpg" alt="Kids" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: '#111', marginBottom: 3 }}>Kids Corner — Ages 0 to 6</div>
              <div style={{ fontSize: 13, color: '#666' }}>Stories, songs and videos made for young learners</div>
            </div>
          </div>
          <Link href="/kids"
            style={{ background: '#c8922a', color: 'white', padding: '11px 26px', borderRadius: 8, fontWeight: 600, fontSize: 13, textDecoration: 'none', whiteSpace: 'nowrap' }}
            className="hover:opacity-90 transition-opacity">
            Enter Kids Corner
          </Link>
        </div>
      </section>

      {/* ── SUBJECTS GRID ──────────────────────────────────── */}
      <section style={{ maxWidth: 1152, margin: '0 auto', padding: '56px 20px', width: '100%' }}>
        <div style={{ marginBottom: 36 }}>
          <div style={{ width: 48, height: 3, background: '#c8922a', borderRadius: 2, marginBottom: 16 }} />
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(22px, 3vw, 32px)', color: '#111', marginBottom: 8 }}>
            Choose a Subject Room
          </h2>
          <p style={{ color: '#888', fontSize: 14 }}>Select any subject to browse all books and materials</p>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 16 }}>
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={i} style={{ height: 190, borderRadius: 12, background: '#e5e7eb' }} className="animate-pulse" />
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 16 }}>
            {Object.values(SUBJECT_INFO).map((info) => {
              const found = subjects.find(s => s.name === info.name);
              const count = found?.count || 0;
              return (
                <button key={info.name}
                  onClick={() => router.push(`/subject/${encodeURIComponent(info.name)}`)}
                  className="subject-card"
                  style={{ background: 'white', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.07)', cursor: 'pointer', textAlign: 'left', padding: 0 }}>
                  {/* Subject image */}
                  <div style={{ height: 108, overflow: 'hidden', position: 'relative' }}>
                    <img src={info.image} alt={info.name} className="subject-img"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to top, ${info.color}dd 0%, transparent 55%)` }} />
                  </div>
                  {/* Label */}
                  <div style={{ padding: '10px 12px' }}>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: '#111', lineHeight: 1.3, marginBottom: 4 }}>{info.name}</div>
                    <div style={{ fontSize: 11, color: '#999' }}>{count} material{count !== 1 ? 's' : ''}</div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────── */}
      <section style={{ background: 'white', padding: '56px 20px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <div style={{ width: 48, height: 3, background: '#c8922a', borderRadius: 2, margin: '0 auto 16px' }} />
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(22px, 3vw, 32px)', color: '#111' }}>How It Works</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 32 }}>
            {[
              { num: '01', title: 'Choose a Subject', desc: 'Browse 18 subjects from Mathematics to Music, Computer Science to Civics.' },
              { num: '02', title: 'Filter by Class or Age', desc: 'Narrow down to your class — Standard 1 through Form 4, or by age group.' },
              { num: '03', title: 'Read or Watch Free', desc: 'Open any book, video or story instantly. No sign-up, no payment, ever.' },
            ].map(s => (
              <div key={s.num}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 44, color: '#c8922a', opacity: 0.4, fontWeight: 700, lineHeight: 1, marginBottom: 14 }}>{s.num}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111', marginBottom: 8 }}>{s.title}</h3>
                <p style={{ fontSize: 13.5, color: '#777', lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PHOTO SECTION ──────────────────────────────────── */}
      <section style={{ background: '#0d3d26', padding: '56px 20px' }}>
        <div style={{ maxWidth: 1152, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: 40, alignItems: 'center' }}>
          <div style={{ flex: '1 1 300px' }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", color: 'white', fontSize: 'clamp(22px, 3vw, 34px)', marginBottom: 16 }}>
              Built for Tanzania's Children
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15, lineHeight: 1.8, marginBottom: 24 }}>
              Every material is selected specifically for the Tanzanian curriculum — from pre-primary through Ordinary Level secondary school.
            </p>
            <Link href="/search"
              style={{ display: 'inline-block', background: '#c8922a', color: 'white', padding: '12px 28px', borderRadius: 8, fontWeight: 600, fontSize: 14, textDecoration: 'none' }}
              className="hover:opacity-90 transition-opacity">
              Browse All Materials
            </Link>
          </div>
          <div style={{ flex: '1 1 300px', display: 'flex', gap: 14 }}>
            <div style={{ flex: 1, borderRadius: 12, overflow: 'hidden', height: 220 }}>
              <img src="/pupils.jpg" alt="Students" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ flex: 1, borderRadius: 12, overflow: 'hidden', height: 220, marginTop: 24 }}>
              <img src="/pupils2.jpg" alt="Classroom" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
