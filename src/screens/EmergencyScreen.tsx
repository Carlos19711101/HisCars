// screens/EmergencyScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';
import CameraComponent, { CameraComponentRef } from '../components/CameraComponent';
import styles from './EmergencyScreen.styles';
import { agentService } from '../service/agentService';

// ----- Tipos -----
type JournalEntry = {
  id: string;
  text: string;
  date: Date;
  image?: string;
};

type EmergencyContact = {
  id: string;
  name: string;
  phone: string;
};

type EmergencyProtocol = {
  id: string;
  title: string;
  description: string;
};

// ----- Storage Keys -----
const STORAGE_KEY = '@journal_entries_emergency';

// (si luego tienes contactos/protocolos persistidos, ajusta aquí)
const cargarContactosEmergencia = async (): Promise<EmergencyContact[]> => {

  return [];

};

const cargarProtocolos = async (): Promise<EmergencyProtocol[]> => {
  return []; // reemplaza con tu carga real
};

const EmergencyScreen = ({ navigation }: any) => {
  // Bitácora (idéntico patrón a Preventive/General)
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [newEntry, setNewEntry] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Cámara
  const [cameraVisible, setCameraVisible] = useState(false);
  const cameraRef = useRef<CameraComponentRef>(null);


  // Chatbox
  const [showChat, setShowChat] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Emergencia contactos y protocolos

  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [emergencyProtocols, setEmergencyProtocols] = useState<EmergencyProtocol[]>([]);

  useEffect(() => {
    loadEntries();
    loadEmergencyData();
    
    // Reproducir mensaje de voz automáticamente cuando se abre el screen
    const timer = setTimeout(() => {
      playWelcomeMessage();
    }, 1000);

    return () => {
      Speech.stop();
      clearTimeout(timer);
    };
  }, []);

  // Guarda bitácora y refresca estado del agente cuando cambie
  useEffect(() => {
    saveEntries(entries);
    updateAgentEmergencyState(entries);
  }, [entries]);

  // ----- Funciones de voz -----
  const playWelcomeMessage = async () => {
    try {
      setIsSpeaking(true);
      await Speech.stop();
      
      const welcomeMessage = 
        "¡Hola! Estamos en control de combustible. " +
        "Para tener una buena gestión oprime el botón de Estadísticas Combustible y sigue las instrucciones.";
      
      Speech.speak(welcomeMessage, {
        language: 'es-ES',
        pitch: 1.0,
        rate: 0.9,
        onDone: () => setIsSpeaking(false),
        onStopped: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    } catch (error) {
      console.error('Error reproduciendo mensaje de voz:', error);
      setIsSpeaking(false);
    }
  };

  const stopSpeech = () => {
    Speech.stop();
    setIsSpeaking(false);
  };


  const saveEntries = async (entriesToSave: JournalEntry[]) => {
    try {
      // Guardamos la fecha en ISO para consistencia
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(entriesToSave.map(e => ({ ...e, date: e.date.toISOString() })))
      );
    } catch (e) {
      console.error('Error guardando entradas (Emergency):', e);
    }
  };

  const loadEntries = async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const loaded: JournalEntry[] = JSON.parse(raw).map((e: any) => ({
          ...e,
          date: new Date(e.date),
        }));
        setEntries(loaded);
      }
    } catch (e) {
      console.error('Error cargando entradas (Emergency):', e);
    }
  };

  // ----- Estado para el Agente (resumen de Emergencia) -----
  const updateAgentEmergencyState = async (list: JournalEntry[]) => {
    try {
      const sorted = [...list].sort((a, b) => b.date.getTime() - a.date.getTime());
      const last = sorted[0] || null;

      await agentService.saveScreenState('Emergency', {
        // para el resumen simple del agente
        contacts: emergencyContacts.map(c => `${c.name} (${c.phone})`),
        emergencyProtocol: emergencyProtocols[0]?.title || undefined,
        lastEntryAt: last ? last.date.toISOString() : null,
        entriesCount: list.length,
      });
    } catch (e) {
      console.error('Error actualizando screen state (Emergency):', e);
    }
  };

  // ----- Carga de contactos/protocolos -----
  const loadEmergencyData = async () => {
    try {
      const contacts = await cargarContactosEmergencia();
      const protocols = await cargarProtocolos();
      setEmergencyContacts(contacts);
      setEmergencyProtocols(protocols);

      // guardamos algo básico en el estado del agente
      await agentService.saveScreenState('Emergency', {
        contacts: contacts.map(c => `${c.name} (${c.phone})`),
        emergencyProtocol: protocols[0]?.title || undefined,
        lastUpdated: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error loading emergency data:', error);
    }
  };

  // ----- Media -----
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      // (opcional) registrar acción
      await agentService.recordAppAction('Imagen seleccionada en Emergencia', 'EmergencyScreen', {
        uri: result.assets[0].uri,
      });
    }
  };

  const openCamera = () => setCameraVisible(true);
  const closeCamera = () => setCameraVisible(false);

  const takePicture = async () => {
    if (cameraRef.current) {
      const uri = await cameraRef.current.takePicture();
      if (uri) {
        setSelectedImage(uri);
        closeCamera();
        // (opcional) registrar acción
        await agentService.recordAppAction('Foto tomada en Emergencia', 'EmergencyScreen', {
          uri,
        });
      }
    }
  };

  // ----- CRUD bitácora -----
  const addEntry = async () => {
    if (!newEntry.trim() && !selectedImage) return;

    const entry: JournalEntry = {
      id: Date.now().toString(),
      text: newEntry,
      date: new Date(date),
      image: selectedImage || undefined,
    };

    setEntries(prev => [entry, ...prev]);
    setNewEntry('');
    setSelectedImage(null);
    setDate(new Date());

    // (opcional) registramos acción en historial
    await agentService.recordAppAction('Entrada agregada en Emergencia', 'EmergencyScreen', {
      text: entry.text || '',
      image: !!entry.image,
      at: entry.date.toISOString(),
    });
  };

  const deleteEntry = (id: string) => {
    Alert.alert(
      'Eliminar entrada',
      '¿Estás seguro de que quieres borrar este mensaje?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            setEntries(prev => prev.filter(e => e.id !== id));
            // (opcional) registro
            await agentService.recordAppAction('Entrada eliminada en Emergencia', 'EmergencyScreen', {
              id,
            });
          },
        },
      ]
    );
  };

  const renderEntry = ({ item }: { item: JournalEntry }) => (
    <View style={styles.entryContainer}>
      <View style={styles.entryHeader}>
        <Text style={styles.entryDate}>
          {item.date.toLocaleDateString()} - {item.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
        <TouchableOpacity onPress={() => deleteEntry(item.id)} style={styles.deleteButton}>
          <Ionicons name="trash" size={20} color="#ff5252" />
        </TouchableOpacity>
      </View>
      {item.image && <Image source={{ uri: item.image }} style={styles.entryImage} />}
      {item.text ? <Text style={styles.entryText}>{item.text}</Text> : null}
      <View style={styles.timelineConnector} />
    </View>
  );


  // Carga contactos y protocolos, registro con agente
  // Nota: la función loadEmergencyData ya está definida más arriba, por lo que
  // se evita la redeclaración aquí para eliminar el error de ámbito.

  // Registro de uso de contacto emergencia con agente:
  const useEmergencyContact = async (contact: EmergencyContact) => {
    await agentService.recordAppAction(
      'Contacto de emergencia usado',
      'EmergencyScreen',
      { contact: contact.name, number: contact.phone }
    );
  };

  // ✅ Función CORREGIDA para navegar a FuelStatsBot
  const navigateToFuelStats = () => {
    try {
      navigation.navigate('FuelStatsBot');
    } catch (error) {
      console.error('Error navegando a FuelStatsBot:', error);
      Alert.alert('Error', 'No se pudo abrir las estadísticas de combustible');
    }
  };

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) setDate(selectedDate);
  };


  // Renderizar el chatbox
  const renderChatBox = () => (
    <Modal
      visible={showChat}
      animationType="slide"
      transparent
      onShow={playWelcomeMessage}
    >
      <View style={styles.chatOverlay}>
        <View style={styles.chatContainer}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatTitle}>Asistente de Combustible</Text>
            <TouchableOpacity 
              onPress={() => {
                stopSpeech();
                setShowChat(false);
              }}
              style={styles.chatCloseButton}
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.chatMessageContainer}>
            <View style={styles.chatBotMessage}>
              <Ionicons name="volume-high" size={20} color="#4A0CA3" />
              <Text style={styles.chatMessageText}>
                Reproduciendo instrucciones de voz...
              </Text>
            </View>
            
            {isSpeaking && (
              <View style={styles.chatSpeakingIndicator}>
                <Ionicons name="mic" size={16} color="#4CD964" />
                <Text style={styles.chatSpeakingText}>Reproduciendo mensaje...</Text>
              </View>
            )}
          </View>

          <View style={styles.chatControls}>
            <TouchableOpacity 
              style={styles.chatReplayButton}
              onPress={playWelcomeMessage}
              disabled={isSpeaking}
            >
              <Ionicons name="refresh" size={20} color="white" />
              <Text style={styles.chatReplayButtonText}>Repetir mensaje</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.chatActionButton}
              onPress={() => {
                stopSpeech();
                setShowChat(false);
                navigateToFuelStats();
              }}
            >
              <Ionicons name="stats-chart" size={20} color="white" />
              <Text style={styles.chatActionButtonText}>Ir a Estadísticas</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient
         colors={['#000000', '#3A0CA3', '#F72585']}
          locations={[0, 0.6, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.container, { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }]}
        >
          {/* Botón de chat flotante */}
          <TouchableOpacity 
            style={styles.chatFloatingButton}
            onPress={() => setShowChat(true)}
          >
            <LinearGradient
              colors={['#0606fbff', '#05c6fbff', '#1f06fdff']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.chatFloatingButtonGradient}
            >
              <Ionicons name="chatbubble-ellipses" size={24} color="white" />
              {isSpeaking && (
                <View style={styles.chatPulseIndicator} />
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Todo')}>
            <AntDesign name="double-left" size={24} color="white" />
          </TouchableOpacity>

          <View style={styles.content}>
            <Text style={styles.title}>Control Combustible</Text>
            
            {/* ✅ Botón CORREGIDO de Estadísticas Combustible */}
            <TouchableOpacity
              style={styles.fuelStatsButton}
              onPress={navigateToFuelStats}
            >
              <LinearGradient
                colors={['#1d09f7ff', '#07cdfaff', '#1703f9ff']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.fuelStatsButtonGradient}
              >
                <Ionicons name="stats-chart" size={20} color="white" />
                <Text style={styles.fuelStatsButtonText}>  Estadísticas Combustible</Text>
              </LinearGradient>

            </TouchableOpacity>
          </View>

          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
            style={styles.keyboardAvoidingView}
          >
            <FlatList
              data={entries}
              renderItem={renderEntry}
              keyExtractor={(item) => item.id}
              inverted
              contentContainerStyle={styles.entriesList}
              ListHeaderComponent={<></>}
            />

            <View style={styles.inputContainer}>
              <TouchableOpacity onPress={openCamera} style={styles.mediaButton}>
                <Ionicons name="camera" size={24} color="white" />
              </TouchableOpacity>

              <TouchableOpacity onPress={pickImage} style={styles.mediaButton}>
                <Ionicons name="image" size={24} color="white" />
              </TouchableOpacity>

              <TextInput
                style={styles.input}
                value={newEntry}
                onChangeText={setNewEntry}
                placeholder="Escribe tu comentario aquí..."
                placeholderTextColor="#aaa"
                multiline
              />

              <TouchableOpacity onPress={addEntry} style={styles.sendButton}>
                <Ionicons name="send" size={24} color="white" />
              </TouchableOpacity>
            </View>

            {selectedImage && (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
                <TouchableOpacity style={styles.removeImageButton} onPress={() => setSelectedImage(null)}>
                  <Ionicons name="close" size={20} color="white" />
                </TouchableOpacity>
              </View>
            )}
          </KeyboardAvoidingView>

          {showDatePicker && (
            <DateTimePicker value={date} mode="datetime" display="default" onChange={onChangeDate} />
          )}

          <Modal visible={cameraVisible} animationType="slide">
            <CameraComponent ref={cameraRef} onClose={closeCamera} />
            <TouchableOpacity
              onPress={takePicture}
              style={{
                position: 'absolute',
                bottom: 40,
                alignSelf: 'center',
                backgroundColor: 'rgba(0,0,0,0.5)',
                padding: 20,
                borderRadius: 50,
              }}
            >
              <Ionicons name="camera" size={50} color="white" />
            </TouchableOpacity>
          </Modal>

          {/* Chatbox Modal */}
          {renderChatBox()}
        </LinearGradient>
      </SafeAreaView>
    </>
  );
};

export default EmergencyScreen;