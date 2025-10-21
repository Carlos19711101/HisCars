// screens/FuelStatsBotScreen.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Alert,
  Image,
  ScrollView,
  StatusBar,
  Modal,
  DeviceEventEmitter,
  Keyboard,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { nanoid } from 'nanoid/non-secure';
import styles from './FulStatsBotScreen.styles';

// -------------------------
// Tipos de navegación
// -------------------------
type RootStackParamList = {
  Todo: undefined;
  StatisticsScreen: undefined;
  FuelStatsBotScreen: undefined;
  Emergency: undefined;
};

type Nav = NativeStackNavigationProp<RootStackParamList, 'FuelStatsBotScreen'>;

// -------------------------
// Mensajes
// -------------------------
type MessageType = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  entryId?: string;
  isDeletable?: boolean;
};

// -------------------------
// Almacenamiento
// -------------------------
export const STORAGE_KEYS = {
  PRICE: 'fuelPricePerGallonCOP',
  ENTRIES: 'fuelEntries',
};

const EMERGENCY_JOURNAL_KEY = '@journal_entries_emergency';
type JournalEntryPersist = { id: string; text: string; date: string; image?: string };

// -------------------------
// Tipos de datos
// -------------------------
export type FuelEntry = {
  id: string;
  dateISO: string;
  amountCOP: number;
  pricePerGallonCOP: number;
  gallons: number;
  odometerKm?: number;
  type: 'baseline' | 'fillup';
};

// -------------------------
// Helpers
// -------------------------
const safeCurrency = (v: number) => {
  try {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(v);
  } catch {
    return 'COP ' + Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }
};

const shortDate = (iso: string | Date) => {
  const d = iso instanceof Date ? iso : new Date(iso);
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const parseNumber = (s: string) => {
  if (!s) return NaN;
  const cleaned = s
    .trim()
    .replace(/\s/g, '')
    .replace(/[.](?=.*[.])/g, '')
    .replace(/,/g, '.')
    .replace(/[^\d.]/g, '');
  return Number(cleaned);
};

const stripForSpeech = (s: string) => {
  if (!s) return '';
  return s
    .replace(
      /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}]/gu,
      ''
    )
    .replace(/[•◆►▪︎▪■□–—\-*_#`~]/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .replace(/\[.*?\]/g, '')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/[^\w\sáéíóúñÁÉÍÓÚÑ.,!?;:()'-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const expandAbbreviations = (text: string): string => {
  if (!text) return text;
  
  return text
    .replace(/\bkm\b/gi, 'kilómetros')
    .replace(/\bL\b/g, 'litros')
    .replace(/\bgal\b/gi, 'galones')
    .replace(/\bCOP\b/g, 'pesos colombianos')
    .replace(/\bkm\/L\b/gi, 'kilómetros por litro')
    .replace(/\bkm\/gal\b/gi, 'kilómetros por galón')
    .replace(/\bodom\.\b/gi, 'velocímetro')
    .replace(/\bodómetro\b/gi, 'velocímetro')
    .replace(/\bveloc\.\b/gi, 'velocímetro')
    .replace(/\bval\b/gi, 'valor')
    .replace(/\bprec\b/gi, 'precio')
    .replace(/\binf\b/gi, 'informe')
    .replace(/\bresum\b/gi, 'resumen')
    .replace(/\best\b/gi, 'estadística')
    .replace(/\btanq\b/gi, 'tanqueada')
    .replace(/\babast\b/gi, 'abastecido')
    .replace(/\bgast\b/gi, 'gastado')
    .replace(/\brecorr\b/gi, 'recorridos')
    .replace(/\bprom\b/gi, 'promedio')
    .replace(/\brend\b/gi, 'rendimiento')
    .replace(/\bcalc\b/gi, 'calcular')
    .replace(/\bregis\b/gi, 'registrado')
    .replace(/\bactual\b/gi, 'actualizado')
    .replace(/\binfo\b/gi, 'información')
    .replace(/\binsuf\b/gi, 'insuficiente')
    .replace(/\bdist\b/gi, 'distancias')
    .replace(/\bestim\b/gi, 'estimados')
    .replace(/\bneces\b/gi, 'necesitas')
    .replace(/\bregist\b/gi, 'registros')
    .replace(/\bperiod\b/gi, 'período')
    .replace(/\bsolicit\b/gi, 'solicitado')
    .replace(/\bcombust\b/gi, 'combustible')
    .replace(/\basist\b/gi, 'asistente')
    .replace(/\bconsum\b/gi, 'consumo');
};

// -------------------------
// Persistencia
// -------------------------
async function loadPrice(): Promise<number> {
  const p = await AsyncStorage.getItem(STORAGE_KEYS.PRICE);
  return p ? Number(p) : 16000;
}
async function savePrice(v: number) {
  await AsyncStorage.setItem(STORAGE_KEYS.PRICE, String(Math.round(v)));
}
async function loadEntries(): Promise<FuelEntry[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.ENTRIES);
  const arr: FuelEntry[] = raw ? JSON.parse(raw) : [];
  return arr.sort((a, b) => +new Date(a.dateISO) - +new Date(b.dateISO));
}
async function saveEntries(entries: FuelEntry[]) {
  await AsyncStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(entries));
  DeviceEventEmitter.emit('fuel:entries:updated');
}

