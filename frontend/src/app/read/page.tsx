'use client';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function Reader() {
  const sp = useSearchParams();
  const url = sp.get('url');

  if (!url) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'sans-serif', color: '#888' }}>
      No file provided.
    </div>
  );

  // Use Google Docs Viewer to render the PDF inline — bypasses Cloudinary's forced download header
  const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', background: '#1a1a1a' }}>
      {/* Top bar */}
      <div style={{ background: '#0d3d26', padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e8b04a" strokeWidth="2" strokeLinecap="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
          <span style={{ color: 'white', fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600 }}>
            Maktabahuru Reader
          </span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <a href={url} target="_blank" rel="noreferrer"
            style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', textDecoration: 'none', padding: '6px 12px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 6 }}>
            Download ↓
          </a>
          <button onClick={() => window.close()}
            style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', background: 'none', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 6, padding: '6px 12px', cursor: 'pointer' }}>
            Close
          </button>
        </div>
      </div>

      {/* Google Docs Viewer iframe */}
      <iframe
        src={googleViewerUrl}
        style={{ flex: 1, border: 'none', width: '100%' }}
        title="PDF Reader"
        allow="autoplay"
      />
    </div>
  );
}

export default function ReadPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#1a1a1a', color: 'white', fontFamily: 'sans-serif' }}>
        Loading reader...
      </div>
    }>
      <Reader />
    </Suspense>
  );
}