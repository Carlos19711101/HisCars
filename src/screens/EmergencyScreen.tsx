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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CameraComponent, { CameraComponentRef } from '../components/CameraComponent';
import styles from './EmergencyScreen.styles';
import { agentService } from '../service/agentService';

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

const STORAGE_KEY = '@journal_entries_emergency';

// Simulación funciones para cargar datos, reemplaza con la tuya real
const cargarContactosEmergencia = async (): Promise<EmergencyContact[]> => {
  // Por ejemplo podrías cargar desde AsyncStorage o API
  return [];
};
const cargarProtocolos = async (): Promise<EmergencyProtocol[]> => {
  return [];
};

const EmergencyScreen = ({ navigation }: any) => {
  // Bitácora
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [newEntry, setNewEntry] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [cameraVisible, setCameraVisible] = useState(false);
  const cameraRef = useRef<CameraComponentRef>(null);

  // Emergencia contactos y protocolos
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [emergencyProtocols, setEmergencyProtocols] = useState<EmergencyProtocol[]>([]);

  useEffect(() => {
    loadEntries();
    loadEmergencyData();
  }, []);

  useEffect(() => {
    saveEntries(entries);
  }, [entries]);

  const saveEntries = async (entriesToSave: JournalEntry[]) => {
    try {
      const jsonValue = JSON.stringify(entriesToSave);
      await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
    } catch (e) {
      console.error('Error guardando entradas:', e);
    }
  };

  const loadEntries = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      if (jsonValue != null) {
        const loadedEntries: JournalEntry[] = JSON.parse(jsonValue).map((entry: any) => ({
          ...entry,
          date: new Date(entry.date),
        }));
        setEntries(loadedEntries);
      }
    } catch (e) {
      console.error('Error cargando entradas:', e);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
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
      }
    }
  };

  const addEntry = () => {
    if (!newEntry.trim() && !selectedImage) return;
    const entry: JournalEntry = {
      id: Date.now().toString(),
      text: newEntry,
      date: new Date(date),
      image: selectedImage || undefined,
    };
    setEntries([entry, ...entries]);
    setNewEntry('');
    setSelectedImage(null);
    setDate(new Date());
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
          onPress: () => {
            setEntries(entries.filter(entry => entry.id !== id));
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
      {item.text && <Text style={styles.entryText}>{item.text}</Text>}
    </View>
  );

  // Carga contactos y protocolos, registro con agente
  const loadEmergencyData = async () => {
    try {
      const contacts = await cargarContactosEmergencia();
      const protocols = await cargarProtocolos();

      setEmergencyContacts(contacts);
      setEmergencyProtocols(protocols);

      await agentService.saveScreenState('Emergency', {
        contacts,
        protocols,
        totalContacts: contacts.length,
        lastUpdated: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error loading emergency data:', error);
    }
  };

  // Registro de uso de contacto emergencia con agente:
  const useEmergencyContact = async (contact: EmergencyContact) => {
    await agentService.recordAppAction(
      'Contacto de emergencia usado',
      'EmergencyScreen',
      { contact: contact.name, number: contact.phone }
    );
  };

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  return (
    <>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <LinearGradient
        colors={['#000000', '#3A0CA3', '#F72585']}
          locations={[0, 0.6, 1]} // Aquí implementamos los porcentajes
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        style={[styles.container, { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }]}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Todo')}>
          <AntDesign name="double-left" size={24} color="white" />
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={styles.title}>Daños en la Vía</Text>
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardAvoidingView}>
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
      </LinearGradient>
    </>
  );
};

export default EmergencyScreen;