async function appendEmergencyJournal(text: string) {
  try {
    const raw = await AsyncStorage.getItem(EMERGENCY_JOURNAL_KEY);
    const current: JournalEntryPersist[] = raw ? JSON.parse(raw) : [];
    const entry: JournalEntryPersist = {
      id: Date.now().toString(),
      text,
      date: new Date().toISOString(),
    };
    const updated = [entry, ...current];
    await AsyncStorage.setItem(EMERGENCY_JOURNAL_KEY, JSON.stringify(updated));
  } catch {
    // Silenciar errores
  }
}

// -------------------------
// Cálculos
// -------------------------
function computeSummaryFromSlice(entries: FuelEntry[]) {
  const withOdo = entries.filter(e => e.odometerKm !== undefined);
  const rendArr: number[] = [];
  let kmTotales = 0;
  let litrosTotales = 0;

  for (let i = 1; i < withOdo.length; i++) {
    const prev = withOdo[i - 1];
    const curr = withOdo[i];
    const deltaKm = (curr.odometerKm! - prev.odometerKm!);
    const litrosCurr = curr.gallons * 3.78541;
    if (deltaKm > 0 && litrosCurr > 0) {
      rendArr.push(deltaKm / litrosCurr);
      kmTotales += deltaKm;
      litrosTotales += litrosCurr;
    }
  }

  const promRend = rendArr.length ? (rendArr.reduce((a, b) => a + b, 0) / rendArr.length) : null;
  const totalCOP = entries.reduce((a, e) => a + e.amountCOP, 0);
  const totalGal = entries.reduce((a, e) => a + e.gallons, 0);

  return { totalCOP, totalGal, kmTotales, promRend };
}

// -------------------------
// Agente
// -------------------------
class FuelAgent {
  private pricePerGallon = 16000;
  private entries: FuelEntry[] = [];

  async init() {
    this.pricePerGallon = await loadPrice();
    this.entries = await loadEntries();
  }

  private speak(txt: string) {
    const t = stripForSpeech(txt);
    try { Speech.stop(); Speech.speak(t, { language: 'es-ES', pitch: 1.0, rate: 0.9 }); } catch { }
  }

  private ok(msg: string): string {
    this.speak(msg);
    return msg;
  }

  private fail(msg: string): string {
    this.speak(msg);
    return msg;
  }

  get hasBaseline(): boolean {
    return this.entries.some(e => e.type === 'baseline');
  }

  getEntries(): FuelEntry[] {
    return this.entries;
  }

  getPrice(): number {
    return this.pricePerGallon;
  }

  async handle(text: string): Promise<string> {
    const lower = text.toLowerCase();

    if (lower.includes('ver precio')) {
      return this.ok(`El precio por galón actual es ${safeCurrency(this.pricePerGallon)}.`);
    }

    if (lower.includes('resumen')) {
      const { totalCOP, totalGal, kmTotales, promRend } = computeSummaryFromSlice(this.entries);
      const litros = totalGal * 3.78541;
      const lines = [
        `Total gastado: ${safeCurrency(totalCOP)}`,
        `Abastecido: ${totalGal.toFixed(2)} galones (${litros.toFixed(1)} litros)`,
        kmTotales > 0 ? `Kilómetros recorridos estimados: ${kmTotales.toFixed(0)} kilómetros` : `Sugerencia: registra velocímetro para calcular distancias.`,
        promRend ? `Rendimiento promedio: ${promRend.toFixed(2)} kilómetros por litro` : 'Rendimiento: insuficiente información (faltan velocímetros).',
      ];
      return this.ok(`Resumen:\n• ${lines.join('\n• ')}`);
    }

    if (lower.includes('últimos 5')) {
      if (!this.entries.length) return this.ok('Aún no tengo registros de tanqueo.');
      const last = [...this.entries]
        .sort((a, b) => +new Date(b.dateISO) - +new Date(a.dateISO))
        .slice(0, 5);
      const lines = last.map((e, i) =>
        `${i + 1}. ${shortDate(e.dateISO)} — ${safeCurrency(e.amountCOP)} (${e.gallons.toFixed(2)} galones)${e.odometerKm ? ` — ${e.odometerKm} kilómetros` : ''}${e.type === 'baseline' ? ' — baseline' : ''}`
      );
      return this.ok(`Últimos ${last.length} registros:\n${lines.join('\n')}`);
    }

    return this.ok('Usa "Acciones rápidas" para gestionar tu combustible.');
  }

