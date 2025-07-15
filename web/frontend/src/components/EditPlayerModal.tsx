'use client';

import { XMarkIcon } from '@heroicons/react/24/outline';
import { Player } from '@/types/team';
import PlayerForm from './PlayerForm';

interface EditPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (playerData: Omit<Player, 'id'>) => void;
  player?: Player;
  isNewPlayer?: boolean;
}

export default function EditPlayerModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  player,
  isNewPlayer = false 
}: EditPlayerModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-[#59c0d9] to-[#59c0d9]/80 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">
              {isNewPlayer ? 'Agregar Jugador' : 'Editar Jugador'}
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:text-white/80 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <PlayerForm
            initialData={player}
            onSubmit={onSubmit}
            onCancel={onClose}
            submitButtonText={isNewPlayer ? 'Agregar Jugador' : 'Guardar Cambios'}
          />
        </div>
      </div>
    </div>
  );
} 