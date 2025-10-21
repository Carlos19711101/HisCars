import { StyleSheet, ViewStyle, TextStyle, ImageStyle, StatusBar } from 'react-native';

// Interfaz para todos los estilos del componente.
interface Styles {
  safeArea: ViewStyle;
  container: ViewStyle;
  content: ViewStyle;
  keyboardAvoidingView: ViewStyle;
  backButton: ViewStyle;
  backButtonIcon: ViewStyle; // Estilo añadido para el icono
  entriesList: ViewStyle;
  entryContainer: ViewStyle;
  entryHeader: ViewStyle;
  entryDate: TextStyle;
  deleteButton: ViewStyle;
  entryText: TextStyle;
  entryImage: ImageStyle;
  timelineConnector: ViewStyle;
  inputContainer: ViewStyle;
  input: TextStyle;
  mediaButton: ViewStyle;
  sendButton: ViewStyle;
  imagePreviewContainer: ViewStyle;
  imagePreview: ImageStyle;
  removeImageButton: ViewStyle;
  listFooter: ViewStyle;
  title: TextStyle;
  cameraModalButton: ViewStyle; // Estilo añadido para el botón de la cámara
  searchAddressButton: ViewStyle; // Nuevo estilo para el botón de búsqueda
  searchAddressText: TextStyle; // Nuevo estilo para el texto del botón
  searchIcon: ViewStyle; // Nuevo estilo para el icono de búsqueda
}

const styles = StyleSheet.create<Styles>({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 10,
    alignItems: 'center',
    right: -10,
    width: '100%',
  },
  keyboardAvoidingView: {
    flex: 1,
    paddingTop: 5,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 30,
    zIndex: 10,
    padding: 10,
  },
  backButtonIcon: {
    marginLeft: 0,
    marginTop: -5,
  },
  entriesList: {
    paddingBottom: 20,
  },
  entryContainer: {
    backgroundColor: 'rgba(30, 6, 251, 0.18)',
    borderRadius: 10,
    padding: 5,
    marginHorizontal: 8,
    marginVertical: 8,
    position: 'relative',
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  entryDate: {
    color: '#fff',
    fontSize: 12,
    left: 25,
  },
  deleteButton: {
    padding: 5,
    right: 5,
  },
  entryText: {
    fontSize: 16,
    color: '#fff',
    marginTop: 5,
  },
  entryImage: {
    width: '100%',
    height: 400,
    borderRadius: 8,
    marginTop: 8,
  },
  timelineConnector: {
    position: 'absolute',
    left: -15,
    top: 30,
    bottom: -8,
    width: 2,
    backgroundColor: 'white',
  },
  inputContainer: {
    top: -10,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginBottom: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginHorizontal: 5,
    maxHeight: 100,
    color: '#333',
  },
  mediaButton: {
    padding: 8,
  },
  sendButton: {
    padding: 8,
    marginLeft: 5,
  },
  imagePreviewContainer: {
    position: 'relative',
    padding: 10,
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 10,
    padding: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    marginTop: 8,
    right: -5,
  },
  cameraModalButton: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
    borderRadius: 50,
  },
  // Nuevos estilos para el botón de búsqueda
  searchAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(6, 254, 254, 0.89)',
    paddingVertical: 12,
    paddingHorizontal: 60,
    borderRadius: 20,
    marginLeft: -15,
    marginTop: 10,
  },
  searchAddressText: {
    alignItems: 'center',
    color: 'white',
    fontSize: 14,
    right: -10,
    fontWeight: '600',
  },
  searchIcon: {
    left: -25,
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
  listFooter: {
    height: 20,
    marginBottom: 5,
  },
});

export default styles;