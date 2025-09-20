import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Alert, BackHandler, Platform, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

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

  const STATUS_BAR_HEIGHT = Platform.OS === 'android' ? StatusBar.currentHeight : 0;

  return (
    <>
      <StatusBar
        translucent={true}
        backgroundColor="transparent"
        barStyle="light-content"
      />
      
      <LinearGradient
        colors={['#000000', '#3A0CA3', '#F72585']}
        locations={[0, 0.6, 1]} // Aquí implementamos los porcentajes
        style={[styles.container, { paddingTop: STATUS_BAR_HEIGHT }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Botón de salida */}
        <TouchableOpacity 
          style={[styles.exitButton, { top: (STATUS_BAR_HEIGHT || 0) + 20 }]} 
          onPress={exitApp}
        >
          <AntDesign name="logout" size={24} color="white" />
        </TouchableOpacity>
        
        {/* Contenido principal */}
        <View style={styles.content}>
          <Text style={styles.title}>¡Bienvenido!</Text>
          <Text style={styles.subtitle}>Descubre una experiencia única diseñada para ti</Text>
          
          <TouchableOpacity 
            style={styles.button}
            onPress={() => navigation.navigate('Todo')}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['#FFFFFF', '#E0E0E0']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.buttonText}>Comenzar</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>Respaldado por:</Text>
          <Text style={styles.footerBrandText}>Global Solutions IA</Text>
        </View>
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
    width: '90%',
    marginBottom: height * 0.15, // Espacio para el footer
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  button: {
    width: '80%',
    borderRadius: 30,
    overflow: 'hidden', // Para que el gradiente del botón no se salga
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#3A0CA3',
    fontSize: 18,
    fontWeight: '600',
  },
  exitButton: {
    position: 'absolute',
    left: 20,
    zIndex: 10,
    padding: 10,
  },
  footerContainer: {
    position: 'absolute',
    bottom: 90,
    width: '100%',
    alignItems: 'center',
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
  },
  footerBrandText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default WelcomeScreen;