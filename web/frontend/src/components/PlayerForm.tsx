import { useState } from 'react';
import { Player, PlayerStats } from '@/types/team';

const POSITIONS = [
  'Armador',
  'Central',
  'Punta',
  'Opuesto',
  'Libero',
  'Líbero'
];

const initialPlayerStats: PlayerStats = {
  aces: 0,
  servicios: 0,
  ataques: 0,
  bloqueos: 0,
  defensas: 0,
  recepciones: 0,
  colocaciones: 0,
  errores: 0
};

interface PlayerFormProps {
  initialData?: Partial<Player>;
  onSubmit: (playerData: Omit<Player, 'id'>) => void;
  onCancel: () => void;
  submitButtonText?: string;
}

export default function PlayerForm({ 
  initialData, 
  onSubmit, 
  onCancel,
  submitButtonText = 'Guardar'
}: PlayerFormProps) {
  const [player, setPlayer] = useState<Omit<Player, 'id'>>({
    name: initialData?.name || '',
    number: initialData?.number || 0,
    position: initialData?.position || '',
    stats: initialData?.stats || initialPlayerStats,
    senadeExpiration: initialData?.senadeExpiration || '',
    healthCardExpiration: initialData?.healthCardExpiration || '',
    yellowCards: initialData?.yellowCards || 0,
    redCards: initialData?.redCards || 0,
    emergencyContact: initialData?.emergencyContact || '',
    contactNumber: initialData?.contactNumber || ''
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!player.name || !player.number || !player.position) {
      setError('Por favor completa todos los campos del jugador');
      return;
    }

    if (!player.senadeExpiration || !player.healthCardExpiration) {
      setError('Por favor ingresa las fechas de vencimiento de SENADE y Ficha Médica');
      return;
    }

    if (!player.emergencyContact || !player.contactNumber) {
      setError('Por favor ingresa los números de contacto');
      return;
    }

    onSubmit(player);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Nombre
          </label>
          <input
            type="text"
            value={player.name}
            onChange={(e) => setPlayer({ ...player, name: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#59c0d9] focus:ring-[#59c0d9]"
            placeholder="Nombre del jugador"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Número
          </label>
          <input
            type="number"
            value={player.number || ''}
            onChange={(e) => setPlayer({ ...player, number: parseInt(e.target.value) || 0 })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#59c0d9] focus:ring-[#59c0d9]"
            placeholder="Número"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Posición
          </label>
          <select
            value={player.position}
            onChange={(e) => setPlayer({ ...player, position: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#59c0d9] focus:ring-[#59c0d9]"
          >
            <option value="">Selecciona una posición</option>
            {POSITIONS.map((position) => (
              <option key={position} value={position}>
                {position}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Vencimiento SENADE
          </label>
          <input
            type="date"
            value={player.senadeExpiration}
            onChange={(e) => setPlayer({ ...player, senadeExpiration: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#59c0d9] focus:ring-[#59c0d9]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Vencimiento Ficha Médica
          </label>
          <input
            type="date"
            value={player.healthCardExpiration}
            onChange={(e) => setPlayer({ ...player, healthCardExpiration: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#59c0d9] focus:ring-[#59c0d9]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Contacto de Emergencia
          </label>
          <input
            type="tel"
            value={player.emergencyContact}
            onChange={(e) => setPlayer({ ...player, emergencyContact: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#59c0d9] focus:ring-[#59c0d9]"
            placeholder="Número de emergencia"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Número de Contacto
          </label>
          <input
            type="tel"
            value={player.contactNumber}
            onChange={(e) => setPlayer({ ...player, contactNumber: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#59c0d9] focus:ring-[#59c0d9]"
            placeholder="Número de contacto"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Tarjetas Amarillas
          </label>
          <input
            type="number"
            value={player.yellowCards}
            onChange={(e) => setPlayer({ ...player, yellowCards: parseInt(e.target.value) || 0 })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#59c0d9] focus:ring-[#59c0d9]"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Tarjetas Rojas
          </label>
          <input
            type="number"
            value={player.redCards}
            onChange={(e) => setPlayer({ ...player, redCards: parseInt(e.target.value) || 0 })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#59c0d9] focus:ring-[#59c0d9]"
            min="0"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#59c0d9]"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md text-white bg-[#59c0d9] hover:bg-[#59c0d9]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#59c0d9]"
        >
          {submitButtonText}
        </button>
      </div>
    </form>
  );
} 