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

type PdfViewer = 'google' | 'direct' | 'office';

export default function ReaderPage() {
  const params = useParams();
  const router = useRouter();
  const [mat, setMat] = useState<Material | null>(null);
  const [loading, setLoading] = useState(true);
  const [pdfViewer, setPdfViewer] = useState<PdfViewer>('google');
  const [iframeError, setIframeError] = useState(false);

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

  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  const TYPE_COLOR: Record<string, string> = { book: '#1a5c38', video: '#1d4ed8', story: '#6d28d9', audio: '#c2410c' };
  const color = TYPE_COLOR[mat.type] || '#1a5c38';

  const getPdfSrc = (url: string, viewer: PdfViewer) => {
    switch (viewer) {
      case 'google': return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
      case 'office': return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
      case 'direct': return url;
      default: return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
    }
  };

  const renderContent = () => {
    const url = mat.fileUrl;

    // VIDEO
    if (mat.type === 'video') {
      const ytId = getYouTubeId(url);
      if (ytId) return (
        <div style={{ width: '100%', aspectRatio: '16/9', borderRadius: 12, overflow: 'hidden', background: '#000' }}>
          <iframe src={`https://www.youtube.com/embed/${ytId}?rel=0`}
            style={{ width: '100%', height: '100%', border: 'none' }}
            allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
        </div>
      );
      return (
        <div style={{ borderRadius: 12, overflow: 'hidden', background: '#000' }}>
          <video controls style={{ width: '100%', maxHeight: '70vh' }} src={url}>Your browser does not support video.</video>
        </div>
      );
    }

    // AUDIO
    if (mat.type === 'audio') return (
      <div style={{ background: '#0d3d26', borderRadius: 16, padding: '48px 32px', textAlign: 'center' }}>
        {mat.coverImage && <img src={mat.coverImage} alt={mat.title} style={{ width: 160, height: 160, borderRadius: 12, objectFit: 'cover', margin: '0 auto 24px', display: 'block' }} />}
        <div style={{ color: 'white', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{mat.title}</div>
        {mat.author && <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 24 }}>{mat.author}</div>}
        <audio controls style={{ width: '100%' }} src={url} />
      </div>
    );

    // PDF / BOOK / STORY
    return (
      <div>
        {/* Viewer switcher toolbar */}
        <div style={{ background: '#1a1a2e', padding: '10px 16px', borderRadius: '12px 12px 0 0', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginRight: 4 }}>Viewer:</span>
          {([
            { key: 'google', label: 'Google Viewer' },
            { key: 'direct', label: 'Direct' },
            { key: 'office', label: 'Office Viewer' },
          ] as { key: PdfViewer; label: string }[]).map(v => (
            <button key={v.key}
              onClick={() => { setPdfViewer(v.key); setIframeError(false); }}
              style={{ background: pdfViewer === v.key ? '#c8922a' : 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: 6, padding: '5px 12px', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
              {v.label}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          {/* Download button */}
          <a href={url} target="_blank" rel="noreferrer" download
            style={{ background: '#1a7a4a', color: 'white', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 11, fontWeight: 600, cursor: 'pointer', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Download
          </a>
          {/* Open in new tab */}
          <a href={url} target="_blank" rel="noreferrer"
            style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 11, fontWeight: 600, cursor: 'pointer', textDecoration: 'none' }}>
            Open in Tab
          </a>
        </div>

        {/* PDF Viewer iframe */}
        {!iframeError ? (
          <div style={{ position: 'relative', height: '78vh', background: '#525659', borderRadius: '0 0 12px 12px', overflow: 'hidden' }}>
            <iframe
              key={pdfViewer}
              src={getPdfSrc(url, pdfViewer)}
              style={{ width: '100%', height: '100%', border: 'none' }}
              title={mat.title}
              onError={() => setIframeError(true)}
            />
          </div>
        ) : (
          /* Fallback when iframe fails (large files) */
          <div style={{ background: '#f8f7f4', borderRadius: '0 0 12px 12px', padding: '48px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111', marginBottom: 8 }}>File Too Large to Preview</h3>
            <p style={{ fontSize: 14, color: '#666', lineHeight: 1.7, marginBottom: 24, maxWidth: 400, margin: '0 auto 24px' }}>
              This file is too large to display in the browser viewer. You can download it to read it on your computer.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href={url} download target="_blank" rel="noreferrer"
                style={{ background: '#1a7a4a', color: 'white', padding: '12px 28px', borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
                Download File
              </a>
              <a href={url} target="_blank" rel="noreferrer"
                style={{ background: '#f3f4f6', color: '#333', padding: '12px 28px', borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
                Open in New Tab
              </a>
            </div>
            <p style={{ fontSize: 12, color: '#aaa', marginTop: 20 }}>
              Try switching the viewer above — Google Viewer, Direct, or Office Viewer may work differently.
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8f7f4', fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar />

      {/* Back bar */}
      <div style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '10px 20px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <button onClick={() => router.back()}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#555', fontSize: 13, fontWeight: 500 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m15 18-6-6 6-6"/></svg>
            Back
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 20px' }}>
        {/* Title */}
        <div style={{ marginBottom: 20 }}>
          <span style={{ background: color, color: 'white', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{mat.type}</span>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(20px, 3vw, 30px)', fontWeight: 700, color: '#111', marginTop: 10, lineHeight: 1.3 }}>{mat.title}</h1>
          {mat.author && <p style={{ fontSize: 14, color: '#888', marginTop: 4 }}>by {mat.author}</p>}
        </div>

        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 250px', gap: 24, alignItems: 'start' }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
              {renderContent()}
            </div>
          </div>

          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {mat.coverImage && mat.type !== 'video' && (
              <div style={{ borderRadius: 12, overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
                <img src={mat.coverImage} alt={mat.title} style={{ width: '100%', height: 180, objectFit: 'cover' }} />
              </div>
            )}
            <div style={{ background: 'white', borderRadius: 12, padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
              <h3 style={{ fontSize: 11, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Details</h3>
              {[
                { label: 'Subject', value: mat.subject },
                { label: 'Language', value: mat.language === 'sw' ? 'Kiswahili' : mat.language === 'en' ? 'English' : 'Both' },
                { label: 'Views', value: mat.views.toString() },
                ...(mat.classes?.length ? [{ label: 'Classes', value: mat.classes.join(', ') }] : []),
              ].map(d => (
                <div key={d.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                  <span style={{ color: '#888' }}>{d.label}</span>
                  <span style={{ color: '#111', fontWeight: 600, textAlign: 'right', maxWidth: 140, fontSize: 12 }}>{d.value}</span>
                </div>
              ))}
            </div>
            {mat.description && (
              <div style={{ background: 'white', borderRadius: 12, padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
                <h3 style={{ fontSize: 11, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>About</h3>
                <p style={{ fontSize: 13, color: '#666', lineHeight: 1.7 }}>{mat.description}</p>
              </div>
            )}
            
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#92400e', marginBottom: 6 }}>Having trouble viewing?</div>
              <p style={{ fontSize: 11, color: '#78350f', lineHeight: 1.6 }}>
                Try switching the viewer at the top of the document. If the file is too large, use the Download button to read it on your computer.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}