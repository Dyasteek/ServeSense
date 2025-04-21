'use client';

import { useEffect, useState } from 'react';
import { livosurService, LivosurDivision } from '@/services/livosurService';

export default function DivisionsPage() {
  const [divisions, setDivisions] = useState<LivosurDivision[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDivisions();
  }, []);

  const loadDivisions = async () => {
    try {
      setLoading(true);
      const divisionsData = await livosurService.getDivisions();
      setDivisions(divisionsData);
      setError(null);
    } catch (err) {
      setError('Error al cargar las divisiones');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const groupDivisionsByGenderAndLevel = (divisions: LivosurDivision[]) => {
    const grouped: { [key: string]: { [key: string]: LivosurDivision[] } } = {};
    divisions.forEach(division => {
      if (!grouped[division.gender]) {
        grouped[division.gender] = {};
      }
      if (!grouped[division.gender][division.level]) {
        grouped[division.gender][division.level] = [];
      }
      grouped[division.gender][division.level].push(division);
    });
    return grouped;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#59c0d9]"></div>
      </div>
    );
  }

  const groupedDivisions = groupDivisionsByGenderAndLevel(divisions);
  const levels = ['Primera', 'Segunda', 'Tercera', 'A', 'B', 'C', 'D'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-[#59c0d9] to-[#59c0d9]/80 p-6">
              <h1 className="text-2xl font-bold text-white">Divisiones LiVoSur 2025</h1>
            </div>

            <div className="p-6">
              {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
                  {error}
                </div>
              )}

              <div className="space-y-8">
                {Object.entries(groupedDivisions).map(([gender, genderDivisions]) => (
                  <div key={gender} className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900">{gender}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {levels.map(level => {
                        const levelDivisions = genderDivisions[level] || [];
                        return levelDivisions.map((division, index) => (
                          <div key={`${level}-${index}`} className="bg-gray-50 rounded-xl p-6">
                            <div className="space-y-2">
                              <h3 className="text-lg font-medium text-gray-900">
                                {division.category}
                              </h3>
                              <div className="text-sm text-gray-500">
                                <p>ID: {division.id}</p>
                                <p className="mt-1">
                                  URL: https://livosur-web.dataproject.com/CompetitionMatches.aspx?ID=178&PID={division.id}
                                </p>
                              </div>
                            </div>
                          </div>
                        ));
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 