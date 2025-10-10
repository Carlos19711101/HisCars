import React from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StatusBar,
  Platform,
  StyleSheet,
  Dimensions,
  ImageBackground
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign, Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

// Definir los tipos de navegación localmente para evitar problemas de importación
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
};

type InfoScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Info'>;

const { width, height } = Dimensions.get('window');

const InfoScreen = () => {
  const navigation = useNavigation<InfoScreenNavigationProp>();

  // Importar imágenes de las tarjetas principales
  const cardImages = [
    require('../../assets/imagenTargeta/ProfileScreen3.png'),
    require('../../assets/imagenTargeta/DailyScreen.png'),
    require('../../assets/imagenTargeta/PreventiveScreen1.png'),
    require('../../assets/imagenTargeta/GeneralScreen1.png'),
    require('../../assets/imagenTargeta/EmergencyScreen.png'),
    require('../../assets/imagenTargeta/RouteScreen.png'),
  ];

  // Datos de las características de la app
  const features = [
    {
      icon: 'id-card',
      title: 'Tarjeta # 1 \nPerfil Vehículo',
      description:'En el perfil de tu vehículo, actualiza la foto y registra los datos del propietario. Mantén actualizada información clave como SOAT, pico y placa y tecnomecánica, para un seguimiento y control más eficiente, adiccionalmente, puedes registrar datos específicos de tu vehículo como marca, modelo, facilitando la gestión integral de tu vehículo.',
      color: '#33ee0d',
      image: cardImages[0]
    },
    {
      icon: 'calendar-check',
      title: 'Tarjeta # 2 \nAgéndate',
      description: 'Organiza tus citas personales, mantenimientos y cualquier actividad diaria con nuestro sistema inteligente de recordatorios. Gestiona agendas, recibe alertas automáticas y asegúrate de no olvidar eventos importantes. Nuestra plataforma te permite planificar y actualizar tus tareas, optimizando tu tiempo y facilitando un control eficiente de tu rutina y el cuidado de tu vehículo.',
      color: '#eb0dee',
      image: cardImages[1]
    },
    {
      icon: 'tools',
      title: 'Tarjeta # 3 \nMantenimiento Preventivo',
      description: 'Programa y realiza un seguimiento detallado de los mantenimientos preventivos de tu Vehículo. Documenta cada intervención tomando fotografías y subiendo registros desde tu galería. Así, contarás con un expediente completo y actualizado que respalda el historial de tus mantenimientos preventivos, facilitando el control, la gestión y la toma de decisiones para mantener tu Vehículo en óptimas condiciones.',
      color: '#0deeda',
      image: cardImages[2]
    },
    {
      icon: 'cog',
      title: 'Tarjeta # 4 \nMantenimiento General',
      description: 'Registra de manera organizada todos los mantenimientos generales realizados a tu vehículo. Disfruta de un sistema avanzado de registro, similar al de mantenimientos preventivos, que te permite documentar cada servicio realizado, adjuntar fotos y almacenar comprobantes. Así, contarás con un historial completo y accesible de todas las intervenciones, facilitando la gestión, el análisis y el control del estado de tu vehículo a lo largo del tiempo.',
      color: '#0b0ffaff',
      image: cardImages[3]
    },
    {
      icon: 'first-aid',
      title: 'Tarjeta # 5 \nModo Emergencia',
      description: 'Acceda de forma inmediata a información clave ante cualquier ocurrencia en la vía. Registrar cada incidente te permite construir un historial detallado, facilitando la identificación de patrones y ayudando a prevenir posibles fallas en el futuro. Así, estarás mejor preparado para actuar y tomar decisiones informadas sobre la seguridad y el mantenimiento de tu vehículo.',
      color: '#FF5252',
      image: cardImages[4]
    },
    {
      icon: 'map-marked-alt',
      title: 'Tarjeta # 6 \nGestión de Rutas',
      description: 'Registra y revisa tus rutas y recorridos favoritos de forma sencilla y organizada. Documenta cada viaje y mantiene un historial completo para que puedas consultarlo cuando quieras. Además, contamos con dos de los buscadores de direcciones más confiables: Google Maps y Waze, integrados para facilitar tus búsquedas y hacer que planificar tus trayectos sea rápido y eficiente.',
      color: '#810dee',
      image: cardImages[5]
    }
  ];

  // Pasos para usar la app
  const steps = [
    {
      step: 1,
      title: 'Completa tu perfil',
      description: 'Registra los datos de tu vehículo en la sección de perfil.'
    },
    {
      step: 2,
      title: 'Programa mantenimientos',
      description: 'Usa las secciones de mantenimiento preventivo y general.'
    },
    {
      step: 3,
      title: 'Organiza tus viajes',
      description: 'Planifica tus rutas y agéndalas en el calendario diario.'
    },
    {
      step: 4,
      title: 'Explora todas las funciones',
      description: 'Descubre cómo cada sección puede ayudarte en tu día a día.'
    },
    {
      step: 5,
      title: 'Creamos un Agente Inteligente',
      description: 'Desarrollamos este Agente pensando en tu comodidad. Actualmente está en fase de mejora, por lo que puede presentar algunos errores. Sin embargo, continuamos optimizándolo para ofrecerte una experiencia cada vez más fluida y eficiente, facilitando la interacción y la rapidez en la atención a tus necesidades.'
    }
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <LinearGradient
        colors={['#000000', '#285a01ff', '#0bfc07ff']}
          locations={[0, 0.6, 1]} // Aquí implementamos los porcentajes
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient} 
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.navigate('Todo')}
          >
            <AntDesign name="double-left" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Información de la App</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <ImageBackground
              source={require('../../assets/imagenTargeta/InfoApp2.png')} // Imagen de fondo para el hero
              style={styles.heroCard}
              imageStyle={styles.heroCardImage}
              resizeMode="cover"
            >
              <LinearGradient
                colors={['rgba(249, 248, 250, 0)', 'rgba(249, 249, 250, 0)', 'rgba(242, 249, 248, 0)']}
                style={styles.heroOverlay}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {/* <View style={styles.logoContainer}>
                  <Ionicons name="document-text" size={50} color="white" />
                </View> */}
                <Text style={styles.heroTitle}>Creemos una Historia Juntos</Text>
                <Text style={styles.heroSubtitle}>
                  La aplicación completa para gestionar y mantener el expediente de tu Vehículo.
                </Text>
              </LinearGradient>
            </ImageBackground>
          </View>
               <View style={styles.heroSection}>
            <ImageBackground
              source={require('../../assets/imagenTargeta/AgenteInteligente.png')} // Imagen de fondo para el hero
              style={styles.heroCard}
              imageStyle={styles.heroCardImage}
              resizeMode="cover"
            >
              <LinearGradient
                colors={['rgba(249, 248, 250, 0)', 'rgba(249, 249, 250, 0)', 'rgba(242, 249, 248, 0)']}
                style={styles.heroOverlay}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.heroTitle}></Text>
                <Text style={styles.heroSubtitle1}>
                  ¡Hola! Soy tu Agente Inteligente, diseñado para asitirte en algunas preguntas y respuestas informativas y frecuentes.
                </Text>
              </LinearGradient>
            </ImageBackground>
          </View>

          {/* Features Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Características Principales</Text>
            {features.map((feature, index) => (
              <ImageBackground
                key={index}
                source={feature.image}
                style={styles.featureCard}
                imageStyle={styles.featureCardImage}
                resizeMode="cover"
              >
                <LinearGradient
                  colors={['rgba(0, 0, 0, 0.7)', 'rgba(0, 0, 0, 0.5)']}
                  style={styles.featureOverlay}
                >
                  <View style={[styles.featureIcon, { backgroundColor: feature.color }]}>
                    <FontAwesome5 name={feature.icon} size={20} color="white" />
                  </View>
                  <View style={styles.featureText}>
                    <Text style={styles.featureTitle}>{feature.title}</Text>
                    <Text style={styles.featureDescription}>{feature.description}</Text>
                  </View>
                </LinearGradient>
              </ImageBackground>
            ))}
          </View>

          {/* How to Use Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cómo Empezar</Text>
            {steps.map((step, index) => (
              <View key={index} style={styles.stepCard}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{step.step}</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepDescription}>{step.description}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* App Info Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Acerca de la Aplicación</Text>
            <ImageBackground
              source={require('../../assets/imagenTargeta/Global.png')} // Imagen de fondo para la info card
              style={styles.infoCard}
              imageStyle={styles.infoCardImage}
              resizeMode="cover"
            >
              <LinearGradient
                colors={['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0)']}
                style={styles.infoCardOverlay}
              >
                <View style={styles.infoItem}>
                  <MaterialIcons name="update" size={22} color="#f6f4f9ff" />
                <View style={styles.infoText}>
                    <Text style={styles.infoLabel}>Última Actualización</Text>
                    <Text style={styles.infoValue}>Septiembre 2025</Text>
                </View>
                </View>
                <View style={styles.infoItem}>
                  <MaterialIcons name="history" size={22} color="#f2f1f5ff" />
                  {/* <View style={styles.infoText}>
                    <Text style={styles.infoLabel}>Versión</Text>
                    <Text style={styles.infoValue}>1.0.0</Text>
                  </View> */}
                </View>
                <View style={styles.infoItem}>
                  <AntDesign name="team" size={22} color="#fcfbfcff" />
                  <View style={styles.infoText}>
                    <Text style={styles.infoLabel}>Desarrollado por</Text>
                    <Text style={styles.infoValue}>Global Solutions IA</Text>
                  </View>
                </View>
              </LinearGradient>
            </ImageBackground>
          </View>

          {/* Footer CTA */}
          <TouchableOpacity 
            style={styles.ctaButton}
            onPress={() => navigation.navigate('Todo')}
          >
            <Text style={styles.ctaText}>¡Empezar a Usar la App!</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>© 2025 Documenta la Historia. Todos los derechos reservados.</Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  heroSection: {
    padding: 20,
    alignItems: 'center',
  },
  heroCard: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    minHeight: 300,
    justifyContent: 'center',
  },
  heroCardImage: {
    borderRadius: 20,
  },
  heroOverlay: {
    padding: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  heroTitle: {
    color: '#ffffffff',
    top: -50,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  heroSubtitle: {
    color: 'rgba(245, 249, 244, 1)',
    top: 20,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  heroSubtitle1: {
    color: 'rgba(244, 246, 243, 1)',
    top: 60,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  featureCard: {
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 15,
    minHeight: 180,
  },
  featureCardImage: {
    borderRadius: 15,
  },
  featureOverlay: {
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 180,
  },
  featureIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  featureDescription: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    lineHeight: 20,
  },
  stepCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  stepNumberText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  stepDescription: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
  infoCard: {
    borderRadius: 15,
    overflow: 'hidden',
    minHeight: 200,
    justifyContent: 'center',
  },
  infoCardImage: {
    borderRadius: 15,
  },
  infoCardOverlay: {
    padding: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 50,
  },
  infoText: {
    marginLeft: 25,
    flex: 1,
  },
  infoLabel: {
    color: '#f9f9faff',
    fontSize: 14,
    fontWeight: '600',
  },
  infoValue: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '500',
  },
  ctaButton: {
    backgroundColor: 'white',
    marginHorizontal: 40,
    marginVertical: 30,
    borderRadius: 30,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  ctaText: {
    color: '#6E45E2',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    textAlign: 'center',
  },
});

export default InfoScreen;