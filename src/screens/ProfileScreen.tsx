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
  extracontractual: string;
  contractual: string;
  soat: string;
  tecnico: string;
  
  // Recordatorios para todos los documentos
  extracontractualReminderDaysBefore?: number | null;
  extracontractualNotificationId?: string | null;
  contractualReminderDaysBefore?: number | null;
  contractualNotificationId?: string | null;
  soatReminderDaysBefore?: number | null;
  soatNotificationId?: string | null;
  tecnicoReminderDaysBefore?: number | null;
  tecnicoNotificationId?: string | null;

  // Nuevos campos para recordatorios múltiples
  extracontractualNotificationIds?: string[] | null;
  contractualNotificationIds?: string[] | null;
  soatNotificationIds?: string[] | null;
  tecnicoNotificationIds?: string[] | null;
  extracontractualDailyWindowDays?: number | null;
  contractualDailyWindowDays?: number | null;
  soatDailyWindowDays?: number | null;
  tecnicoDailyWindowDays?: number | null;
  extracontractualReminderHour?: number;
  extracontractualReminderMinute?: number;
  contractualReminderHour?: number;
  contractualReminderMinute?: number;
  soatReminderHour?: number;
  soatReminderMinute?: number;
  tecnicoReminderHour?: number;
  tecnicoReminderMinute?: number;
};

