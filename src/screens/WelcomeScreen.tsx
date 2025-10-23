import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Alert, BackHandler, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign } from '@expo/vector-icons';

const WelcomeScreen = ({ navigation }: any) => {
  const exitApp = () => {
    Alert.alert(
      'Cerrar aplicación',
      '¿Estás seguro que deseas salir?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Salir',
          onPress: () => BackHandler.exitApp(),
        },
      ],
      { cancelable: false }
    );
  };

  // Calcula la altura segura para el StatusBar
  const STATUS_BAR_HEIGHT = Platform.OS === 'android' ? StatusBar.currentHeight : 0;

  return (
    <>
      {/* StatusBar transparente con texto claro */}
      <StatusBar
        translucent={true}
        backgroundColor="transparent"
        barStyle="light-content"
      />
      
      <LinearGradient
        colors={['#000000', '#3A0CA3', '#F72585']}
          locations={[0, 0.6, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        style={[styles.container, { paddingTop: STATUS_BAR_HEIGHT }]}
      >
        {/* Botón de salida - Ajustado para considerar el StatusBar */}
        <TouchableOpacity 
          style={[styles.exitButton, { top: (STATUS_BAR_HEIGHT || 0 )+ 20 }]} 
          onPress={exitApp}
        >
          <AntDesign name="logout" size={24} color="white" />
        </TouchableOpacity>
        
        <View style={styles.content}>
          <Text style={styles.title}>¡Bienvenido!</Text>
          <Text style={styles.subtitle}>Descubre una experiencia única diseñada para ti</Text>
          
          <TouchableOpacity 
            style={styles.button}
            onPress={() => navigation.navigate('Todo')}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>Comenzar</Text>
          </TouchableOpacity>
        </View>

        {/* Texto "producido por" en la parte inferior */}
        <Text style={styles.footerText}>Respaldado por:</Text>
        <Text style={styles.footer1Text}>Global Solutions IA</Text>
      </LinearGradient>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
    alignItems: 'center',
    width: '80%',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#cacbd6',
    paddingVertical: 15,
    paddingHorizontal: 60,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 9,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
  },
  buttonText: {
    color: 'rgba(14, 15, 14, 0.98)',
    fontSize: 18,
    fontWeight: '500',
  },
  exitButton: {
    position: 'absolute',
    left: 20,
    zIndex: 10,
    padding: 10,
  },
   footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent', // Fondo transparente
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
  },
  footerText: {
    position: 'absolute',
    bottom: 100,
    color: 'rgba(14, 15, 14, 0.98)',
    fontSize: 12,
    textAlign: 'center',
    width: '100%',
  },
  footer1Text: {
    position: 'absolute',
    bottom: 70,
    color: 'rgba(14, 15, 14, 0.98)',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    width: '100%',
  },
});

export default WelcomeScreen;