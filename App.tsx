import React, { useEffect } from 'react';
import { StatusBar, StyleSheet, View, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';

// === CONFIGURACIÓN GLOBAL DE NOTIFICACIONES ===
Notifications.setNotificationHandler({
  handleNotification: async () => ({
     shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,  
  }),
});

// Imports de pantallas
import WelcomeScreen from './src/screens/WelcomeScreen';
import AuthScreen from './src/screens/AuthScreen';
import DailyScreen from './src/screens/DailyScreen';
import PreventiveScreen from './src/screens/PreventiveScreen';
import EmergencyScreen from './src/screens/EmergencyScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import TodoScreen from './src/screens/TodoScreen';
import RouteScreen from './src/screens/RouteScreen';
import GeneralScreen from './src/screens/GeneralScreen';
import SearchAdress from './src/screens/SearchAddress';
import AgendaScreen from './src/screens/AgendaScreen'; 
import InfoScreen from './src/screens/InfoScreen';
import ChatBotsScreen from './src/screens/ChatBotsScreen';
import IAScreen from './src/screens/IAScreen';

// Tipos de rutas
type RootStackParamList = {
  Welcome: undefined;
  AuthScreen: undefined;
  Daily: undefined;
  Todo: undefined;
  General: undefined;
  Preventive: undefined;
  Emergency: undefined;
  Profile: undefined;
  Route: undefined;
  SearchAddress: undefined;
  Agenda: undefined; 
  Info: undefined;
  ChatBots: undefined;
  IA: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  useEffect(() => {
    // Solicitar permisos de notificaciones
    const configureNotifications = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permisos de notificación no otorgados');
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          sound: 'default',
        });
      }
    };

    configureNotifications();
  }, []);

  return (
    <SafeAreaProvider>
      <View style={styles.appContainer}>
        <StatusBar
          translucent={true}
          backgroundColor="transparent"
          barStyle="light-content"
        />

        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Welcome"
            screenOptions={{
              headerShown: false,
              contentStyle: {
                backgroundColor: 'transparent',
              },
            }}
          >
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="AuthScreen" component={AuthScreen} />
            <Stack.Screen name="Daily" component={DailyScreen} />
            <Stack.Screen name="Todo" component={TodoScreen} />
            <Stack.Screen name="General" component={GeneralScreen} />
            <Stack.Screen name="Preventive" component={PreventiveScreen} />
            <Stack.Screen name="Emergency" component={EmergencyScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="Route" component={RouteScreen} />
            <Stack.Screen name="SearchAddress" component={SearchAdress} />
            <Stack.Screen name="Agenda" component={AgendaScreen} />
            <Stack.Screen name="Info" component={InfoScreen} />
            <Stack.Screen name="ChatBots" component={ChatBotsScreen} />
            <Stack.Screen name="IA" component={IAScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
