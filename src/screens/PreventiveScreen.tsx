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
import styles from './PreventiveScreen.styles';
import { agentService } from '../service/agentService';

type JournalEntry = {
  id: string;
  text: string;
  date: Date;
  image?: string;
};

type PreventiveTask = {
  id: string;
  description: string;
  dueDate: string; // string ISO
  completed: boolean;
};

const STORAGE_KEY = '@journal_entries_Preventive';
const TASKS_KEY = '@preventive_tasks';

const PreventiveScreen = ({ navigation }: any) => {
  // Bitácora
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [newEntry, setNewEntry] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [cameraVisible, setCameraVisible] = useState(false);
  const cameraRef = useRef<CameraComponentRef>(null);

  // Tareas preventivas
  const [preventiveTasks, setPreventiveTasks] = useState<PreventiveTask[]>([]);

  useEffect(() => {
    loadEntries();
    loadPreventiveTasks();
  }, []);

  useEffect(() => {
    saveEntries(entries);
  }, [entries]);

  // ------------ BITÁCORA LOGIC ------------

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
      {item.image && (
        <Image source={{ uri: item.image }} style={styles.entryImage} />
      )}
      {item.text && <Text style={styles.entryText}>{item.text}</Text>}
      <View style={styles.timelineConnector} />
    </View>
  );

  // ----------- TAREAS PREVENTIVAS ------------

  const cargarTareasPreventivas = async (): Promise<PreventiveTask[]> => {
    const storage = await AsyncStorage.getItem(TASKS_KEY);
    let tareas: PreventiveTask[] = [];
    if (storage) {
      tareas = JSON.parse(storage);
    }
    return tareas;
  };

  const savePreventiveTasks = async (tasks: PreventiveTask[]) => {
    await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    setPreventiveTasks(tasks);
    // Reporte al agente
    await agentService.saveScreenState('Preventive', {
      tasks,
      totalTasks: tasks.length,
      completed: tasks.filter(t => t.completed).length,
      nextDue: tasks.find(t => !t.completed && new Date(t.dueDate) > new Date()),
    });
  };

  const loadPreventiveTasks = async () => {
    try {
      const tasks = await cargarTareasPreventivas();
      setPreventiveTasks(tasks);
      await agentService.saveScreenState('Preventive', {
        tasks,
        totalTasks: tasks.length,
        completed: tasks.filter(t => t.completed).length,
        nextDue: tasks.find(t => !t.completed && new Date(t.dueDate) > new Date()),
      });
    } catch (e) {
      console.error('Error loading preventive tasks:', e);
    }
  };

  const completeTask = async (taskId: string) => {
    const updated = preventiveTasks.map(t =>
      t.id === taskId ? { ...t, completed: true } : t
    );
    await savePreventiveTasks(updated);
    await agentService.recordAppAction(
      'Tarea preventiva completada',
      'PreventiveScreen',
      { taskId }
    );
  };

  const renderTask = ({ item }: { item: PreventiveTask }) => (
    <View style={styles.taskCard}>
      <Text style={styles.taskDescription}>{item.description}</Text>
      <Text style={styles.taskDue}>Vence: {new Date(item.dueDate).toLocaleDateString()}</Text>
      <Text style={styles.taskStatus}>Estado: {item.completed ? 'Completada' : 'Pendiente'}</Text>
      {!item.completed && (
        <TouchableOpacity onPress={() => completeTask(item.id)} style={styles.completeBtn}>
          <Ionicons name="checkmark-circle" size={20} color="#39d353" />
          <Text style={styles.completeText}>Marcar como completada</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  return (
    <>
      <StatusBar
        translucent={true}
        backgroundColor="transparent"
        barStyle="light-content"
      />
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
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('Todo')}
        >
          <AntDesign name="double-left" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.content}>
          <Text style={styles.title}>Mantenimiento Preventivo</Text>
        </View>
        {/* Lista de tareas preventivas */}
        {/* <View>
          <Text style={styles.sectionTitle}>Tareas preventivas</Text>
          <FlatList
            data={preventiveTasks}
            keyExtractor={item => item.id}
            renderItem={renderTask}
            ListEmptyComponent={<Text>No hay tareas preventivas configuradas.</Text>}
            horizontal={true}
            contentContainerStyle={styles.taskList}
          />
        </View> */}
        {/* Bitácora/commentarios */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
          <FlatList
            data={entries}
            renderItem={renderEntry}
            keyExtractor={item => item.id}
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
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="datetime"
            display="default"
            onChange={onChangeDate}
          />
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

export default PreventiveScreen;
