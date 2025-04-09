import axios from 'axios';

const API_URL = 'http://localhost:5000/api'; // Cambiar por la URL de producción

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // El servidor respondió con un código de estado fuera del rango 2xx
      console.error('Error de respuesta:', error.response.data);
    } else if (error.request) {
      // La solicitud fue hecha pero no se recibió respuesta
      console.error('Error de red:', error.request);
    } else {
      // Algo sucedió al configurar la solicitud
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export const syncData = async (table, data) => {
  try {
    const response = await api.post(`/sync/${table}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error sincronizando ${table}:`, error);
    throw error;
  }
};

export const getTeams = async () => {
  try {
    const response = await api.get('/teams');
    return response.data;
  } catch (error) {
    console.error('Error obteniendo equipos:', error);
    throw error;
  }
};

export const getPlayers = async (teamId) => {
  try {
    const response = await api.get(`/players?team=${teamId}`);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo jugadores:', error);
    throw error;
  }
};

export const getMatches = async () => {
  try {
    const response = await api.get('/matches');
    return response.data;
  } catch (error) {
    console.error('Error obteniendo partidos:', error);
    throw error;
  }
};

export const updateStats = async (playerId, matchId, stats) => {
  try {
    const response = await api.post(`/players/${playerId}/stats`, {
      matchId,
      stats
    });
    return response.data;
  } catch (error) {
    console.error('Error actualizando estadísticas:', error);
    throw error;
  }
};

export default api; 