'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Team {
  id: string;
  name: string;
  color: string;
  divisional: string;
  semester: string;
  isOpponent: boolean;
}

export default function LeaguePage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    color: '#000000',
    divisional: 'A',
    semester: 'Primavera'
  });

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/teams?isOpponent=true`);
      if (!response.ok) {
        throw new Error('Error al cargar los equipos');
      }
      const data = await response.json();
      setTeams(data);
    } catch (error) {
      console.error('Error:', error);
      setError('Hubo un error al cargar los equipos');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (team?: Team) => {
    if (team) {
      setEditingTeam(team);
      setFormData({
        name: team.name,
        color: team.color,
        divisional: team.divisional,
        semester: team.semester
      });
    } else {
      setEditingTeam(null);
      setFormData({
        name: '',
        color: '#000000',
        divisional: 'A',
        semester: 'Primavera'
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingTeam
        ? `${process.env.NEXT_PUBLIC_API_URL}/teams/${editingTeam.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/teams`;

      const response = await fetch(url, {
        method: editingTeam ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          isOpponent: true
        }),
      });

      if (!response.ok) {
        throw new Error('Error al guardar el equipo');
      }

      await loadTeams();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error:', error);
      setError('Hubo un error al guardar el equipo');
    }
  };

  const handleDelete = async (teamId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este equipo?')) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/teams/${teamId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el equipo');
      }

      await loadTeams();
    } catch (error) {
      console.error('Error:', error);
      setError('Hubo un error al eliminar el equipo');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Liga</h1>
            <p className="text-gray-600">Gestiona los equipos rivales de la temporada</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            Agregar Equipo
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <div
              key={team.id}
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: team.color }}
                >
                  {team.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{team.name}</h3>
                  <p className="text-sm text-gray-500">
                    Divisional {team.divisional} - {team.semester}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleOpenModal(team)}
                  className="flex-1 bg-gray-50 text-gray-700 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                >
                  <PencilIcon className="h-4 w-4" />
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(team.id)}
                  className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                >
                  <TrashIcon className="h-4 w-4" />
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">
                {editingTeam ? 'Editar Equipo' : 'Agregar Equipo'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Equipo
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color del Equipo
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-12 h-12 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Divisional
                  </label>
                  <select
                    value={formData.divisional}
                    onChange={(e) => setFormData({ ...formData, divisional: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="A">Divisional A</option>
                    <option value="B">Divisional B</option>
                    <option value="C">Divisional C</option>
                    <option value="D">Divisional D</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Semestre
                  </label>
                  <select
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="Primavera">Primavera</option>
                    <option value="Otoño">Otoño</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    {editingTeam ? 'Guardar Cambios' : 'Agregar Equipo'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 