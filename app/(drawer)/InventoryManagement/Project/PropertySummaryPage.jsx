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
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

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

  // Extract projectId from params or propertyData
  const projectId = params.projectId || propertyData?.id || propertyData?.projectId;

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
      <View style={styles.content}>
        <PropertySummary 
          projectId={projectId}
          onSave={handlePropertySummarySave}
          initialData={{}}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === "android" ? hp('3%') : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp('5%'),
    paddingVertical: hp('2%'),
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingTop: Platform.OS === "android" ? hp('5%') : hp('2%'),
  },
  backButton: {
    padding: wp('1.2%'),
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: wp('5.2%'),
    fontFamily: 'PlusSB',
    color: '#004d40',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: wp('3.5%'),
    fontFamily: 'PlusR',
    color: '#666',
    textAlign: 'center',
    marginTop: hp('0.3%'),
  },
  content: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  projectInfo: {
    backgroundColor: '#fff',
    margin: wp('4%'),
    padding: wp('4%'),
    borderRadius: wp('2.5%'),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: hp('0.25%'),
    },
    shadowOpacity: 0.1,
    shadowRadius: wp('1%'),
    elevation: 5,
  },
  projectName: {
    fontSize: wp('4.8%'),
    fontFamily: 'PlusSB',
    color: '#004d40',
    marginBottom: hp('0.6%'),
  },
  builderName: {
    fontSize: wp('4%'),
    fontFamily: 'PlusR',
    color: '#666',
    marginBottom: hp('0.4%'),
  },
  address: {
    fontSize: wp('3.5%'),
    fontFamily: 'PlusL',
    color: '#888',
  },
});

export default PropertySummaryPage;
