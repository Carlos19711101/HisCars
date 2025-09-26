import { StyleSheet, ViewStyle, TextStyle, Platform, StatusBar } from 'react-native';

interface Styles {
  safeArea: ViewStyle;
  container: ViewStyle;
  header: ViewStyle;
  backButton: ViewStyle;
  title: TextStyle;
  headerPlaceholder: ViewStyle;
  searchContainer: ViewStyle;
  searchIcon: ViewStyle;
  searchInput: TextStyle;
  appSelectionContainer: ViewStyle;
  sectionTitle: TextStyle;
  appButtonsContainer: ViewStyle;
  appButton: ViewStyle;
  appButtonContent: ViewStyle;
  appButtonText: TextStyle;
  recentSearchesContainer: ViewStyle;
  recentSearchesHeader: ViewStyle;
  clearButton: TextStyle;
  recentSearchesList: ViewStyle;
  recentSearchItem: ViewStyle;
  recentSearchText: TextStyle;
  emptyState: ViewStyle;
  emptyStateText: TextStyle;
}

const styles = StyleSheet.create<Styles>({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 20 : 20,
    marginBottom: 30,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  headerPlaceholder: {
    width: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(11, 213, 249, 0.99)',
    borderRadius: 25,
    paddingHorizontal: 15,
    marginBottom: 30,
    height: 50,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: '"rgba(252, 254, 252, 0.99)"',
    paddingVertical: 8,
  },
  appSelectionContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 15,
  },
  appButtonsContainer: {
    gap: 15,
  },
  appButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  appButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  appButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
    marginLeft: 15,
  },
  recentSearchesContainer: {
    flex: 1,
  },
  recentSearchesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  clearButton: {
    color: '#ff6b6b',
    fontSize: 14,
  },
  recentSearchesList: {
    flex: 1,
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    marginBottom: 8,
    gap: 10,
  },
  recentSearchText: {
    color: 'white',
    fontSize: 14,
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.7,
  },
  emptyStateText: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 30,
    lineHeight: 22,
  },
});

export default styles;