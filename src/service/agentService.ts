import AsyncStorage from '@react-native-async-storage/async-storage';

// Tipo para el estado de las pantallas
export type ScreenState = {
    Daily?: any;
    General?: any;
    Preventive?: any;
    Emergency?: any;
    Profile?: any;
    Route?: any;
    Agenda?: any;
};

// Servicio para guardar estados de pantallas
export const agentService = {
    // Guardar estado de una pantalla
    async saveScreenState(screen: keyof ScreenState, data: any): Promise<void> {
        try {
            // Obtener estados actuales
            const savedStates = await AsyncStorage.getItem('@screen_states');
            const currentStates: ScreenState = savedStates ? JSON.parse(savedStates) : {};

            // Actualizar el estado específico
            currentStates[screen] = {
                ...currentStates[screen],
                ...data,
                lastUpdated: new Date().toISOString()
            };

            // Guardar de vuelta
            await AsyncStorage.setItem('@screen_states', JSON.stringify(currentStates));
            console.log(`✅ Estado de ${screen} guardado correctamente`);
        } catch (error) {
            console.error(`❌ Error guardando estado de ${screen}:`, error);
        }
    },

    // Registrar acción en el historial
    async recordAppAction(action: string, screen: string, data: any = {}): Promise<void> {
        try {
            const savedHistory = await AsyncStorage.getItem('@app_history');
            const history = savedHistory ? JSON.parse(savedHistory) : [];

            const newItem = {
                id: Date.now().toString(),
                action,
                screen,
                data,
                timestamp: new Date().toISOString()
            };

            history.push(newItem);
            await AsyncStorage.setItem('@app_history', JSON.stringify(history));
        } catch (error) {
            console.error('Error registrando acción:', error);
        }
    }
};