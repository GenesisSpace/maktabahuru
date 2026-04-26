'use client';
import { coverUrl, openMaterial } from '@/lib/api';

interface Material {
  _id: string; title: string; description?: string;
  type: 'book' | 'video' | 'story' | 'audio';
  subject: string; classes: string[]; ageMin: number; ageMax: number;
  coverImage: string | null; views: number; downloads: number; language: string;
}

const TYPE_COLOR  = { book: '#1a5c38', video: '#1d4ed8', story: '#6d28d9', audio: '#c2410c' };
const TYPE_LABEL  = { book: 'BOOK', video: 'VIDEO', story: 'STORY', audio: 'AUDIO' };
const TYPE_ACTION = { book: 'Read Now', video: 'Watch Now', story: 'Read Now', audio: 'Listen Now' };

const TYPE_ICON = {
  book: (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
  ),
  video: (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
      <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>
    </svg>
  ),
  story: (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
      <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
    </svg>
  ),
  audio: (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
      <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
    </svg>
  ),
};

export default function MaterialCard({ mat }: { mat: Material }) {
  const color = TYPE_COLOR[mat.type] || '#1a5c38';

  return (
    <>
      <style>{`
        .mat-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid rgba(0,0,0,0.07);
          display: flex;
          flex-direction: column;
          transition: transform 0.22s ease, box-shadow 0.22s ease;
          cursor: pointer;
        }
        .mat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 16px 40px rgba(0,0,0,0.13);
        }
        .mat-card:hover .mat-cover-img {
          transform: scale(1.06);
        }
        .mat-card:hover .mat-btn {
          opacity: 0.88;
        }
        .mat-cover-img {
          transition: transform 0.4s ease;
        }
        .mat-btn {
          transition: opacity 0.15s ease;
        }
      `}</style>

      <div className="mat-card">
        {/* ── Cover ── */}
        <div style={{
          height: 200,
          background: `linear-gradient(135deg, ${color}22 0%, ${color}44 100%)`,
          position: 'relative',
          overflow: 'hidden',
          flexShrink: 0,
        }}>
          {mat.coverImage ? (
            <img
              src={coverUrl(mat.coverImage)}
              alt={mat.title}
              className="mat-cover-img"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          ) : (
            /* Placeholder with big centered icon */
            <div style={{
              width: '100%', height: '100%',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 10,
              background: `linear-gradient(145deg, ${color}18, ${color}35)`,
            }}>
              {/* Decorative circles */}
              <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: `${color}18` }} />
              <div style={{ position: 'absolute', bottom: -30, left: -10, width: 120, height: 120, borderRadius: '50%', background: `${color}12` }} />
              <div style={{ color, opacity: 0.5, position: 'relative', zIndex: 1 }}>
                {TYPE_ICON[mat.type]}
              </div>
              <span style={{ fontSize: 11, color, opacity: 0.5, fontWeight: 600, letterSpacing: '0.04em', position: 'relative', zIndex: 1 }}>
                {TYPE_LABEL[mat.type]}
              </span>
            </div>
          )}

          {/* Gradient overlay at bottom for text readability */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 70,
            background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 100%)',
            pointerEvents: 'none',
          }} />

          {/* Type badge — top left */}
          <div style={{
            position: 'absolute', top: 10, left: 10,
            background: color, color: 'white',
            fontSize: 9, fontWeight: 800,
            padding: '3px 8px', borderRadius: 5,
            letterSpacing: '0.07em',
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
          }}>
            {TYPE_LABEL[mat.type]}
          </div>

          {/* Language badge — top right */}
          <div style={{
            position: 'absolute', top: 10, right: 10,
            background: 'rgba(255,255,255,0.92)',
            color: '#333', fontSize: 9, fontWeight: 700,
            padding: '3px 8px', borderRadius: 5,
            backdropFilter: 'blur(4px)',
          }}>
            {mat.language === 'sw' ? 'SW' : mat.language === 'en' ? 'EN' : 'SW/EN'}
          </div>

          {/* Play icon overlay for video */}
          {mat.type === 'video' && mat.coverImage && (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{
                width: 46, height: 46, borderRadius: '50%',
                background: 'rgba(255,255,255,0.92)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill={color}>
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
              </div>
            </div>
          )}

          {/* Classes pill at bottom-left over gradient */}
          {mat.classes?.length > 0 && (
            <div style={{
              position: 'absolute', bottom: 8, left: 10,
              display: 'flex', gap: 4, flexWrap: 'wrap',
            }}>
              {mat.classes.slice(0, 2).map(c => (
                <span key={c} style={{
                  fontSize: 9, fontWeight: 600,
                  background: 'rgba(255,255,255,0.88)',
                  color: '#333', padding: '2px 7px', borderRadius: 4,
                  backdropFilter: 'blur(4px)',
                }}>
                  {c}
                </span>
              ))}
              {mat.classes.length > 2 && (
                <span style={{
                  fontSize: 9, fontWeight: 600,
                  background: 'rgba(255,255,255,0.7)',
                  color: '#555', padding: '2px 7px', borderRadius: 4,
                }}>
                  +{mat.classes.length - 2}
                </span>
              )}
            </div>
          )}
        </div>

        {/* ── Content ── */}
        <div style={{
          padding: '12px 14px 14px',
          flex: 1, display: 'flex', flexDirection: 'column', gap: 6,
        }}>
          <h3 style={{
            fontSize: 13.5, fontWeight: 700, color: '#111',
            lineHeight: 1.35, margin: 0,
            overflow: 'hidden', display: '-webkit-box',
            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          }}>
            {mat.title}
          </h3>

          {mat.description && (
            <p style={{
              fontSize: 11.5, color: '#888', lineHeight: 1.5, margin: 0,
              overflow: 'hidden', display: '-webkit-box',
              WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            }}>
              {mat.description}
            </p>
          )}

          {/* Stats */}
          <div style={{
            display: 'flex', gap: 10, fontSize: 11, color: '#bbb',
            marginTop: 'auto', paddingTop: 6,
            alignItems: 'center',
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
              {mat.views}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              {mat.downloads}
            </span>
          </div>

          {/* CTA Button */}
          <button
            className="mat-btn"
            onClick={() => openMaterial(mat._id, mat.type)}
            style={{
              width: '100%', padding: '10px',
              borderRadius: 9, border: 'none',
              cursor: 'pointer',
              background: color,
              color: 'white',
              fontSize: 12.5, fontWeight: 700,
              marginTop: 4,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            {mat.type === 'video' && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            )}
            {mat.type === 'audio' && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/></svg>
            )}
            {(mat.type === 'book' || mat.type === 'story') && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
            )}
            {TYPE_ACTION[mat.type]}
          </button>
        </div>
      </div>
    </>
  );
}