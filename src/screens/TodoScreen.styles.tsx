import { StyleSheet, Dimensions, ViewStyle, TextStyle, ImageStyle, StatusBar } from 'react-native';

// 1. CONSTANTES DE LAYOUT: Movidas aquí para centralizar la configuración de la presentación.
const { width } = Dimensions.get('window');
export const CARD_WIDTH = width * 0.6; // 60% para tarjeta central
export const SPACING = 0.6;
export const MARGIN_HORIZONTAL = (width - CARD_WIDTH) / 2 - SPACING;

// Interfaz para todos los estilos del componente
interface Styles {
  containerGlobal: ViewStyle;
  container: ViewStyle;
  content: ViewStyle;
  scrollContainer: ViewStyle;
  card: ViewStyle;
  cardImage: ImageStyle;
  textContainer: ViewStyle;
  cardTitle: TextStyle;
  cardSubtitle: TextStyle;
  backButton: ViewStyle;
  pagination: ViewStyle;
  paginationDot: ViewStyle;
  paginationDotActive: ViewStyle;
  title: TextStyle;
  addButton: ViewStyle;
  addButton3: ViewStyle;
  addButton2: ImageStyle;
  addButton4: ImageStyle;
  content1: ViewStyle;
}

const styles = StyleSheet.create<Styles>({
  containerGlobal: {
    flex: 1,
  },
  addButton: {
    position: 'absolute',
    top: 15,
    right: 50,
    bottom: 30,
    width: 65,
    height: 65,
    borderRadius: 30,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  addButton2: {
    position: 'absolute',
    top: 2,
    right: 2,
    bottom: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4bec3cf6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  addButton3: {
    position: 'absolute',
    top: 1,
    right: 200,
    bottom: 30,
    width: 95,
    height: 50,
    borderRadius: 10,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  addButton4: {
    position: 'absolute',
    top: 10,
    right: 5,
    bottom: 30,
    width: 90,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#f0f7ef02',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  container: {
    height: '70%',
    marginVertical: 'auto',
    overflow: 'hidden',
  },
  content: {
    padding: 10,
    alignItems: 'center',
    width: '100%',
  },
  content1: {
    padding: 10,
    alignItems: 'center',
    width: '100%',
  },
  scrollContainer: {
    alignItems: 'center',
  },
  card: {
    height: '100%',
    width: 'auto',
    borderRadius: 20,
    justifyContent: 'flex-end', // Cambiado para alinear el texto al fondo
    alignItems: 'center',
    shadowColor: '#0e0e0e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 15,
    position: 'relative',
  },
  cardImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  textContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fondo semitransparente para mejor legibilidad
    padding: 15,
    width: '100%',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    paddingHorizontal: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10,
  },
  backButton: {
    position: 'absolute',
    marginTop: 5,
    left: 20,
    zIndex: 10,
    padding: 5,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#333',
    width: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    marginTop: 8,
    right: -5,
  },
});

export default styles;