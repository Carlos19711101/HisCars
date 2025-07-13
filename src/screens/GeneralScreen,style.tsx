// screens/GeneralScreen.styles.ts

import { StyleSheet, ViewStyle, TextStyle, ImageStyle } from 'react-native';

// Interfaz para asegurar el tipado fuerte de nuestros estilos
interface Styles {
  container: ViewStyle;
  content: ViewStyle;
  keyboardAvoidingView: ViewStyle;
  backButton: ViewStyle;
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
}

const styles = StyleSheet.create<Styles>({
  container: {
    flex: 1,
  },
  content: {
    padding: 10,
    alignItems: 'center',
    width: '100%',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
  },
  entriesList: {
    paddingBottom: 20,
  },
  entryContainer: {
    backgroundColor: 'rgba(43, 202, 213, 0.14)',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 15,
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
  },
  deleteButton: {
    padding: 5,
  },
  entryText: {
    fontSize: 16,
    color: '#fff',
    marginTop: 5,
  },
  entryImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 10,
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
  listFooter: {
    height: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 30,
    marginTop: 30,
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