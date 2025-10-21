// screens/EmergencyScreen.styles.ts
import { StyleSheet, ViewStyle, TextStyle, ImageStyle, Platform } from 'react-native';

interface Styles {
  safeArea: ViewStyle;
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
  
  // Estilos para el botón de gestión de combustible
  fuelStatsButton: ViewStyle;
  fuelStatsButtonGradient: ViewStyle;
  fuelStatsButtonText: TextStyle;
  
  // Estilos para el resumen de combustible
  fuelSummaryWrapper: ViewStyle;
  fuelSummaryContainer: ViewStyle;
  fuelSummaryHeader: ViewStyle;
  fuelSummaryTitle: TextStyle;
  fuelSummaryText: TextStyle;
  fuelMetricsGrid: ViewStyle;
  fuelMetric: ViewStyle;
  fuelMetricValue: TextStyle;
  fuelMetricLabel: TextStyle;
  fuelOverallMetrics: ViewStyle;
  fuelOverallTitle: TextStyle;
  fuelOverallText: TextStyle;
  fuelLastUpdate: TextStyle;
  fuelSetupButton: ViewStyle;
  fuelSetupButtonText: TextStyle;

  // Nuevos estilos para el historial de combustible
  fuelHistoryContainer: ViewStyle;
  fuelHistoryScroll: ViewStyle;
  fuelHistoryTitle: TextStyle;
  fuelHistoryItem: ViewStyle;
  fuelHistoryDate: TextStyle;
  fuelHistoryDetails: ViewStyle;
  fuelHistoryAmount: TextStyle;
  fuelHistoryOdometer: TextStyle;
  viewAllButton: ViewStyle;
  viewAllButtonText: TextStyle;
  
  footerContainer: ViewStyle;
  footerContent: ViewStyle;

  // Nuevos estilos para el chatbox de voz
  chatOverlay: ViewStyle;
  chatContainer: ViewStyle;
  chatHeader: ViewStyle;
  chatTitle: TextStyle;
  chatCloseButton: ViewStyle;
  chatMessageContainer: ViewStyle;
  chatBotMessage: ViewStyle;
  chatMessageText: TextStyle;
  chatSpeakingIndicator: ViewStyle;
  chatSpeakingText: TextStyle;
  chatControls: ViewStyle;
  chatReplayButton: ViewStyle;
  chatReplayButtonText: TextStyle;
  chatActionButton: ViewStyle;
  chatActionButtonText: TextStyle;
  chatFloatingButton: ViewStyle;
  chatFloatingButtonGradient: ViewStyle;
  chatPulseIndicator: ViewStyle;
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
    width: '100%',
    marginTop: Platform.OS === 'ios' ? 10 : 20,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 40,
    left: 20,
    zIndex: 10,
    padding: 8,
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
    top: -8,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginBottom: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.23)',
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
    height: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
    marginTop: -10,
    textAlign: 'center',
  },

  // Estilos para el botón de gestión de combustible
  fuelStatsButton: {
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginTop: 10,
    width: '80%',
  },
  fuelStatsButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  fuelStatsButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

  // Estilos para el resumen de combustible
  fuelSummaryWrapper: {
    flex: 1,
    marginHorizontal: 12,
    marginBottom: 8,
    maxHeight: 350,
  },
  fuelSummaryContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  fuelSummaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  fuelSummaryTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  fuelSummaryText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 10,
  },
  fuelMetricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  fuelMetric: {
    alignItems: 'center',
    flex: 1,
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    marginHorizontal: 4,
  },
  fuelMetricValue: {
    color: '#58fd03',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  fuelMetricLabel: {
    color: 'white',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 4,
  },
  fuelOverallMetrics: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  fuelOverallTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  fuelOverallText: {
    color: 'white',
    fontSize: 12,
    lineHeight: 18,
  },
  fuelLastUpdate: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 10,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 8,
  },
  fuelSetupButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 8,
    alignSelf: 'center',
  },
  fuelSetupButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },

  // Nuevos estilos para el historial de combustible
  fuelHistoryContainer: {
    marginBottom: 10,
  },
  fuelHistoryScroll: {
    maxHeight: 180,
  },
  fuelHistoryTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  fuelHistoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
  },
  fuelHistoryDate: {
    color: 'white',
    fontSize: 12,
    flex: 1,
  },
  fuelHistoryDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  fuelHistoryAmount: {
    color: '#58fd03',
    fontSize: 12,
    fontWeight: 'bold',
  },
  fuelHistoryOdometer: {
    color: 'white',
    fontSize: 12,
  },
  viewAllButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'center',
    marginTop: 8,
  },
  viewAllButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },

  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
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

  // =========================================================================
  // NUEVOS ESTILOS PARA EL CHATBOX DE VOZ
  // =========================================================================
  chatOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '60%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 15,
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  chatCloseButton: {
    padding: 5,
  },
  chatMessageContainer: {
    marginBottom: 20,
  },
  chatBotMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4A0CA3',
  },
  chatMessageText: {
    marginLeft: 10,
    color: '#666',
    fontSize: 14,
    flex: 1,
  },
  chatSpeakingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    padding: 8,
    backgroundColor: '#f0f8f0',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  chatSpeakingText: {
    marginLeft: 5,
    color: '#4CD964',
    fontSize: 12,
    fontWeight: '600',
  },
  chatControls: {
    gap: 10,
  },
  chatReplayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6c757d',
    padding: 15,
    borderRadius: 12,
    gap: 8,
  },
  chatReplayButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  chatActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0c8ca3ff',
    padding: 10,
    borderRadius: 12,
    gap: 8,
  },
  chatActionButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  chatFloatingButton: {
    position: 'absolute',
    top: 70,
    right: 20,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  chatFloatingButtonGradient: {
    marginTop: -20,
    width: 40,
    height: 40,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  chatPulseIndicator: {
    position: 'absolute',
    top: 50,
    right: -5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4CD964',
    borderWidth: 2,
    borderColor: 'white',
  },
});

export default styles;