const ProfileScreen = ({ navigation }: any) => {
  // Estados existentes
  const [avatar, setAvatar] = useState(require('../../assets/imagen/Microbusper.jpg'));
  const [modalVisible, setModalVisible] = useState(false);

  // Datos que se muestran y guardan
  const [tabData, setTabData] = useState<TabData>({
    extracontractual: '',
    contractual: '',
    soat: '',
    tecnico: '',
    extracontractualReminderDaysBefore: null,
    extracontractualNotificationId: null,
    contractualReminderDaysBefore: null,
    contractualNotificationId: null,
    soatReminderDaysBefore: null,
    soatNotificationId: null,
    tecnicoReminderDaysBefore: null,
    tecnicoNotificationId: null,
    extracontractualNotificationIds: null,
    contractualNotificationIds: null,
    soatNotificationIds: null,
    tecnicoNotificationIds: null,
    extracontractualDailyWindowDays: null,
    contractualDailyWindowDays: null,
    soatDailyWindowDays: null,
    tecnicoDailyWindowDays: null,
    extracontractualReminderHour: 9,
    extracontractualReminderMinute: 0,
    contractualReminderHour: 9,
    contractualReminderMinute: 0,
    soatReminderHour: 9,
    soatReminderMinute: 0,
    tecnicoReminderHour: 9,
    tecnicoReminderMinute: 0,
  });

  // Datos de la moto (solo Marca y Placa)
  const [editMotoModalVisible, setEditMotoModalVisible] = useState(false);
  const [userData, setUserData] = useState({
    Marca: '',
    Placa: '',
  });
  const [editMotoValues, setEditMotoValues] = useState(userData);

  // Nuevos estados para calendario y recordatorios
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activeDocType, setActiveDocType] = useState<'extracontractual' | 'contractual' | 'soat' | 'tecnico' | null>(null);
  const [tempDate, setTempDate] = useState<Date>(new Date());
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [pendingDueISO, setPendingDueISO] = useState<string | null>(null);

  // Hora para recordatorios - CORREGIDO
  const [reminderTime, setReminderTime] = useState<Date>(() => {
    const d = new Date();
    d.setHours(9, 0, 0, 0);
    return d;
  });
  const [showTimePicker, setShowTimePicker] = useState(false);

  // ------- Helpers -------
  const toISODate = (d: Date) => {
    const y = d.getFullYear();
    const m = `${d.getMonth() + 1}`.padStart(2, '0');
    const day = `${d.getDate()}`.padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const formatYYYYMMDD = (iso: string) => iso;

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

          // Preparar hora - CORREGIDO
          const h = saved.soatReminderHour ?? 9;
          const m = saved.soatReminderMinute ?? 0;
          const d = new Date();
          d.setHours(h, m, 0, 0);
          setReminderTime(d);
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

  // ------- Notificaciones -------
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

  const makeDateTrigger = (triggerDate: Date): any => {
    const anyNotif: any = Notifications as any;
    const ms = triggerDate.getTime();
    const dateType =
      anyNotif?.SchedulableTriggerInputTypes?.DATE ?? 'date';
    return {
      type: dateType,
      date: ms,
      ...(Platform.OS === 'android' ? { channelId: 'default', allowWhileIdle: true } : {}),
    } as any;
  };

  // Cancelar recordatorios previos
  const cancelPreviousFor = useCallback(async (doc: 'extracontractual' | 'contractual' | 'soat' | 'tecnico') => {
    try {
      const ids = 
        doc === 'extracontractual' ? tabData.extracontractualNotificationIds :
        doc === 'contractual' ? tabData.contractualNotificationIds :
        doc === 'soat' ? tabData.soatNotificationIds :
        tabData.tecnicoNotificationIds;
      
      if (ids && ids.length) {
        await Promise.all(ids.map(id => Notifications.cancelScheduledNotificationAsync(id).catch(() => {})));
      }
      
      const legacyId = 
        doc === 'extracontractual' ? tabData.extracontractualNotificationId :
        doc === 'contractual' ? tabData.contractualNotificationId :
        doc === 'soat' ? tabData.soatNotificationId :
        tabData.tecnicoNotificationId;
      
      if (legacyId) {
        await Notifications.cancelScheduledNotificationAsync(legacyId).catch(() => {});
      }
    } catch {}
  }, [tabData]);

  // CORREGIDO: Función para aplicar hora sin errores
  const applyTime = (base: Date, hour: number, minute: number) => {
    const d = new Date(base);
    d.setHours(hour, minute, 0, 0);
    return d;
  };

  // Programar recordatorio simple
  const scheduleSingleReminder = useCallback(
    async ({
      doc,
      dueISO,
      daysBefore,
      hour,
      minute,
    }: {
      doc: 'extracontractual' | 'contractual' | 'soat' | 'tecnico';
      dueISO: string;
      daysBefore: number;
      hour: number;
      minute: number;
    }): Promise<string | null> => {
      try {
        await cancelPreviousFor(doc);

        const due = new Date(dueISO + 'T00:00:00');
        const triggerDate = new Date(due);
        triggerDate.setDate(triggerDate.getDate() - daysBefore);
        const finalDate = applyTime(triggerDate, hour, minute);

        if (finalDate.getTime() <= Date.now()) {
          Alert.alert('Aviso', 'El recordatorio quedó en el pasado. No se programó notificación.');
          return null;
        }

        const trigger = makeDateTrigger(finalDate);
        const docName = 
          doc === 'extracontractual' ? 'Extracontractual' :
          doc === 'contractual' ? 'Contractual' :
          doc === 'soat' ? 'SOAT' :
          'Técnico Mecánica';
        
        const id = await Notifications.scheduleNotificationAsync({
          content: {
            title: '📄 Vencimiento de documento',
            body: `Tu ${docName} vence el ${formatYYYYMMDD(dueISO)}`,
            sound: true,
            priority: Notifications.AndroidNotificationPriority.HIGH,
            data: { doc, dueISO, daysBefore, hour, minute },
          },
          trigger,
        });

        return id;
      } catch (e) {
        console.log('Error programando recordatorio simple:', e);
        return null;
      }
    },
    [cancelPreviousFor]
  );

  // Programar recordatorios diarios
  const scheduleDailyWindowReminders = useCallback(
    async ({
      doc,
      dueISO,
      windowDays,
      hour,
      minute,
    }: {
      doc: 'extracontractual' | 'contractual' | 'soat' | 'tecnico';
      dueISO: string;
      windowDays: 5 | 10 | 15;
      hour: number;
      minute: number;
    }): Promise<string[]> => {
      const ids: string[] = [];
      try {
        await cancelPreviousFor(doc);

        const due = new Date(dueISO + 'T00:00:00');
        const docName = 
          doc === 'extracontractual' ? 'Extracontractual' :
          doc === 'contractual' ? 'Contractual' :
          doc === 'soat' ? 'SOAT' :
          'Técnico Mecánica';
        
        for (let i = windowDays; i >= 1; i--) {
          const day = new Date(due);
          day.setDate(day.getDate() - i);
          const finalDate = applyTime(day, hour, minute);
          if (finalDate.getTime() <= Date.now()) continue;

          const trigger = makeDateTrigger(finalDate);
          const id = await Notifications.scheduleNotificationAsync({
            content: {
              title: '⏰ Recordatorio de documento (diario)',
              body: `${docName} vence el ${formatYYYYMMDD(dueISO)} · Faltan ${i} día(s)`,
              sound: true,
              priority: Notifications.AndroidNotificationPriority.HIGH,
              data: { doc, dueISO, dayOffset: i, hour, minute },
            },
            trigger,
          });
          ids.push(id);
        }
      } catch (e) {
        console.log('Error programando ventana diaria:', e);
      }
      return ids;
    },
    [cancelPreviousFor]
  );

  // ------- Guardar datos -------
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

  // ------- Funciones para cámara y galería -------
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

  // Editar información de la moto (solo Marca y Placa)
  const handleOpenEditMoto = () => {
    setEditMotoValues(userData);
    setEditMotoModalVisible(true);
  };

  const handleSaveEditMoto = () => {
    setUserData(editMotoValues);
    saveUserData(editMotoValues);
    setEditMotoModalVisible(false);
  };

  // ------- Nuevas funciones para calendario y recordatorios -------
  const openDueDatePicker = (doc: 'extracontractual' | 'contractual' | 'soat' | 'tecnico') => {
    setActiveDocType(doc);
    const prevISO = 
      doc === 'extracontractual' ? tabData.extracontractual :
      doc === 'contractual' ? tabData.contractual :
      doc === 'soat' ? tabData.soat :
      tabData.tecnico;
    
    setTempDate(prevISO ? new Date(prevISO + 'T00:00:00') : new Date());

    // Pre-cargar hora según doc - CORREGIDO
    let hour = 9;
    let minute = 0;

    if (doc === 'extracontractual') {
      hour = tabData.extracontractualReminderHour ?? 9;
      minute = tabData.extracontractualReminderMinute ?? 0;
    } else if (doc === 'contractual') {
      hour = tabData.contractualReminderHour ?? 9;
      minute = tabData.contractualReminderMinute ?? 0;
    } else if (doc === 'soat') {
      hour = tabData.soatReminderHour ?? 9;
      minute = tabData.soatReminderMinute ?? 0;
    } else {
      hour = tabData.tecnicoReminderHour ?? 9;
      minute = tabData.tecnicoReminderMinute ?? 0;
    }

    const t = new Date();
    t.setHours(hour, minute, 0, 0);
    setReminderTime(t);

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

  const onTimePicked = (_evt: DateTimePickerEvent, selected?: Date) => {
    setShowTimePicker(false);
    if (selected) setReminderTime(selected);
  };

  // Elegir opción simple de recordatorio
  const pickSimpleReminder = async (daysBefore: number | null) => {
    if (!activeDocType || !pendingDueISO) {
      setShowReminderModal(false);
      return;
    }

    let notificationId: string | null = null;
    let ids: string[] | null = null;

    if (daysBefore !== null) {
      const id = await scheduleSingleReminder({
        doc: activeDocType,
        dueISO: pendingDueISO,
        daysBefore,
        hour: reminderTime.getHours(),
        minute: reminderTime.getMinutes(),
      });
      notificationId = id;
    } else {
      await cancelPreviousFor(activeDocType);
    }

    const newTab: TabData = { ...tabData };
    
    if (activeDocType === 'extracontractual') {
      newTab.extracontractual = pendingDueISO;
      newTab.extracontractualReminderDaysBefore = daysBefore ?? null;
      newTab.extracontractualNotificationId = notificationId ?? null;
      newTab.extracontractualNotificationIds = ids;
      newTab.extracontractualDailyWindowDays = null;
      newTab.extracontractualReminderHour = reminderTime.getHours();
      newTab.extracontractualReminderMinute = reminderTime.getMinutes();
    } else if (activeDocType === 'contractual') {
      newTab.contractual = pendingDueISO;
      newTab.contractualReminderDaysBefore = daysBefore ?? null;
      newTab.contractualNotificationId = notificationId ?? null;
      newTab.contractualNotificationIds = ids;
      newTab.contractualDailyWindowDays = null;
      newTab.contractualReminderHour = reminderTime.getHours();
      newTab.contractualReminderMinute = reminderTime.getMinutes();
    } else if (activeDocType === 'soat') {
      newTab.soat = pendingDueISO;
      newTab.soatReminderDaysBefore = daysBefore ?? null;
      newTab.soatNotificationId = notificationId ?? null;
      newTab.soatNotificationIds = ids;
      newTab.soatDailyWindowDays = null;
      newTab.soatReminderHour = reminderTime.getHours();
      newTab.soatReminderMinute = reminderTime.getMinutes();
    } else {
      newTab.tecnico = pendingDueISO;
      newTab.tecnicoReminderDaysBefore = daysBefore ?? null;
      newTab.tecnicoNotificationId = notificationId ?? null;
      newTab.tecnicoNotificationIds = ids;
      newTab.tecnicoDailyWindowDays = null;
      newTab.tecnicoReminderHour = reminderTime.getHours();
      newTab.tecnicoReminderMinute = reminderTime.getMinutes();
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
        : 'Recordatorio programado correctamente.'
    );
  };

  // Elegir opción de recordatorio diario
  const pickDailyWindow = async (windowDays: 5 | 10 | 15) => {
    if (!activeDocType || !pendingDueISO) {
      setShowReminderModal(false);
      return;
    }

    const ids = await scheduleDailyWindowReminders({
      doc: activeDocType,
      dueISO: pendingDueISO,
      windowDays,
      hour: reminderTime.getHours(),
      minute: reminderTime.getMinutes(),
    });

    const newTab: TabData = { ...tabData };
    
    if (activeDocType === 'extracontractual') {
      newTab.extracontractual = pendingDueISO;
      newTab.extracontractualNotificationIds = ids;
      newTab.extracontractualNotificationId = null;
      newTab.extracontractualReminderDaysBefore = null;
      newTab.extracontractualDailyWindowDays = windowDays;
      newTab.extracontractualReminderHour = reminderTime.getHours();
      newTab.extracontractualReminderMinute = reminderTime.getMinutes();
    } else if (activeDocType === 'contractual') {
      newTab.contractual = pendingDueISO;
      newTab.contractualNotificationIds = ids;
      newTab.contractualNotificationId = null;
      newTab.contractualReminderDaysBefore = null;
      newTab.contractualDailyWindowDays = windowDays;
      newTab.contractualReminderHour = reminderTime.getHours();
      newTab.contractualReminderMinute = reminderTime.getMinutes();
    } else if (activeDocType === 'soat') {
      newTab.soat = pendingDueISO;
      newTab.soatNotificationIds = ids;
      newTab.soatNotificationId = null;
      newTab.soatReminderDaysBefore = null;
      newTab.soatDailyWindowDays = windowDays;
      newTab.soatReminderHour = reminderTime.getHours();
      newTab.soatReminderMinute = reminderTime.getMinutes();
    } else {
      newTab.tecnico = pendingDueISO;
      newTab.tecnicoNotificationIds = ids;
      newTab.tecnicoNotificationId = null;
      newTab.tecnicoReminderDaysBefore = null;
      newTab.tecnicoDailyWindowDays = windowDays;
      newTab.tecnicoReminderHour = reminderTime.getHours();
      newTab.tecnicoReminderMinute = reminderTime.getMinutes();
    }
    
    setTabData(newTab);
    await saveTabData(newTab);

    setShowReminderModal(false);
    setPendingDueISO(null);
    setActiveDocType(null);

    Alert.alert(
      'Guardado',
      ids.length
        ? `Programado: 1 recordatorio por día durante los últimos ${windowDays} días.`
        : 'No se programaron recordatorios (todas las fechas quedaron en el pasado).'
    );
  };

  // Helper para mostrar labels
  const rightLabelFor = (key: 'extracontractual' | 'contractual' | 'soat' | 'tecnico') => {
    const iso = tabData[key];
    if (!iso) return 'Editar';
    return `Vence ${formatYYYYMMDD(iso)}`;
  };

  return (
    <>
      <StatusBar
        translucent={true}
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <LinearGradient
        colors={['#0b3a01', '#2a9508', '#66f338']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('Todo')}
          >
            <AntDesign name="double-left" size={34} color="#fff" />
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.avatarContainer}>
              <Image
                source={avatar}
                style={styles.avatar}
                resizeMode="cover"
              />
              <TouchableOpacity
                style={styles.editAvatarButton}
                onPress={() => setModalVisible(true)}
              >
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
            </View>
          </View>

          <View style={styles.verticalButtonRow}>
            {/* Extracontractual - CON CALENDARIO */}
            <View style={styles.buttonWithResult}>
              <TouchableOpacity
                style={[styles.editButtonCompact, styles.editButtonCompact]}
                onPress={() => openDueDatePicker('extracontractual')}
              >
                <Text style={[styles.editButtonText]}>Extracontractual</Text>
              </TouchableOpacity>
              <Text style={styles.resultTextRight}>
                {rightLabelFor('extracontractual')}
              </Text>
            </View>

            {/* Contractual - CON CALENDARIO */}
            <View style={styles.buttonWithResult}>
              <TouchableOpacity
                style={[styles.editButtonCompact, styles.editButtonCompact]}
                onPress={() => openDueDatePicker('contractual')}
              >
                <Text style={[styles.editButtonText]}>Contractual</Text>
              </TouchableOpacity>
              <Text style={styles.resultTextRight}>
                {rightLabelFor('contractual')}
              </Text>
            </View>

            {/* SOAT - CON CALENDARIO */}
            <View style={styles.buttonWithResult}>
              <TouchableOpacity
                style={styles.editButtonCompact}
                onPress={() => openDueDatePicker('soat')}
              >
                <Text style={styles.editButtonText}>Vence Soat</Text>
              </TouchableOpacity>
              <Text style={styles.resultTextRight}>
                {rightLabelFor('soat')}
              </Text>
            </View>

            {/* Técnico Mecánica - CON CALENDARIO */}
            <View style={styles.buttonWithResult}>
              <TouchableOpacity
                style={styles.editButtonCompact}
                onPress={() => openDueDatePicker('tecnico')}
              >
                <Text style={styles.editButtonText}>Técnico Mecánica</Text>
              </TouchableOpacity>
              <Text style={styles.resultTextRight}>
                {rightLabelFor('tecnico')}
              </Text>
            </View>
          </View>

          {/* Modales */}

          {/* Modal para seleccionar imagen */}
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

          {/* Modal para editar información del vehiculo (solo Marca y Placa) */}
          <Modal
            visible={editMotoModalVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setEditMotoModalVisible(false)}
          >
            <View style={styles.editModalOverlay}>
              <View style={styles.editModalContent}>
                <Text style={styles.editModalTitle}>Editar Información</Text>
                <TextInput
                  style={styles.editModalInput}
                  value={editMotoValues.Marca}
                  onChangeText={text => setEditMotoValues(prev => ({ ...prev, Marca: text }))}
                  placeholder="Marca"
                  placeholderTextColor="#888"
                />
                <TextInput
                  style={styles.editModalInput}
                  value={editMotoValues.Placa}
                  onChangeText={text => setEditMotoValues(prev => ({ ...prev, Placa: text }))}
                  placeholder="Placa"
                  placeholderTextColor="#888"
                />
                <View style={styles.editModalButtonRow}>
                  <TouchableOpacity style={styles.editModalSaveButton} onPress={handleSaveEditMoto}>
                    <Text style={styles.editModalSaveButtonText}>Guardar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.editModalCancelButton} onPress={() => setEditMotoModalVisible(false)}>
                    <Text style={styles.editModalCancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          {/* NUEVOS MODALES PARA CALENDARIO Y RECORDATORIOS */}

          {/* Date Picker para todos los documentos */}
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
                    {activeDocType === 'extracontractual' ? 'Elige fecha de vencimiento Extracontractual' : 
                     activeDocType === 'contractual' ? 'Elige fecha de vencimiento Contractual' :
                     activeDocType === 'soat' ? 'Elige fecha de vencimiento SOAT' :
                     'Elige fecha de vencimiento Técnico Mecánica'}
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

          {/* Modal de recordatorios */}
          <Modal
            visible={showReminderModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowReminderModal(false)}
          >
            <View style={styles.editModalOverlay}>
              <View style={styles.editModalContent}>
                <Text style={styles.editModalTitle}>Recordatorio</Text>

                {/* Hora seleccionada */}
                <View style={{ alignItems: 'center', marginBottom: 10 }}>
                  <Text style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
                    Hora actual: {reminderTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                  <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.editModalSaveButton}>
                    <Text style={styles.editModalSaveButtonText}>Cambiar hora</Text>
                  </TouchableOpacity>
                </View>

                {showTimePicker && (
                  <DateTimePicker
                    value={reminderTime}
                    mode="time"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onTimePicked}
                  />
                )}

                {/* Diario (uno por día) */}
                <Text style={{ fontSize: 15, fontWeight: '700', marginTop: 6, marginBottom: 4 }}>Diario (uno por día):</Text>
                <TouchableOpacity
                  style={{ paddingVertical: 10, alignItems: 'center' }}
                  onPress={() => pickDailyWindow(5)}
                >
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#090FFA' }}>
                    Últimos 5 días (un recordatorio cada día)
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ paddingVertical: 10, alignItems: 'center' }}
                  onPress={() => pickDailyWindow(10)}
                >
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#090FFA' }}>
                    Últimos 10 días (un recordatorio cada día)
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ paddingVertical: 10, alignItems: 'center' }}
                  onPress={() => pickDailyWindow(15)}
                >
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#090FFA' }}>
                    Últimos 15 días (un recordatorio cada día)
                  </Text>
                </TouchableOpacity>

                {/* Separador */}
                <View style={{ height: 1, backgroundColor: '#eee', marginVertical: 10, width: '100%' }} />

                {/* Una sola vez */}
                <Text style={{ fontSize: 15, fontWeight: '700', marginBottom: 6 }}>Una sola vez:</Text>
                <TouchableOpacity style={{ paddingVertical: 8, alignItems: 'center' }} onPress={() => pickSimpleReminder(null)}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#090FFA' }}>Sin recordar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ paddingVertical: 8, alignItems: 'center' }} onPress={() => pickSimpleReminder(0)}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#090FFA' }}>Mismo día</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ paddingVertical: 8, alignItems: 'center' }} onPress={() => pickSimpleReminder(1)}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#090FFA' }}>1 día antes</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ paddingVertical: 8, alignItems: 'center' }} onPress={() => pickSimpleReminder(3)}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#090FFA' }}>3 días antes</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ paddingVertical: 8, alignItems: 'center' }} onPress={() => pickSimpleReminder(7)}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#090FFA' }}>7 días antes</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ paddingVertical: 8, alignItems: 'center' }} onPress={() => pickSimpleReminder(10)}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#090FFA' }}>10 días antes</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ paddingVertical: 8, alignItems: 'center' }} onPress={() => pickSimpleReminder(15)}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#090FFA' }}>15 días antes</Text>
                </TouchableOpacity>

                <View style={styles.editModalButtonRow}>
                  <TouchableOpacity
                    style={styles.editModalCancelButton}
                    onPress={() => {
                      setShowReminderModal(false);
                      setPendingDueISO(null);
                      setActiveDocType(null);
                    }}
                  >
                    <Text style={styles.editModalCancelButtonText}>Cerrar</Text>
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