  async setNewPrice(price: number): Promise<string> {
    if (price <= 0) return this.fail('Precio inválido.');
    this.pricePerGallon = Math.round(price);
    await savePrice(this.pricePerGallon);
    return this.ok(`Precio por galón actualizado a ${safeCurrency(this.pricePerGallon)}.`);
  }

  async addBaseline(odometerKm: number): Promise<{ message: string; entryId: string } | string> {
    if (this.hasBaseline) return this.fail('Ya existe una primera tanqueada registrada.');
    if (!Number.isFinite(odometerKm) || odometerKm <= 0) {
      return this.fail('Datos inválidos para la primera tanqueada.');
    }
    
    const amountCOP = 0;
    const pricePerGallonCOP = this.pricePerGallon;
    const gallons = 0;
    
    const entry: FuelEntry = {
      id: nanoid(),
      dateISO: new Date().toISOString(),
      amountCOP: Math.round(amountCOP),
      pricePerGallonCOP: Math.round(pricePerGallonCOP),
      gallons,
      odometerKm,
      type: 'baseline',
    };
    this.entries = [...this.entries, entry].sort((a, b) => +new Date(a.dateISO) - +new Date(b.dateISO));
    await saveEntries(this.entries);

    await appendEmergencyJournal(
      `⛽ Primera tanqueada — Velocímetro inicial: ${odometerKm} kilómetros`
    );

    const successMessage = `Primera tanqueada registrada: Velocímetro inicial ${odometerKm} kilómetros.`;
    this.speak(successMessage);
    
    return { 
      message: successMessage,
      entryId: entry.id
    };
  }

  async addFillup(amountCOP: number, pricePerGallonCOP: number, odometerKm: number): Promise<{ message: string; entryId: string } | string> {
    if (amountCOP <= 0 || pricePerGallonCOP <= 0 || !Number.isFinite(odometerKm)) {
      return this.fail('Datos inválidos para la tanqueada.');
    }
    const gallons = amountCOP / pricePerGallonCOP;
    const entry: FuelEntry = {
      id: nanoid(),
      dateISO: new Date().toISOString(),
      amountCOP: Math.round(amountCOP),
      pricePerGallonCOP: Math.round(pricePerGallonCOP),
      gallons,
      odometerKm,
      type: 'fillup',
    };
    this.entries = [...this.entries, entry].sort((a, b) => +new Date(a.dateISO) - +new Date(b.dateISO));
    await saveEntries(this.entries);

    await appendEmergencyJournal(
      `⛽ Última tanqueada — Valor: ${safeCurrency(amountCOP)} | Precio/galón: ${safeCurrency(pricePerGallonCOP)} | Velocímetro: ${odometerKm} kilómetros`
    );

    const successMessage = `Tanqueada registrada: ${safeCurrency(amountCOP)} (${gallons.toFixed(2)} galones) — Velocímetro ${odometerKm} kilómetros.`;
    this.speak(successMessage);
    
    return { 
      message: successMessage,
      entryId: entry.id
    };
  }

