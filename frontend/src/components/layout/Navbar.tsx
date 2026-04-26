'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');

  const go = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) { router.push(`/search?q=${encodeURIComponent(q)}`); setOpen(false); }
  };

  return (
    <nav style={{ background: '#0d3d26', fontFamily: "'DM Sans', sans-serif" }} className="sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between gap-5">

        {/* Logo */}
    <Link href="/" className="flex items-center gap-3 shrink-0">
  <div style={{
    width: 65,
    height: 65,
    borderRadius: '50%',
    overflow: 'hidden',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255,255,255,0.08)',
    border: '2px solid rgba(255,255,255,0.15)',
  }}>
    <img src="/klb.jpeg" alt="Maktaba Huru" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
  </div>
  <div>
    <div style={{ fontFamily: "'Playfair Display', serif", color: 'white', fontSize: 16, fontWeight: 700, lineHeight: 1.1 }}>
      Maktaba Huru
    </div>
    <div style={{ color: '#06b6d4', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600 }}>
      E-Library
    </div>
  </div>
</Link>

        {/* Search bar */}
        <form onSubmit={go} className="hidden md:flex flex-1 max-w-sm">
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.1)', borderRadius: 8, overflow: 'hidden', width: '100%', border: '1px solid rgba(255,255,255,0.15)' }}>
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search books, subjects..."
              style={{ flex: 1, background: 'transparent', color: 'white', padding: '8px 14px', fontSize: 13, outline: 'none', border: 'none' }}
              className="placeholder-white/40" />
            <button type="submit" style={{ background: '#c8922a', color: 'white', padding: '0 16px', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
              Search
            </button>
          </div>
        </form>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-5">
          <Link href="/" style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}
            className="hover:text-white transition-colors">Home</Link>
          <Link href="/search" style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}
            className="hover:text-white transition-colors">All Books</Link>
          <Link href="/kids"
            style={{ background: '#c8922a', color: 'white', fontSize: 13, fontWeight: 600, padding: '8px 18px', borderRadius: 8, textDecoration: 'none' }}
            className="hover:opacity-90 transition-opacity whitespace-nowrap">
            Kids Corner
          </Link>
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setOpen(!open)} style={{ color: 'white', background: 'none', border: 'none', cursor: 'pointer' }} className="md:hidden">
          {open
            ? <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>
            : <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
          }
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div style={{ background: '#0a2e1c', borderTop: '1px solid rgba(255,255,255,0.08)' }} className="md:hidden px-5 pb-5 pt-3 space-y-3">
          <form onSubmit={go} style={{ display: 'flex', gap: 8 }}>
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search..."
              style={{ flex: 1, background: 'rgba(255,255,255,0.1)', color: 'white', padding: '10px 14px', borderRadius: 8, fontSize: 13, outline: 'none', border: '1px solid rgba(255,255,255,0.15)' }} />
            <button type="submit" style={{ background: '#c8922a', color: 'white', padding: '0 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>Go</button>
          </form>
          {[['/', 'Home'], ['/kids', 'Kids Corner'], ['/search', 'All Books']].map(([href, label]) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}
              style={{ display: 'block', color: 'rgba(255,255,255,0.8)', fontSize: 15, padding: '6px 0', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
