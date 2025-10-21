// screens/FuelStatsBotScreen.styles.ts
import { StyleSheet, Platform } from 'react-native';

export default StyleSheet.create({
  container: { 
  flex: 1 
  },
  content: {
    padding: 10,
    alignItems: 'center',
    width: '100%',
    marginTop: Platform.OS === 'ios' ? 10 : 20,
  },
  header: {
    marginTop: 5,
    height: 40,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: { padding: 4 },
  headerContent: { flex: 1, alignItems: 'center' },
  headerTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700' 
  },
  menuButton: { padding: 6 },

  chatContainer: { 
    flex: 1,
    marginTop: -60,
    paddingHorizontal: 12 
  },
  messagesList: { paddingVertical: 12, paddingBottom: 96 },

  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  userMessageContainer: { justifyContent: 'flex-end' },
  botMessageContainer: { justifyContent: 'flex-start' },

  botAvatar: { 
    backgroundColor: '#4A0CA3',
    borderRadius: 100,
    width: 32,
    height: 32,
    marginRight: 8 
  },
  botAvatarImage: { 
    borderRadius: 100,
    width: 32,
    height: 32
 },

  userAvatar: {
    width: 28,
    height: 28,
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A0CA3',
    borderRadius: 14,
  },

  messageBubble: {
    maxWidth: '78%',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  userMessageBubble: {
    marginLeft: 'auto',
    backgroundColor: '#2C2C54AA',
  },
  botMessageBubble: {
    marginRight: 'auto',
    backgroundColor: '#1E1E3FAA',
  },
  messageText: { color: '#F2F2F2', fontSize: 14, lineHeight: 20 },
  userMessageText: { color: '#FFFFFF' },
  botMessageText: { color: '#EDEBFF' },

  timestamp: { fontSize: 10, color: '#C9C9D9', marginTop: 6, alignSelf: 'flex-end' },
  userTimestamp: {},
  botTimestamp: {},

  statusContainer: {
    alignSelf: 'center',
    marginBottom: 6,
    backgroundColor: '#00000055',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  
  statusText: { color: 'white', fontWeight: '600' },

  actionButtonsContainer: {
    marginTop: 100,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 12,
    marginBottom: 6,
  },
  helpButton: {
    marginTop: -100,
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  actionButtonText: { color: 'white', fontWeight: '700' },

  /* ===== Modal Acciones rápidas ===== */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  quickModalContainer: {
    backgroundColor: '#0F141C',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 1,
    borderColor: '#1E2734',
    maxHeight: '80%',
    paddingBottom: 8,
  },
  quickHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E2734',
  },
  quickTitle: { color: '#E8EEF6', fontSize: 16, fontWeight: '700' },
  quickBody: { paddingHorizontal: 16, paddingBottom: 12 },
  quickInstruction: {
    color: '#BFD6FF',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
    marginBottom: 10,
  },
  bold: { fontWeight: '700', color: '#E8EEF6' },

  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingVertical: 8,
  },
  quickButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#18202B',
    borderWidth: 1,
    borderColor: '#243142',
    minWidth: '48%',
  },
  quickButtonDisabled: { opacity: 0.4 },
  quickButtonText: { color: '#E8EEF6', fontWeight: '600', fontSize: 12 },

  /* ===== Modales genéricos (precio / primera / última / reporte) ===== */
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'left',
    color: '#333',
  },
  modalHint: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    color: '#222',
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    gap: 10,
  },
  btnCancel: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
  },
  btnCancelText: { fontSize: 16, fontWeight: '600', color: '#666' },
  btnConfirm: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#4A0CA3',
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.5 },
  btnConfirmText: { fontSize: 16, fontWeight: '600', color: 'white' },

  // ✅ NUEVO ESTILO: Botón de peligro
  btnDanger: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ef4444',
  },

  // ✅ NUEVO ESTILO: Botón de eliminar en mensajes
  deleteButton: {
    padding: 6,
    marginLeft: 8,
  },

  /* ===== Selector de N tanqueadas ===== */
  countRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
    marginTop: 4,
  },
  countChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#bdbdbd',
    backgroundColor: '#ffffff',
  },
  countChipActive: {
    backgroundColor: '#4A0CA3',
    borderColor: '#4A0CA3',
  },
  countChipText: { color: '#444', fontWeight: '600' },
  countChipTextActive: { color: 'white', fontWeight: '700' },

  /* ===== Input ===== */
  inputContainer: {
    paddingHorizontal: 12,
    paddingBottom: Platform.OS === 'ios' ? 20 : 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#121822',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1E2734',
    padding: 8,
  },
  textInput: {
    flex: 1,
    color: 'white',
    paddingHorizontal: 8,
    paddingVertical: 8,
    maxHeight: 120,
  },
  sendButton: {
    backgroundColor: '#6E45E2',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  sendButtonDisabled: { opacity: 0.5 },
});