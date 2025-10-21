import { StyleSheet, ViewStyle, TextStyle, ImageStyle } from 'react-native';

// Interfaz para asegurar tipado fuerte de estilos
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

  // Nuevos estilos para tareas preventivas
  sectionTitle: TextStyle;
  taskList: ViewStyle;
  taskCard: ViewStyle;
  taskDescription: TextStyle;
  taskDue: TextStyle;
  taskStatus: TextStyle;
  completeBtn: ViewStyle;
  completeText: TextStyle;

  footerContainer?: ViewStyle;
  footerContent?: ViewStyle;
}

const styles = StyleSheet.create<Styles>({
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
    marginBottom: 5,
    right: 5,
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
    marginTop: 5,
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
  listFooter: {
    height: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    marginTop: 8,
    right: -5,
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

  // --- Estilos para tareas preventivas ---

  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 12,
    marginBottom: 10,
  },
  taskList: {
    paddingHorizontal: 12,
  },
  taskCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 14,
    borderRadius: 14,
    marginRight: 14,
    minWidth: 210,
    maxWidth: 250,
  },
  taskDescription: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  taskDue: {
    color: '#fff',
    marginTop: 4,
    fontSize: 13,
  },
  taskStatus: {
    marginTop: 6,
    color: '#ccc',
    fontSize: 12,
  },
  completeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  completeText: {
    marginLeft: 6,
    color: '#39d353',
    fontWeight: '600',
    fontSize: 13,
  },
});

export default styles;
