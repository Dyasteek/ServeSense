import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Importar pantallas
import HomeScreen from '../screens/HomeScreen';
import TeamsScreen from '../screens/TeamsScreen';
import TeamDetailScreen from '../screens/TeamDetailScreen';
import PlayerDetailScreen from '../screens/PlayerDetailScreen';
import MatchScreen from '../screens/MatchScreen';
import StatsScreen from '../screens/StatsScreen';
import SyncScreen from '../screens/SyncScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#2c3e50',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: 'ServeSense' }}
        />
        <Stack.Screen 
          name="Teams" 
          component={TeamsScreen} 
          options={{ title: 'Equipos' }}
        />
        <Stack.Screen 
          name="TeamDetail" 
          component={TeamDetailScreen} 
          options={{ title: 'Detalle del Equipo' }}
        />
        <Stack.Screen 
          name="PlayerDetail" 
          component={PlayerDetailScreen} 
          options={{ title: 'Detalle del Jugador' }}
        />
        <Stack.Screen 
          name="Match" 
          component={MatchScreen} 
          options={{ title: 'Partido en Curso' }}
        />
        <Stack.Screen 
          name="Stats" 
          component={StatsScreen} 
          options={{ title: 'Estadísticas' }}
        />
        <Stack.Screen 
          name="Sync" 
          component={SyncScreen} 
          options={{ title: 'Sincronización' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 