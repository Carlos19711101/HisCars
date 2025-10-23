// screens/RouteScreen.tsx
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
import CameraComponent, { CameraComponentRef } from '../components/CameraComponent';
import styles from './RouteScreen.styles';
import { agentService } from '../service/agentService';

type JournalEntry = {
  id: string;
  text: string;
  date: Date;
  image?: string;
};

// Aquí deberías implementar o importar tus funciones reales de carga
const cargarRutasGuardadas = async (): Promise<any[]> => {
  // Ejemplo: carga desde AsyncStorage o API
  return [];
};
const cargarViajesRecientes = async (): Promise<any[]> => {
  // Ejemplo: carga desde AsyncStorage o API
  return [];
};
// Ejemplo función para calcular distancia total que debes implementar
const calcularDistanciaTotal = (trips: any[]): number => {
  return trips.reduce((acc, trip) => acc + (trip.distance || 0), 0);
};

const STORAGE_KEY = '@journal_entries_route';

const RouteScreen = ({ navigation }: any) => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [newEntry, setNewEntry] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [cameraVisible, setCameraVisible] = useState(false);
  const cameraRef = useRef<CameraComponentRef>(null);

  // Estado para rutas y viajes, usados para la integración del agente
  const [savedRoutes, setSavedRoutes] = useState<any[]>([]);
  const [recentTrips, setRecentTrips] = useState<any[]>([]);

  useEffect(() => {
    loadEntries();
    loadRouteData();
  }, []);

  // ✅ Guardar en storage y actualizar estado del agente cuando cambien las entradas
  useEffect(() => {
    saveEntries(entries);
    updateAgentRouteState(entries);
  }, [entries]);

  // ---------- Bitácora ----------
  const saveEntries = async (entriesToSave: JournalEntry[]) => {
    try {
      // Guardar con fecha en ISO para que el ChatBots lo ordene bien
      const payload = entriesToSave.map(e => ({ ...e, date: e.date.toISOString() }));
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.error('Error guardando entradas:', e);
    }
  };

  const loadEntries = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      if (jsonValue != null) {
        const loadedEntries = JSON.parse(jsonValue).map((entry: any) => ({
          ...entry,
          date: new Date(entry.date),
        }));
        setEntries(loadedEntries);
      }
    } catch (e) {
      console.error('Error cargando entradas:', e);
    }
  };

  // 🔗 Estado para el Agente (lo que lee el ChatBots para resumen/últimos 5)
  const updateAgentRouteState = async (list: JournalEntry[]) => {
    try {
      const sorted = [...list].sort((a, b) => b.date.getTime() - a.date.getTime());
      const last = sorted[0] || null;

      await agentService.saveScreenState('Route', {
        routes: savedRoutes,
        recentTrips,
        totalRoutes: savedRoutes.length,
        totalDistance: calcularDistanciaTotal(recentTrips),
        favorite: savedRoutes[0]?.name || savedRoutes[0] || null,
        entriesCount: list.length,
        lastEntryAt: last ? last.date.toISOString() : null,
      });
    } catch (e) {
      console.error('Error actualizando screen state (Route):', e);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
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

    // (Opcional) registra en historial para trazabilidad
    await agentService.recordAppAction('Entrada agregada en Rutas', 'RouteScreen', {
      text: entry.text || '',
      image: !!entry.image,
      at: entry.date.toISOString(),
    });
  };

  const deleteEntry = (id: string) => {
    Alert.alert('Eliminar entrada', '¿Estás seguro de que quieres borrar este mensaje?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => setEntries(entries.filter(entry => entry.id !== id)) },
    ]);
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
      <View style={styles.timelineConnector} />
    </View>
  );

  // ---------- Integración con agente (rutas/viajes existentes) ----------
  const loadRouteData = async () => {
    try {
      const routes = await cargarRutasGuardadas();
      const trips = await cargarViajesRecientes();
      setSavedRoutes(routes);
      setRecentTrips(trips);

      // Guardar estado base (sin entradas). Las entradas se agregan en updateAgentRouteState()
      await agentService.saveScreenState('Route', {
        routes,
        recentTrips: trips,
        totalRoutes: routes.length,
        totalDistance: calcularDistanciaTotal(trips),
        favorite: routes[0]?.name || routes[0] || null,
      });
    } catch (error) {
      console.error('Error loading route data:', error);
    }
  };

  // Guardar una nueva ruta (ejemplo)
  const saveNewRoute = async (route: any) => {
    // Lógica para guardar la ruta (no incluida aquí)
    await agentService.recordAppAction('Nueva ruta guardada', 'RouteScreen', {
      name: route.name,
      distance: route.distance,
      waypoints: route.waypoints?.length || 0,
    });
  };

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const navigateToSearchAddress = () => {
    navigation.navigate('SearchAddress');
  };

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
          <TouchableOpacity
            style={[styles.backButton, { top: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 10 : 20 }]}
            onPress={() => navigation.navigate('Todo')}
          >
            <AntDesign name="double-left" size={30} color="white" style={styles.backButtonIcon} />
          </TouchableOpacity>

          <View style={styles.content}>
            <Text style={styles.title}>Mis Rutas</Text>
            <TouchableOpacity style={styles.searchAddressButton} onPress={navigateToSearchAddress}>
              <Ionicons name="search" size={20} color="white" style={styles.searchIcon} />
              <Text style={styles.searchAddressText}>Buscar dirección</Text>
            </TouchableOpacity>
          </View>

          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardAvoidingView}>
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
                placeholder="Escribe tu ruta aquí..."
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
      </SafeAreaView>
    </>
  );
};

export default RouteScreen;
