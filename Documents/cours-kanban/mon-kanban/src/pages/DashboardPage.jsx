// src/pages/DashboardPage.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import UserTable from '../components/UserTable';
import TaskList from '../components/TaskList';

export default function DashboardPage({ session }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('tasks');
  const [boardId, setBoardId] = useState(null);

  async function fetchUsers() {
    setLoading(true);
    const { data } = await supabase.from('profiles').select('*');
    setUsers(data || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchUsers();
    supabase.from('boards').select('id').limit(1)
      .then(({ data }) => { if (data?.[0]) setBoardId(data[0].id); });
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  return (
    <div>
      <header style={{ background: '#1A8C82', color: 'white', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '1.25rem' }}>🗂 KanbanRT</h1>
        <button onClick={handleLogout} style={{ background: 'white', color: '#1A8C82', border: 'none', padding: '0.4rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
          Déconnexion
        </button>
      </header>

      <main style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {[['tasks', '🗂 Tâches'], ['users', '👥 Utilisateurs']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', cursor: 'pointer',
              background: tab === key ? '#1A8C82' : '#E2E8F0',
              color: tab === key ? 'white' : '#1E293B',
              fontWeight: tab === key ? 700 : 400,
            }}>{label}</button>
          ))}
        </div>

        {tab === 'tasks' && boardId && <TaskList boardId={boardId} />}
        {tab === 'tasks' && !boardId && (
          <p style={{ color: '#94A3B8' }}>Aucun tableau trouvé. Créez-en un via SQL Editor.</p>
        )}
        {tab === 'users' && (
          loading ? <p>Chargement...</p> : <UserTable users={users} onRefresh={fetchUsers} />
        )}
      </main>
    </div>
  );
}