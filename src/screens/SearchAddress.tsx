import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Linking,
  Alert,
  ScrollView,
  SafeAreaView,
  Platform,
  StatusBar,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign, Ionicons, MaterialIcons } from '@expo/vector-icons';
import styles from './SearchAddress.styles';

const SearchAddress = ({ navigation }: any) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const demoImages = [
    'https://cdn-icons-png.flaticon.com/512/888/888856.png',
    'https://cdn-icons-png.flaticon.com/512/3771/3771526.png',
  ];

  const openMapsApp = (app: 'google' | 'apple' | 'waze') => {
    if (!searchQuery.trim()) {
      Alert.alert('Error', 'Por favor ingresa una dirección para buscar');
      return;
    }

    const encodedQuery = encodeURIComponent(searchQuery);
    let url = '';

    if (app === 'google') {
      url = `https://www.google.com/maps/search/?api=1&query=${encodedQuery}`;
      
      // Verificar si Google Maps está instalado, sino abrir en navegador
      Linking.canOpenURL('comgooglemaps://')
        .then(supported => {
          if (supported) {
            return Linking.openURL(`comgooglemaps://?q=${encodedQuery}`);
          } else {
             return Linking.openURL(url);
          }
        })
        .catch(err => {
          Linking.openURL(url);
          console.error('Error abriendo Google Maps:', err);
        });
    } else if (app === 'apple') {
      url = `http://maps.apple.com/?q=${encodedQuery}`;
      Linking.openURL(url).catch(err => {
        console.error('Error abriendo Apple Maps:', err);
        Alert.alert('Error', 'No se pudo abrir Apple Maps');
      });
    } else if (app === 'waze') {
      url = `https://waze.com/ul?q=${encodedQuery}&navigate=yes`;
      
      // Verificar si Waze está instalado
      Linking.canOpenURL('waze://')
        .then(supported => {
          if (supported) {
            return Linking.openURL(`waze://?q=${encodedQuery}&navigate=yes`);
          } else {
            // Si Waze no está instalado, abrir en Play Store/App Store
            if (Platform.OS === 'android') {
              Linking.openURL('market://details?id=com.waze');
            } else {
              Linking.openURL('itms-apps://itunes.apple.com/app/id323229106');
            }
          }
        })
        .catch(err => {
          console.error('Error abriendo Waze:', err);
          Alert.alert('Error', 'No se pudo abrir Waze');
        });
    }

    // Guardar búsqueda en historial reciente (máximo 5)
    if (!recentSearches.includes(searchQuery)) {
      const updatedSearches = [searchQuery, ...recentSearches].slice(0, 5);
      setRecentSearches(updatedSearches);
    }
  };

  const clearSearchHistory = () => {
    Alert.alert(
      'Limpiar historial',
      '¿Estás seguro de que quieres eliminar todo tu historial de búsquedas?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive', 
          onPress: () => setRecentSearches([]) 
        },
      ]
    );
  };

  const useRecentSearch = (search: string) => {
    setSearchQuery(search);
  };

  return (
    <>
      <StatusBar
        translucent={true}
        backgroundColor="transparent"
        barStyle="light-content"
      />
      
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient 
          colors={['#000000', '#3A0CA3', '#F72585']}
          locations={[0, 0.6, 1]} // Aquí implementamos los porcentajes
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.container, { 
            paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 
          }]}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <AntDesign name="arrow-left" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.title}>Buscar Dirección</Text>
            <View style={styles.headerPlaceholder} />
          </View>

          {/* Search Input */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={24} color="#aaa" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Ingresa una dirección o lugar..."
              placeholderTextColor="#aaa"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
          </View>

          {/* App Selection */}
          <View style={styles.appSelectionContainer}>
            <Text style={styles.sectionTitle}>Buscar con:</Text>
            
            <View style={styles.appButtonsContainer}>
              <TouchableOpacity 
                style={styles.appButton}
                onPress={() => openMapsApp('google')}
              >
                <View style={styles.appButtonContent}>
                  <Image 
                    source={{ uri: demoImages[0] }}
                    style={{ width: 28, height: 28 }}
                    resizeMode="contain"
                  />
                  <Text style={styles.appButtonText}>Google Maps</Text>
                </View>
                <MaterialIcons name="open-in-new" size={20} color="white" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.appButton}
                onPress={() => openMapsApp('waze')}
              >
                <View style={styles.appButtonContent}>
                  <Image 
                    source={{ uri: demoImages[1] }}
                    style={{ width: 28, height: 28 }}
                    resizeMode="contain"
                  />
                  <Text style={styles.appButtonText}>Waze</Text>
                </View>
                <MaterialIcons name="open-in-new" size={20} color="white" />
              </TouchableOpacity>

              {Platform.OS === 'ios' && (
                <TouchableOpacity 
                  style={styles.appButton}
                  onPress={() => openMapsApp('apple')}
                >
                  <View style={styles.appButtonContent}>
                    <Ionicons name="navigate" size={28} color="#007AFF" />
                    <Text style={styles.appButtonText}>Apple Maps</Text>
                  </View>
                  <MaterialIcons name="open-in-new" size={20} color="white" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <View style={styles.recentSearchesContainer}>
              <View style={styles.recentSearchesHeader}>
                <Text style={styles.sectionTitle}>Búsquedas recientes</Text>
                <TouchableOpacity onPress={clearSearchHistory}>
                  <Text style={styles.clearButton}>Limpiar</Text>
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.recentSearchesList}>
                {recentSearches.map((search, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={styles.recentSearchItem}
                    onPress={() => useRecentSearch(search)}
                  >
                    <Ionicons name="time-outline" size={20} color="#aaa" />
                    <Text style={styles.recentSearchText}>{search}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Empty State */}
          {recentSearches.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="compass-outline" size={60} color="rgba(255, 255, 255, 0.96)" />
              <Text style={styles.emptyStateText}>
                Ingresa una dirección y selecciona tu app de mapas preferida
              </Text>
            </View>
          )}
        </LinearGradient>
      </SafeAreaView>
    </>
  );
};

export default SearchAddress;
