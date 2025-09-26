import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  Alert,
  Platform,
  SafeAreaView,
  StatusBar,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Keyboard,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Calendar, DateData } from 'react-native-calendars';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styles from './DailyScreen.styles';

import { agentService } from '../service/agentService';

type AppointmentType = 'personal' | 'work' | 'medical' | 'urgent' | 'other';

interface Appointment {
  id: string;
  title: string;
  description: string;
  date: Date;
  endDate?: Date;
  type: AppointmentType;
  reminder: boolean;
  completed: boolean;
}

type RootStackParamList = {
  Agenda: undefined;
  Daily: undefined;
  Todo: undefined;
};

const STORAGE_KEY = '@professional_appointments';

/** Hook para conocer la altura del teclado */
function useKeyboardHeight() {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const showEvt = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const subShow = Keyboard.addListener(showEvt, e => {
      setHeight(e?.endCoordinates?.height ?? 0);
    });
    const subHide = Keyboard.addListener(hideEvt, () => setHeight(0));

    return () => {
      subShow.remove();
      subHide.remove();
    };
  }, []);

  return height;
}

const DailyScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [showModal, setShowModal] = useState(false);

  const [filterType, setFilterType] = useState<AppointmentType | 'all'>('all');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDateTime, setSelectedDateTime] = useState(new Date());
  const [appointmentType, setAppointmentType] = useState<AppointmentType>('personal');
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');

  const kbHeight = useKeyboardHeight();
  const insets = useSafeAreaInsets();
  const KEYBOARD_OFFSET = Platform.OS === 'ios' ? 60 : 0;
  const { height: screenHeight } = Dimensions.get('window');

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        let loaded: Appointment[] = [];
        if (stored) {
          loaded = JSON.parse(stored).map((item: any) => ({
            ...item,
            date: new Date(item.date),
          }));
          setAppointments(loaded);
        }

        await agentService.saveScreenState('Daily', {
          appointments: loaded,
          total: loaded.length,
          nextAppointment: loaded[0] || null,
        });

        await agentService.recordAppAction(
          'Citas diarias cargadas',
          'DailyScreen',
          { count: loaded.length }
        );
      } catch (error) {
        console.error('Error loading appointments:', error);
      }
    };
    loadAppointments();
  }, []);

  const saveAppointments = async (apps: Appointment[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
      setAppointments(apps);

      await agentService.saveScreenState('Daily', {
        appointments: apps,
        total: apps.length,
        nextAppointment: apps[0] || null,
      });
    } catch {
      Alert.alert('Error', 'No se pudo guardar la cita');
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSelectedDateTime(new Date());
    setAppointmentType('personal');
  };

  const handleSaveAppointment = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Por favor ingresa un nombre para la cita');
      return;
    }
    const newAppointment: Appointment = {
      id: Date.now().toString(),
      title: title.trim(),
      description: description.trim(),
      date: selectedDateTime,
      type: appointmentType,
      reminder: false,
      completed: false,
    };
    const updated = [...appointments, newAppointment];
    await saveAppointments(updated);

    await agentService.recordAppAction(
      'Nueva cita creada',
      'DailyScreen',
      { title: newAppointment.title, date: newAppointment.date.toISOString() }
    );

    resetForm();
    setShowModal(false);
    navigation.navigate('Agenda');
    Alert.alert('Éxito', 'Cita creada correctamente');
  };

  const getTypeColor = (type: AppointmentType): string => {
    const colors = {
      personal: '#f8fc0bff',
      work: '#0af5e5fc',
      medical: '#deddfae2',
      urgent: '#f60707ff',
      other: '#42fb0ea8',
    };
    return colors[type];
  };

  const getTypeLightColor = (): string => '#0c0c0c';

  const getTypeIcon = (type: AppointmentType): string => {
    const icons = {
      personal: 'person',
      work: 'briefcase',
      medical: 'medkit',
      urgent: 'warning',
      other: 'calendar',
    };
    return icons[type];
  };

  const markedDates = useMemo(() => {
    const marks: any = {};
    appointments.forEach(app => {
      const dateStr = app.date.toISOString().split('T')[0];
      if (!marks[dateStr]) {
        marks[dateStr] = { dots: [{ key: app.id, color: getTypeColor(app.type) }] };
      } else {
        marks[dateStr].dots.push({ key: app.id, color: getTypeColor(app.type) });
      }
    });
    if (selectedDate) {
      marks[selectedDate] = {
        ...marks[selectedDate],
        selected: true,
        selectedColor: '#e30e0eff',
      };
    }
    return marks;
  }, [appointments, selectedDate]);

  const openPicker = (mode: 'date' | 'time') => {
    setPickerMode(mode);
    setShowPicker(true);
  };

  const onChangePicker = (event: any, selected?: Date) => {
    if (event.type === 'dismissed') {
      setShowPicker(false);
      return;
    }
    if (selected) {
      if (pickerMode === 'date') {
        const newDate = new Date(selectedDateTime);
        newDate.setFullYear(selected.getFullYear(), selected.getMonth(), selected.getDate());
        setSelectedDateTime(newDate);
        openPicker('time');
      } else {
        const newDate = new Date(selectedDateTime);
        newDate.setHours(selected.getHours(), selected.getMinutes());
        setSelectedDateTime(newDate);
        setShowPicker(false);
      }
    }
  };

  const navigateToAgenda = () => navigation.navigate('Agenda');

  return (
    <>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient
         colors={['#000000', '#3A0CA3', '#F72585']}
          locations={[0, 0.6, 1]} // Aquí implementamos los porcentajes
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.container}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('Todo')}
          >
            <AntDesign name="double-left" size={44} color="white" />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Agéndate</Text>
            <TouchableOpacity style={styles.agendaButton} onPress={navigateToAgenda}>
              <Ionicons name="list" size={24} color="#ffffff" />
              <Text style={styles.agendaButtonText}>Ver Agenda</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
            <TouchableOpacity
              style={[styles.filterButton, filterType === 'all' && styles.filterButtonActive]}
              onPress={() => setFilterType('all')}
            >
              <Text style={styles.filterText}>Todos</Text>
            </TouchableOpacity>
            {(['personal', 'work', 'medical', 'urgent', 'other'] as AppointmentType[]).map(type => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.filterButton,
                  filterType === type && styles.filterButtonActive,
                  { backgroundColor: getTypeLightColor(), borderColor: getTypeColor(type) },
                ]}
                onPress={() => setFilterType(type)}
              >
                <Ionicons name={getTypeIcon(type) as any} size={16} color={getTypeColor(type)} />
                <Text style={[styles.filterText, { color: getTypeColor(type) }]}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.calendarContainer}>
            <Calendar
              current={selectedDate}
              minDate={new Date().toISOString().split('T')[0]}
              onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
              markedDates={markedDates}
              markingType={'multi-dot'}
              theme={{
                backgroundColor: 'transparent',
                calendarBackground: 'transparent',
                textSectionTitleColor: '#ffffff',
                selectedDayBackgroundColor: '#0eb9e3',
                selectedDayTextColor: '#ffffff',
                todayTextColor: '#58fd03',
                dayTextColor: '#ffffff',
                textDisabledColor: '#aaaaaa',
                dotColor: '#58fd03',
                selectedDotColor: '#ffffff',
                arrowColor: '#58fd03',
                monthTextColor: '#ffffff',
                indicatorColor: '#58fd03',
                textDayFontWeight: '300',
                textMonthFontWeight: 'bold',
                textDayHeaderFontWeight: '300',
                textDayFontSize: 16,
                textMonthFontSize: 18,
                textDayHeaderFontSize: 14,
              }}
            />
          </View>

          <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)}>
            <Text style={styles.agendaButtonText1}>Crear Cita</Text>
          </TouchableOpacity>

          {/* MODAL CORREGIDO - No se encoge con el teclado */}
          <Modal
            visible={showModal}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowModal(false)}
          >
            <View style={styles.modalOverlay}>
              {/* CONTENEDOR PRINCIPAL SIN flex:1 */}
              <View style={[
                styles.modalContainer, 
                { maxHeight: screenHeight * 0.8 } // Altura máxima controlada
              ]}>
                
                {/* KeyboardAvoidingView SOLO alrededor del contenido desplazable */}
                <KeyboardAvoidingView
                  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                  style={{ flex: 1 }}
                  keyboardVerticalOffset={KEYBOARD_OFFSET}
                >
                  
                  <ScrollView
                    contentContainerStyle={[
                      styles.modalContent,
                      { paddingBottom: kbHeight + (insets?.bottom ?? 0) + 24 }
                    ]}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                  >
                    <View style={styles.modalHeader}>
                      <Text style={styles.modalTitle}>Nueva Cita</Text>
                      <TouchableOpacity 
                        onPress={() => setShowModal(false)} 
                        style={styles.closeButton}
                      >
                        <Ionicons name="close" size={24} color="#ffffff" />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>1. Nombre Cita</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Nombre de la cita"
                        placeholderTextColor="#aaaaaa"
                        value={title}
                        onChangeText={setTitle}
                        returnKeyType="next"
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Descripción Adicional</Text>
                      <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Descripción (opcional)"
                        placeholderTextColor="#aaaaaa"
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>2. Elige Tipo de Cita</Text>
                      <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={false} 
                        style={styles.typeSelector}
                      >
                        {(['personal', 'work', 'medical', 'urgent', 'other'] as AppointmentType[]).map(type => (
                          <TouchableOpacity
                            key={type}
                            style={[
                              styles.typeOption,
                              appointmentType === type && styles.typeOptionSelected,
                              { backgroundColor: getTypeLightColor(), borderColor: getTypeColor(type) },
                            ]}
                            onPress={() => setAppointmentType(type)}
                          >
                            <Ionicons name={getTypeIcon(type) as any} size={16} color={getTypeColor(type)} />
                            <Text style={[styles.typeOptionText, { color: getTypeColor(type) }]}>
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>3. Elige Fecha y Hora</Text>
                      <TouchableOpacity 
                        style={styles.timeButton} 
                        onPress={() => openPicker('date')}
                      >
                        <Ionicons name="calendar" size={20} color="#0eb9e3" />
                        <Text style={styles.timeButtonText}>
                          {selectedDateTime.toLocaleDateString()} {selectedDateTime.toLocaleTimeString()}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.modalFooter}>
                      <TouchableOpacity 
                        style={[styles.saveButton, { width: '100%' }]} 
                        onPress={handleSaveAppointment}
                      >
                        <Text style={styles.saveButtonText}>4. Crear Cita</Text>
                      </TouchableOpacity>
                    </View>
                  </ScrollView>
                </KeyboardAvoidingView>
              </View>
            </View>

            {showPicker && (
              <DateTimePicker
                value={selectedDateTime}
                mode={pickerMode}
                display="default"
                onChange={onChangePicker}
              />
            )}
          </Modal>
        </LinearGradient>
      </SafeAreaView>
    </>
  );
};

export default DailyScreen;