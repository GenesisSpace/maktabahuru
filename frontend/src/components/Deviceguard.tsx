'use client';
import { useEffect, useState } from 'react';

export default function DeviceGuard({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const ua = navigator.userAgent;
      const mobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(ua);
      const smallScreen = window.innerWidth < 768;
      // Block if mobile user agent AND small screen
      setIsMobile(mobileUA && smallScreen);
      setChecked(true);
    };
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  if (!checked) return null;

  if (isMobile) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0d3d26',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        fontFamily: "'DM Sans', sans-serif",
      }}>
        {/* Background pattern */}
        <div style={{
          position: 'fixed', inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          pointerEvents: 'none',
        }} />

        <div style={{
          background: 'white',
          borderRadius: 20,
          padding: '40px 28px',
          maxWidth: 340,
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 24px 64px rgba(0,0,0,0.3)',
          position: 'relative',
        }}>
          {/* Logo */}
          <img src="/logo.png" alt="Maktaba Huru" style={{ height: 72, objectFit: 'contain', marginBottom: 20 }} />

          {/* Icon */}
          <div style={{
            width: 64, height: 64, borderRadius: 16,
            background: '#fef2f2', margin: '0 auto 20px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round">
              <rect x="5" y="2" width="14" height="20" rx="2"/>
              <path d="M12 18h.01"/>
            </svg>
          </div>

          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 22, fontWeight: 700, color: '#111', marginBottom: 12,
          }}>
            Mobile Not Supported
          </h1>

          <p style={{ fontSize: 14, color: '#666', lineHeight: 1.75, marginBottom: 24 }}>
            Maktaba Huru is a <strong>computer-based system</strong>. Please open this website on a <strong>desktop or laptop computer</strong> to access the library.
          </p>

          <div style={{
            background: '#f8f7f4', borderRadius: 12, padding: '16px',
            display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left',
          }}>
            <div style={{ flexShrink: 0 }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1a7a4a" strokeWidth="1.5" strokeLinecap="round">
                <rect x="2" y="3" width="20" height="14" rx="2"/>
                <path d="M8 21h8M12 17v4"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#111', marginBottom: 2 }}>Use a Computer</div>
              <div style={{ fontSize: 11, color: '#888' }}>Open <strong>maktabahuru.co.tz</strong> on a desktop or laptop browser</div>
            </div>
          </div>

          <div style={{
            marginTop: 20, padding: '10px 16px',
            background: '#0d3d2611', borderRadius: 8,
            fontSize: 12, color: '#1a7a4a', fontWeight: 600,
          }}>
            Maktaba Huru — E-Library Tanzania
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}