'use client';
import { useEffect, useState } from 'react';

export default function MobileBlock({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(ua);
    const isSmallScreen = window.innerWidth < 768;
    setIsMobile(isMobileUA && isSmallScreen);
    setChecked(true);
  }, []);

  // Don't flash content before check
  if (!checked) return null;

  if (isMobile) {
    return (
      <div style={{ minHeight: '100vh', background: '#0d3d26', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'sans-serif' }}>
        <div style={{ position: 'fixed', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '24px 24px', pointerEvents: 'none' }} />
        <div style={{ background: 'white', borderRadius: 20, padding: '40px 28px', maxWidth: 360, width: '100%', textAlign: 'center', boxShadow: '0 24px 64px rgba(0,0,0,0.3)', position: 'relative' }}>
          <img src="/logo.png" alt="Maktaba Huru" style={{ height: 64, objectFit: 'contain', marginBottom: 24 }} />
          <div style={{ width: 68, height: 68, borderRadius: 16, background: '#fef2f2', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round">
              <rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/>
            </svg>
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111', marginBottom: 12 }}>Mobile Not Supported</h1>
          <p style={{ fontSize: 14, color: '#666', lineHeight: 1.75, marginBottom: 20 }}>
            Maktaba Huru is a computer-based system. Please open this website on a <strong>desktop or laptop computer</strong> to access the library.
          </p>
          <div style={{ background: '#f8f7f4', borderRadius: 10, padding: '12px 16px', fontSize: 12, color: '#888', lineHeight: 1.6 }}>
            Open <strong>maktabahuru.co.tz</strong> on a desktop or laptop browser
          </div>
          <div style={{ marginTop: 20, fontSize: 11, color: '#bbb' }}>Maktaba Huru — E-Library Tanzania</div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}