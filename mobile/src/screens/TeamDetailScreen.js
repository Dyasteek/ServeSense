import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import db from '../database/database';
import { getPlayers } from '../api/config';

const TeamDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { teamId } = route.params;
  const [team, setTeam] = useState(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeamData();
  }, [teamId]);

  const loadTeamData = async () => {
    try {
      // Cargar datos del equipo
      db.transaction((tx) => {
        tx.executeSql(
          'SELECT * FROM teams WHERE server_id = ? OR id = ?',
          [teamId, teamId],
          (_, { rows: { _array } }) => {
            if (_array.length > 0) {
              setTeam(_array[0]);
              loadPlayers(_array[0].id);
            }
          }
        );
      });
    } catch (error) {
      console.error('Error loading team:', error);
    }
  };

  const loadPlayers = async (localTeamId) => {
    try {
      // Primero intentamos cargar desde la base de datos local
      db.transaction((tx) => {
        tx.executeSql(
          'SELECT * FROM players WHERE team_id = ?',
          [localTeamId],
          async (_, { rows: { _array } }) => {
            if (_array.length > 0) {
              setPlayers(_array);
              setLoading(false);
            } else {
              // Si no hay datos locales, cargamos desde la API
              await fetchPlayersFromAPI();
            }
          }
        );
      });
    } catch (error) {
      console.error('Error loading players:', error);
      fetchPlayersFromAPI();
    }
  };

  const fetchPlayersFromAPI = async () => {
    try {
      const apiPlayers = await getPlayers(teamId);
      setPlayers(apiPlayers);
      
      // Guardamos los jugadores en la base de datos local
      db.transaction((tx) => {
        apiPlayers.forEach(player => {
          tx.executeSql(
            'INSERT OR REPLACE INTO players (server_id, name, number, position, team_id, last_sync) VALUES (?, ?, ?, ?, ?, ?)',
            [player._id, player.name, player.number, player.position, team.id, new Date().toISOString()]
          );
        });
      });
    } catch (error) {
      console.error('Error fetching players:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderPlayerItem = ({ item }) => (
    <TouchableOpacity
      style={styles.playerItem}
      onPress={() => navigation.navigate('PlayerDetail', { playerId: item.server_id || item.id })}
    >
      <View style={styles.playerNumber}>
        <Text style={styles.numberText}>{item.number}</Text>
      </View>
      <View style={styles.playerInfo}>
        <Text style={styles.playerName}>{item.name}</Text>
        <Text style={styles.playerPosition}>{item.position}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading || !team) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2c3e50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.teamHeader}>
        <Text style={styles.teamName}>{team.name}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Jugadores</Text>
        <FlatList
          data={players}
          renderItem={renderPlayerItem}
          keyExtractor={(item) => (item.server_id || item.id).toString()}
          contentContainerStyle={styles.listContainer}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamHeader: {
    backgroundColor: '#2c3e50',
    padding: 20,
    alignItems: 'center',
  },
  teamName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  section: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  listContainer: {
    paddingBottom: 20,
  },
  playerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  playerNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  numberText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  playerPosition: {
    fontSize: 14,
    color: '#7f8c8d',
  },
});

export default TeamDetailScreen; 