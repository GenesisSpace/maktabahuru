import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{ background: '#0d3d26', color: 'rgba(255,255,255,0.55)', fontFamily: "'DM Sans', sans-serif" }} className="mt-auto">
      <div className="max-w-6xl mx-auto px-5 py-12">
        <div className="flex flex-col sm:flex-row justify-between gap-10">
          <div style={{ maxWidth: 300 }}>
            <div className="flex items-center gap-3 mb-4">
              <div style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                overflow: 'hidden',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255,255,255,0.08)',
                border: '2px solid rgba(255,255,255,0.15)',
              }}>
                <img src="/klb.jpeg" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div>
                <div style={{ fontFamily: "'Playfair Display', serif", color: 'white', fontSize: 16, fontWeight: 700 }}>Maktaba Huru</div>
                <div style={{ color: '#06b6d4', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase' }}>E-Library Tanzania</div>
              </div>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.75 }}>
              Free education for every child in Tanzania. No registration, no fees — just open and learn.
            </p>
          </div>
          <div className="flex gap-16">
            <div>
              <div style={{ color: 'white', fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>Library</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[['/', 'Home'], ['/kids', 'Kids Corner'], ['/search', 'All Books']].map(([href, label]) => (
                  <Link key={href} href={href} style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, textDecoration: 'none' }}
                    className="hover:text-white transition-colors">{label}</Link>
                ))}
              </div>
            </div>
            <div>
              <div style={{ color: 'white', fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>Admin</div>
              <Link href="/admin/login" style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, textDecoration: 'none' }}
                className="hover:text-white transition-colors">Admin Login</Link>
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: 32, paddingTop: 24, fontSize: 12, textAlign: 'center' }}>
          Elimu ni haki ya kila mtoto — Education is every child's right
        </div>
      </div>
    </footer>
  );
}