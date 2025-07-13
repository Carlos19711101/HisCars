import React from 'react';
import { View, Text, TouchableOpacity, Image, BackHandler, Alert, StatusBar, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign } from '@expo/vector-icons';
import styles from './AuthScreen.styles';

const AuthScreen = ({ navigation }: any) => {
  const [isLogged, setIsLogged] = React.useState(false);

  const exitApp = () => {
    Alert.alert(
      'Salir',
      '¿Estás seguro de que quieres salir de la aplicación?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Salir', onPress: () => BackHandler.exitApp() },
      ],
      { cancelable: false }
    );
  };

  // Calcula la altura del StatusBar según la plataforma
  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight : 0;

  return (
    <>
      {/* Configuración del StatusBar para esta pantalla */}
      <StatusBar
        translucent={true}
        backgroundColor="transparent"
        barStyle="light-content"
      />
      
      <LinearGradient
         colors={['#000000', '#3A0CA3', '#7209B7', '#F72585']}
         locations={[0, 0.3, 0.6, 1]}   // Misma distribución porcentual
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        style={[styles.container, { paddingTop: statusBarHeight }]}
      >
        {/* <TouchableOpacity style={styles.exitButton} onPress={exitApp}>
          <AntDesign name="logout" size={24} color="white" />
        </TouchableOpacity> */}
        
        <View style={styles.content}>
          <Image
            source={{ uri: 'https://via.placeholder.com/100' }}
            style={styles.logo}
          />

          {isLogged ? (
            <>
              <Text style={styles.welcomeText}>¡Bienvenido de vuelta!</Text>
              <TouchableOpacity
                style={[styles.button, styles.mainButton]}
                onPress={() => navigation.navigate('Home')}
              >
                <Text style={styles.buttonText}>Continuar a la App</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.title}>¡Bienvenido!</Text>
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>o</Text>
                <View style={styles.dividerLine} />
              </View>
              <TouchableOpacity
                style={[styles.button, styles.googleButton]}
                onPress={() => navigation.navigate('Todo')}
                activeOpacity={0.7}
              >
                <Text style={styles.buttonText}>Iniciar Sesión</Text>
              </TouchableOpacity>
              <Text style={styles.registerText}></Text>
              <Text style={styles.registerText}></Text>
              <TouchableOpacity
                style={[styles.button, styles.googleButton]}
                onPress={() => navigation.navigate('Todo')}
                activeOpacity={0.7}
              >
                <Text style={styles.buttonText}>Sin Registro</Text>
              </TouchableOpacity>
              <Text style={styles.buttonText}></Text>
              <TouchableOpacity
                style={[styles.button, styles.googleButton]}
                onPress={() => navigation.navigate('Todo')}
              >
                <Text style={styles.buttonText}>Sin Datos</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.registerLink}
                onPress={() => navigation.navigate('Todo')}
              >
                {/* Puedes agregar aquí un texto o icono para el registro */}
              </TouchableOpacity>
            </>
          )}
        </View>
        
        {/* Texto "producido por" agregado en la parte inferior */}
        <Text style={styles.footerText}>Respaldado por:</Text>
        <Text style={styles.footer1Text}>Global Solutions IA</Text>
      </LinearGradient>
    </>
  );
};

export default AuthScreen;