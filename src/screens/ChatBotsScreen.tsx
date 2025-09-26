// screens/ChatBotsScreen.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from './ChatBotsScreen.styles';

// -------------------------
// Tipos de navegación
// -------------------------
type RootStackParamList = {
  Welcome: undefined;
  Todo: undefined;
  Daily: undefined;
  General: undefined;
  Preventive: undefined;
  Emergency: undefined;
  Profile: undefined;
  Route: undefined;
  Agenda: undefined;
  ChatBotsScreen: undefined;
  IAScreen: undefined;
};

type ChatBotsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ChatBotsScreen'
>;

// -------------------------
// Tipos de Mensajes
// -------------------------
type MessageType = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
};

// -------------------------
// Estado compartido de pantallas
// -------------------------
type DocumentsExpiryType = {
  soat?: string;
  tecnico?: string;
  picoPlacaDay?: string;
};

type ScreenState = {
  Daily?: {
    appointments?: any[];
    total?: number;
    nextAppointment?: any;
  };
  Agenda?: {
    appointments?: any[];
    total?: number;
    today?: number;
    upcoming?: number;
  };
  General?: {
    services?: string[];
    lastService?: string;
    nextService?: string;
  };
  Preventive?: {
    tasks?: { id: string; description: string; dueDate: string; completed: boolean }[];
    totalTasks?: number;
    completed?: number;
    nextDue?: any;
  };
  Emergency?: {
    contacts?: string[];
    emergencyProtocol?: string;
  };
  Profile?: {
    name?: string;
    documents?: string[];
    documentsStatus?: string;
    documentsExpiry?: DocumentsExpiryType;
  };
  Route?: {
    routes?: string[];
    favorite?: string;
    totalDistance?: string;
  };
};

// -------------------------
// Utilidades de fechas (ES)
// -------------------------
const ES_MONTHS = [
  'enero','febrero','marzo','abril','mayo','junio',
  'julio','agosto','septiembre','octubre','noviembre','diciembre'
];
const ES_DAYS = [
  'domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'
];
const pad2 = (n: number) => String(n).padStart(2, '0');
const formatDateEs = (d: Date) =>
  `${d.getDate()} de ${ES_MONTHS[d.getMonth()]} de ${d.getFullYear()}`;
