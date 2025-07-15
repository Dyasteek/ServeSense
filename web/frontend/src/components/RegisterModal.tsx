import { useState } from 'react';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RegisterModal({ isOpen, onClose, onSuccess }: RegisterModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Error al registrar usuario.');
      } else {
        setSuccess('Usuario creado exitosamente. ¡Ya puedes iniciar sesión!');
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
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Crear cuenta nueva</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#59c0d9] focus:ring-[#59c0d9] bg-white text-gray-900"
              placeholder="Tu nombre"
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#59c0d9] focus:ring-[#59c0d9] bg-white text-gray-900"
              placeholder="tu@email.com"
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#59c0d9] focus:ring-[#59c0d9] bg-white text-gray-900"
              placeholder="••••••••"
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Confirmar contraseña</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#59c0d9] focus:ring-[#59c0d9] bg-white text-gray-900"
              placeholder="••••••••"
              disabled={isLoading}
            />
          </div>
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>}
          {success && <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm">{success}</div>}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 bg-[#59c0d9] text-white rounded-md font-semibold hover:bg-[#59c0d9]/90 transition-colors disabled:bg-gray-400"
          >
            {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>
      </div>
    </div>
  );
} 