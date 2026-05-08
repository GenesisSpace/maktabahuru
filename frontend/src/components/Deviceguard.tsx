'use client';
import { useEffect, useState } from 'react';

const ALLOWED_IPS = [
  '197.250.51.186', // Masasi Library
];

const CACHE_KEY = 'maktaba_ip_ok';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

type Status = 'checking' | 'allowed' | 'blocked' | 'mobile';

export default function DeviceGuard({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>('checking');
  const [userIp, setUserIp] = useState('');

  useEffect(() => {
    // 1. Check mobile
    const ua = navigator.userAgent;
    const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(ua);
    const isSmallScreen = window.innerWidth < 768;
    if (isMobileUA && isSmallScreen) { setStatus('mobile'); return; }

    // 2. Admin pages — always allowed
    if (window.location.pathname.startsWith('/admin')) { setStatus('allowed'); return; }

    // 3. Check cache — skip IP check if verified recently
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { timestamp, ip } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION && ALLOWED_IPS.includes(ip)) {
          setStatus('allowed');
          return;
        }
      }
    } catch { /* ignore */ }

    // 4. Check IP via public API
    fetch('https://api.ipify.org?format=json')
      .then(r => r.json())
      .then(data => {
        const ip = data.ip;
        setUserIp(ip);
        if (ALLOWED_IPS.includes(ip)) {
          // Cache for 24 hours
          localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), ip }));
          setStatus('allowed');
        } else {
          setStatus('blocked');
        }
      })
      .catch(() => {
        // If IP check fails, check cache as fallback
        try {
          const cached = localStorage.getItem(CACHE_KEY);
          if (cached) {
            const { timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < CACHE_DURATION) {
              setStatus('allowed');
              return;
            }
          }
        } catch { /* ignore */ }
        setStatus('blocked');
      });
  }, []);

  if (status === 'checking') return (
    <div style={{ minHeight: '100vh', background: '#0d3d26', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20, fontFamily: 'sans-serif' }}>
      <img src="/logo.png" alt="Maktaba Huru" style={{ height: 80, objectFit: 'contain' }} />
      <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>Loading library...</div>
      <div style={{ width: 36, height: 36, border: '3px solid rgba(255,255,255,0.15)', borderTop: '3px solid #c8922a', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (status === 'mobile') return (
    <BlockPage
      iconColor="#dc2626" iconBg="#fef2f2"
      iconPath={<><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/></>}
      title="Mobile Not Supported"
      message="Maktaba Huru is a computer-based system. Please open this website on a desktop or laptop computer to access the library."
      hint="Open maktabahuru.co.tz on a desktop or laptop browser"
    />
  );

  if (status === 'blocked') return (
    <BlockPage
      iconColor="#dc2626" iconBg="#fef2f2"
      iconPath={<><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>}
      title="Access Restricted"
      message="This library is only available within the Masasi Learning Center. Please connect to the library network to access these materials."
      hint={`Your current network is not authorized to access this system${userIp ? ` (${userIp})` : ''}`}
    />
  );

  return <>{children}</>;
}

function BlockPage({ iconColor, iconBg, iconPath, title, message, hint, action }: {
  iconColor: string; iconBg: string; iconPath: React.ReactNode;
  title: string; message: string; hint: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div style={{ minHeight: '100vh', background: '#0d3d26', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'sans-serif' }}>
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '24px 24px', pointerEvents: 'none' }} />
      <div style={{ background: 'white', borderRadius: 20, padding: '40px 28px', maxWidth: 380, width: '100%', textAlign: 'center', boxShadow: '0 24px 64px rgba(0,0,0,0.3)', position: 'relative' }}>
        <img src="/logo.png" alt="Maktaba Huru" style={{ height: 64, objectFit: 'contain', marginBottom: 24 }} />
        <div style={{ width: 68, height: 68, borderRadius: 16, background: iconBg, margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.5" strokeLinecap="round">{iconPath}</svg>
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111', marginBottom: 12 }}>{title}</h1>
        <p style={{ fontSize: 14, color: '#666', lineHeight: 1.75, marginBottom: 20 }}>{message}</p>
        <div style={{ background: '#f8f7f4', borderRadius: 10, padding: '12px 16px', fontSize: 12, color: '#888', lineHeight: 1.6, marginBottom: action ? 16 : 0 }}>{hint}</div>
        {action && (
          <button onClick={action.onClick} style={{ width: '100%', background: '#0d3d26', color: 'white', padding: '12px', borderRadius: 10, border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', marginTop: 4 }}>
            {action.label}
          </button>
        )}
        <div style={{ marginTop: 20, fontSize: 11, color: '#bbb' }}>Maktaba Huru — E-Library Tanzania</div>
      </div>
    </div>
  );
}