const formatDateShortEs = (d: Date) =>
  `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();
const toDate = (x: string | Date | undefined): Date | null => {
  if (!x) return null;
  if (x instanceof Date) return x;
  const d = new Date(x);
  return isNaN(d.getTime()) ? null : d;
};

// Parseo flexible de fechas (hoy/mañana/pasado, DD/MM/YYYY, YYYY-MM-DD, "15 de octubre (2025)")
function parseDateFromText(text: string): Date | null {
  const t = text.toLowerCase().trim();

  if (/\bhoy\b/.test(t)) return new Date();
  if (/\bmañana\b/.test(t)) { const d = new Date(); d.setDate(d.getDate() + 1); return d; }
  if (/\bpasado\s+mañana\b/.test(t)) { const d = new Date(); d.setDate(d.getDate() + 2); return d; }

  // Días de la semana
  for (let i = 0; i < ES_DAYS.length; i++) {
    const day = ES_DAYS[i];
    if (t.includes(day)) {
      const today = new Date().getDay();
      const diff = (i - today + 7) % 7;
      const d = new Date();
      d.setDate(d.getDate() + diff);
      return d;
    }
  }

  const m1 = t.match(/\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})\b/);
  if (m1) {
    const dd = parseInt(m1[1], 10);
    const mm = parseInt(m1[2], 10) - 1;
    const yyyy = parseInt(m1[3], 10);
    const d = new Date(yyyy, mm, dd);
    if (!isNaN(d.getTime())) return d;
  }

  const m2 = t.match(/\b(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})\b/);
  if (m2) {
    const yyyy = parseInt(m2[1], 10);
    const mm = parseInt(m2[2], 10) - 1;
    const dd = parseInt(m2[3], 10);
    const d = new Date(yyyy, mm, dd);
    if (!isNaN(d.getTime())) return d;
  }

  const monthRegex = ES_MONTHS.join('|');
  const m3 = t.match(new RegExp(`\\b(\\d{1,2})\\s+de\\s+(${monthRegex})(?:\\s+de\\s+(\\d{4}))?\\b`, 'i'));
  if (m3) {
    const dd = parseInt(m3[1], 10);
    const monthName = m3[2].toLowerCase();
    const yyyy = m3[3] ? parseInt(m3[3], 10) : new Date().getFullYear();
    const mm = ES_MONTHS.indexOf(monthName);
    if (mm >= 0) {
      const d = new Date(yyyy, mm, dd);
      if (!isNaN(d.getTime())) return d;
    }
  }
  return null;
}

// -------------------------
// Sanitización MEJORADA para voz (no leer iconos/emojis/bullets)
// -------------------------
function stripForSpeech(s: string): string {
  if (!s) return '';
  
  // Eliminar todos los emojis y símbolos Unicode
  let cleanText = s.replace(
    /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}]/gu,
    ''
  );
  
  // Eliminar caracteres de formato, bullets y markdown
  cleanText = cleanText
    .replace(/[•◆►▪︎▪■□–—\-*_#`~]/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
  
  // Eliminar texto entre corchetes (como [object Object])
  cleanText = cleanText.replace(/\[.*?\]/g, '');
  
  // Eliminar URLs
  cleanText = cleanText.replace(/https?:\/\/\S+/g, '');
  
  // Eliminar cualquier otro carácter especial que no sea alfanumérico o puntuación básica
  cleanText = cleanText.replace(/[^\w\sáéíóúñÁÉÍÓÚÑ.,!?;:()'-]/g, ' ');
  
  // Normalizar espacios múltiples
  cleanText = cleanText.replace(/\s+/g, ' ').trim();
  
  return cleanText;
}

// -------------------------
// Agente Inteligente mejorado (usa datos reales de AsyncStorage)
// -------------------------
class IntelligentAgent {
  private screenStates: ScreenState = {};
  private appHistory: Array<{ id: string; action: string; screen: string; data: any; timestamp: string }> = [];
  private lastResponses: string[] = [];
  private readonly MAX_HISTORY = 5;

  async refreshFromStorage() {
    try {
      const ss = await AsyncStorage.getItem('@screen_states');
      if (ss) this.screenStates = JSON.parse(ss);

      // Hidratar Profile desde @tabData si faltan expiraciones
      if (!this.screenStates.Profile?.documentsExpiry) {
        const td = await AsyncStorage.getItem('@tabData');
        if (td) {
          const { soat, tecnico, picoyplaca } = JSON.parse(td || '{}');
          
          // SOLUCIÓN: Tipo explícito para evitar el error
          const exp: DocumentsExpiryType = {};
          
          const parseLoose = (v?: string) => {
            if (!v) return undefined;
            const d = parseDateFromText(v);
            return d ? new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())).toISOString() : undefined;
          };
          
          exp.soat = parseLoose(soat);
          exp.tecnico = parseLoose(tecnico);
          exp.picoPlacaDay = picoyplaca || undefined;

          const prof = this.screenStates.Profile || { documents: [] };
          prof.documentsExpiry = { ...prof.documentsExpiry, ...exp };
          if (!prof.documents) prof.documents = ['SOAT', 'Técnico Mecánica'];
          this.screenStates.Profile = prof;
        }
      }

      const ah = await AsyncStorage.getItem('@app_history');
      if (ah) this.appHistory = JSON.parse(ah);
    } catch (error) {
      console.error('Error refreshing from storage:', error);
    }
  }

  private bullets(lines: string[]) {
    return lines.filter(Boolean).map(l => `• ${l}`).join('\n');
  }

  private isSimilarResponse(newResponse: string): boolean {
    if (this.lastResponses.length === 0) return false;
    
    const normalizedNew = newResponse.toLowerCase().replace(/\s+/g, ' ');
    
    return this.lastResponses.some(prev => {
      const normalizedPrev = prev.toLowerCase().replace(/\s+/g, ' ');
      // Comprobar si son respuestas similares (más del 70% de similitud)
      const similarity = this.calculateSimilarity(normalizedNew, normalizedPrev);
      return similarity > 0.7;
    });
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const words1 = str1.split(' ');
    const words2 = str2.split(' ');
    
    const commonWords = words1.filter(word => words2.includes(word));
    return commonWords.length / Math.max(words1.length, words2.length);
  }

  private addToResponseHistory(response: string) {
    this.lastResponses.push(response);
    if (this.lastResponses.length > this.MAX_HISTORY) {
      this.lastResponses.shift();
    }
  }

  private analyze(screen: keyof ScreenState) {
    const st: any = this.screenStates[screen] || {};
    switch (screen) {
      case 'Daily': {
        const apps = (st.appointments || []).map((a: any) => ({ ...a, date: toDate(a.date) }));
        const today = new Date();
        const total = apps.length;
        const todayCount = apps.filter((a: any) => a.date && sameDay(a.date, today)).length;
        const upcoming = apps.filter((a: any) => a.date && a.date > today).length;
        return {
          status: todayCount ? 'Citas hoy' : total ? 'Con citas' : 'Sin citas',
          details: `Daily: ${total} en total, ${todayCount} hoy, ${upcoming} próximas.`,
          bullets: apps.slice(0, 3).map((a: any) =>
            `${a.title} — ${a.date ? formatDateEs(a.date) : 'N/D'}`
          ),
        };
      }
      case 'Agenda': {
        const apps = (st.appointments || []).map((a: any) => ({ ...a, date: toDate(a.date) }));
        const completed = apps.filter((a: any) => a.completed).length;
        const pending = apps.length - completed;
        return {
          status: pending ? 'Pendientes' : apps.length ? 'Todo completado' : 'Vacía',
          details: `Agenda: ${apps.length} en total, ${completed} completadas, ${pending} pendientes.`,
          bullets: apps.slice(0, 3).map((a: any) =>
            `${a.title} — ${a.date ? formatDateEs(a.date) : 'N/D'}`
          ),
        };
      }
      case 'General': {
        const services = st.services || [];
        return {
          status: services.length ? 'Configurado' : 'No configurado',
          details: `General: ${services.length} servicios. Último: ${st.lastService || 'N/D'}.`,
          bullets: services.slice(0, 3).map((s: string) => s),
        };
      }
      case 'Preventive': {
        const tasks = st?.tasks ?? [];
        const completed = st?.completed ?? tasks.filter((t: any) => t.completed).length;
        const overdue = tasks.filter((t: any) => {
          const dueDate = toDate(t.dueDate);
          return dueDate && dueDate < new Date() && !t.completed;
        }).length;
        return {
          status: overdue ? 'Con tareas vencidas' : tasks.length ? 'En progreso' : 'No configurado',
          details: `Preventivo: ${tasks.length} tareas, ${completed} completadas, ${overdue} vencidas.`,
          bullets: tasks.slice(0, 3).map(
            (t: any) => `${t.description} — vence ${formatDateEs(new Date(t.dueDate))}`
          ),
        };
      }
      case 'Emergency': {
        const c = st?.contacts ?? [];
        return {
          status: c.length ? 'Protegido' : 'Crítico',
          details: `Emergencia: ${c.length} contactos.`,
          bullets: c.slice(0, 3).map((x: string) => x),
        };
      }
      case 'Profile': {
        const docs = st?.documents ?? [];
        const exp = st?.documentsExpiry ?? {};
        const today = new Date();
        
        // Verificar vencimientos próximos (30 días)
        const soatExpiry = exp.soat ? toDate(exp.soat) : null;
        const tecExpiry = exp.tecnico ? toDate(exp.tecnico) : null;
        
        const daysUntilSoat = soatExpiry ? Math.ceil((soatExpiry.getTime() - today.getTime()) / (1000 * 3600 * 24)) : null;
        const daysUntilTec = tecExpiry ? Math.ceil((tecExpiry.getTime() - today.getTime()) / (1000 * 3600 * 24)) : null;
        
        let status = docs.length ? 'Perfil cargado' : 'Incompleto';
        if ((daysUntilSoat !== null && daysUntilSoat <= 30) || (daysUntilTec !== null && daysUntilTec <= 30)) {
          status = 'Vencimientos próximos';
        }
        if ((daysUntilSoat !== null && daysUntilSoat <= 0) || (daysUntilTec !== null && daysUntilTec <= 0)) {
          status = 'Documentos vencidos';
        }
        
        return {
          status,
          details: `Perfil: ${st?.name || 'N/D'}. Documentos: ${docs.length}. Estado: ${st?.documentsStatus || 'N/D'}.`,
          bullets: [
            exp.soat ? `SOAT vence: ${formatDateEs(new Date(exp.soat))}${daysUntilSoat !== null ? ` (${daysUntilSoat} días)` : ''}` : 'SOAT: N/D',
            exp.tecnico ? `Técnico vence: ${formatDateEs(new Date(exp.tecnico))}${daysUntilTec !== null ? ` (${daysUntilTec} días)` : ''}` : 'Técnico: N/D',
            exp.picoPlacaDay ? `Pico y Placa: ${exp.picoPlacaDay}` : 'Pico y Placa: N/D',
          ],
        };
      }
      case 'Route': {
        const r = st?.routes ?? [];
        return {
          status: r.length ? 'Configurado' : 'Vacío',
          details: `Rutas: ${r.length}. Favorita: ${st?.favorite || 'N/D'}.`,
          bullets: r.slice(0, 3).map((x: string) => x),
        };
      }
      default:
        return { status: 'Desconocido', details: 'Pantalla no reconocida', bullets: [] as string[] };
    }
  }

  private respondForDate(screen: keyof ScreenState, date: Date): string {
    const st: any = this.screenStates[screen] || {};
    const dStr = formatDateEs(date);

    if (screen === 'Daily' || screen === 'Agenda') {
      const apps = (st.appointments || []).map((a: any) => ({ ...a, date: toDate(a.date) }));
      const sameDayApps = apps.filter((a: any) => a.date && sameDay(a.date as Date, date));
      if (!sameDayApps.length) return `No encuentro eventos en ${screen} para ${dStr}.`;

      const lines = sameDayApps.map((a: any) =>
        `• ${a.title}${a.description ? ` — ${a.description}` : ''}`
      );
      return `${screen} — ${dStr}:\n${lines.join('\n')}`;
    }

    if (screen === 'Preventive') {
      const tasks = st.tasks || [];
      const hits = tasks.filter((t: any) => sameDay(new Date(t.dueDate), date));
      if (!hits.length) return `Sin tareas preventivas que venzan el ${dStr}.`;
      return `Tareas preventivas con vencimiento ${dStr}:\n${this.bullets(hits.map((h: any) => h.description))}`;
    }

    if (screen === 'Profile') {
      const exp = st.documentsExpiry || {};
      const hitSoat = exp.soat && sameDay(new Date(exp.soat), date);
      const hitTec = exp.tecnico && sameDay(new Date(exp.tecnico), date);
      const matches: string[] = [];
      if (hitSoat) matches.push('SOAT');
      if (hitTec) matches.push('Técnico Mecánica');
      if (!matches.length) return `No veo vencimientos de Perfil para ${dStr}.`;
      return `Vencimientos en Perfil para ${dStr}:\n${this.bullets(matches)}`;
    }

    return `Para ${screen} no tengo datos filtrables por fecha (${dStr}).`;
  }

  private getContextSummary(): string {
    const keys: (keyof ScreenState)[] = ['Daily','Agenda','General','Preventive','Emergency','Profile','Route'];
    const lines: string[] = [];
    let alerts = 0;

    for (const k of keys) {
      const a = this.analyze(k);
      lines.push(`• ${k}: ${a.status} — ${a.details}`);
      if (/Crítico|Incompleto|Pendiente|Vencimientos próximos|Documentos vencidos|Con tareas vencidas/i.test(a.status)) alerts++;
    }

    const recent = this.appHistory.slice(-3).reverse();
    const extras = recent.length
      ? '\n\nAcciones recientes:\n' + recent.map(r => `• ${r.action}`).join('\n')
      : '';

    const tail = alerts
      ? `\n\n⚠️ Tienes ${alerts} área(s) que requieren atención.`
      : `\n\n✅ Todo en orden.`;

    return `Resumen de tu aplicación:\n${lines.join('\n')}${tail}${extras}`;
  }

  private respondProfileStatus(): string {
    const st = this.screenStates.Profile;
    if (!st?.documents?.length && !st?.documentsExpiry) {
      return 'Perfil incompleto: no encuentro documentos. Sube licencia, SOAT y tecnomecánica.';
    }
    const exp = st?.documentsExpiry || {};
    const fmt = (iso?: string) => (iso ? formatDateEs(new Date(iso)) : 'N/D');
    
    const today = new Date();
    const soatExpiry = exp.soat ? toDate(exp.soat) : null;
    const tecExpiry = exp.tecnico ? toDate(exp.tecnico) : null;
    
    const daysUntilSoat = soatExpiry ? Math.ceil((soatExpiry.getTime() - today.getTime()) / (1000 * 3600 * 24)) : null;
    const daysUntilTec = tecExpiry ? Math.ceil((tecExpiry.getTime() - today.getTime()) / (1000 * 3600 * 24)) : null;
    
    let warnings = '';
    if (daysUntilSoat !== null && daysUntilSoat <= 30) {
      warnings += `\n⚠️ SOAT vence en ${daysUntilSoat} días`;
    }
    if (daysUntilTec !== null && daysUntilTec <= 30) {
      warnings += `\n⚠️ Técnico Mecánica vence en ${daysUntilTec} días`;
    }

    const extras = [
      `SOAT: ${fmt(exp.soat)}${daysUntilSoat !== null ? ` (${daysUntilSoat} días)` : ''}`,
      `Técnico Mecánica: ${fmt(exp.tecnico)}${daysUntilTec !== null ? ` (${daysUntilTec} días)` : ''}`,
      `Pico y Placa: ${exp.picoPlacaDay || 'N/D'}`,
    ].join('\n');

    return `Perfil:
${this.bullets([
  `Documentos: ${st?.documents?.length || 0}`,
  `Estado docs: ${st?.documentsStatus || 'N/D'}`,
])}
${extras}${warnings}
¿Abrimos "Profile" para actualizar?`;
  }

  async answer(userMessage: string): Promise<string> {
    const text = userMessage.trim();
    const low = text.toLowerCase();

    // Vencimientos directos
    if (/(vence|vencen|vencimiento|soat|tecnomec|técnico|pico\s*y\s*placa)/i.test(low)) {
      const response = this.respondProfileStatus();
      this.addToResponseHistory(response);
      return response;
    }

    // Fecha + pantalla
    const date = parseDateFromText(low);
    const map: Record<string, keyof ScreenState> = {
      daily: 'Daily',
      agenda: 'Agenda',
      calendario: 'Agenda',
      general: 'General',
      preventivo: 'Preventive',
      preventiva: 'Preventive',
      emergencia: 'Emergency',
      profile: 'Profile',
      perfil: 'Profile',
      ruta: 'Route',
      rutas: 'Route',
    };
    const mentioned: (keyof ScreenState)[] = [];
    Object.entries(map).forEach(([k, v]) => {
      if (low.includes(k)) mentioned.push(v);
    });

    if (date && mentioned.length) {
      const response = this.respondForDate(mentioned[0], date);
      this.addToResponseHistory(response);
      return response;
    }

    // Solo pantalla
    if (mentioned.length) {
      const blocks = mentioned.map(sc => {
        const a = this.analyze(sc);
        const blk = a.bullets?.length ? `\n${this.bullets(a.bullets)}` : '';
        return `📋 ${sc}: ${a.details}${blk}`;
      });
      const response = blocks.join('\n\n');
      this.addToResponseHistory(response);
      return response;
    }

    // Saludo / ayuda / resumen
    if (/(^|\s)(hola|buenas|saludos)(\s|$)/i.test(low)) {
      const response = `¡Hola! 👋 Estoy conectado a tus pantallas.\n\n${this.getContextSummary()}\n\n¿Sobre qué quieres saber más?`;
      this.addToResponseHistory(response);
      return response;
    }
    if (/ayuda|qué puedes|como me puedes ayudar/i.test(low)) {
      const response = `Puedo:\n• Resumir tu app\n• Responder por fecha (hoy/mañana/DD/MM/"15 de octubre")\n• Decirte vencimientos (SOAT/Técnico/Pico y Placa)\n• Ver tareas preventivas por día\n• Analizar General, Emergency, Profile y Route\n\n¿Qué necesitas?`;
      this.addToResponseHistory(response);
      return response;
    }
    if (/resumen|estado|cómo va|como va/i.test(low)) {
      const response = this.getContextSummary();
      this.addToResponseHistory(response);
      return response;
    }

    // Por defecto - evitar respuestas repetidas
    const defaultResponse = `Entiendo: "${text}".\n\n${this.getContextSummary()}\n\nTambién puedes preguntar por fecha y pantalla, p. ej.: "Daily 15/10/2025" o "Agenda del 3 de noviembre".`;
    
    if (this.isSimilarResponse(defaultResponse)) {
      return "Ya te he proporcionado esta información recientemente. ¿Hay algo específico en lo que pueda ayudarte? Por ejemplo, puedes preguntarme sobre:\n• Vencimientos de documentos\n• Citas para una fecha específica\n• Tareas pendientes\n• Contactos de emergencia";
    }
    
    this.addToResponseHistory(defaultResponse);
    return defaultResponse;
  }

  speak(text: string) {
    const sanitized = stripForSpeech(text);
    try {
      Speech.stop(); // Detener cualquier speech anterior
      Speech.speak(sanitized, { language: 'es-ES', pitch: 1.0, rate: 0.9 });
    } catch (error) {
      console.error('Error en speech:', error);
    }
  }
}

