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
  const [pdfMode, setPdfMode] = useState<'embed' | 'google' | 'download'>('embed');

  useEffect(() => {
    api.get(`/materials/${params.id}`)
      .then(r => { setMat(r.data.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [params.id]);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#f8f7f4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #e5e7eb', borderTop: '3px solid #1a7a4a', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
        <div style={{ color: '#888', fontSize: 14 }}>Loading...</div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );

  if (!mat) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#444', marginBottom: 16 }}>Material not found</div>
        <button onClick={() => router.back()} style={{ background: '#1a7a4a', color: 'white', padding: '10px 24px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 14 }}>Go Back</button>
      </div>
    </div>
  );

  const TYPE_COLOR: Record<string, string> = { book: '#1a5c38', video: '#1d4ed8', story: '#6d28d9', audio: '#c2410c' };
  const color = TYPE_COLOR[mat.type] || '#1a5c38';

  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  const renderPDF = (url: string) => {
    // For Cloudinary PDFs - get direct URL
    const directUrl = url;
    const googleUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;

    return (
      <div>
        {/* Toolbar */}
        <div style={{ background: '#1e293b', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginRight: 4 }}>View as:</span>
          {[
            { key: 'embed', label: 'Built-in Viewer' },
            { key: 'google', label: 'Google Viewer' },
          ].map(v => (
            <button key={v.key}
              onClick={() => setPdfMode(v.key as any)}
              style={{ background: pdfMode === v.key ? '#c8922a' : 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: 6, padding: '5px 12px', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
              {v.label}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <a href={directUrl} download target="_blank" rel="noreferrer"
            style={{ background: '#1a7a4a', color: 'white', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 11, fontWeight: 600, cursor: 'pointer', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5 }}>
            ⬇ Download
          </a>
        </div>

        {/* Viewer area */}
        <div style={{ height: '80vh', background: '#525659', position: 'relative' }}>
          {pdfMode === 'embed' && (
            <embed
              src={`${directUrl}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
              type="application/pdf"
              style={{ width: '100%', height: '100%' }}
            />
          )}
          {pdfMode === 'google' && (
            <iframe
              src={googleUrl}
              style={{ width: '100%', height: '100%', border: 'none' }}
              title={mat.title}
            />
          )}

          {/* Fallback message overlay - shown if embed fails */}
          {pdfMode === 'embed' && (
            <noscript>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f7f4', flexDirection: 'column', gap: 16 }}>
                <div style={{ fontSize: 48 }}>📄</div>
                <p style={{ fontSize: 14, color: '#666' }}>Please switch to Google Viewer or download the file.</p>
              </div>
            </noscript>
          )}
        </div>

        {/* Fallback options */}
        <div style={{ background: '#f8f7f4', padding: '14px 16px', borderTop: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: '#888' }}>Having trouble viewing?</span>
          <button onClick={() => setPdfMode('google')}
            style={{ fontSize: 12, color: '#1a7a4a', background: 'none', border: '1px solid #1a7a4a', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontWeight: 600 }}>
            Try Google Viewer
          </button>
          <a href={directUrl} download target="_blank" rel="noreferrer"
            style={{ fontSize: 12, color: '#1d4ed8', background: 'none', border: '1px solid #1d4ed8', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontWeight: 600, textDecoration: 'none' }}>
            Download PDF
          </a>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    const url = mat.fileUrl;

    // VIDEO
    if (mat.type === 'video') {
      const ytId = getYouTubeId(url);
      if (ytId) return (
        <div style={{ width: '100%', aspectRatio: '16/9', background: '#000' }}>
          <iframe src={`https://www.youtube.com/embed/${ytId}?rel=0`}
            style={{ width: '100%', height: '100%', border: 'none' }}
            allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
        </div>
      );
      return (
        <div style={{ background: '#000' }}>
          <video controls style={{ width: '100%', maxHeight: '75vh', display: 'block' }} src={url} />
        </div>
      );
    }

    // AUDIO
    if (mat.type === 'audio') return (
      <div style={{ background: 'linear-gradient(135deg, #0d3d26, #1a7a4a)', padding: '48px 32px', textAlign: 'center' }}>
        {mat.coverImage && (
          <img src={mat.coverImage} alt={mat.title}
            style={{ width: 160, height: 160, borderRadius: 16, objectFit: 'cover', margin: '0 auto 24px', display: 'block', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }} />
        )}
        <div style={{ color: 'white', fontSize: 20, fontWeight: 700, marginBottom: 6 }}>{mat.title}</div>
        {mat.author && <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 28 }}>by {mat.author}</div>}
        <audio controls style={{ width: '100%', maxWidth: 480, margin: '0 auto', display: 'block' }} src={url} />
      </div>
    );

    // PDF / BOOK / STORY
    return renderPDF(url);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8f7f4', fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar />

      {/* Back bar */}
      <div style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '10px 20px', position: 'sticky', top: 64, zIndex: 40 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => router.back()}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#555', fontSize: 13, fontWeight: 500 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m15 18-6-6 6-6"/></svg>
            Back
          </button>
          <span style={{ color: '#ddd' }}>|</span>
          <span style={{ fontSize: 13, color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{mat.title}</span>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '20px' }}>
        {/* Title row */}
        <div style={{ marginBottom: 16 }}>
          <span style={{ background: color, color: 'white', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{mat.type}</span>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(18px, 2.5vw, 28px)', fontWeight: 700, color: '#111', marginTop: 8, lineHeight: 1.3 }}>{mat.title}</h1>
          {mat.author && <p style={{ fontSize: 13, color: '#888', marginTop: 3 }}>by {mat.author}</p>}
        </div>

        {/* Main layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: 20, alignItems: 'start' }}>

          {/* Content */}
          <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', minWidth: 0 }}>
            {renderContent()}
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {mat.coverImage && mat.type !== 'video' && (
              <img src={mat.coverImage} alt={mat.title}
                style={{ width: '100%', height: 170, objectFit: 'cover', borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }} />
            )}

            {/* Details */}
            <div style={{ background: 'white', borderRadius: 12, padding: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Details</div>
              {[
                { label: 'Subject', value: mat.subject },
                { label: 'Language', value: mat.language === 'sw' ? 'Kiswahili' : mat.language === 'en' ? 'English' : 'Both' },
                { label: 'Views', value: String(mat.views) },
                ...(mat.classes?.length ? [{ label: 'Classes', value: mat.classes.slice(0,3).join(', ') }] : []),
              ].map(d => (
                <div key={d.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 7 }}>
                  <span style={{ color: '#888' }}>{d.label}</span>
                  <span style={{ color: '#111', fontWeight: 600, textAlign: 'right', maxWidth: 130 }}>{d.value}</span>
                </div>
              ))}
            </div>

            {mat.description && (
              <div style={{ background: 'white', borderRadius: 12, padding: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>About</div>
                <p style={{ fontSize: 12, color: '#666', lineHeight: 1.7 }}>{mat.description}</p>
              </div>
            )}

            {/* Tip */}
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#92400e', marginBottom: 4 }}>Reading Tips</div>
              <p style={{ fontSize: 11, color: '#78350f', lineHeight: 1.6 }}>
                If the book does not load, click <strong>Try Google Viewer</strong> or <strong>Download PDF</strong> below the viewer.
              </p>
            </div>
          </div>
        </div>
      </div>
      <style>{`@media(max-width:768px){.reader-main{grid-template-columns:1fr !important}}`}</style>
    </div>
  );
}