  async generateReportByLastN(n: number): Promise<string> {
    if (n < 1) n = 1;
    
    const ordered = [...this.entries].sort((a, b) => +new Date(a.dateISO) - +new Date(b.dateISO));
    
    if (ordered.length < 1) return this.fail('Necesitas al menos un registro con velocímetro.');

    const slice = ordered.slice(-n);
    
    if (slice.length === 1) {
      const entry = slice[0];
      const baseline = this.entries.find(e => e.type === 'baseline');
      
      if (!baseline || baseline.odometerKm === undefined) {
        return this.fail('No hay registro baseline con velocímetro para calcular.');
      }

      const deltaKm = entry.odometerKm! - baseline.odometerKm;
      const litros = entry.gallons * 3.78541;
      
      if (deltaKm <= 0 || litros <= 0) {
        return this.fail('No hay suficiente información para calcular el rendimiento.');
      }

      const rendimiento = deltaKm / litros;
      const lines = [
        `Período: desde velocímetro inicial hasta última tanqueada`,
        `Velocímetro inicial: ${baseline.odometerKm} kilómetros`,
        `Velocímetro actual: ${entry.odometerKm} kilómetros`,
        `Kilómetros recorridos: ${deltaKm.toFixed(0)} kilómetros`,
        `Combustible usado: ${entry.gallons.toFixed(2)} galones (${litros.toFixed(1)} litros)`,
        `Rendimiento: ${rendimiento.toFixed(2)} kilómetros por litro`,
        `Total gastado: ${safeCurrency(entry.amountCOP)}`,
      ];
      
      const reportText = `📊 Informe de Combustible\n• ${lines.join('\n• ')}`;
      
      await appendEmergencyJournal(reportText);
      
      return this.ok(reportText);
    } else {
      const { totalCOP, totalGal, kmTotales, promRend } = computeSummaryFromSlice(slice);

      const litros = totalGal * 3.78541;
      const lines = [
        `Período: últimas ${slice.length} tanqueadas`,
        `Total gastado: ${safeCurrency(totalCOP)}`,
        `Abastecido: ${totalGal.toFixed(2)} galones (${litros.toFixed(1)} litros)`,
        kmTotales > 0 ? `Kilómetros recorridos (velocímetro): ${kmTotales.toFixed(0)} kilómetros` : 'Kilómetros recorridos: insuficiente información (faltan velocímetros).',
        promRend ? `Rendimiento promedio: ${promRend.toFixed(2)} kilómetros por litro` : 'Rendimiento: insuficiente información (faltan velocímetros).',
      ];
      const reportText = `📊 Informe de Combustible\n• ${lines.join('\n• ')}`;

      await appendEmergencyJournal(reportText);

      return this.ok(reportText);
    }
  }

  async clearAllData(): Promise<string> {
    this.entries = [];
    await saveEntries(this.entries);
    
    await appendEmergencyJournal(`🗑️ Todos los datos de combustible han sido borrados`);
    
    return this.ok('Todos los datos de combustible han sido borrados correctamente. Puedes comenzar de nuevo.');
  }

  async deleteEntry(entryId: string): Promise<string> {
    const entryToDelete = this.entries.find(e => e.id === entryId);
    if (!entryToDelete) {
      return this.fail('No se encontró el registro a eliminar.');
    }

    if (entryToDelete.type === 'baseline' && this.entries.length > 1) {
      return this.fail('No puedes eliminar el registro baseline mientras tengas otras tanqueadas registradas. Usa "Borrar todos los datos" para comenzar de nuevo.');
    }

    this.entries = this.entries.filter(e => e.id !== entryId);
    await saveEntries(this.entries);

    const entryType = entryToDelete.type === 'baseline' ? 'Primera tanqueada' : 'Tanqueada';
    const entryDetails = entryToDelete.type === 'baseline' 
      ? `Velocímetro: ${entryToDelete.odometerKm} kilómetros`
      : `Valor: ${safeCurrency(entryToDelete.amountCOP)} | Velocímetro: ${entryToDelete.odometerKm} kilómetros`;
    
    await appendEmergencyJournal(`🗑️ ${entryType} eliminada — ${entryDetails}`);

    return this.ok(`${entryType} eliminada correctamente.`);
  }
}

