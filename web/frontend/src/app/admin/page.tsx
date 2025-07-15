'use client';

import { useEffect, useState } from "react";
import { UserIcon, UsersIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon, PencilIcon, TrashIcon, PlusIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { signOut, useSession } from 'next-auth/react';

const SIDEBAR_LINKS = [
  { name: "Dashboard", icon: UsersIcon },
  { name: "Usuarios", icon: UserIcon },
  { name: "Equipos", icon: UsersIcon }, // Nuevo ítem
  { name: "Ajustes", icon: Cog6ToothIcon },
];

function EditUserModal({ user, isOpen, onClose, onSave }: any) {
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [role, setRole] = useState(user?.role || "coach");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setName(user?.name || "");
    setEmail(user?.email || "");
    setRole(user?.role || "coach");
    setPassword("");
    setError("");
  }, [user, isOpen]);

  const handleSave = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/users/${user._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, role, password: password || undefined })
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Error al actualizar usuario");
      } else {
        onSave();
        onClose();
      }
    } catch (err) {
      setError("Error de red");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold" aria-label="Cerrar">×</button>
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Editar usuario</h2>
        <form className="space-y-4" onSubmit={handleSave}>
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#59c0d9] focus:ring-[#59c0d9] bg-white text-gray-900" disabled={loading} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Correo electrónico</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#59c0d9] focus:ring-[#59c0d9] bg-white text-gray-900" disabled={loading} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Rol</label>
            <select value={role} onChange={e => setRole(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#59c0d9] focus:ring-[#59c0d9] bg-white text-gray-900" disabled={loading}>
              <option value="coach">Coach</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Nueva contraseña (opcional)</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#59c0d9] focus:ring-[#59c0d9] bg-white text-gray-900" disabled={loading} />
          </div>
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>}
          <button type="submit" disabled={loading} className="w-full py-2 px-4 bg-[#59c0d9] text-white rounded-md font-semibold hover:bg-[#59c0d9]/90 transition-colors disabled:bg-gray-400">
            {loading ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
      </div>
    </div>
  );
}

function DeleteUserModal({ user, isOpen, onClose, onDelete }: any) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  if (!isOpen) return null;
  const handleDelete = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/users/${user._id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Error al eliminar usuario");
      } else {
        onDelete();
        onClose();
      }
    } catch (err) {
      setError("Error de red");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold" aria-label="Cerrar">×</button>
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Eliminar usuario</h2>
        <p className="mb-4 text-gray-700">¿Estás seguro de que deseas eliminar a <b>{user.name}</b>?</p>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-2">{error}</div>}
        <div className="flex gap-4 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50">Cancelar</button>
          <button onClick={handleDelete} disabled={loading} className="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600 disabled:bg-red-300">
            {loading ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
}

function UserTeamsModal({ user, isOpen, onClose }: { user: any, isOpen: boolean, onClose: () => void }) {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (isOpen && user) {
      setLoading(true);
      fetch(`/api/teams?owner=${user._id}`)
        .then(res => res.json())
        .then(data => setTeams(data))
        .finally(() => setLoading(false));
    } else {
      setTeams([]);
    }
  }, [isOpen, user]);
  if (!isOpen || !user) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold" aria-label="Cerrar">×</button>
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Equipos de {user.name}</h2>
        {loading ? (
          <div className="text-center text-gray-500">Cargando equipos...</div>
        ) : teams.length === 0 ? (
          <div className="text-center text-gray-500">No tiene equipos registrados.</div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {teams.map(team => (
              <li key={team._id} className="py-2">
                <span className="font-semibold text-gray-700">{team.name}</span>
                <span className="ml-2 text-gray-500 text-sm">({team.division})</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function CreateUserModal({ isOpen, onClose, onSuccess }: { isOpen: boolean, onClose: () => void, onSuccess: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [teamName, setTeamName] = useState('');
  const [role, setRole] = useState('coach');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [coaches, setCoaches] = useState<any[]>([]);
  const [selectedCoach, setSelectedCoach] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      fetch('/api/admin/users')
        .then(res => res.json())
        .then(data => setCoaches(data.filter((u: any) => u.role === 'coach')))
        .catch(() => setCoaches([]));
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!name || !email || !password || !confirmPassword) {
      setError('Por favor completa todos los campos.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    setIsLoading(true);
    try {
      // 1. Crear equipo si se especifica nombre
      let teamId = undefined;
      if (teamName) {
        if (!selectedCoach) {
          setError('Debes seleccionar un coach para el equipo.');
          setIsLoading(false);
          return;
        }
        const teamRes = await fetch('/api/teams', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: teamName, owner: selectedCoach }),
          credentials: 'include'
        });
        const teamData = await teamRes.json();
        if (!teamRes.ok) {
          setError(teamData.message || 'Error al crear equipo.');
          setIsLoading(false);
          return;
        }
        teamId = teamData._id;
      }
      // 2. Crear usuario asociado a ese equipo (si existe)
      const userRes = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role, teamId }),
        credentials: 'include'
      });
      const userData = await userRes.json();
      if (!userRes.ok) {
        setError(userData.message || 'Error al crear usuario.');
      } else {
        setSuccess('Usuario y equipo creados exitosamente.');
        setTimeout(() => {
          setSuccess('');
          onSuccess();
          onClose();
        }, 1500);
      }
    } catch (err) {
      setError('Error de red. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold"
          aria-label="Cerrar"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Crear usuario y equipo</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#59c0d9] focus:ring-[#59c0d9] bg-white text-gray-900" placeholder="Nombre del usuario" disabled={isLoading} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Correo electrónico</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#59c0d9] focus:ring-[#59c0d9] bg-white text-gray-900" placeholder="tu@email.com" disabled={isLoading} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#59c0d9] focus:ring-[#59c0d9] bg-white text-gray-900" placeholder="••••••••" disabled={isLoading} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Verificar contraseña</label>
            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#59c0d9] focus:ring-[#59c0d9] bg-white text-gray-900" placeholder="••••••••" disabled={isLoading} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Rol</label>
            <select value={role} onChange={e => setRole(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#59c0d9] focus:ring-[#59c0d9] bg-white text-gray-900" disabled={isLoading}>
              <option value="coach">Coach</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre del equipo (opcional)</label>
            <input type="text" value={teamName} onChange={e => setTeamName(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#59c0d9] focus:ring-[#59c0d9] bg-white text-gray-900" placeholder="Nombre del equipo" disabled={isLoading} />
          </div>
          {teamName && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Coach asignado al equipo</label>
              <select
                value={selectedCoach}
                onChange={e => setSelectedCoach(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#59c0d9] focus:ring-[#59c0d9] bg-white text-gray-900"
                disabled={isLoading}
              >
                <option value="">Selecciona un coach</option>
                {coaches.map(coach => (
                  <option key={coach._id} value={coach._id}>{coach.name} ({coach.email})</option>
                ))}
              </select>
              {coaches.length === 0 && <div className="text-xs text-gray-500 mt-1">No hay coaches disponibles.</div>}
            </div>
          )}
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>}
          {success && <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm">{success}</div>}
          <button type="submit" disabled={isLoading} className="w-full py-2 px-4 bg-[#59c0d9] text-white rounded-md font-semibold hover:bg-[#59c0d9]/90 transition-colors disabled:bg-gray-400">
            {isLoading ? 'Creando...' : 'Crear usuario y equipo'}
          </button>
        </form>
      </div>
    </div>
  );
}

function CreateTeamModal({ isOpen, onClose, onSuccess, coaches }: { isOpen: boolean, onClose: () => void, onSuccess: () => void, coaches: any[] }) {
  const [name, setName] = useState('');
  const [division, setDivision] = useState('');
  const [selectedCoach, setSelectedCoach] = useState('');
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setWarning('');
    if (!name || !division || !selectedCoach) {
      setError('Completa todos los campos y selecciona un coach.');
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, division, owner: selectedCoach }),
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Error al crear equipo.');
      } else {
        if (data.warning) {
          setWarning(data.warning);
        } else {
          onSuccess();
          onClose();
          setName('');
          setDivision('');
          setSelectedCoach('');
        }
      }
    } catch (err) {
      setError('Error de red.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold" aria-label="Cerrar">×</button>
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Crear equipo</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre del equipo</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#59c0d9] focus:ring-[#59c0d9] bg-white text-gray-900" placeholder="Nombre del equipo" disabled={isLoading} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">División</label>
            <input type="text" value={division} onChange={e => setDivision(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#59c0d9] focus:ring-[#59c0d9] bg-white text-gray-900" placeholder="División" disabled={isLoading} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Coach (owner)</label>
            <select value={selectedCoach} onChange={e => setSelectedCoach(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#59c0d9] focus:ring-[#59c0d9] bg-white text-gray-900" disabled={isLoading}>
              <option value="">Selecciona un coach</option>
              {coaches.map(coach => (
                <option key={coach._id} value={coach._id}>{coach.name} ({coach.email})</option>
              ))}
            </select>
          </div>
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>}
          {warning && <div className="bg-yellow-50 text-yellow-700 p-3 rounded-md text-sm">{warning}</div>}
          <button type="submit" disabled={isLoading} className="w-full py-2 px-4 bg-[#59c0d9] text-white rounded-md font-semibold hover:bg-[#59c0d9]/90 transition-colors disabled:bg-gray-400">
            {isLoading ? 'Creando...' : 'Crear equipo'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorUsers, setErrorUsers] = useState('');
  const [editUser, setEditUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);
  const [teamsUser, setTeamsUser] = useState<any|null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [teams, setTeams] = useState<any[]>([]);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [coaches, setCoaches] = useState<any[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    fetchUsers();
    fetchTeams();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setErrorUsers('');
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
        if (Array.isArray(data) && data.length === 0) {
          setErrorUsers('No hay usuarios registrados.');
        }
      } else {
        const data = await res.json();
        setErrorUsers(data.message || 'Error al cargar usuarios.');
      }
    } catch (err) {
      setErrorUsers('Error de red al cargar usuarios.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      const res = await fetch('/api/teams?all=1');
      if (res.ok) {
        const data = await res.json();
        setTeams(data);
      }
    } catch {}
  };

  // Cargar coaches para el modal de crear equipo
  useEffect(() => {
    fetch('/api/admin/users')
      .then(res => res.json())
      .then(data => setCoaches(data.filter((u: any) => u.role === 'coach')))
      .catch(() => setCoaches([]));
  }, []);

  return (
    <div className="min-h-screen bg-[#f4f8fb] flex">
      {/* Botón menú móvil */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded-full shadow-lg border border-gray-200"
        onClick={() => setSidebarOpen(true)}
        aria-label="Abrir menú"
      >
        <Bars3Icon className="h-6 w-6 text-gray-700" />
      </button>
      {/* Sidebar */}
      <aside
        className={`fixed md:static top-0 left-0 z-40 h-full w-64 bg-white shadow-lg flex flex-col py-8 px-4 rounded-r-3xl transition-transform duration-200 md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Botón cerrar en móvil */}
        <button
          className="md:hidden absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold"
          onClick={() => setSidebarOpen(false)}
          aria-label="Cerrar menú"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
        <div className="flex flex-col items-center mb-10 mt-8 md:mt-0">
          <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mb-2">
            <UserIcon className="h-10 w-10 text-gray-500" />
          </div>
          <span className="font-semibold text-lg text-gray-700">{session?.user?.name || 'Admin'}</span>
        </div>
        <nav className="flex-1">
          <ul className="space-y-2">
            {SIDEBAR_LINKS.map((item) => (
              <li key={item.name}>
                <button
                  className={`flex items-center w-full gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-[#e6f0fa] transition-colors ${activeTab === item.name ? 'bg-[#e6f0fa] font-bold' : ''}`}
                  onClick={() => { setActiveTab(item.name); setSidebarOpen(false); }}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex-1" />
        <button
          className="flex items-center gap-2 px-4 py-2 mt-8 rounded-lg text-red-600 hover:bg-red-50 transition-colors w-full"
          onClick={async () => {
            await signOut({ redirect: false });
            router.push('/login');
          }}
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5" />
          Cerrar sesión
        </button>
      </aside>
      {/* Overlay móvil */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      {/* Main content ... igual que antes ... */}
      <main className="flex-1 p-10">
        {activeTab === 'Dashboard' && (
          <>
            <h1 className="text-3xl font-bold text-gray-900">ServeSense Admin Panel</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center">
                <span className="text-gray-500">Usuarios</span>
                <span className="text-3xl font-bold text-[#59c0d9]">{users.length}</span>
              </div>
              <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center">
                <span className="text-gray-500">Equipos</span>
                <span className="text-3xl font-bold text-[#59c0d9]">{teams.length}</span>
              </div>
              <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center">
                <span className="text-gray-500">Balance</span>
                <span className="text-3xl font-bold text-[#59c0d9]">$ -</span>
              </div>
            </div>
          </>
        )}
        {activeTab === 'Usuarios' && (
          <>
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Usuarios</h1>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCreate(true)}
                  className="inline-flex items-center gap-2 bg-[#59c0d9] text-white px-4 py-2 rounded-lg hover:bg-[#59c0d9]/90 transition-colors"
                >
                  <PlusIcon className="h-5 w-5" /> Crear usuario
                </button>
                <input
                  type="text"
                  placeholder="Buscar usuario..."
                  className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#59c0d9] bg-white text-gray-900"
                />
              </div>
            </div>
            {loading ? (
              <div className="text-center text-gray-500">Cargando...</div>
            ) : errorUsers ? (
              <div className="text-center text-red-500 bg-red-50 border border-red-200 rounded-lg py-4 mb-4">{errorUsers}</div>
            ) : (
              <div className="overflow-x-auto rounded-2xl shadow border border-gray-200 bg-white">
                <table className="min-w-full divide-y divide-gray-200 text-sm md:text-base">
                  <thead className="bg-[#f7fafc] sticky top-0 z-10">
                    <tr>
                      <th className="py-2 md:py-3 px-2 md:px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nombre</th>
                      <th className="py-2 md:py-3 px-2 md:px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                      <th className="py-2 md:py-3 px-2 md:px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Rol</th>
                      <th className="py-2 md:py-3 px-2 md:px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map((user: any, idx: number) => (
                      <tr
                        key={user._id}
                        className={`transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-[#e6f0fa] cursor-pointer`}
                        onClick={() => setTeamsUser(user)}
                      >
                        <td className="py-2 md:py-3 px-2 md:px-4 font-medium text-gray-900">{user.name}</td>
                        <td className="py-2 md:py-3 px-2 md:px-4 text-gray-700">{user.email}</td>
                        <td className="py-2 md:py-3 px-2 md:px-4 capitalize text-gray-700">{user.role}</td>
                        <td className="py-2 md:py-3 px-2 md:px-4">
                          <div className="flex gap-2 flex-wrap">
                            <button
                              onClick={e => { e.stopPropagation(); setEditUser(user); }}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded text-[#59c0d9] hover:bg-[#e6f0fa] text-xs md:text-sm font-medium transition-colors"
                            >
                              <PencilIcon className="h-4 w-4" />Editar
                            </button>
                            <button
                              onClick={e => { e.stopPropagation(); setDeleteUser(user); }}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded text-red-500 hover:bg-red-50 text-xs md:text-sm font-medium transition-colors"
                            >
                              <TrashIcon className="h-4 w-4" />Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <UserTeamsModal user={teamsUser} isOpen={!!teamsUser} onClose={() => setTeamsUser(null)} />
            <EditUserModal user={editUser} isOpen={!!editUser} onClose={() => setEditUser(null)} onSave={fetchUsers} />
            <DeleteUserModal user={deleteUser} isOpen={!!deleteUser} onClose={() => setDeleteUser(null)} onDelete={fetchUsers} />
            <CreateUserModal isOpen={showCreate} onClose={() => setShowCreate(false)} onSuccess={fetchUsers} />
          </>
        )}
        {activeTab === 'Equipos' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Equipos</h2>
              <button
                onClick={() => setShowCreateTeam(true)}
                className="inline-flex items-center gap-2 bg-[#59c0d9] text-white px-4 py-2 rounded-lg hover:bg-[#59c0d9]/90 transition-colors"
              >
                <PlusIcon className="h-5 w-5" /> Crear equipo
              </button>
            </div>
            <div className="overflow-x-auto rounded-2xl shadow border border-gray-200 bg-white">
              <table className="min-w-full divide-y divide-gray-200 text-sm md:text-base">
                <thead className="bg-[#f7fafc] sticky top-0 z-10">
                  <tr>
                    <th className="py-2 md:py-3 px-2 md:px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nombre</th>
                    <th className="py-2 md:py-3 px-2 md:px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">División</th>
                    <th className="py-2 md:py-3 px-2 md:px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Coach (owner)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {teams.map((team: any, idx: number) => (
                    <tr key={team._id} className={`transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="py-2 md:py-3 px-2 md:px-4 font-medium text-gray-900">{team.name}</td>
                      <td className="py-2 md:py-3 px-2 md:px-4 text-gray-700">{team.division}</td>
                      <td className="py-2 md:py-3 px-2 md:px-4 text-gray-700">{team.owner?.name || team.owner}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <CreateTeamModal isOpen={showCreateTeam} onClose={() => setShowCreateTeam(false)} onSuccess={fetchTeams} coaches={coaches} />
          </div>
        )}
        {activeTab === 'Ajustes' && (
          <></>
        )}
      </main>
    </div>
  );
}