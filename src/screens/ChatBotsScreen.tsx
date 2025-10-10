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
  StatusBar,
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

type PreventiveTask = {
  id: string;
  description: string;
  dueDate: string;          // ISO o "DD/MM/YYYY"
  completed: boolean;
  completedAt?: string;     // ISO
};

type ScreenState = {
  Daily?: {
    appointments?: Array<{ title: string; description?: string; date: string | Date; completed?: boolean }>;
    total?: number;
    nextAppointment?: any;
  };
  Agenda?: {
    appointments?: Array<{ title: string; description?: string; date: string | Date; completed?: boolean }>;
    total?: number;
    today?: number;
    upcoming?: number;
  };
  General?: {
    services?: string[];
    lastService?: string | null;
  };
  Preventive?: {
    tasks?: PreventiveTask[];
    totalTasks?: number;
    completed?: number;
    nextDue?: any;
  };
  Emergency?: {
    contacts?: string[];
    emergencyProtocol?: string;
    lastEntryAt?: string | null;
    entriesCount?: number;
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
const formatDateEs = (d: Date) =>
  `${d.getDate()} de ${ES_MONTHS[d.getMonth()]} de ${d.getFullYear()}`;
const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();
const toDate = (x: string | Date | undefined): Date | null => {
  if (!x) return null;
  if (x instanceof Date) return x;
  const d = new Date(x);
  if (!isNaN(d.getTime())) return d;
  const m = String(x).match(/\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})\b/);
  if (m) {
    const dd = parseInt(m[1], 10);
    const mm = parseInt(m[2], 10) - 1;
    const yyyy = parseInt(m[3], 10);
    const d2 = new Date(yyyy, mm, dd);
    return isNaN(d2.getTime()) ? null : d2;
  }
  return null;
};

