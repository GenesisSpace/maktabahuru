'use client';
import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { SUBJECT_INFO, CLASSES } from '@/lib/subjects';

const SUBJECTS = Object.keys(SUBJECT_INFO);
const FORMATS_FOR: Record<string, string[]> = {
  book:  ['pdf', 'epub', 'link'],
  video: ['mp4', 'youtube', 'link'],
  story: ['pdf', 'link'],
  audio: ['mp3', 'link'],
};

interface Props { item: any; onClose: () => void; onSaved: () => void; }

export default function AddMaterialModal({ item, onClose, onSaved }: Props) {
  const isEdit = !!item;
  const [form, setForm] = useState({
    title: '', titleSw: '', description: '', author: '',
    subject: SUBJECTS[0], type: 'book',
    format: 'pdf', classes: [] as string[],
    ageMin: '0', ageMax: '99',
    language: 'en',          // ← DEFAULT IS ENGLISH
    isForKids: false, isFeatured: false, isPublished: false,
    fileUrl: '', isExternal: false,
  });
  const [file, setFile] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (item) {
      setForm({
        title: item.title || '', titleSw: item.titleSw || '',
        description: item.description || '', author: item.author || '',
        subject: item.subject || SUBJECTS[0], type: item.type || 'book',
        format: item.format || 'pdf', classes: item.classes || [],
        ageMin: String(item.ageMin ?? 0), ageMax: String(item.ageMax ?? 99),
        language: item.language || 'en',   // ← default English on edit too
        isForKids: item.isForKids || false, isFeatured: item.isFeatured || false,
        isPublished: item.isPublished || false,
        fileUrl: item.isExternal ? item.fileUrl : '', isExternal: item.isExternal || false,
      });
    }
  }, [item]);

  const toggleClass = (c: string) => {
    setForm(f => ({ ...f, classes: f.classes.includes(c) ? f.classes.filter(x => x !== c) : [...f.classes, c] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.isExternal && !file && !isEdit) { setError('Please select a file or enter an external URL.'); return; }
    setLoading(true); setError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (Array.isArray(v)) fd.append(k, JSON.stringify(v));
        else fd.append(k, String(v));
      });
      if (file)  fd.append('file', file);
      if (cover) fd.append('cover', cover);
      if (isEdit) {
        await api.put(`/admin/materials/${item._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post('/admin/materials', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      onSaved();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error occurred. Please try again.');
    } finally { setLoading(false); }
  };

  const formats = FORMATS_FOR[form.type] || ['pdf'];
  const inp: React.CSSProperties = { width: '100%', border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box', background: 'white' };
  const lbl: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: '#444', display: 'block', marginBottom: 5 };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: 'white', borderRadius: 16, width: '100%', maxWidth: 640, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.25)', fontFamily: "'DM Sans', sans-serif" }}>

        {/* Header */}
        <div style={{ position: 'sticky', top: 0, background: 'white', borderBottom: '1px solid #f3f4f6', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10 }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: '#111' }}>
            {isEdit ? 'Edit Material' : 'Add New Material'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 4 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: 8, padding: '10px 14px', fontSize: 13 }}>{error}</div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={lbl}>Title *</label>
              <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                style={inp} placeholder="e.g. Mathematics Standard 3" />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={lbl}>Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                style={{ ...inp, minHeight: 64, resize: 'vertical' }} placeholder="Short description..." rows={2} />
            </div>
            <div>
              <label style={lbl}>Author</label>
              <input value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))}
                style={inp} placeholder="e.g. MoEVT Tanzania" />
            </div>
            <div>
              <label style={lbl}>Language</label>
              <select value={form.language} onChange={e => setForm(f => ({ ...f, language: e.target.value }))} style={inp}>
                <option value="en">English</option>
                <option value="sw">Kiswahili</option>
                <option value="both">Both</option>
              </select>
            </div>
            <div>
              <label style={lbl}>Subject *</label>
              <select required value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} style={inp}>
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Type *</label>
              <select required value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value, format: FORMATS_FOR[e.target.value][0] }))} style={inp}>
                <option value="book">Book</option>
                <option value="video">Video</option>
                <option value="story">Story</option>
                <option value="audio">Audio</option>
              </select>
            </div>
            <div>
              <label style={lbl}>Format</label>
              <select value={form.format} onChange={e => setForm(f => ({ ...f, format: e.target.value }))} style={inp}>
                {formats.map(f => <option key={f} value={f}>{f.toUpperCase()}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>File Source</label>
              <select value={form.isExternal ? 'external' : 'upload'}
                onChange={e => setForm(f => ({ ...f, isExternal: e.target.value === 'external' }))} style={inp}>
                <option value="upload">Upload File</option>
                <option value="external">External URL</option>
              </select>
            </div>
          </div>

          {/* File / URL */}
          {form.isExternal ? (
            <div>
              <label style={lbl}>File URL *</label>
              <input required={!isEdit} value={form.fileUrl} onChange={e => setForm(f => ({ ...f, fileUrl: e.target.value }))}
                style={inp} placeholder="https://..." />
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={lbl}>Upload File {!isEdit && '*'}</label>
                <input ref={fileRef} type="file" onChange={e => setFile(e.target.files?.[0] || null)}
                  style={{ display: 'none' }} accept=".pdf,.epub,.mp4,.mp3,.ogg" />
                <button type="button" onClick={() => fileRef.current?.click()}
                  style={{ width: '100%', border: '2px dashed #e5e7eb', borderRadius: 8, padding: '12px', fontSize: 13, color: '#888', background: 'white', cursor: 'pointer', textAlign: 'center' }}>
                  {file ? file.name : isEdit ? 'Replace file (optional)' : 'Choose file'}
                </button>
              </div>
              <div>
                <label style={lbl}>Cover Image (optional)</label>
                <input ref={coverRef} type="file" onChange={e => setCover(e.target.files?.[0] || null)}
                  style={{ display: 'none' }} accept="image/*" />
                <button type="button" onClick={() => coverRef.current?.click()}
                  style={{ width: '100%', border: '2px dashed #e5e7eb', borderRadius: 8, padding: '12px', fontSize: 13, color: '#888', background: 'white', cursor: 'pointer', textAlign: 'center' }}>
                  {cover ? cover.name : 'Choose image'}
                </button>
              </div>
            </div>
          )}

          {/* Classes */}
          <div>
            <label style={lbl}>Suitable Classes</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {CLASSES.map(c => (
                <button key={c} type="button" onClick={() => toggleClass(c)}
                  style={{ padding: '5px 11px', borderRadius: 6, fontSize: 11, fontWeight: 600, border: '1px solid', cursor: 'pointer', background: form.classes.includes(c) ? '#0d3d26' : 'white', color: form.classes.includes(c) ? 'white' : '#666', borderColor: form.classes.includes(c) ? '#0d3d26' : '#e5e7eb' }}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Age range */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={lbl}>Min Age</label>
              <input type="number" min="0" max="18" value={form.ageMin}
                onChange={e => setForm(f => ({ ...f, ageMin: e.target.value }))} style={inp} />
            </div>
            <div>
              <label style={lbl}>Max Age (99 = all)</label>
              <input type="number" min="0" max="99" value={form.ageMax}
                onChange={e => setForm(f => ({ ...f, ageMax: e.target.value }))} style={inp} />
            </div>
          </div>

          {/* Toggles */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
            {([
              ['isForKids', 'For Young Children (under 6)'],
              ['isFeatured', 'Featured Material'],
              ['isPublished', 'Publish Now'],
            ] as [string, string][]).map(([key, label]) => (
              <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#444' }}>
                <input type="checkbox" checked={(form as any)[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.checked }))}
                  style={{ width: 16, height: 16, accentColor: '#0d3d26' }} />
                {label}
              </label>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
            <button type="button" onClick={onClose}
              style={{ flex: 1, padding: '12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#555', background: 'white', cursor: 'pointer' }}>
              Cancel
            </button>
            <button type="submit" disabled={loading}
              style={{ flex: 1, padding: '12px', background: loading ? '#aaa' : '#0d3d26', color: 'white', borderRadius: 8, fontSize: 13, fontWeight: 700, border: 'none', cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Material'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}