// -------------------------
// Componente de pantalla (UI)
// -------------------------
const FuelStatsBotScreen = () => {
  const navigation = useNavigation<Nav>();
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const [showQuickModal, setShowQuickModal] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [showFirstFillModal, setShowFirstFillModal] = useState(false);
  const [showLastFillModal, setShowLastFillModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showClearDataModal, setShowClearDataModal] = useState(false);

  const [newPrice, setNewPrice] = useState('');
  const [firstOdo, setFirstOdo] = useState('');
  const [lastAmount, setLastAmount] = useState('');
  const [lastPrice, setLastPrice] = useState('');
  const [lastOdo, setLastOdo] = useState('');
  const [reportCount, setReportCount] = useState<number>(1);

  const [keyboardOffset] = useState(new Animated.Value(0));
  const flatListRef = useRef<FlatList>(null);
  const agentRef = useRef(new FuelAgent());

  const refreshFromAgent = () => {
    const p = agentRef.current.getPrice();
    setLastPrice(String(p));
  };

  useEffect(() => {
    (async () => {
      await agentRef.current.init();
      refreshFromAgent();

      const welcome: MessageType = {
        id: Date.now().toString(),
        text:
          '¡Hola! 👋 Soy tu asistente de consumo de combustible.\n\n' +
          'Aquí puedes:\n' +
          '• Ver o cambiar el precio por galón\n' +
          '• Registrar tu primer dato y última tanqueada\n' +
          '• Generar reportes por las últimas N tanqueadas\n' +
          '• Ver un resumen general\n' +
          '• Borrar registros individuales o todos los datos',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages([welcome]);

      setTimeout(() => {
        try {
          Speech.speak(
            'Hola. Soy tu asistente de combustible. Abre Acciones rápidas para comenzar.',
            { language: 'es-ES', rate: 0.9 }
          );
        } catch {}
      }, 300);
    })();

    const sub = DeviceEventEmitter.addListener('fuel:entries:updated', async () => {
      await agentRef.current.init();
      refreshFromAgent();
    });

    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        Animated.timing(keyboardOffset, {
          duration: 300,
          toValue: -e.endCoordinates.height / 2,
          useNativeDriver: true,
        }).start();
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        Animated.timing(keyboardOffset, {
          duration: 300,
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    );

    return () => {
      sub.remove();
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  useEffect(() => {
    if (messages.length && flatListRef.current) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 80);
    }
  }, [messages]);

  const pushBot = (text: string, entryId?: string, isDeletable: boolean = false) => {
    const expandedText = expandAbbreviations(text);
    setMessages(prev => [
      ...prev,
      { 
        id: (Date.now() + 1).toString(), 
        text: expandedText, 
        sender: 'bot', 
        timestamp: new Date(),
        entryId,
        isDeletable
      },
    ]);
  };

  const handleSend = async (txt?: string) => {
    const content = (txt ?? inputText).trim();
    if (!content) return;
    setIsProcessing(true);

    const userMsg: MessageType = { id: Date.now().toString(), text: content, sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    if (!txt) setInputText('');

    const reply = await agentRef.current.handle(content);
    pushBot(reply);
    setIsProcessing(false);
  };

  const handleDeleteEntry = async (entryId: string, messageIndex: number) => {
    Alert.alert(
      'Eliminar Registro',
      '¿Estás seguro de que quieres eliminar este registro?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: async () => {
            setIsProcessing(true);
            
            setMessages(prev => prev.filter((_, index) => index !== messageIndex));
            
            const reply = await agentRef.current.deleteEntry(entryId);
            pushBot(reply);
            
            setIsProcessing(false);
          }
        },
      ]
    );
  };

  const handleSetPrice = async () => {
    const price = parseNumber(newPrice);
    if (price <= 0) {
      Alert.alert('Error', 'Por favor ingresa un precio válido');
      return;
    }
    setIsProcessing(true);
    setShowPriceModal(false);

    setMessages(prev => [
      ...prev,
      { id: Date.now().toString(), text: `Cambiar precio a ${safeCurrency(price)}`, sender: 'user', timestamp: new Date() },
    ]);

    const reply = await agentRef.current.setNewPrice(price);
    refreshFromAgent();
    pushBot(reply);

    setNewPrice('');
    setIsProcessing(false);
  };

  const handleFirstFill = async () => {
    const odo = parseNumber(firstOdo);
    if (!Number.isFinite(odo) || odo <= 0) {
      Alert.alert('Error', 'Por favor ingresa un valor válido para el velocímetro inicial');
      return;
    }
    if (agentRef.current.hasBaseline) {
      Alert.alert('Aviso', 'Ya existe una primera tanqueada registrada.');
      return;
    }

    setIsProcessing(true);
    setShowFirstFillModal(false);

    const userMsg: MessageType = {
      id: Date.now().toString(),
      text: `Primera tanqueada — Velocímetro inicial: ${odo} kilómetros`,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);

    const result = await agentRef.current.addBaseline(odo);
    if (typeof result === 'object' && 'entryId' in result) {
      pushBot(result.message, result.entryId, true);
    } else {
      pushBot(result as string);
    }

    refreshFromAgent();
    setFirstOdo('');
    setIsProcessing(false);
  };

  const handleLastFill = async () => {
    const amount = parseNumber(lastAmount);
    const price = parseNumber(lastPrice);
    const odo = parseNumber(lastOdo);
    if (amount <= 0 || price <= 0 || !Number.isFinite(odo)) {
      Alert.alert('Error', 'Todos los campos son obligatorios y deben ser válidos');
      return;
    }
    if (!agentRef.current.hasBaseline) {
      Alert.alert('Requisito', 'Primero registra el "Primer dato".');
      return;
    }

    setIsProcessing(true);
    setShowLastFillModal(false);

    const userMsg: MessageType = {
      id: Date.now().toString(),
      text: `Última tanqueada — Valor: ${safeCurrency(amount)} | Precio/galón: ${safeCurrency(price)} | Velocímetro: ${odo} kilómetros`,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);

    const result = await agentRef.current.addFillup(amount, price, odo);
    if (typeof result === 'object' && 'entryId' in result) {
      pushBot(result.message, result.entryId, true);
    } else {
      pushBot(result as string);
    }

    refreshFromAgent();
    setLastAmount(''); setLastPrice(String(agentRef.current.getPrice())); setLastOdo('');
    setIsProcessing(false);
  };

  const handleGenerateReportByN = async () => {
    if (reportCount < 1) {
      Alert.alert('Error', 'El reporte necesita al menos 1 tanqueada.');
      return;
    }
    setIsProcessing(true);
    setShowReportModal(false);

    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        text: `Generar informe por últimas ${reportCount} tanqueadas`,
        sender: 'user',
        timestamp: new Date(),
      },
    ]);

    const reply = await agentRef.current.generateReportByLastN(reportCount);
    pushBot(reply);

    setIsProcessing(false);
  };

  const handleClearAllData = async () => {
    setIsProcessing(true);
    setShowClearDataModal(false);

    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        text: `Borrar todos los datos de combustible`,
        sender: 'user',
        timestamp: new Date(),
      },
    ]);

    const reply = await agentRef.current.clearAllData();
    refreshFromAgent();
    pushBot(reply);

    setIsProcessing(false);
  };

  const quickButtons = [
    { icon: 'pricetag', label: 'Ver precio', onPress: () => handleSend('ver precio del galón') },
    { icon: 'create', label: 'Cambiar precio', onPress: () => setShowPriceModal(true) },
    { icon: 'flag', label: 'Primer dato', onPress: () => setShowFirstFillModal(true), disabled: agentRef.current.hasBaseline },
    { icon: 'add-circle', label: 'Última tanqueada', onPress: () => setShowLastFillModal(true) },
    { icon: 'stats-chart', label: 'Resumen', onPress: () => setShowReportModal(true) },
    { icon: 'trash', label: 'Borrar datos', onPress: () => setShowClearDataModal(true) },
  ];

  const CountOption = ({ n }: { n: number }) => (
    <TouchableOpacity
      style={[styles.countChip, reportCount === n && styles.countChipActive]}
      onPress={() => setReportCount(n)}
    >
      <Text style={[styles.countChipText, reportCount === n && styles.countChipTextActive]}>{n}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
       colors={['#000000', '#3A0CA3', '#F72585']}
          locations={[0, 0.6, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.content}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Emergency')}>
              <Ionicons name="arrow-back" size={34} color="white" />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Asistente de Combustible</Text>
            </View>
            <TouchableOpacity style={styles.menuButton} onPress={() => setShowQuickModal(true)}>
              <Ionicons name="flash" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Botón Acciones rápidas */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity style={styles.helpButton} onPress={() => setShowQuickModal(true)} disabled={isProcessing}>
              <LinearGradient
                colors={['#0509f7ff', '#05d4fdff', '#0509f7ff']}
                start={{ x: 0, y: 0.2 }}
                end={{ x: 1, y: 1 }}
                style={styles.buttonGradient}
              >
                <Ionicons name="flash" size={22} color="white" />
                <Text style={styles.actionButtonText}>  Acciones rápidas</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Chat */}
        <View style={styles.chatContainer}>
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={({ item, index }) => {
              const isUser = item.sender === 'user';
              return (
                <View style={[styles.messageContainer, isUser ? styles.userMessageContainer : styles.botMessageContainer]}>
                  {!isUser && (
                    <View style={styles.botAvatar}>
                      <Image
                        source={require('../../assets/imagen/help2.png')}
                        style={styles.botAvatarImage}
                        resizeMode="contain"
                      />
                    </View>
                  )}
                  <View style={[styles.messageBubble, isUser ? styles.userMessageBubble : styles.botMessageBubble]}>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <Text style={[styles.messageText, isUser ? styles.userMessageText : styles.botMessageText]}>
                        {item.text}
                      </Text>
                      {!isUser && item.isDeletable && item.entryId && (
                        <TouchableOpacity 
                          style={styles.deleteButton}
                          onPress={() => handleDeleteEntry(item.entryId!, index)}
                          disabled={isProcessing}
                        >
                          <Ionicons name="trash-outline" size={16} color="#ff6b6b" />
                        </TouchableOpacity>
                      )}
                    </View>
                    <Text style={[styles.timestamp, isUser ? styles.userTimestamp : styles.botTimestamp]}>
                      {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                  {isUser && (
                    <View style={styles.userAvatar}>
                      <Ionicons name="person" size={20} color="white" />
                    </View>
                  )}
                </View>
              );
            }}
            keyExtractor={(it) => it.id}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/* Estado */}
        {isProcessing && (
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>⛽ Procesando…</Text>
          </View>
        )}

        {/* ===== Modales ===== */}

        {/* Modal Acciones Rápidas */}
        <Modal visible={showQuickModal} animationType="slide" transparent>
          <KeyboardAvoidingView 
            style={styles.modalOverlay} 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <View style={styles.quickModalContainer}>
              <View style={styles.quickHeader}>
                <Text style={styles.quickTitle}>Acciones rápidas</Text>
                <TouchableOpacity onPress={() => setShowQuickModal(false)}>
                  <Ionicons name="close" size={24} color="#6E45E2" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.quickBody} showsVerticalScrollIndicator>
                <Text style={styles.quickInstruction}>
                  Revisa el valor del combustible (<Text style={styles.bold}>Ver precio</Text>) y si no coincide, cámbialo al valor actual (<Text style={styles.bold}>Cambiar precio</Text>).{'\n\n'}
                  Luego ingresa el valor del velocímetro inicial (<Text style={styles.bold}>Primer dato</Text> — importante para estadística) y después registra la siguiente como <Text style={styles.bold}>Última tanqueada</Text> (se requieren al menos dos).{'\n\n'}
                  Finalmente, genera el reporte en <Text style={styles.bold}>Resumen</Text>.{'\n\n'}
                  Si te equivocaste en los datos, puedes <Text style={styles.bold}>Borrar registros individuales</Text> tocando el ícono de basura o <Text style={styles.bold}>Borrar todos los datos</Text> para comenzar de nuevo.
                </Text>

                <View style={styles.quickGrid}>
                  {quickButtons.map((b, idx) => (
                    <TouchableOpacity
                      key={`q-${idx}`}
                      style={[styles.quickButton, b.disabled && styles.quickButtonDisabled]}
                      onPress={() => { setShowQuickModal(false); if (!b.disabled) b.onPress(); }}
                      disabled={b.disabled}
                    >
                      <Ionicons name={b.icon as any} size={20} color="white" />
                      <Text style={styles.quickButtonText}>{b.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* Cambiar precio */}
        <Modal visible={showPriceModal} animationType="slide" transparent>
          <KeyboardAvoidingView 
            style={styles.modalOverlay} 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <Animated.View 
              style={[
                styles.modalContainer,
                { transform: [{ translateY: keyboardOffset }] }
              ]}
            >
              <Text style={styles.modalTitle}>Cambiar Precio del Galón</Text>

              <TextInput
                style={styles.modalInput}
                placeholder="Ingresa el nuevo precio (COP)"
                placeholderTextColor="#999"
                value={newPrice}
                onChangeText={setNewPrice}
                keyboardType="numeric"
              />

              <View style={styles.modalRow}>
                <TouchableOpacity style={styles.btnCancel} onPress={() => setShowPriceModal(false)}>
                  <Text style={styles.btnCancelText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnConfirm} onPress={handleSetPrice}>
                  <Text style={styles.btnConfirmText}>Actualizar</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </KeyboardAvoidingView>
        </Modal>

        {/* Primer dato */}
        <Modal visible={showFirstFillModal} animationType="slide" transparent>
          <KeyboardAvoidingView 
            style={styles.modalOverlay} 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <Animated.View 
              style={[
                styles.modalContainer,
                { transform: [{ translateY: keyboardOffset }] }
              ]}
            >
              <Text style={styles.modalTitle}>Primer Dato - Velocímetro Inicial</Text>
              <Text style={styles.modalHint}>
                ⚠️ OBLIGATORIO: Registra el kilometraje actual de tu vehículo.{'\n\n'}
                💡 IMPORTANTE: Este dato es fundamental para comenzar el control de combustible desde cero y obtener cálculos precisos de rendimiento.{'\n\n'}
                🔒 Solo podrás usar esta opción una vez al iniciar el control.
              </Text>

              <TextInput
                style={styles.modalInput}
                placeholder="Velocímetro actual (kilómetros)"
                placeholderTextColor="#999"
                value={firstOdo}
                onChangeText={setFirstOdo}
                keyboardType="numeric"
                autoFocus={true}
              />

              <View style={styles.modalRow}>
                <TouchableOpacity style={styles.btnCancel} onPress={() => setShowFirstFillModal(false)}>
                  <Text style={styles.btnCancelText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.btnConfirm, agentRef.current.hasBaseline && styles.btnDisabled]}
                  onPress={handleFirstFill}
                  disabled={agentRef.current.hasBaseline}
                >
                  <Text style={styles.btnConfirmText}>Registrar</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </KeyboardAvoidingView>
        </Modal>

        {/* Última tanqueada */}
        <Modal visible={showLastFillModal} animationType="slide" transparent>
          <KeyboardAvoidingView 
            style={styles.modalOverlay} 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <Animated.View 
              style={[
                styles.modalContainer,
                { transform: [{ translateY: keyboardOffset }] }
              ]}
            >
              <Text style={styles.modalTitle}>Última tanqueada</Text>
              <Text style={styles.modalHint}>Valor obligatorio: precio por galón, valor de tanqueada y velocímetro actual.</Text>

              <TextInput
                style={styles.modalInput}
                placeholder="Valor tanqueada (COP)"
                placeholderTextColor="#999"
                value={lastAmount}
                onChangeText={setLastAmount}
                keyboardType="numeric"
              />
              <TextInput
                style={styles.modalInput}
                placeholder="Precio por galón (COP)"
                placeholderTextColor="#999"
                value={lastPrice}
                onChangeText={setLastPrice}
                keyboardType="numeric"
              />
              <TextInput
                style={styles.modalInput}
                placeholder="Velocímetro actual (kilómetros)"
                placeholderTextColor="#999"
                value={lastOdo}
                onChangeText={setLastOdo}
                keyboardType="numeric"
              />

              <View style={styles.modalRow}>
                <TouchableOpacity style={styles.btnCancel} onPress={() => setShowLastFillModal(false)}>
                  <Text style={styles.btnCancelText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnConfirm} onPress={handleLastFill}>
                  <Text style={styles.btnConfirmText}>Registrar</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </KeyboardAvoidingView>
        </Modal>

        {/* Reporte */}
        <Modal visible={showReportModal} animationType="slide" transparent>
          <KeyboardAvoidingView 
            style={styles.modalOverlay} 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <Animated.View 
              style={[
                styles.modalContainer,
                { transform: [{ translateY: keyboardOffset }] }
              ]}
            >
              <Text style={styles.modalTitle}>Generar reporte</Text>
              <Text style={styles.modalHint}>
                Elige cuántas últimas tanqueadas considerar.{'\n'}
                • 1 tanqueada: cálculo desde el velocímetro inicial{'\n'}
                • 2+ tanqueadas: cálculo entre tanqueadas consecutivas
              </Text>

              <View style={styles.countRow}>
                {[1,2,3,4,5,6,7,8,9,10].map(n => <CountOption key={n} n={n} />)}
              </View>

              <View style={styles.modalRow}>
                <TouchableOpacity style={styles.btnCancel} onPress={() => setShowReportModal(false)}>
                  <Text style={styles.btnCancelText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnConfirm} onPress={handleGenerateReportByN}>
                  <Text style={styles.btnConfirmText}>Generar reporte</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </KeyboardAvoidingView>
        </Modal>

        {/* Borrar todos los datos */}
        <Modal visible={showClearDataModal} animationType="slide" transparent>
          <KeyboardAvoidingView 
            style={styles.modalOverlay} 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <Animated.View 
              style={[
                styles.modalContainer,
                { transform: [{ translateY: keyboardOffset }] }
              ]}
            >
              <Text style={styles.modalTitle}>⚠️ Borrar Todos los Datos</Text>
              <Text style={styles.modalHint}>
                ¿Estás seguro de que quieres borrar todos los datos de combustible?{'\n\n'}
                🔥 Esta acción no se puede deshacer.{'\n\n'}
                Se eliminarán:{'\n'}
                • Todos los registros de tanqueadas{'\n'}
                • El velocímetro inicial{'\n'}
                • Los datos de rendimiento{'\n\n'}
                El precio del galón se mantendrá.
              </Text>

              <View style={styles.modalRow}>
                <TouchableOpacity style={styles.btnCancel} onPress={() => setShowClearDataModal(false)}>
                  <Text style={styles.btnCancelText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.btnConfirm, styles.btnDanger]} 
                  onPress={handleClearAllData}
                >
                  <Ionicons name="trash" size={18} color="white" />
                  <Text style={styles.btnConfirmText}>  Borrar Todo</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </KeyboardAvoidingView>
        </Modal>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default FuelStatsBotScreen;