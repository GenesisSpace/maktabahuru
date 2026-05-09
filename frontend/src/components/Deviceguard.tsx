'use client';
import { useEffect, useState } from 'react';

// Add ALL possible IPs for your library network here
const ALLOWED_IPS = [
  '197.250.51.186', // Masasi Library WiFi
  // If you get a new IP, add it here
];

const CACHE_KEY = 'maktaba_ip_ok';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

type Status = 'checking' | 'allowed' | 'blocked' | 'mobile';

export default function DeviceGuard({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>('checking');

  useEffect(() => {
    // STEP 1 — Admin pages always open, no checks
    if (window.location.pathname.startsWith('/admin')) {
      setStatus('allowed');
      return;
    }

    // STEP 2 — Block mobile
    const ua = navigator.userAgent;
    const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(ua);
    if (isMobileUA && window.innerWidth < 768) {
      setStatus('mobile');
      return;
    }

    // STEP 3 — Check cache first (instant if verified within 7 days)
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

    // STEP 4 — Check IP (only on first visit or after 7 days)
    // Use multiple IP services as fallback
    const checkIP = async () => {
      const services = [
        'https://api.ipify.org?format=json',
        'https://api.my-ip.io/ip.json',
        'https://ipapi.co/json/',
      ];

      for (const service of services) {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 4000);
          const r = await fetch(service, { signal: controller.signal });
          clearTimeout(timeout);
          const data = await r.json();
          const ip = data.ip || data.IP || data.query;
          if (ip) {
            if (ALLOWED_IPS.includes(ip)) {
              localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), ip }));
              setStatus('allowed');
            } else {
              setStatus('blocked');
            }
            return;
          }
        } catch { /* try next service */ }
      }

      // All services failed — allow access to avoid blocking library computers
      // This handles cases where the network blocks these IP check services
      localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), ip: 'unknown' }));
      setStatus('allowed');
    };

    checkIP();
  }, []);

  if (status === 'checking') return (
    <div style={{ minHeight: '100vh', background: '#0d3d26', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, fontFamily: 'sans-serif' }}>
      <img src="/logo.png" alt="Maktaba Huru" style={{ height: 80, objectFit: 'contain' }} />
      <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>Loading library...</div>
      <div style={{ width: 32, height: 32, border: '3px solid rgba(255,255,255,0.12)', borderTop: '3px solid #c8922a', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
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
      hint="Connect to the library WiFi and refresh the page"
      action={{ label: 'Try Again', onClick: () => { localStorage.removeItem(CACHE_KEY); window.location.reload(); } }}
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