function parseDateFromText(text: string): Date | null {
  const t = text.toLowerCase().trim();

  if (/\bhoy\b/.test(t)) return new Date();
  if (/\bmañana\b/.test(t)) { const d = new Date(); d.setDate(d.getDate() + 1); return d; }
  if (/\bpasado\s+mañana\b/.test(t)) { const d = new Date(); d.setDate(d.getDate() + 2); return d; }

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

function getDateRange(label: 'today'|'tomorrow'|'this-week'|'this-month'|'next-month') {
  const start = new Date(); start.setHours(0,0,0,0);
  let end = new Date(start);

  if (label === 'today') {
    end.setDate(start.getDate() + 1);
    return { start, end, label };
  }
  if (label === 'tomorrow') {
    start.setDate(start.getDate() + 1);
    end = new Date(start); end.setDate(start.getDate() + 1);
    return { start, end, label };
  }
  if (label === 'this-week') {
    const day = start.getDay();
    const diffToMonday = (day === 0 ? -6 : 1 - day);
    start.setDate(start.getDate() + diffToMonday);
    end = new Date(start); end.setDate(start.getDate() + 7);
    return { start, end, label };
  }
  if (label === 'this-month') {
    start.setDate(1);
    end = new Date(start.getFullYear(), start.getMonth() + 1, 1);
    return { start, end, label };
  }
  const firstNext = new Date(start.getFullYear(), start.getMonth() + 1, 1);
  const firstAfter = new Date(start.getFullYear(), start.getMonth() + 2, 1);
  return { start: firstNext, end: firstAfter, label };
}

// -------------------------
// Sanitización para voz
// -------------------------
function stripForSpeech(s: string): string {
  if (!s) return '';
  let cleanText = s.replace(
    /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}]/gu,
    ''
  );
  cleanText = cleanText
    .replace(/[•◆►▪︎▪■□–—\-*_#`~]/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
  cleanText = cleanText.replace(/\[.*?\]/g, '');
  cleanText = cleanText.replace(/https?:\/\/\S+/g, '');
  cleanText = cleanText.replace(/[^\w\sáéíóúñÁÉÍÓÚÑ.,!?;:()'-]/g, ' ');
  cleanText = cleanText.replace(/\s+/g, ' ').trim();
  return cleanText;
}

// -------------------------
// 🔐 Motor de Intenciones
// -------------------------
type DetectedIntent =
  | { screen: 'Preventive'; intent: 'LAST_DONE' }
  | { screen: 'Preventive'; intent: 'NEXT_DUE' }
  | { screen: 'Preventive'; intent: 'OVERDUE' }
  | { screen: 'Preventive'; intent: 'LIST_BY_DATE'; date: Date }
  | { screen: 'Preventive'; intent: 'SUMMARY' }
  | { screen: 'Profile';    intent: 'SOAT_DUE' | 'TEC_DUE' | 'DOCS_STATUS' | 'PICO_PLACA' }
  | { screen: 'Agenda' | 'Daily'; intent: 'LIST_BY_DATE'; date: Date }
  | { screen: 'Agenda' | 'Daily'; intent: 'LIST_RANGE'; start: Date; end: Date; label?: string }
  | { screen: 'Agenda' | 'Daily'; intent: 'SUMMARY' }
  | { screen: 'Preventive' | 'General' | 'Emergency' | 'Route'; intent: 'HISTORY_LAST5' };

type ProfileIntent = Extract<DetectedIntent, { screen: 'Profile' }>;
type PreventiveIntent = Extract<DetectedIntent, { screen: 'Preventive' }>;
type AgendaDailyIntent = Extract<DetectedIntent, { screen: 'Agenda' | 'Daily' }>;
type HistoryIntent = Extract<DetectedIntent, { intent: 'HISTORY_LAST5' }>;

function detectIntent(textRaw: string): DetectedIntent | null {
  const t = textRaw.toLowerCase();

  // Preventive
  if (/preventiv/.test(t)) {
    if (/(últim[oa]s?\s*\d*\s*registros?)|(lo\s+último\s+que\s+registr[ée]?)/.test(t)) {
      return { screen: 'Preventive', intent: 'HISTORY_LAST5' };
    }
    if (/últim|ultimo|último/.test(t) && /manten|servici/.test(t)) {
      return { screen: 'Preventive', intent: 'LAST_DONE' };
    }
    if (/próxim|proxim|siguient|vence|por vencer/.test(t)) {
      return { screen: 'Preventive', intent: 'NEXT_DUE' };
    }
    if (/vencid|atrasad/.test(t)) {
      return { screen: 'Preventive', intent: 'OVERDUE' };
    }
    const d = parseDateFromText(t);
    if (d) return { screen: 'Preventive', intent: 'LIST_BY_DATE', date: d };
    return { screen: 'Preventive', intent: 'SUMMARY' };
  }

  // General
  if (/general/.test(t)) {
    if (/(últim[oa]s?\s*\d*\s*registros?)|(lo\s+último\s+que\s+registr[ée]?)/.test(t)) {
      return { screen: 'General', intent: 'HISTORY_LAST5' };
    }
  }

  // Emergencia
  if (/emergenc/.test(t)) {
    if (/(últim[oa]s?\s*\d*\s*registros?)|(lo\s+último\s+que\s+registr[ée]?)/.test(t)) {
      return { screen: 'Emergency', intent: 'HISTORY_LAST5' };
    }
  }

  // Ruta(s)
  if (/\brutas?\b/.test(t)) {
    if (/(últim[oa]s?\s*\d*\s*registros?)|(lo\s+último\s+que\s+registr[ée]?)/.test(t)) {
      return { screen: 'Route', intent: 'HISTORY_LAST5' };
    }
  }

  // Profile
  if (/soat/.test(t)) return { screen: 'Profile', intent: 'SOAT_DUE' };
  if (/t[eé]cnic|tecnomec/.test(t)) return { screen: 'Profile', intent: 'TEC_DUE' };
  if (/pico\s*y\s*placa|picoyplaca/.test(t)) return { screen: 'Profile', intent: 'PICO_PLACA' };
  if (/document|estado de mis documento/.test(t)) return { screen: 'Profile', intent: 'DOCS_STATUS' };

  // Agenda / Daily
  const agendaRegex = /(agenda|calendari|daily)/;
  if (agendaRegex.test(t)) {
    if (/hoy/.test(t)) {
      const { start, end } = getDateRange('today');
      return { screen: t.includes('daily') ? 'Daily' : 'Agenda', intent: 'LIST_RANGE', start, end, label: 'hoy' };
    }
    if (/mañana/.test(t)) {
      const { start, end } = getDateRange('tomorrow');
      return { screen: t.includes('daily') ? 'Daily' : 'Agenda', intent: 'LIST_RANGE', start, end, label: 'mañana' };
    }
    if (/esta\s+semana/.test(t)) {
      const { start, end } = getDateRange('this-week');
      return { screen: t.includes('daily') ? 'Daily' : 'Agenda', intent: 'LIST_RANGE', start, end, label: 'esta semana' };
    }
    if (/este\s+mes/.test(t)) {
      const { start, end } = getDateRange('this-month');
      return { screen: t.includes('daily') ? 'Daily' : 'Agenda', intent: 'LIST_RANGE', start, end, label: 'este mes' };
    }
    if (/pr(ó|o)ximo\s+mes/.test(t)) {
      const { start, end } = getDateRange('next-month');
      return { screen: t.includes('daily') ? 'Daily' : 'Agenda', intent: 'LIST_RANGE', start, end, label: 'próximo mes' };
    }
    const d = parseDateFromText(t);
    if (d) return { screen: t.includes('daily') ? 'Daily' : 'Agenda', intent: 'LIST_BY_DATE', date: d };
    return { screen: 'Agenda', intent: 'SUMMARY' };
  }

  return null;
}

// -------------------------
// Q&A Informativas (SOLO EN CÓDIGO) — Vehículos livianos
// -------------------------
type InformativeQA = { question: string; answer: string };
type InformativeCategory = { title: string; qas: InformativeQA[] };

// 👉 Edita/añade aquí (vehículos livianos)
const INFORMATIVE_QA: InformativeCategory[] = [
  {
    title: 'Mantenimiento preventivo (vehículos livianos)',
    qas: [
      {
        question: '¿Qué incluye un mantenimiento preventivo básico?',
        answer:
          'Cambio de aceite y filtro, revisión de niveles (refrigerante, frenos, dirección/lavaparabrisas), inspección de frenos, neumáticos y luces, chequeo de batería/bornes, revisión de filtros de aire del motor y de cabina, y escaneo OBD-II si aplica.',
      },
      {
        question: '¿Cada cuánto cambiar el aceite del motor?',
        answer:
          'Sigue el manual. Rango típico: 5.000–10.000 km o 6–12 meses según aceite y uso. Uso severo (tráfico intenso, trayectos cortos, remolque, polvo o calor extremo) requiere intervalos más cortos.',
      },
      {
        question: '¿Qué filtros se cambian y con qué frecuencia?',
        answer:
          'Aceite (en cada cambio de aceite), aire del motor (15–30 mil km o anual), aire de cabina (12–20 mil km), combustible (40–60 mil km o según fabricante; algunos lo llevan integrado en el tanque sin mantenimiento programado).',
      },
      {
        question: '¿Cómo saber si necesito alineación o balanceo?',
        answer:
          'Vibración del volante a velocidad, el vehículo "se va" a un lado o desgaste irregular de llantas. Balanceo al rotar llantas o tras impactos; alineación tras golpes, cambios de suspensión o si no mantiene trayectoria recta.',
      },
      {
        question: '¿Cuándo es "uso severo" y qué cambia?',
        answer:
          'Ciclos de arranque en frío frecuentes, trayectos cortos, remolque, polvo/barro, calor extremo, tráfico pesado. En estos casos acorta los intervalos de aceite, filtros y revisiones.',
      },
    ],
  },
  {
    title: 'Sistema de frenos',
    qas: [
      {
        question: '¿Cuándo cambiar pastillas y discos de freno?',
        answer:
          'Pastillas: cuando el espesor útil es <3 mm, hay chirridos/alarma o el pedal vibra. Discos: si están ovalados, con surcos profundos o por debajo del espesor mínimo indicado en la pieza.',
      },
      {
        question: '¿Cada cuánto cambiar el líquido de frenos?',
        answer:
          'Regla general: cada 2 años o 40.000 km. El líquido (DOT 3/4/5.1) absorbe humedad, lo que reduce el punto de ebullición y puede causar pedal esponjoso. Cambia y purga según manual.',
      },
      {
        question: 'Señales de alerta en el sistema de frenos',
        answer:
          'Testigo de freno/ABS encendido, pedal bajo o esponjoso, tirón a un lado al frenar, ruidos metálicos, olor a quemado o pérdida de eficacia. Revisa de inmediato.',
      },
      {
        question: '¿El freno de estacionamiento necesita mantenimiento?',
        answer:
          'Sí. Debe ajustarse y revisarse su cable o módulo (si es eléctrico). Si sube demasiado o no retiene en pendientes, requiere ajuste/servicio.',
      },
    ],
  },
  {
    title: 'Neumáticos y suspensión',
    qas: [
      {
        question: '¿Cuál es la presión correcta de neumáticos?',
        answer:
          'La indicada por el fabricante (etiqueta en marco de puerta o tapa de combustible). Medir en frío. Si tu auto tiene TPMS, úsalo como referencia y confirma con manómetro.',
      },
      {
        question: '¿Cada cuánto rotar los neumáticos?',
        answer:
          'Cada 8–10 mil km o 6 meses. Respeta el patrón según sean direccionales o asimétricos, y vuelve a balancear tras la rotación.',
      },
      {
        question: '¿Cuál es la profundidad mínima de la banda de rodadura?',
        answer:
          'Legalmente suele ser ≥1,6 mm (indicador TWI). Para lluvia intensa se recomienda >3 mm. Desgaste irregular puede indicar problemas de alineación/suspensión.',
      },
      {
        question: '¿Cuándo revisar amortiguadores y bujes?',
        answer:
          'Si hay rebotes excesivos, balanceo en curvas, "cabeceo" al frenar, ruidos o fugas. Referencia: 60–100 mil km según uso y vías.',
      },
    ],
  },
  {
    title: 'Refrigeración y correas',
    qas: [
      {
        question: '¿Cada cuánto cambiar el refrigerante?',
        answer:
          'Depende del tipo (OAT/HOAT) y manual: 2–5 años comúnmente. Nunca mezcles tipos distintos. Revisa nivel en frío entre "MIN–MAX".',
      },
      {
        question: 'Síntomas de sobrecalentamiento y qué hacer',
        answer:
          'Aguja o testigo de temperatura altos, olor dulce, pérdida de potencia. Detente con seguridad, apaga A/C, no abras el tapón en caliente y llama asistencia si no baja la temperatura.',
      },
      {
        question: 'Correa de distribución vs. de accesorios',
        answer:
          'Distribución: reemplazo programado (p. ej. 60–120 mil km o años). Si tu motor usa cadena, se inspecciona. Accesorios: suele cambiarse entre 60–100 mil km o si hay grietas/ruidos.',
      },
    ],
  },
  {
    title: 'Batería, encendido y electricidad',
    qas: [
      {
        question: 'Vida útil típica de una batería',
        answer:
          '3–5 años. Señales de fatiga: arranque lento, luces tenues, testigo de batería. Revisa bornes limpios y bien apretados, y prueba de carga en taller.',
      },
      {
        question: '¿Cuándo cambiar las bujías?',
        answer:
          'Cobre: 20–30 mil km. Iridio/platino: 60–100 mil km. Síntomas de desgaste: tirones en marcha, consumo elevado, ralentí inestable.',
      },
      {
        question: 'Luces y seguridad',
        answer:
          'Verifica regularmente altas, bajas, stop y direccionales. Cambia bombillas por pares para mantener uniformidad y revisa el enfoque de faros.',
      },
    ],
  },
  {
    title: 'Consejos confiables para el usuario',
    qas: [
      {
        question: 'Checklist rápido antes de un viaje',
        answer:
          'Niveles (aceite, refrigerante, frenos, lavaparabrisas), presión de neumáticos (incluida la de repuesto), herramientas/triángulos, limpiaparabrisas, frenos, fugas visibles y papeles al día.',
      },
      {
        question: '¿Por qué seguir el manual del fabricante?',
        answer:
          'Allí están especificados intervalos, viscosidades, pares de apriete y fluidos correctos. Cumplirlos alarga vida útil y mantiene garantía.',
      },
      {
        question: 'Combustible y filtro de combustible',
        answer:
          'Usa el octanaje recomendado. Cambia el filtro según plan; en sistemas con filtro en tanque, respeta los intervalos de fabricante y evita circular en reserva de forma habitual.',
      },
    ],
  },
];

// Normalizador/ayudantes
function normalizeTxt(s: string) {
  return s.toLowerCase().replace(/\s+/g, ' ').trim();
}

// Limpia QAs vacías y elimina duplicados por texto normalizado
function cleanInformativeCatalog(cats: InformativeCategory[]): InformativeCategory[] {
  const seen = new Set<string>();
  return cats
    .map(cat => {
      const qas = cat.qas
        .filter(qa => qa.question && qa.answer)
        .filter(qa => {
          const key = normalizeTxt(qa.question);
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      return { ...cat, qas };
    })
    .filter(cat => cat.qas.length > 0);
}

const INFORMATIVE_QA_CLEAN = cleanInformativeCatalog(INFORMATIVE_QA);

// -------------------------
// Helpers: historial / últimos 5 por pantalla
// -------------------------
const APP_HISTORY_KEY = '@app_history';
const PREVENTIVE_JOURNAL_KEY = '@journal_entries_Preventive';
const GENERAL_JOURNAL_KEY    = '@journal_entries_general';
const EMERGENCY_JOURNAL_KEY  = '@journal_entries_emergency';
const ROUTE_JOURNAL_KEY      = '@journal_entries_route';

type AppHistoryItem = { id: string; action: string; screen: string; data: any; timestamp: string };

async function loadHistory(): Promise<AppHistoryItem[]> {
  const raw = await AsyncStorage.getItem(APP_HISTORY_KEY);
  const arr: AppHistoryItem[] = raw ? JSON.parse(raw) : [];
  return arr.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

async function last5FromHistoryFor(screen: 'Emergency'|'Route'|'General'|'Preventive'): Promise<string[]> {
  const list = await loadHistory();
  const keyVariants = [screen, `${screen}Screen`].map(s => s.toLowerCase());
  const hits = list.filter(it => {
    const scr = (it.screen || '').toString().toLowerCase();
    return keyVariants.some(k => scr.includes(k));
  }).slice(0, 5);

  if (!hits.length) return [];
  return hits.map(it => {
    const when = new Date(it.timestamp);
    const details = it.data ? JSON.stringify(it.data) : '';
    return `${when.toLocaleDateString()} ${when.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})} — ${it.action}${details ? ` — ${details}` : ''}`;
  });
}

// --- Preventive ---
type PreventiveJournalEntry = { id: string; text?: string; image?: string; date: string | Date };

async function last5PreventiveJournal(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(PREVENTIVE_JOURNAL_KEY);
  if (!raw) return [];
  let entries: PreventiveJournalEntry[] = [];
  try { entries = JSON.parse(raw); } catch { return []; }
  const norm = entries
    .map(e => ({ ...e, date: new Date(e.date) }))
    .sort((a, b) => (b.date as Date).getTime() - (a.date as Date).getTime())
    .slice(0, 5);
  if (!norm.length) return [];
  return norm.map(e => {
    const d   = e.date as Date;
    const base = `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    const txt  = e.text ? ` — ${e.text}` : '';
    const img  = e.image ? ' — [imagen adjunta]' : '';
    return `${base}${txt}${img}`;
  });
}


// --- General ---
type GeneralJournalEntry = { id: string; text?: string; image?: string; date: string | Date };
async function last5GeneralJournal(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(GENERAL_JOURNAL_KEY);
  if (!raw) return [];
  let entries: GeneralJournalEntry[] = [];
  try { entries = JSON.parse(raw); } catch { return []; }
  const norm = entries
    .map(e => ({ ...e, date: new Date(e.date) }))
    .sort((a, b) => (b.date as Date).getTime() - (a.date as Date).getTime())
    .slice(0, 5);
  if (!norm.length) return [];
  return norm.map(e => {
    const d = e.date as Date;
    const base = `${d.toLocaleDateString()} ${d.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}`;
    const txt = e.text ? ` — ${e.text}` : '';
    const img = e.image ? ' — [imagen adjunta]' : '';
    return `${base}${txt}${img}`;
  });
}

// --- Emergency ---
type EmergencyJournalEntry = { id: string; text?: string; image?: string; date: string | Date };
async function last5EmergencyJournal(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(EMERGENCY_JOURNAL_KEY);
  if (!raw) return [];
  let entries: EmergencyJournalEntry[] = [];
  try { entries = JSON.parse(raw); } catch { return []; }
  const norm = entries
    .map(e => ({ ...e, date: new Date(e.date) }))
    .sort((a, b) => (b.date as Date).getTime() - (a.date as Date).getTime())
    .slice(0, 5);
  if (!norm.length) return [];
  return norm.map(e => {
    const d = e.date as Date;
    const base = `${d.toLocaleDateString()} ${d.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}`;
    const txt = e.text ? ` — ${e.text}` : '';
    const img = e.image ? ' — [imagen adjunta]' : '';
    return `${base}${txt}${img}`;
  });
}

// --- Route (bitácora propia; si no existe, usa historial como fallback) ---
type RouteJournalEntry = { id: string; text?: string; image?: string; date: string | Date };
async function last5RouteJournalOrHistory(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(ROUTE_JOURNAL_KEY);
  if (raw) {
    let entries: RouteJournalEntry[] = [];
    try { entries = JSON.parse(raw); } catch { /* ignore */ }
    const norm = (entries || [])
      .map(e => ({ ...e, date: new Date(e.date) }))
      .sort((a, b) => (b.date as Date).getTime() - (a.date as Date).getTime())
      .slice(0, 5);
    if (norm.length) {
      return norm.map(e => {
        const d = e.date as Date;
        const base = `${d.toLocaleDateString()} ${d.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}`;
        const txt = e.text ? ` — ${e.text}` : '';
        const img = e.image ? ' — [imagen adjunta]' : '';
        return `${base}${txt}${img}`;
      });
    }
  }
  // Fallback a historial si aún no implementas bitácora en Rutas
  return await last5FromHistoryFor('Route');
}

// -------------------------
// Agente Inteligente
// -------------------------
class IntelligentAgent {
  private screenStates: ScreenState = {};
  private lastResponses: string[] = [];
  private informativeQAsFlat: InformativeQA[] = []; // 👉 se setea desde fuera
  private readonly MAX_HISTORY = 5;

  setInformativeCatalog(cats: InformativeCategory[]) {
    this.informativeQAsFlat = cats.flatMap(c => c.qas);
  }

  async refreshFromStorage() {
    try {
      const ss = await AsyncStorage.getItem('@screen_states');
      if (ss) this.screenStates = JSON.parse(ss);

      if (!this.screenStates.Profile?.documentsExpiry) {
        const td = await AsyncStorage.getItem('@tabData');
        if (td) {
          const { soat, tecnico, picoyplaca } = JSON.parse(td || '{}');

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
    } catch (error) {
      console.error('Error refreshing from storage:', error);
    }
  }

  private bullets(lines: string[]) {
    return lines.filter(Boolean).map(l => `• ${l}`).join('\n');
  }

  private addToResponseHistory(response: string) {
    this.lastResponses.push(response);
    if (this.lastResponses.length > this.MAX_HISTORY) this.lastResponses.shift();
  }

  // --------- Handlers por pantalla ----------
  private handlePreventive(intent: Extract<DetectedIntent, { screen: 'Preventive' }>): string {
    const st = this.screenStates.Preventive || {};
    const tasks = (st.tasks || []) as PreventiveTask[];

    if (!tasks.length) {
      if ('date' in (intent as any)) {
        const d = (intent as any).date as Date;
        return `No encuentro tareas preventivas para ${formatDateEs(d)}.`;
      }
      return 'Preventivo: no tengo tareas registradas aún.';
    }

    const parseTaskDate = (t: PreventiveTask) => toDate(t.completedAt || t.dueDate);

    if (intent.intent === 'LAST_DONE') {
      const done = tasks.filter(t => t.completed && parseTaskDate(t)).sort((a,b) => {
        const da = parseTaskDate(a)!.getTime();
        const db = parseTaskDate(b)!.getTime();
        return db - da;
      });
      if (!done.length) return 'Aún no veo mantenimientos preventivos completados.';
      const last = done[0];
      const when = parseTaskDate(last)!;
      return `Último mantenimiento preventivo: ${formatDateEs(when)} — ${last.description}.`;
    }

    if (intent.intent === 'NEXT_DUE') {
      const today = new Date();
      const pending = tasks
        .filter(t => !t.completed && toDate(t.dueDate))
        .sort((a,b) => (toDate(a.dueDate)!.getTime() - toDate(b.dueDate)!.getTime()));
      const next = pending.find(t => toDate(t.dueDate)!.getTime() >= today.getTime());
      if (!next) return 'No encuentro próximos mantenimientos preventivos programados.';
      const when = toDate(next.dueDate)!;
      return `Próximo mantenimiento preventivo: ${formatDateEs(when)} — ${next.description}.`;
    }

    if (intent.intent === 'OVERDUE') {
      const today = new Date();
      const overdue = tasks.filter(t => !t.completed && toDate(t.dueDate) && toDate(t.dueDate)!.getTime() < today.getTime());
      if (!overdue.length) return 'No tienes tareas preventivas vencidas. ✅';
      const lines = overdue
        .sort((a,b) => toDate(a.dueDate)!.getTime() - toDate(b.dueDate)!.getTime())
        .slice(0, 5)
        .map(t => `${t.description} — vencía ${formatDateEs(toDate(t.dueDate)!)}.`);
      return `Tareas preventivas vencidas (${overdue.length}):\n${this.bullets(lines)}`;
    }

    if (intent.intent === 'LIST_BY_DATE') {
      const d = (intent as any).date as Date;
      const hits = (st.tasks || []).filter((t: any) => {
        const due = toDate(t.dueDate);
        const done = t.completedAt ? toDate(t.completedAt) : null;
        return (due && sameDay(due, d)) || (done && sameDay(done, d));
      });
      if (!hits.length) return `Sin tareas preventivas para ${formatDateEs(d)}.`;
      const lines = hits.map((t: any) => {
        const tag = t.completed ? '✅' : '⏳';
        const ref = t.completed ? (toDate(t.completedAt!) || toDate(t.dueDate)!) : toDate(t.dueDate)!;
        const label = t.completed ? 'completada' : 'programada';
        return `${tag} ${t.description} — ${label} el ${formatDateEs(ref)}.`;
      });
      return `Preventivo — ${formatDateEs(d)}:\n${this.bullets(lines)}`;
    }

    const total = tasks.length;
    const done = tasks.filter(t => t.completed).length;
    const today = new Date();
    const overdue = tasks.filter(t => !t.completed && toDate(t.dueDate) && toDate(t.dueDate)!.getTime() < today.getTime()).length;
    return `Preventivo: ${total} tareas, ${done} completadas, ${overdue} vencidas.`;
  }

  private handleProfile(intent: any): string {
    const st = this.screenStates.Profile || {};
    const exp = st.documentsExpiry || {};
    const fmt = (iso?: string) => (iso ? formatDateEs(new Date(iso)) : 'N/D');

    if (intent.intent === 'SOAT_DUE') {
      return exp.soat ? `SOAT vence: ${fmt(exp.soat)}.` : 'No tengo la fecha de vencimiento del SOAT.';
    }
    if (intent.intent === 'TEC_DUE') {
      return exp.tecnico ? `Técnico Mecánica vence: ${fmt(exp.tecnico)}.` : 'No tengo la fecha de vencimiento de la Técnico Mecánica.';
    }
    if (intent.intent === 'PICO_PLACA') {
      return `Pico y Placa: ${exp.picoPlacaDay || 'N/D'}.`;
    }
    const docs = st.documents || [];
    return `Perfil — Documentos: ${docs.length}. Estado: ${st.documentsStatus || 'N/D'}.`;
  }

  private handleAgendaDaily(screen: 'Agenda'|'Daily', intent: any): string {
    const st = this.screenStates[screen] || {};
    const apps = (st.appointments || []).map((a: any) => ({ ...a, date: toDate(a.date) })).filter(a => a.date);

    if (intent.intent === 'LIST_BY_DATE') {
      const d = (intent as any).date as Date;
      const same = apps.filter(a => sameDay(a.date as Date, d));
      if (!same.length) return `No encuentro eventos en ${screen} para ${formatDateEs(d)}.`;
      const lines = same
        .sort((a,b) => (a.date as Date).getTime() - (b.date as Date).getTime())
        .map(a => `${a.title}${a.description ? ` — ${a.description}` : ''}`);
      return `${screen} — ${formatDateEs(d)}:\n${this.bullets(lines)}`;
    }

    if (intent.intent === 'LIST_RANGE') {
      const { start, end } = intent as any;
      const hits = apps
        .filter(a => {
          const ts = (a.date as Date).getTime();
          return ts >= start.getTime() && ts < end.getTime();
        })
        .sort((a,b) => (a.date as Date).getTime() - (b.date as Date).getTime());

      const label = (intent as any).label ? ` (${(intent as any).label})` : '';
      if (!hits.length) return `${screen}${label}: sin eventos.`;
      const lines = hits.slice(0, 20).map(a => `${a.title}${a.description ? ` — ${a.description}` : ''}`);
      return `${screen}${label}: ${hits.length} evento(s).\n${this.bullets(lines)}`;
    }

    const today = new Date();
    const total = apps.length;
    const todayCount = apps.filter(a => sameDay(a.date as Date, today)).length;
    const upcoming = apps.filter(a => (a.date as Date).getTime() > today.getTime()).length;
    return `${screen}: ${total} en total, ${todayCount} hoy, ${upcoming} próximas.`;
  }

  private async handleHistoryLast5(intent: HistoryIntent): Promise<string> {
    if (intent.intent !== 'HISTORY_LAST5') return 'No entendí el historial solicitado.';

    if (intent.screen === 'Preventive') {
      const lines = await last5PreventiveJournal();
      if (!lines.length) return 'Preventivo — No encuentro registros recientes.';
      return `Preventivo — Últimos ${Math.min(5, lines.length)} registros:\n${this.bullets(lines)}`;
    }

    if (intent.screen === 'General') {
      const lines = await last5GeneralJournal();
      if (!lines.length) return 'General — No encuentro registros recientes.';
      return `General — Últimos ${Math.min(5, lines.length)} registros:\n${this.bullets(lines)}`;
    }

    if (intent.screen === 'Emergency') {
      const lines = await last5EmergencyJournal();
      if (!lines.length) return 'Emergencia — No encuentro registros recientes.';
      return `Emergencia — Últimos ${Math.min(5, lines.length)} registros:\n${this.bullets(lines)}`;
    }

    if (intent.screen === 'Route') {
      const lines = await last5RouteJournalOrHistory();
      if (!lines.length) return 'Rutas — No encuentro registros recientes.';
      return `Rutas — Últimos ${Math.min(5, lines.length)} registros:\n${this.bullets(lines)}`;
    }

    return 'No pude resolver esa consulta.';
  }

  private analyze(screen: keyof ScreenState) {
    switch (screen) {
      case 'Daily':      return { details: this.handleAgendaDaily('Daily',  { screen: 'Daily',  intent: 'SUMMARY' } as any) };
      case 'Agenda':     return { details: this.handleAgendaDaily('Agenda', { screen: 'Agenda', intent: 'SUMMARY' } as any) };
      case 'General': {
        const st = this.screenStates.General || {};
        const services = st.services || [];
        return { details: `General: ${services.length} servicios. Último: ${st.lastService ? formatDateEs(new Date(st.lastService)) : 'N/D'}.` };
      }
      case 'Preventive': return { details: this.handlePreventive({ screen: 'Preventive', intent: 'SUMMARY' } as any) };
      case 'Emergency': {
        const st = this.screenStates.Emergency || {};
        const c = st.contacts || [];
        return { details: `Emergencia: ${c.length} contacto(s). ${st.entriesCount ? `Entradas: ${st.entriesCount}.` : ''}` };
      }
      case 'Profile':    return { details: this.handleProfile({ screen: 'Profile', intent: 'DOCS_STATUS' } as any) };
      case 'Route': {
        const st = this.screenStates.Route || {};
        const r = st.routes || [];
        return { details: `Rutas: ${r.length}. Favorita: ${st.favorite || 'N/D'}.` };
      }
      default: return { details: 'Pantalla no reconocida.' };
    }
  }

  private getContextSummary(): string {
    const keys: (keyof ScreenState)[] = ['Daily','Agenda','General','Preventive','Emergency','Profile','Route'];
    const lines: string[] = [];
    for (const k of keys) {
      const a = this.analyze(k);
      lines.push(`• ${k}: ${a.details}`);
    }
    return `Resumen de tu aplicación:\n${lines.join('\n')}`;
  }

  async answer(userMessage: string): Promise<string> {
    const text = userMessage.trim();
    const low = text.toLowerCase();

    // 0) Coincidencia exacta con Preguntas Informativas (en código)
    const norm = normalizeTxt(low);
    const hit = this.informativeQAsFlat.find(q => normalizeTxt(q.question) === norm);
    if (hit) {
      this.addToResponseHistory(hit.answer);
      return hit.answer;
    }

    const intent = detectIntent(low);

    if (intent) {
      await this.refreshFromStorage();

      if (intent.intent === 'HISTORY_LAST5') {
        const out = await this.handleHistoryLast5(intent as HistoryIntent);
        this.addToResponseHistory(out);
        return out;
      }
      if (intent.screen === 'Preventive') {
        const out = this.handlePreventive(intent as any);
        this.addToResponseHistory(out);
        return out;
      }
      if (intent.screen === 'Profile') {
        const out = this.handleProfile(intent as any);
        this.addToResponseHistory(out);
        return out;
      }
      if (intent.screen === 'Agenda' || intent.screen === 'Daily') {
        const out = this.handleAgendaDaily(intent.screen, intent as any);
        this.addToResponseHistory(out);
        return out;
      }
      const out = this.analyze(intent.screen as any).details;
      this.addToResponseHistory(out);
      return out;
    }

    // Búsqueda por keyword de pantalla → resumen
    const SCREEN_KEYWORDS: Record<string, keyof ScreenState> = {
      perfil: 'Profile',
      daily: 'Daily',
      agenda: 'Agenda',
      calendario: 'Agenda',
      general: 'General',
      preventivo: 'Preventive',
      preventiva: 'Preventive',
      emergencia: 'Emergency',
      ruta: 'Route',
      rutas: 'Route',
      profile: 'Profile',
      route: 'Route',
      emergency: 'Emergency',
      preventive: 'Preventive',
    };
    for (const [kw, screen] of Object.entries(SCREEN_KEYWORDS)) {
      if (low.includes(kw)) {
        await this.refreshFromStorage();
        const out = this.analyze(screen).details;
        this.addToResponseHistory(out);
        return out;
      }
    }

    if (/(^|\s)(hola|buenas|saludos)(\s|$)/i.test(low)) {
      const response = `¡Hola! 👋 Tengo Preguntas Frecuentes (Perfil/Agenda/Otras) y Preguntas Informativas (predefinidas en código). También puedo listar los últimos 5 registros de Preventivo, General, Emergencia y Rutas. \n\n${this.getContextSummary()}\n\n¿Sobre qué quieres saber más?`;
      this.addToResponseHistory(response);
      return response;
    }
    if (/ayuda|qué puedes|como me puedes ayudar/i.test(low)) {
      const response = `Puedo responder con lo que haya en cada pantalla (sin abrirla):
• Perfil: SOAT, Técnico, Pico y Placa
• Agenda/Daily: hoy, mañana, semana, mes, próximo mes o una fecha concreta
• Preventivo/General/Emergencia/Rutas: "últimos 5 registros"
• Además: Preguntas Informativas (vehículos livianos) predefinidas en el código.`;
      this.addToResponseHistory(response);
      return response;
    }
    if (/resumen|estado|cómo va|como va/i.test(low)) {
      const response = this.getContextSummary();
      this.addToResponseHistory(response);
      return response;
    }

    const response = `Entiendo: "${text}".\n\n${this.getContextSummary()}\n\nPrueba: "Agenda hoy", "¿Cuándo vence el SOAT?", "Últimos 5 registros en emergencia", o "Últimos 5 registros en rutas".`;
    this.addToResponseHistory(response);
    return response;
  }

  speak(text: string) {
    const sanitized = stripForSpeech(text);
    try {
      Speech.stop();
      Speech.speak(sanitized, { language: 'es-ES', pitch: 1.0, rate: 0.9 });
    } catch (error) {
      console.error('Error en speech:', error);
    }
  }
}

// -------------------------
// Componente de pantalla (UI)
// -------------------------
const ChatBotsScreen = () => {
  const navigation = useNavigation<ChatBotsScreenNavigationProp>();
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [inputText, setInputText] = useState('');
  const [showFrequent, setShowFrequent] = useState(false);
  const [showInformative, setShowInformative] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const agentRef = useRef(new IntelligentAgent());

  useEffect(() => {
    (async () => {
      agentRef.current.setInformativeCatalog(INFORMATIVE_QA_CLEAN);
      await agentRef.current.refreshFromStorage();

      const welcome: MessageType = {
        id: Date.now().toString(),
        text: '¡Hola! 👋  Soy tu asistente inteligente. \n\n¿Cómo puedo ayudarte? ',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages([welcome]);

      setTimeout(() => agentRef.current.speak('¡Hola! Soy tu asistente inteligente. ¿Cómo puedo ayudarte?'), 350);
    })();
  }, []);

  useFocusEffect(
    useCallback(() => {
      agentRef.current.refreshFromStorage();
      return () => {};
    }, [])
  );

  useEffect(() => {
    if (messages.length && flatListRef.current) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 80);
    }
  }, [messages]);

  const sendMessage = async () => {
    const txt = inputText.trim();
    if (!txt) return;

    setShowFrequent(false);
    setShowInformative(false);
    setIsProcessing(true);

    const userMsg: MessageType = {
      id: Date.now().toString(),
      text: txt,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');

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

  const selectQuick = async (q: string) => {
    setShowFrequent(false);
    setIsProcessing(true);

    const userMsg: MessageType = {
      id: Date.now().toString(),
      text: q,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);

    const reply = await agentRef.current.answer(q);

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

  const selectInformative = (qa: { question: string; answer: string }) => {
    setShowInformative(false);
    const userMsg: MessageType = {
      id: Date.now().toString(),
      text: qa.question,
      sender: 'user',
      timestamp: new Date(),
    };
    const botMsg: MessageType = {
      id: (Date.now() + 1).toString(),
      text: qa.answer,
      sender: 'bot',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg, botMsg]);
    agentRef.current.speak(qa.answer);
  };

  const goToIA = () => {
    try {
      // @ts-ignore
      navigation.navigate({ name: 'IA' });
    } catch {
      navigation.navigate('IAScreen' as any);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#000000', '#285a01ff', '#0bfc07ff']}
          locations={[0, 0.6, 1]} // Aquí implementamos los porcentajes
          start={{ x: 0, y: 0 }}
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
                'Tengo:\n• Preguntas Frecuentes (Perfil/Agenda/Otras)\n• Preguntas Informativas (vehículos livianos, predefinidas en código)\n• Consultas: "últimos 5 registros" en Preventivo, General, Emergencia y Rutas.'
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
            renderItem={({ item }) => {
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
            }}
            keyExtractor={(it) => it.id}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/* Estado */}
        {isProcessing && (
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>🧠 Analizando…</Text>
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
              colors={['#09f705ff', '#0eb9e3', '#20fd03ff']}
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
            onPress={() => { setShowFrequent(s => !s); setShowInformative(false); }}
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

          <TouchableOpacity
            style={styles.helpButton}
            onPress={() => { setShowInformative(s => !s); setShowFrequent(false); }}
            disabled={isProcessing}
          >
            <LinearGradient
              colors={['#0509f7ff', '#0eb9e3', '#0509f7ff']}
              start={{ x: 0, y: 0.2 }}
              end={{ x: 1, y: 1 }}
              style={styles.buttonGradient}
            >
              <Ionicons name="information-circle" size={22} color="white" />
              <Text style={styles.actionButtonText}>  Preguntas Informativas</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Panel Preguntas Frecuentes */}
        {showFrequent && (
          <View style={styles.questionsPanel}>
            <View style={styles.questionsHeader}>
              <Text style={styles.questionsTitle}>Preguntas Frecuentes</Text>
              <TouchableOpacity onPress={() => setShowFrequent(false)}>
                <Ionicons name="close" size={24} color="#6E45E2" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.questionsScroll} showsVerticalScrollIndicator>
              {[
                {
                  title: 'Perfil',
                  qs: [
                    '¿Cuándo vence el SOAT?',
                    'Vencimiento Técnico Mecánica',
                    '¿Qué día tengo Pico y Placa?',
                  ],
                },
                {
                  title: 'Agenda y Citas',
                  qs: [
                    'Agenda hoy',
                    'Agenda mañana',
                    'Agenda esta semana',
                    'Agenda este mes',
                    'Agenda próximo mes',
                  ],
                },
                { title: 'Preventivo',  qs: ['Últimos 5 registros en preventivo'] },
                { title: 'General',     qs: ['Últimos 5 registros en general'] },
                { title: 'Emergencia',  qs: ['Últimos 5 registros en emergencia'] },
                { title: 'Rutas',       qs: ['Últimos 5 registros en rutas'] },
              ].map((cat, cIdx) => (
                <View key={`faq-cat-${cIdx}`} style={styles.questionCategory}>
                  <Text style={styles.categoryTitle}>{cat.title}</Text>
                  {cat.qs.map((q, qIdx) => (
                    <TouchableOpacity
                      key={`faq-q-${cIdx}-${qIdx}`}
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

        {/* Panel Preguntas Informativas */}
        {showInformative && (
          <View style={styles.questionsPanel}>
            <View style={styles.questionsHeader}>
              <Text style={styles.questionsTitle}>Preguntas Informativas</Text>
              <TouchableOpacity onPress={() => setShowInformative(false)}>
                <Ionicons name="close" size={24} color="#6E45E2" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.questionsScroll} showsVerticalScrollIndicator>
              {INFORMATIVE_QA_CLEAN.map((cat, cIdx) => (
                <View key={`info-cat-${cIdx}`} style={styles.questionCategory}>
                  <Text style={styles.categoryTitle}>{cat.title}</Text>
                  {cat.qas.map((qa, qIdx) => (
                    <TouchableOpacity
                      key={`info-q-${cIdx}-${qIdx}`}
                      style={styles.questionButton}
                      onPress={() => selectInformative(qa)}
                    >
                      <Text style={styles.questionText}>{qa.question}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
              {INFORMATIVE_QA_CLEAN.length === 0 && (
                <Text style={[styles.questionText, { opacity: 0.8 }]}>
                  No hay preguntas informativas configuradas.
                </Text>
              )}
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
              placeholder="Pregunta…"
              placeholderTextColor="#999999ff"
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