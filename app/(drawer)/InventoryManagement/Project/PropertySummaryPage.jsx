import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  Platform,
  ScrollView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, useNavigation } from 'expo-router';
import PropertySummary from '../../../../components/PropertySummary';

const PropertySummaryPage = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const params = useLocalSearchParams();
  
  // Parse the property data from params
  let propertyData = null;
  try {
    propertyData = params.propertyData ? JSON.parse(params.propertyData) : null;
  } catch (error) {
    console.error('Error parsing property data:', error);
  }

  const handlePropertySummarySave = (summaryData) => {
    console.log('Property Summary Data:', summaryData);
    console.log('Associated Project:', propertyData?.projectName);
    
    // Here you can save the property summary data to your backend or state
    // For now, we'll just show an alert and navigate back
    alert(`Property Summary saved for ${propertyData?.projectName}!`);
    router.back();
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={handleGoBack}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#004d40" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Property Summary</Text>
          {propertyData && (
            <Text style={styles.headerSubtitle}>
              for {propertyData.projectName}
            </Text>
          )}
        </View>
        <View style={{ width: 34 }} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        
        <PropertySummary 
          onSave={handlePropertySummarySave}
          initialData={{}}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === "android" ? 25 : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingTop: Platform.OS === "android" ? 40 : 15,
  },
  backButton: {
    padding: 5,
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'PlusSB',
    color: '#004d40',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'PlusR',
    color: '#666',
    textAlign: 'center',
    marginTop: 2,
  },
  content: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  projectInfo: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  projectName: {
    fontSize: 18,
    fontFamily: 'PlusSB',
    color: '#004d40',
    marginBottom: 5,
  },
  builderName: {
    fontSize: 16,
    fontFamily: 'PlusR',
    color: '#666',
    marginBottom: 3,
  },
  address: {
    fontSize: 14,
    fontFamily: 'PlusL',
    color: '#888',
  },
});

export default PropertySummaryPage;
