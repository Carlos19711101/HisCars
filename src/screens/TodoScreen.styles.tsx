// screens/TodoScreen.styles.ts

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
  cardTitle: TextStyle;
  cardSubtitle: TextStyle;
  backButton: ViewStyle;
  pagination: ViewStyle;
  paginationDot: ViewStyle;
  paginationDotActive: ViewStyle;
  title: TextStyle;
}

const styles = StyleSheet.create<Styles>({
  containerGlobal: {
    flex: 1,
  },
  container: {
    height: 420,
    marginVertical: 80,
    overflow: 'hidden',
  },
  content: {
    padding: 20,
    alignItems: 'center',
    width: '100%',
  },
  scrollContainer: {
    alignItems: 'center',
  },
  card: {
    height: 400,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 15,
  },
  cardImage: {
    width: 80,
    height: 80,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  backButton: {
    position: 'absolute',
    top: 40,
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
    marginBottom: 10,
    marginTop: -5,
    right: -10,
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
});

export default styles;