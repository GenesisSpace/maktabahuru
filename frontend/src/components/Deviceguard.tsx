'use client';
import { useEffect, useState } from 'react';

const FENCE = {
  lat: -10.71667,
  lng: 38.8,
  radiusMeters: 200,
};

const CACHE_KEY = 'maktaba_location_ok';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

function getDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

type Status = 'checking' | 'allowed' | 'outside' | 'mobile' | 'denied' | 'error';

export default function DeviceGuard({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>('checking');
  const [distance, setDistance] = useState<number | null>(null);

  useEffect(() => {
    // 1. Check mobile
    const ua = navigator.userAgent;
    const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(ua);
    const isSmallScreen = window.innerWidth < 768;
    if (isMobileUA && isSmallScreen) { setStatus('mobile'); return; }

    // 2. Admin pages bypass geofence
    if (window.location.pathname.startsWith('/admin')) { setStatus('allowed'); return; }

    // 3. Check cache — if verified recently, skip GPS check
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

    // 4. Geolocation check
    if (!navigator.geolocation) { setStatus('error'); return; }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const dist = getDistance(pos.coords.latitude, pos.coords.longitude, FENCE.lat, FENCE.lng);
        setDistance(Math.round(dist));
        if (dist <= FENCE.radiusMeters) {
          // Save to cache so we don't ask again for 30 minutes
          localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now() }));
          setStatus('allowed');
        } else {
          setStatus('outside');
        }
      },
      (err) => setStatus(err.code === err.PERMISSION_DENIED ? 'denied' : 'error'),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  }, []);

  if (status === 'checking') return (
    <div style={{ minHeight: '100vh', background: '#0d3d26', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20, fontFamily: 'sans-serif' }}>
      <img src="/logo.png" alt="Maktaba Huru" style={{ height: 80, objectFit: 'contain' }} />
      <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>Verifying your location...</div>
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

  if (status === 'denied') return (
    <BlockPage
      iconColor="#d97706" iconBg="#fffbeb"
      iconPath={<><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>}
      title="Location Access Required"
      message="This library requires location access to verify you are within the authorized area. Please allow location access in your browser and refresh the page."
      hint='Click the location icon in your browser address bar and select "Allow"'
      action={{ label: 'Refresh Page', onClick: () => window.location.reload() }}
    />
  );

  if (status === 'outside') return (
    <BlockPage
      iconColor="#dc2626" iconBg="#fef2f2"
      iconPath={<><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></>}
      title="Outside Authorized Area"
      message={`You are ${distance ? distance + ' meters' : 'too far'} from the authorized library zone. This system is only available within the Masasi learning center.`}
      hint="Please visit the library in person to access these materials"
    />
  );

  if (status === 'error') return (
    <BlockPage
      iconColor="#d97706" iconBg="#fffbeb"
      iconPath={<><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>}
      title="Location Unavailable"
      message="Could not determine your location. Please make sure location services are enabled and try again."
      hint="Enable location services in your browser settings and refresh"
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