// -------------------------
// Componente de pantalla
// -------------------------
const ChatBotsScreen = () => {
  const navigation = useNavigation<ChatBotsScreenNavigationProp>();
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [inputText, setInputText] = useState('');
  const [showFrequent, setShowFrequent] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const agentRef = useRef(new IntelligentAgent());

  // Carga inicial + saludo
  useEffect(() => {
    (async () => {
      await agentRef.current.refreshFromStorage();

      const welcome: MessageType = {
        id: Date.now().toString(),
        text:
          '¡Hola! 👋 Soy tu asistente inteligente.\n\nLeo tus pantallas en tiempo real, puedo responder por **fechas** y revisar **vencimientos**.\n\nDime en qué te ayudo.',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages([welcome]);

      setTimeout(() => agentRef.current.speak('¡Hola! Soy tu asistente inteligente. ¿En qué te ayudo?'), 350);
    })();
  }, []);

  // Refrescar contexto cada vez que la pantalla recupera foco
  useFocusEffect(
    useCallback(() => {
      agentRef.current.refreshFromStorage();
      return () => {};
    }, [])
  );

  // Auto scroll
  useEffect(() => {
    if (messages.length && flatListRef.current) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 80);
    }
  }, [messages]);

  const sendMessage = async () => {
    const txt = inputText.trim();
    if (!txt) return;

    setShowFrequent(false);
    setIsProcessing(true);

    const userMsg: MessageType = {
      id: Date.now().toString(),
      text: txt,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    await agentRef.current.refreshFromStorage();
    const reply = await agentRef.current.answer(txt);

    const botMsg: MessageType = {
      id: (Date.now() + 1).toString(),
      text: reply,
      sender: 'bot',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, botMsg]);
    agentRef.current.speak(reply);
    setIsProcessing(false);
  };

  // Preguntas frecuentes mejoradas
  const frequentQuestions: Array<{ title: string; qs: string[] }> = [
    {
      title: '📅 Agenda y Citas',
      qs: [
        '¿Qué citas tengo hoy en Daily?',
        'Agenda del 15/10/2025',
        'Daily mañana',
        '¿Qué hay en mi calendario esta semana?',
        'Próximas citas',
      ],
    },
    {
      title: '📄 Vencimientos de Documentos',
      qs: [
        '¿Cuándo vence el SOAT?',
        'Vencimiento Técnico Mecánica',
        '¿Qué día tengo Pico y Placa?',
        'Estado de mis documentos',
        '¿Tengo documentos próximos a vencer?',
      ],
    },
    {
      title: '🔧 Mantenimiento Preventivo',
      qs: [
        'Tareas preventivas hoy',
        'Tareas que vencen el 20/12/2025',
        'Resumen de mantenimiento preventivo',
        '¿Hay tareas vencidas?',
        'Próximos mantenimientos',
      ],
    },
    {
      title: '🚨 Emergencia y Contactos',
      qs: [
        'Contactos de emergencia',
        'Protocolo de emergencia',
        '¿Quién está en mis contactos de emergencia?',
      ],
    },
    {
      title: '👤 Perfil y Configuración',
      qs: [
        'Resumen de mi perfil',
        'Estado de mis documentos',
        'Mis rutas guardadas',
        'Servicios configurados',
      ],
    },
    {
      title: '🛣️ Rutas y Navegación',
      qs: [
        'Rutas guardadas',
        'Ruta favorita',
        'Distancia total de mis rutas',
      ],
    },
  ];

  const renderMessage = ({ item }: { item: MessageType }) => {
    const isUser = item.sender === 'user';
    return (
      <View
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.botMessageContainer,
        ]}
      >
        {!isUser && (
          <View style={styles.botAvatar}>
            <Image
              source={require('../../assets/imagen/help2.png')}
              style={styles.botAvatarImage}
              resizeMode="contain"
            />
          </View>
        )}

        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userMessageBubble : styles.botMessageBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isUser ? styles.userMessageText : styles.botMessageText,
            ]}
          >
            {item.text}
          </Text>
          <Text
            style={[
              styles.timestamp,
              isUser ? styles.userTimestamp : styles.botTimestamp,
            ]}
          >
            {item.timestamp.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>

        {isUser && (
          <View style={styles.userAvatar}>
            <Ionicons name="person" size={20} color="white" />
          </View>
        )}
      </View>
    );
  };

  const selectQuick = (q: string) => {
    setInputText(q);
    setShowFrequent(false);
    setTimeout(() => sendMessage(), 100);
  };

  const goToIA = () => {
    try {
      // @ts-ignore
      navigation.navigate({ name: 'IA' });
    } catch {
      // fallback
      navigation.navigate('IAScreen' as any);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#020479ff', '#0eb9e3', '#58fd03']}
        start={{ x: 0, y: 0.2 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('Todo')}
          >
            <Ionicons name="arrow-back" size={34} color="white" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Asistente Inteligente</Text>
          </View>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() =>
              Alert.alert(
                '🧠 Asistente Inteligente',
                'Pregúntame por pantallas, por fecha (hoy/mañana/DD/MM/YYYY/"15 de octubre"), o por vencimientos (SOAT/Técnico/Pico y Placa).\n\nTambién puedo:\n• Mostrar resumen general\n• Alertar sobre documentos próximos a vencer\n• Revisar tareas pendientes\n• Mostrar contactos de emergencia'
              )
            }
          >
            <Ionicons name="help-circle" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Chat */}
        <View style={styles.chatContainer}>
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(it) => it.id}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/* Estado */}
        {isProcessing && (
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>🧠 Analizando contexto...</Text>
          </View>
        )}

        {/* Acciones */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={styles.helpButton}
            onPress={goToIA}
            disabled={isProcessing}
          >
            <LinearGradient
              colors={['rgba(128, 0, 255, 1)', '#0eb9e3', '#8003fdff']}
              start={{ x: 0, y: 0.2 }}
              end={{ x: 1, y: 1 }}
              style={styles.buttonGradient}
            >
              <Ionicons name="hardware-chip" size={22} color="white" />
              <Text style={styles.actionButtonText}>  IA Avanzada</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.helpButton}
            onPress={() => setShowFrequent((s) => !s)}
            disabled={isProcessing}
          >
            <LinearGradient
              colors={['#0509f7ff', '#0eb9e3', '#0509f7ff']}
              start={{ x: 0, y: 0.2 }}
              end={{ x: 1, y: 1 }}
              style={styles.buttonGradient}
            >
              <Ionicons name="help-circle" size={22} color="white" />
              <Text style={styles.actionButtonText}>  Preguntas Frecuentes</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Panel Preguntas Frecuentes */}
        {showFrequent && (
          <View style={styles.questionsPanel}>
            <View style={styles.questionsHeader}>
              <Text style={styles.questionsTitle}>Preguntas Contextuales</Text>
              <TouchableOpacity onPress={() => setShowFrequent(false)}>
                <Ionicons name="close" size={24} color="#6E45E2" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.questionsScroll} showsVerticalScrollIndicator>
              {frequentQuestions.map((cat) => (
                <View key={cat.title} style={styles.questionCategory}>
                  <Text style={styles.categoryTitle}>{cat.title}</Text>
                  {cat.qs.map((q) => (
                    <TouchableOpacity
                      key={q}
                      style={styles.questionButton}
                      onPress={() => selectQuick(q)}
                    >
                      <Text style={styles.questionText}>{q}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Input */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.inputContainer}
        >
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Pregunta… (p. ej. 'Daily 15/10/2025', '¿Cuándo vence el SOAT?')"
              placeholderTextColor="#999"
              multiline
              maxLength={500}
              onSubmitEditing={sendMessage}
              editable={!isProcessing}
            />
            <TouchableOpacity
              style={[styles.sendButton, (!inputText || isProcessing) && styles.sendButtonDisabled]}
              onPress={sendMessage}
              disabled={!inputText || isProcessing}
            >
              <Ionicons name="send" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default ChatBotsScreen;