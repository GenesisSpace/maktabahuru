'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Navbar from '@/components/layout/Navbar';

interface Material {
  _id: string; title: string; description?: string;
  type: 'book' | 'video' | 'story' | 'audio';
  subject: string; classes: string[]; author?: string;
  coverImage: string | null; views: number; fileUrl: string;
  format: string; language: string; isExternal: boolean;
}

export default function ReaderPage() {
  const params = useParams();
  const router = useRouter();
  const [mat, setMat] = useState<Material | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/materials/${params.id}`)
      .then(r => { setMat(r.data.data); setLoading(false); })
      .catch(() => { setError('Material not found.'); setLoading(false); });
  }, [params.id]);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#f8f7f4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #e5e7eb', borderTop: '3px solid #1a7a4a', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
        <div style={{ color: '#888', fontSize: 14 }}>Loading...</div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );

  if (error || !mat) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#444', marginBottom: 8 }}>Not Found</div>
        <button onClick={() => router.back()} style={{ background: '#1a7a4a', color: 'white', padding: '10px 24px', borderRadius: 8, border: 'none', cursor: 'pointer' }}>Go Back</button>
      </div>
    </div>
  );

  // Get YouTube embed ID
  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  const renderContent = () => {
    const url = mat.fileUrl;

    // ── VIDEO ──────────────────────────────────────────────────
    if (mat.type === 'video') {
      const ytId = getYouTubeId(url);
      if (ytId) {
        return (
          <div style={{ width: '100%', aspectRatio: '16/9', borderRadius: 12, overflow: 'hidden', background: '#000' }}>
            <iframe
              src={`https://www.youtube.com/embed/${ytId}?autoplay=0&rel=0`}
              style={{ width: '100%', height: '100%', border: 'none' }}
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
        );
      }
      return (
        <div style={{ width: '100%', borderRadius: 12, overflow: 'hidden', background: '#000' }}>
          <video controls style={{ width: '100%', maxHeight: '70vh' }} src={url}>
            Your browser does not support video.
          </video>
        </div>
      );
    }

    // ── AUDIO ──────────────────────────────────────────────────
    if (mat.type === 'audio') {
      return (
        <div style={{ background: '#0d3d26', borderRadius: 16, padding: '48px 32px', textAlign: 'center' }}>
          {mat.coverImage && (
            <img src={mat.coverImage} alt={mat.title}
              style={{ width: 160, height: 160, borderRadius: 12, objectFit: 'cover', margin: '0 auto 24px', display: 'block', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }} />
          )}
          <div style={{ color: 'white', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{mat.title}</div>
          {mat.author && <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 24 }}>{mat.author}</div>}
          <audio controls style={{ width: '100%', marginTop: 16 }} src={url}>
            Your browser does not support audio.
          </audio>
        </div>
      );
    }

    // ── PDF / BOOK ─────────────────────────────────────────────
    if (mat.format === 'pdf' || mat.type === 'book' || mat.type === 'story') {
      // Cloudinary PDF direct embed
      const pdfUrl = url.includes('cloudinary.com')
        ? url.replace('/upload/', '/upload/fl_attachment/').replace('.pdf', '.pdf')
        : url;

      return (
        <div style={{ width: '100%', height: '78vh', borderRadius: 12, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
          <iframe
            src={`https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`}
            style={{ width: '100%', height: '100%', border: 'none' }}
            title={mat.title}
          />
        </div>
      );
    }

    // ── EXTERNAL LINK fallback ─────────────────────────────────
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: 16, color: '#444', marginBottom: 20 }}>This material opens in an external source.</div>
        <a href={url} target="_blank" rel="noreferrer"
          style={{ display: 'inline-block', background: '#1a7a4a', color: 'white', padding: '12px 28px', borderRadius: 8, fontWeight: 700, textDecoration: 'none', fontSize: 14 }}>
          Open Material
        </a>
      </div>
    );
  };

  const TYPE_COLOR = { book: '#1a5c38', video: '#1d4ed8', story: '#6d28d9', audio: '#c2410c' };
  const color = TYPE_COLOR[mat.type] || '#1a5c38';

  return (
    <div style={{ minHeight: '100vh', background: '#f8f7f4', fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar />

      {/* Back bar */}
      <div style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '10px 20px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <button onClick={() => router.back()}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#555', fontSize: 13, fontWeight: 500 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
            Back
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 20px', display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24, alignItems: 'start' }}
        className="!grid-cols-1 lg:!grid-cols-[1fr_280px]">
        <style>{`@media(max-width:900px){.reader-grid{grid-template-columns:1fr !important}}`}</style>

        {/* Main content */}
        <div className="reader-grid">
          <div style={{ background: 'white', borderRadius: 16, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.07)', marginBottom: 0 }}>
            {/* Title */}
            <div style={{ marginBottom: 16 }}>
              <span style={{ background: color, color: 'white', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                {mat.type}
              </span>
              <h1 style={{ fontSize: 'clamp(18px, 2.5vw, 26px)', fontWeight: 700, color: '#111', marginTop: 10, lineHeight: 1.3 }}>
                {mat.title}
              </h1>
              {mat.author && <p style={{ fontSize: 13, color: '#888', marginTop: 4 }}>by {mat.author}</p>}
            </div>

            {/* Content viewer */}
            {renderContent()}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Cover */}
          {mat.coverImage && (
            <div style={{ background: 'white', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
              <img src={mat.coverImage} alt={mat.title} style={{ width: '100%', height: 200, objectFit: 'cover' }} />
            </div>
          )}

          {/* Details */}
          <div style={{ background: 'white', borderRadius: 14, padding: 18, boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#111', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Subject', value: mat.subject },
                { label: 'Language', value: mat.language === 'sw' ? 'Kiswahili' : mat.language === 'en' ? 'English' : 'Both' },
                { label: 'Views', value: mat.views.toString() },
                ...(mat.classes?.length ? [{ label: 'Classes', value: mat.classes.join(', ') }] : []),
              ].map(d => (
                <div key={d.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: '#888' }}>{d.label}</span>
                  <span style={{ color: '#111', fontWeight: 500, textAlign: 'right', maxWidth: 160 }}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          {mat.description && (
            <div style={{ background: 'white', borderRadius: 14, padding: 18, boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: '#111', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>About</h3>
              <p style={{ fontSize: 13, color: '#666', lineHeight: 1.7 }}>{mat.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}