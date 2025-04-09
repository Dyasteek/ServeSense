import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import db from '../database/database';
import { getTeams } from '../api/config';

const TeamsScreen = () => {
  const navigation = useNavigation();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      // Primero intentamos cargar desde la base de datos local
      db.transaction((tx) => {
        tx.executeSql(
          'SELECT * FROM teams',
          [],
          (_, { rows: { _array } }) => {
            if (_array.length > 0) {
              setTeams(_array);
              setLoading(false);
            } else {
              // Si no hay datos locales, cargamos desde la API
              fetchTeamsFromAPI();
            }
          },
          (_, error) => {
            console.error('Error loading teams:', error);
            fetchTeamsFromAPI();
          }
        );
      });
    } catch (error) {
      console.error('Error:', error);
      fetchTeamsFromAPI();
    }
  };

  const fetchTeamsFromAPI = async () => {
    try {
      const apiTeams = await getTeams();
      setTeams(apiTeams);
      
      // Guardamos los equipos en la base de datos local
      db.transaction((tx) => {
        apiTeams.forEach(team => {
          tx.executeSql(
            'INSERT OR REPLACE INTO teams (server_id, name, last_sync) VALUES (?, ?, ?)',
            [team._id, team.name, new Date().toISOString()]
          );
        });
      });
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderTeamItem = ({ item }) => (
    <TouchableOpacity
      style={styles.teamItem}
      onPress={() => navigation.navigate('TeamDetail', { teamId: item.server_id || item.id })}
    >
      <Text style={styles.teamName}>{item.name}</Text>
      <Text style={styles.teamInfo}>Ver detalles →</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2c3e50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={teams}
        renderItem={renderTeamItem}
        keyExtractor={(item) => (item.server_id || item.id).toString()}
        contentContainerStyle={styles.listContainer}
      />
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
  listContainer: {
    padding: 20,
  },
  teamItem: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  teamName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  teamInfo: {
    fontSize: 14,
    color: '#7f8c8d',
  },
});

export default TeamsScreen; 