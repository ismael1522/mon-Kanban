import { useState } from 'react';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';

export default function ProfilePage({ session }) {
  const user = session.user;

  const [fullName, setFullName] = useState(user.user_metadata?.full_name || '');
  const [infoMsg, setInfoMsg] = useState('');
  const [infoErr, setInfoErr] = useState('');

  const [newPass, setNewPass] = useState('');
  const [passMsg, setPassMsg] = useState('');
  const [passErr, setPassErr] = useState('');

  const [avatarUrl, setAvatarUrl] = useState(user.user_metadata?.avatar_url || '');
  const [uploading, setUploading] = useState(false);

  async function handleSaveInfo(e) {
    e.preventDefault();
    setInfoErr(''); setInfoMsg('');
    const { error } = await supabase.auth.updateUser({ data: { full_name: fullName } });
    if (error) setInfoErr(error.message);
    else setInfoMsg('✅ Profil mis à jour !');
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setPassErr(''); setPassMsg('');
    const { error } = await supabase.auth.updateUser({ password: newPass });
    if (error) setPassErr(error.message);
    else { setPassMsg('✅ Mot de passe changé !'); setNewPass(''); }
  }

  async function handleAvatarUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const fileName = `${user.id}-${Date.now()}`;
    const { error } = await supabase.storage.from('avatars').upload(fileName, file, { upsert: true });
    if (!error) {
      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
      await supabase.auth.updateUser({ data: { avatar_url: data.publicUrl } });
      setAvatarUrl(data.publicUrl);
    }
    setUploading(false);
  }

  const card = {
    background: 'white',
    borderRadius: '12px',
    padding: '2rem',
    marginBottom: '1.5rem',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC' }}>
      <Navbar session={session} />
      <main style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
        <h1 style={{ marginBottom: '1.5rem' }}>Mon profil</h1>

        {/* Avatar */}
        <div style={{ ...card, textAlign: 'center' }}>
          <div style={{
            width: '96px', height: '96px', borderRadius: '50%',
            background: '#e2e8f0', margin: '0 auto 1rem',
            overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {avatarUrl
              ? <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontSize: '2.5rem' }}>👤</span>
            }
          </div>
          <label style={{
            cursor: 'pointer', background: '#1A8C82', color: 'white',
            padding: '0.5rem 1.2rem', borderRadius: '6px', fontSize: '0.9rem',
          }}>
            {uploading ? 'Upload...' : 'Changer la photo'}
            <input type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} />
          </label>
        </div>

        {/* Infos générales */}
        <div style={card}>
          <h2 style={{ marginBottom: '1rem' }}>Informations générales</h2>
          <p style={{ color: '#666', marginBottom: '1rem' }}>{user.email}</p>
          <form onSubmit={handleSaveInfo}>
            <input
              type="text"
              placeholder="Nom complet"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #ddd', marginBottom: '1rem', boxSizing: 'border-box' }}
            />
            <button type="submit" style={{ background: '#1A8C82', color: 'white', border: 'none', padding: '0.6rem 1.4rem', borderRadius: '6px', cursor: 'pointer' }}>
              Sauvegarder
            </button>
            {infoMsg && <p style={{ color: 'green', marginTop: '0.5rem' }}>{infoMsg}</p>}
            {infoErr && <p style={{ color: 'red', marginTop: '0.5rem' }}>{infoErr}</p>}
          </form>
        </div>

        {/* Mot de passe */}
        <div style={card}>
          <h2 style={{ marginBottom: '1rem' }}>Changer le mot de passe</h2>
          <form onSubmit={handleChangePassword}>
            <input
              type="password"
              placeholder="Nouveau mot de passe"
              value={newPass}
              onChange={e => setNewPass(e.target.value)}
              style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #ddd', marginBottom: '1rem', boxSizing: 'border-box' }}
            />
            <button type="submit" style={{ background: '#1A8C82', color: 'white', border: 'none', padding: '0.6rem 1.4rem', borderRadius: '6px', cursor: 'pointer' }}>
              Mettre à jour
            </button>
            {passMsg && <p style={{ color: 'green', marginTop: '0.5rem' }}>{passMsg}</p>}
            {passErr && <p style={{ color: 'red', marginTop: '0.5rem' }}>{passErr}</p>}
          </form>
        </div>
      </main>
    </div>
  );
}