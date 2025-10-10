// screens/GeneralScreen.tsx
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
import styles from './GeneralScreen.styles';
import { agentService } from '../service/agentService';

type JournalEntry = {
  id: string;
  text: string;
  date: Date;
  image?: string;
};

const STORAGE_KEY = '@journal_entries_general';

const GeneralScreen = ({ navigation }: any) => {
  // Bitácora (igual que Preventive)
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [newEntry, setNewEntry] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Cámara
  const [cameraVisible, setCameraVisible] = useState(false);
  const cameraRef = useRef<CameraComponentRef>(null);

  useEffect(() => {
    loadEntries();
  }, []);

  // Guarda automáticamente la bitácora y actualiza el estado del agente “General”
  useEffect(() => {
    saveEntries(entries);
    updateAgentGeneralState(entries);
  }, [entries]);

  // ----- Persistencia -----
  const saveEntries = async (entriesToSave: JournalEntry[]) => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(entriesToSave.map(e => ({ ...e, date: e.date.toISOString() })))
      );
    } catch (e) {
      console.error('Error guardando entradas (General):', e);
    }
  };

  const loadEntries = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      if (jsonValue) {
        const loaded: JournalEntry[] = JSON.parse(jsonValue).map((e: any) => ({
          ...e,
          date: new Date(e.date),
        }));
        setEntries(loaded);
      }
    } catch (e) {
      console.error('Error cargando entradas (General):', e);
    }
  };

  // ----- Estado para el Agente (resumen de General) -----
  const updateAgentGeneralState = async (list: JournalEntry[]) => {
    try {
      const sorted = [...list].sort((a, b) => b.date.getTime() - a.date.getTime());
      const last = sorted[0] || null;

      // Derivamos "services" del texto (simple, solo para el resumen del agente)
      const services = list
        .map(e => (e.text || '').trim())
        .filter(Boolean)
        .slice(0, 200);

      await agentService.saveScreenState('General', {
        services,
        lastService: last ? last.date.toISOString() : null,
      });
    } catch (e) {
      console.error('Error actualizando screen state (General):', e);
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

  // ----- CRUD bitácora -----
  const addEntry = () => {
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
            setEntries(prev => prev.filter(e => e.id !== id));
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

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  // ----- UI -----
  return (
    <>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <LinearGradient
        colors={['#000000', '#285a01ff', '#0bfc07ff']}
          locations={[0, 0.6, 1]} // Aquí implementamos los porcentajes
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        style={[
          styles.container,
          { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
        ]}
      >
        {/* Back */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Todo')}>
          <AntDesign name="double-left" size={24} color="white" />
        </TouchableOpacity>

        {/* Title */}
        <View style={styles.content}>
          <Text style={styles.title}>Mantenimiento General</Text>
        </View>

        {/* Bitácora (igual a Preventive) */}
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
            ListHeaderComponent={<View style={styles.listFooter} />}
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
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => setSelectedImage(null)}
              >
                <Ionicons name="close" size={20} color="white" />
              </TouchableOpacity>
            </View>
          )}
        </KeyboardAvoidingView>

        {/* DateTimePicker (si decides usarlo) */}
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="datetime"
            display="default"
            onChange={onChangeDate}
          />
        )}

        {/* Cámara */}
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

export default GeneralScreen;
