// screens/ProfileScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import styles from './ProfileScreen.styles';

type TabData = {
  soat: string;       // ISO yyyy-mm-dd o vacío
  picoyplaca: string; // Ej: 'Lunes'
  tecnico: string;    // ISO yyyy-mm-dd o vacío

  // extras recordatorios
  soatReminderDaysBefore?: number | null;
  soatNotificationId?: string | null;
  tecnicoReminderDaysBefore?: number | null;
  tecnicoNotificationId?: string | null;
};

const ProfileScreen = ({ navigation }: any) => {
  // Estados existentes
  const [avatar, setAvatar] = useState(require('../../assets/imagen/perfil_Carro.png'));
  const [modalVisible, setModalVisible] = useState(false);

  // (Se dejan por compatibilidad, pero ya no se usan para SOAT/Técnico)
  const [editSoatModalVisible, setEditSoatModalVisible] = useState(false);
  const [editPicoyplacaModalVisible, setEditPicoyplacaModalVisible] = useState(false);
  const [editTecnicoModalVisible, setEditTecnicoModalVisible] = useState(false);

  const [tabData, setTabData] = useState<TabData>({
    soat: '',
    picoyplaca: '',
    tecnico: '',
    soatReminderDaysBefore: null,
    soatNotificationId: null,
    tecnicoReminderDaysBefore: null,
    tecnicoNotificationId: null,
  });

  // Valores temporales (compatibilidad con antiguos modales de texto)
  const [editSoatValue, setEditSoatValue] = useState('');
  const [editPicoyplacaValue, setEditPicoyplacaValue] = useState('');
  const [editTecnicoValue, setEditTecnicoValue] = useState('');

  // Datos de la moto (sin cambios)
  const [editMotoModalVisible, setEditMotoModalVisible] = useState(false);
  const [userData, setUserData] = useState({
    Marca: '',
    Placa: '',
    Propietario: '',
    Ciudad: '',
  });
  const [editMotoValues, setEditMotoValues] = useState(userData);

  // Picker de fecha y recordatorio
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activeDocType, setActiveDocType] = useState<'soat' | 'tecnico' | null>(null);
  const [tempDate, setTempDate] = useState<Date>(new Date());

  const [showReminderModal, setShowReminderModal] = useState(false);
  const [pendingDueISO, setPendingDueISO] = useState<string | null>(null); // ISO luego de elegir fecha

  // Modal de días para Pico y Placa
  const [showPicoDayModal, setShowPicoDayModal] = useState(false);

  // ------- Helpers -------
  const toISODate = (d: Date) => {
    const y = d.getFullYear();
    const m = `${d.getMonth() + 1}`.padStart(2, '0');
    const day = `${d.getDate()}`.padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const formatYYYYMMDD = (iso: string) => iso;

  const saveUserData = async (data: typeof userData) => {
    try {
      await AsyncStorage.setItem('@userData', JSON.stringify(data));
    } catch (e) {
      console.error('Error guardando userData', e);
    }
  };

  const saveTabData = async (data: TabData) => {
    try {
      await AsyncStorage.setItem('@tabData', JSON.stringify(data));
    } catch (e) {
      console.error('Error guardando tabData', e);
    }
  };

  const saveAvatar = async (uri: string) => {
    try {
      await AsyncStorage.setItem('@avatarUri', uri);
    } catch (e) {
      console.error('Error guardando avatar', e);
    }
  };

  // ------- Notificaciones (permiso + canal) -------
  useEffect(() => {
    const setupNotifications = async () => {
      try {
        const perm = await Notifications.getPermissionsAsync();
        if (perm.status !== 'granted') {
          await Notifications.requestPermissionsAsync();
        }
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
          });
        }
      } catch (e) {
        console.log('No se pudo preparar notificaciones:', e);
      }
    };
    setupNotifications();
  }, []);

  /**
   * Helper COMPATIBLE con varias versiones de expo-notifications:
   * - Si existe Notifications.SchedulableTriggerInputTypes.DATE, usa el trigger tipado.
   * - Si no, cae al trigger antiguo { date: ... }.
   */
  const makeDateTrigger = (triggerDate: Date): any => {
    const anyNotif: any = Notifications as any;
    const ms = triggerDate.getTime();

    // ¿Existe enum de tipos?
    const dateType =
      anyNotif?.SchedulableTriggerInputTypes?.DATE ??
      'date';

    const typed = {
      type: dateType,
      date: ms, // número (ms) es aceptado por ambas
      ...(Platform.OS === 'android' ? { channelId: 'default', allowWhileIdle: true } : {}),
    };

    // Si tu versión no acepta 'type', este objeto igual funciona porque Expo ignora extras no usados.
    // De todos modos, por máxima compatibilidad devolvemos el tipado moderno:
    return typed as any;
  };

  const scheduleDocReminder = useCallback(
    async ({
      doc,
      dueISO,
      daysBefore,
    }: {
      doc: 'soat' | 'tecnico';
      dueISO: string;
      daysBefore: number; // 0,1,3,7
    }): Promise<string | null> => {
      try {
        // Cancela el anterior si existe
        if (doc === 'soat' && tabData.soatNotificationId) {
          await Notifications.cancelScheduledNotificationAsync(tabData.soatNotificationId);
        }
        if (doc === 'tecnico' && tabData.tecnicoNotificationId) {
          await Notifications.cancelScheduledNotificationAsync(tabData.tecnicoNotificationId);
        }

        // Programamos a las 09:00 del día (dueDate - daysBefore)
        const due = new Date(dueISO + 'T00:00:00');
        const triggerDate = new Date(due);
        triggerDate.setDate(triggerDate.getDate() - daysBefore);
        triggerDate.setHours(9, 0, 0, 0);

        console.log('[Reminder] prepare', {
          doc,
          dueISO,
          daysBefore,
          triggerDate: triggerDate.toISOString(),
          now: new Date().toISOString(),
        });

        if (triggerDate.getTime() <= Date.now()) {
          Alert.alert('Aviso', 'El recordatorio quedó en el pasado. No se programó notificación.');
          return null;
        }

        const trigger = makeDateTrigger(triggerDate);

        const id = await Notifications.scheduleNotificationAsync({
          content: {
            title: '📄 Vencimiento de documento',
            body:
              doc === 'soat'
                ? `Tu SOAT vence el ${formatYYYYMMDD(dueISO)}`
                : `Tu Técnico Mecánica vence el ${formatYYYYMMDD(dueISO)}`,
            sound: true,
            priority: Notifications.AndroidNotificationPriority.HIGH,
            data: { doc, dueISO, daysBefore },
          },
          trigger, // ✅ compatible
        });

        console.log('[Reminder] scheduled', { id });

        return id;
      } catch (e) {
        console.log('Error programando recordatorio:', e);
        return null;
      }
    },
    [tabData.soatNotificationId, tabData.tecnicoNotificationId]
  );

  // ------- Cargar datos guardados -------
  useEffect(() => {
    const loadData = async () => {
      try {
        const userDataString = await AsyncStorage.getItem('@userData');
        if (userDataString) {
          const parsedUserData = JSON.parse(userDataString);
          setUserData(parsedUserData);
          setEditMotoValues(parsedUserData);
        }

        const tabDataString = await AsyncStorage.getItem('@tabData');
        if (tabDataString) {
          const saved = JSON.parse(tabDataString);
          setTabData((prev) => ({
            ...prev,
            ...saved,
          }));
          setEditSoatValue(saved.soat || '');
          setEditPicoyplacaValue(saved.picoyplaca || '');
          setEditTecnicoValue(saved.tecnico || '');
        }

        const avatarUri = await AsyncStorage.getItem('@avatarUri');
        if (avatarUri) {
          setAvatar({ uri: avatarUri });
        }
      } catch (e) {
        console.error('Error cargando datos', e);
      }
    };
    loadData();
  }, []);

  // ------- Cámara / Galería (sin cambios) -------
  const openCamera = async () => {
    setModalVisible(false);
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setAvatar({ uri });
      saveAvatar(uri);
    }
  };

  const openGallery = async () => {
    setModalVisible(false);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setAvatar({ uri });
      saveAvatar(uri);
    }
  };

  // ------- Guardar ediciones (texto) – compatibilidad -------
  const handleSaveEditSoat = () => {
    const newTab = { ...tabData, soat: editSoatValue.trim() || '' };
    setTabData(newTab);
    saveTabData(newTab);
    setEditSoatModalVisible(false);
  };

  const handleSaveEditPicoyplaca = () => {
    const newTab = { ...tabData, picoyplaca: editPicoyplacaValue.trim() || '' };
    setTabData(newTab);
    saveTabData(newTab);
    setEditPicoyplacaModalVisible(false);
  };

  const handleSaveEditTecnico = () => {
    const newTab = { ...tabData, tecnico: editTecnicoValue.trim() || '' };
    setTabData(newTab);
    saveTabData(newTab);
    setEditTecnicoModalVisible(false);
  };

  // ------- Editar información de la moto (sin cambios) -------
  const handleOpenEditMoto = () => {
    setEditMotoValues(userData);
    setEditMotoModalVisible(true);
  };

  const handleSaveEditMoto = () => {
    setUserData(editMotoValues);
    saveUserData(editMotoValues);
    setEditMotoModalVisible(false);
  };

  // ------- Fecha y recordatorio -------
  const openDueDatePicker = (doc: 'soat' | 'tecnico') => {
    setActiveDocType(doc);
    const prevISO = doc === 'soat' ? tabData.soat : tabData.tecnico;
    setTempDate(prevISO ? new Date(prevISO + 'T00:00:00') : new Date());
    setShowDatePicker(true);
  };

  const onDateChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') {
      if (event.type === 'set' && selected) {
        setShowDatePicker(false);
        const iso = toISODate(selected);
        setPendingDueISO(iso);
        setShowReminderModal(true);
      } else if (event.type === 'dismissed') {
        setShowDatePicker(false);
      }
    } else {
      if (selected) setTempDate(selected);
    }
  };

  const confirmIOSDate = () => {
    const iso = toISODate(tempDate);
    setShowDatePicker(false);
    setPendingDueISO(iso);
    setShowReminderModal(true);
  };

  const reminderOptions = [
    { label: 'Sin recordar', value: null },
    { label: 'Mismo día 9:00', value: 0 },
    { label: '1 día antes 9:00', value: 1 },
    { label: '3 días antes 9:00', value: 3 },
    { label: '7 días antes 9:00', value: 7 },
  ] as const;

  const pickReminder = async (daysBefore: number | null) => {
    if (!activeDocType || !pendingDueISO) {
      setShowReminderModal(false);
      return;
    }

    let notificationId: string | null = null;

    if (daysBefore !== null) {
      notificationId = await scheduleDocReminder({
        doc: activeDocType,
        dueISO: pendingDueISO,
        daysBefore,
      });
    } else {
      try {
        if (activeDocType === 'soat' && tabData.soatNotificationId) {
          await Notifications.cancelScheduledNotificationAsync(tabData.soatNotificationId);
        }
        if (activeDocType === 'tecnico' && tabData.tecnicoNotificationId) {
          await Notifications.cancelScheduledNotificationAsync(tabData.tecnicoNotificationId);
        }
      } catch {}
    }

    const newTab: TabData = { ...tabData };
    if (activeDocType === 'soat') {
      newTab.soat = pendingDueISO;
      newTab.soatReminderDaysBefore = daysBefore ?? null;
      newTab.soatNotificationId = notificationId ?? null;
    } else {
      newTab.tecnico = pendingDueISO;
      newTab.tecnicoReminderDaysBefore = daysBefore ?? null;
      newTab.tecnicoNotificationId = notificationId ?? null;
    }
    setTabData(newTab);
    await saveTabData(newTab);

    setShowReminderModal(false);
    setPendingDueISO(null);
    setActiveDocType(null);

    Alert.alert(
      'Guardado',
      daysBefore === null
        ? 'Fecha guardada sin recordatorio.'
        : 'Fecha y recordatorio programados correctamente.'
    );
  };

  // ------- Pico y Placa -------
  const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  const openPicoDaySelector = () => setShowPicoDayModal(true);

  const pickPicoDay = async (day: string) => {
    const newTab = { ...tabData, picoyplaca: day };
    setTabData(newTab);
    await saveTabData(newTab);
    setShowPicoDayModal(false);
  };

  // ------- UI -------
  const rightLabelFor = (key: 'soat' | 'tecnico' | 'picoyplaca') => {
    if (key === 'picoyplaca') {
      return tabData.picoyplaca ? tabData.picoyplaca : 'Editar';
    }
    const iso = tabData[key];
    if (!iso) return 'Editar';
    return `Vence ${formatYYYYMMDD(iso)}`;
  };

  return (
    <>
      <StatusBar translucent={true} backgroundColor="transparent" barStyle="light-content" />
      <LinearGradient
        colors={['#000000', '#3A0CA3', '#F72585']}
        locations={[0, 0.6, 1]} // Aquí implementamos los porcentajes
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Todo')}>
            <AntDesign name="double-left" size={34} color="#fff" />
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.avatarContainer}>
              <Image source={avatar} style={styles.avatar} resizeMode="cover" />
              <TouchableOpacity style={styles.editAvatarButton} onPress={() => setModalVisible(true)}>
                <Text style={styles.editAvatarButtonText}>✏️</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.actionsContainer}>
              <TouchableOpacity style={styles.editButton} onPress={handleOpenEditMoto}>
                <Text style={styles.editButtonText}>Editar Información</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.centeredInfoContainer}>
              <Text style={styles.resultText}>{userData.Marca}</Text>
              <Text style={styles.resultText}>{userData.Placa}</Text>
              <Text style={styles.resultText}>{userData.Propietario}</Text>
              <Text style={styles.resultText}>{userData.Ciudad}</Text>
            </View>
          </View>

          <View style={styles.verticalButtonRow}>
            {/* SOAT */}
            <View style={styles.buttonWithResult}>
              <TouchableOpacity
                style={styles.editButtonCompact}
                onPress={() => openDueDatePicker('soat')}
              >
                <Text style={styles.editButtonText}>Vence Soat</Text>
              </TouchableOpacity>
              <Text style={styles.resultTextRight}>{rightLabelFor('soat')}</Text>
            </View>

            {/* Pico y Placa */}
            <View style={styles.buttonWithResult}>
              <TouchableOpacity
                style={styles.editButtonCompact}
                onPress={openPicoDaySelector}
              >
                <Text style={styles.editButtonText}>Pico y Placa</Text>
              </TouchableOpacity>
              <Text style={styles.resultTextRight}>{rightLabelFor('picoyplaca')}</Text>
            </View>

            {/* Técnico Mecánica */}
            <View style={styles.buttonWithResult}>
              <TouchableOpacity
                style={styles.editButtonCompact}
                onPress={() => openDueDatePicker('tecnico')}
              >
                <Text style={styles.editButtonText}>Técnico Mecánica</Text>
              </TouchableOpacity>
              <Text style={styles.resultTextRight}>{rightLabelFor('tecnico')}</Text>
            </View>
          </View>

          {/* Modal selección de imagen (sin cambios) */}
          <Modal
            visible={modalVisible}
            transparent
            animationType="slide"
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.imagePickerModalOverlay}>
              <View style={styles.imagePickerModalContent}>
                <TouchableOpacity style={styles.imagePickerModalOption} onPress={openCamera}>
                  <Text style={styles.imagePickerModalOptionText}>Abrir cámara</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.imagePickerModalOption} onPress={openGallery}>
                  <Text style={styles.imagePickerModalOptionText}>Abrir galería</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.imagePickerModalCancel}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.imagePickerModalCancelText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* Modales de texto (compatibilidad) */}
          <Modal
            visible={editMotoModalVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setEditMotoModalVisible(false)}
          >
            <View style={styles.editModalOverlay}>
              <View style={styles.editModalContent}>
                <Text style={styles.editModalTitle}>Editar Información de la Moto</Text>
                <TextInput
                  style={styles.editModalInput}
                  value={editMotoValues.Marca}
                  onChangeText={(text) => setEditMotoValues((prev) => ({ ...prev, Marca: text }))}
                  placeholder="Marca"
                  placeholderTextColor="#888"
                />
                <TextInput
                  style={styles.editModalInput}
                  value={editMotoValues.Placa}
                  onChangeText={(text) => setEditMotoValues((prev) => ({ ...prev, Placa: text }))}
                  placeholder="Placa"
                  placeholderTextColor="#888"
                />
                <TextInput
                  style={styles.editModalInput}
                  value={editMotoValues.Propietario}
                  onChangeText={(text) => setEditMotoValues((prev) => ({ ...prev, Propietario: text }))}
                  placeholder="Propietario"
                  placeholderTextColor="#888"
                />
                <TextInput
                  style={styles.editModalInput}
                  value={editMotoValues.Ciudad}
                  onChangeText={(text) => setEditMotoValues((prev) => ({ ...prev, Ciudad: text }))}
                  placeholder="Ciudad"
                  placeholderTextColor="#888"
                />
                <View style={styles.editModalButtonRow}>
                  <TouchableOpacity style={styles.editModalSaveButton} onPress={handleSaveEditMoto}>
                    <Text style={styles.editModalSaveButtonText}>Guardar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.editModalCancelButton}
                    onPress={() => setEditMotoModalVisible(false)}
                  >
                    <Text style={styles.editModalCancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          <Modal
            visible={editSoatModalVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setEditSoatModalVisible(false)}
          >
            <View style={styles.editModalOverlay}>
              <View style={styles.editModalContent}>
                <Text style={styles.editModalTitle}>Vencimiento Soat</Text>
                <TextInput
                  style={styles.editModalInput}
                  value={editSoatValue}
                  onChangeText={setEditSoatValue}
                  multiline
                  placeholder="Escribe aquí..."
                  placeholderTextColor="#888"
                />
                <View style={styles.editModalButtonRow}>
                  <TouchableOpacity style={styles.editModalSaveButton} onPress={handleSaveEditSoat}>
                    <Text style={styles.editModalSaveButtonText}>Guardar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.editModalCancelButton}
                    onPress={() => setEditSoatModalVisible(false)}
                  >
                    <Text style={styles.editModalCancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          <Modal
            visible={editPicoyplacaModalVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setEditPicoyplacaModalVisible(false)}
          >
            <View style={styles.editModalOverlay}>
              <View style={styles.editModalContent}>
                <Text style={styles.editModalTitle}>Pico y Placa</Text>
                <TextInput
                  style={styles.editModalInput}
                  value={editPicoyplacaValue}
                  onChangeText={setEditPicoyplacaValue}
                  multiline
                  placeholder="Escribe aquí..."
                  placeholderTextColor="#888"
                />
                <View style={styles.editModalButtonRow}>
                  <TouchableOpacity style={styles.editModalSaveButton} onPress={handleSaveEditPicoyplaca}>
                    <Text style={styles.editModalSaveButtonText}>Guardar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.editModalCancelButton}
                    onPress={() => setEditPicoyplacaModalVisible(false)}
                  >
                    <Text style={styles.editModalCancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          <Modal
            visible={editTecnicoModalVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setEditTecnicoModalVisible(false)}
          >
            <View style={styles.editModalOverlay}>
              <View style={styles.editModalContent}>
                <Text style={styles.editModalTitle}>Vencimiento Técnico Mecánica</Text>
                <TextInput
                  style={styles.editModalInput}
                  value={editTecnicoValue}
                  onChangeText={setEditTecnicoValue}
                  multiline
                  placeholder="Escribe aquí..."
                  placeholderTextColor="#888"
                />
                <View style={styles.editModalButtonRow}>
                  <TouchableOpacity style={styles.editModalSaveButton} onPress={handleSaveEditTecnico}>
                    <Text style={styles.editModalSaveButtonText}>Guardar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.editModalCancelButton}
                    onPress={() => setEditTecnicoModalVisible(false)}
                  >
                    <Text style={styles.editModalCancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          {/* Date Picker SOAT / Técnico */}
          {showDatePicker && (
            <Modal
              visible={showDatePicker}
              transparent
              animationType="fade"
              onRequestClose={() => setShowDatePicker(false)}
            >
              <View style={styles.editModalOverlay}>
                <View style={styles.editModalContent}>
                  <Text style={styles.editModalTitle}>
                    {activeDocType === 'soat' ? 'Elige fecha de vencimiento SOAT' : 'Elige fecha de vencimiento Técnico'}
                  </Text>

                  <DateTimePicker
                    value={tempDate}
                    mode="date"
                    display={Platform.OS === 'android' ? 'calendar' : 'inline'}
                    onChange={onDateChange}
                  />

                  {Platform.OS === 'ios' && (
                    <View style={styles.editModalButtonRow}>
                      <TouchableOpacity style={styles.editModalSaveButton} onPress={confirmIOSDate}>
                        <Text style={styles.editModalSaveButtonText}>Confirmar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.editModalCancelButton}
                        onPress={() => setShowDatePicker(false)}
                      >
                        <Text style={styles.editModalCancelButtonText}>Cancelar</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            </Modal>
          )}

          {/* Selector de recordatorio */}
          <Modal
            visible={showReminderModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowReminderModal(false)}
          >
            <View style={styles.editModalOverlay}>
              <View style={styles.editModalContent}>
                <Text style={styles.editModalTitle}>Recordatorio</Text>
                {[
                  { label: 'Sin recordar', value: null },
                  { label: 'Mismo día 9:00', value: 0 },
                  { label: '1 día antes 9:00', value: 1 },
                  { label: '3 días antes 9:00', value: 3 },
                  { label: '7 días antes 9:00', value: 7 },
                ].map((opt) => (
                  <TouchableOpacity
                    key={String(opt.value)}
                    style={{ paddingVertical: 12, alignItems: 'center' }}
                    onPress={() => pickReminder(opt.value as number | null)}
                  >
                    <Text style={{ fontSize: 16, fontWeight: '600', color: '#090FFA' }}>{opt.label}</Text>
                  </TouchableOpacity>
                ))}

                <View style={styles.editModalButtonRow}>
                  <TouchableOpacity
                    style={styles.editModalCancelButton}
                    onPress={() => {
                      setShowReminderModal(false);
                      setPendingDueISO(null);
                      setActiveDocType(null);
                    }}
                  >
                    <Text style={styles.editModalCancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          {/* Selector de día Pico y Placa */}
          <Modal
            visible={showPicoDayModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowPicoDayModal(false)}
          >
            <View style={styles.editModalOverlay}>
              <View style={styles.editModalContent}>
                <Text style={styles.editModalTitle}>Día de Pico y Placa</Text>
                {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'].map((day) => (
                  <TouchableOpacity
                    key={day}
                    style={{ paddingVertical: 12, alignItems: 'center' }}
                    onPress={() => pickPicoDay(day)}
                  >
                    <Text style={{ fontSize: 16, fontWeight: '600', color: '#090FFA' }}>{day}</Text>
                  </TouchableOpacity>
                ))}

                <View style={styles.editModalButtonRow}>
                  <TouchableOpacity
                    style={styles.editModalCancelButton}
                    onPress={() => setShowPicoDayModal(false)}
                  >
                    <Text style={styles.editModalCancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </ScrollView>
      </LinearGradient>
    </>
  );
};

export default ProfileScreen;
