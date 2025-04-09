import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { VictoryBar, VictoryChart, VictoryAxis, VictoryTheme } from 'victory-native';
import db from '../database/database';

const PlayerDetailScreen = () => {
  const [player, setPlayer] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlayerData();
  }, []);

  const loadPlayerData = async () => {
    try {
      // Cargar datos del jugador
      db.transaction((tx) => {
        tx.executeSql(
          'SELECT * FROM players WHERE server_id = ? OR id = ?',
          [playerId, playerId],
          (_, { rows: { _array } }) => {
            if (_array.length > 0) {
              setPlayer(_array[0]);
              loadPlayerStats(_array[0].id);
            }
          }
        );
      });
    } catch (error) {
      console.error('Error loading player:', error);
    }
  };

  const loadPlayerStats = async (localPlayerId) => {
    try {
      db.transaction((tx) => {
        tx.executeSql(
          `SELECT type, SUM(total) as total, SUM(successful) as successful, 
           SUM(errors) as errors, SUM(points) as points 
           FROM stats WHERE player_id = ? GROUP BY type`,
          [localPlayerId],
          (_, { rows: { _array } }) => {
            const statsData = {
              serves: { total: 0, successful: 0, errors: 0, points: 0 },
              attacks: { total: 0, successful: 0, errors: 0, points: 0 },
              blocks: { total: 0, successful: 0, errors: 0, points: 0 },
              defenses: { total: 0, successful: 0, errors: 0 }
            };

            _array.forEach(stat => {
              statsData[stat.type] = {
                total: stat.total,
                successful: stat.successful,
                errors: stat.errors,
                points: stat.points || 0
              };
            });

            setStats(statsData);
            setLoading(false);
          }
        );
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      setLoading(false);
    }
  };

  const renderStatCard = (title, data) => (
    <View style={styles.statCard}>
      <Text style={styles.statTitle}>{title}</Text>
      <View style={styles.statRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{data.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{data.successful}</Text>
          <Text style={styles.statLabel}>Exitosos</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{data.errors}</Text>
          <Text style={styles.statLabel}>Errores</Text>
        </View>
        {data.points !== undefined && (
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{data.points}</Text>
            <Text style={styles.statLabel}>Puntos</Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderChart = (data) => {
    const chartData = [
      { x: 'Total', y: data.total },
      { x: 'Exitosos', y: data.successful },
      { x: 'Errores', y: data.errors },
      { x: 'Puntos', y: data.points || 0 }
    ];

    return (
      <View style={styles.chartContainer}>
        <VictoryChart
          theme={VictoryTheme.material}
          domainPadding={20}
          height={200}
        >
          <VictoryAxis
            tickValues={['Total', 'Exitosos', 'Errores', 'Puntos']}
            style={{
              tickLabels: { fontSize: 10, angle: -45 }
            }}
          />
          <VictoryAxis
            dependentAxis
            style={{
              tickLabels: { fontSize: 10 }
            }}
          />
          <VictoryBar
            data={chartData}
            x="x"
            y="y"
            style={{
              data: { fill: '#3498db' }
            }}
          />
        </VictoryChart>
      </View>
    );
  };

  if (loading || !player || !stats) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2c3e50" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.playerNumber}>
          <Text style={styles.numberText}>{player.number}</Text>
        </View>
        <Text style={styles.playerName}>{player.name}</Text>
        <Text style={styles.playerPosition}>{player.position}</Text>
      </View>

      <View style={styles.statsContainer}>
        {renderStatCard('Saque', stats.serves)}
        {renderChart(stats.serves)}
        
        {renderStatCard('Ataque', stats.attacks)}
        {renderChart(stats.attacks)}
        
        {renderStatCard('Bloqueo', stats.blocks)}
        {renderChart(stats.blocks)}
        
        {renderStatCard('Defensa', stats.defenses)}
        {renderChart(stats.defenses)}
      </View>
    </ScrollView>
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
  header: {
    backgroundColor: '#2c3e50',
    padding: 20,
    alignItems: 'center',
  },
  playerNumber: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  numberText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  playerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  playerPosition: {
    fontSize: 16,
    color: '#ecf0f1',
  },
  statsContainer: {
    padding: 20,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 5,
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
});

export default PlayerDetailScreen; 