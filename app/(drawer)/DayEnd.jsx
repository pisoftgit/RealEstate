import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import LottieView from 'lottie-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import useDayEnd from '../../hooks/useDayEnd';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

export default function DayEnd() {
  const navigation = useNavigation();
  const { currentDayData, loading, error, fetchCurrentDay, closeDay, openDay } = useDayEnd();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [openDate, setOpenDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentDayId, setCurrentDayId] = useState(null);

  // Fetch current day data on mount
  useEffect(() => {
    const loadCurrentDay = async () => {
      try {
        const data = await fetchCurrentDay();
        
        if (data && data.date) {
          // Parse the date from response
          const [year, month, day] = data.date.split('-');
          const fetchedDate = new Date(year, month - 1, day);
          setCurrentDate(fetchedDate);
        }
        
        if (data && data.currentDayId) {
          setCurrentDayId(data.currentDayId);
        }
      } catch (err) {
        console.error('Error fetching current day:', err);
        Alert.alert('Error', 'Failed to fetch current day data');
      }
    };

    loadCurrentDay();
  }, []);

  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setOpenDate(selectedDate);
    }
  };

  const handleCloseDay = async () => {
    if (!currentDayId) {
      Alert.alert('Error', 'Current day ID not available');
      return;
    }

    Alert.alert(
      'Close Day',
      `Are you sure you want to close the day for ${formatDate(currentDate)}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Close Day',
          style: 'destructive',
          onPress: async () => {
            try {
              await closeDay(currentDayId);
              Alert.alert('Success', `Day closed for ${formatDate(currentDate)}`);
              
              // Refresh current day data
              await fetchCurrentDay();
            } catch (err) {
              Alert.alert('Error', error || 'Failed to close day');
            }
          },
        },
      ]
    );
  };

  const handleOpenDay = async () => {
    Alert.alert(
      'Open Day',
      `Are you sure you want to open the day for ${formatDate(openDate)}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Open Day',
          onPress: async () => {
            try {
              await openDay(openDate);
              Alert.alert('Success', `Day opened for ${formatDate(openDate)}`);
              
              // Refresh current day data
              await fetchCurrentDay();
            } catch (err) {
              Alert.alert('Error', error || 'Failed to open day');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Drawer Menu */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.menuButton}>
          <Ionicons name="menu" size={28} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Header Row with Title and Lottie */}
      <View style={styles.headerRow}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Day</Text>
          <Text style={styles.headerSubTitle}>End</Text>
        </View>
        <LottieView
          source={require("../../assets/svg/EMP.json")}
          autoPlay
          loop
          style={styles.lottie}
        />
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5aaf57" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      )}

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Close Day Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="moon" size={24} color="#e74c3c" />
            <Text style={styles.cardTitle}>Close Day</Text>
          </View>

          <View style={styles.cardBody}>
            <Text style={styles.label}>Current Date</Text>
            <View style={styles.dateDisplayContainer}>
              <Ionicons name="calendar" size={20} color="#5aaf57" />
              <Text style={styles.dateDisplayText}>{formatDate(currentDate)}</Text>
            </View>

            <Text style={styles.infoText}>
              This will close all operations for the current day. No further transactions can be made after closing.
            </Text>

            <TouchableOpacity style={styles.closeDayButton} onPress={handleCloseDay} disabled={loading}>
              <Ionicons name="lock-closed" size={20} color="#fff" />
              <Text style={styles.buttonText}>
                {loading ? 'Processing...' : 'Close Day'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Open Day Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="sunny" size={24} color="#5aaf57" />
            <Text style={styles.cardTitle}>Open Day</Text>
          </View>

          <View style={styles.cardBody}>
            <Text style={styles.label}>Select Date</Text>
            <TouchableOpacity
              style={styles.datePickerContainer}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color="#5aaf57" />
              <Text style={styles.datePickerText}>{formatDate(openDate)}</Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={openDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
              />
            )}

            <Text style={styles.infoText}>
              This will open operations for the selected day. All transactions can be performed after opening.
            </Text>

            <TouchableOpacity style={styles.openDayButton} onPress={handleOpenDay} disabled={loading}>
              <Ionicons name="lock-open" size={20} color="#fff" />
              <Text style={styles.buttonText}>
                {loading ? 'Processing...' : 'Open Day'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? hp('6.5%') : hp('5%'),
    paddingHorizontal: wp('4%'),
    paddingBottom: hp('1.2%'),
    backgroundColor: '#fff',
  },
  menuButton: {
    width: wp('10%'),
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp('4%'),
    paddingBottom: hp('2%'),
    backgroundColor: '#fff',
  },
  headerTextContainer: {
    flexDirection: 'column',
  },
  headerTitle: {
    fontSize: wp('8%'),
    fontFamily: 'PlusR',
    color: '#222',
    lineHeight: wp('9.5%'),
  },
  headerSubTitle: {
    fontSize: wp('8%'),
    fontFamily: 'PlusSB',
    color: '#5aaf57',
    lineHeight: wp('9.5%'),
  },
  lottie: {
    width: wp('32%'),
    height: wp('32%'),
  },
  content: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    padding: wp('5%'),
    paddingBottom: hp('5%'),
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: wp('4%'),
    padding: wp('5%'),
    marginBottom: wp('4%'),
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: hp('0.25%') },
    shadowOpacity: 0.1,
    shadowRadius: wp('1%'),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('2.5%'),
    paddingBottom: hp('2%'),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  cardTitle: {
    fontSize: wp('5%'),
    fontFamily: 'PlusSB',
    color: '#222',
    marginLeft: wp('3%'),
  },
  cardBody: {
    gap: hp('2%'),
  },
  label: {
    fontSize: wp('3.5%'),
    fontFamily: 'PlusSB',
    color: '#555',
    marginBottom: hp('1%'),
  },
  dateDisplayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: wp('3%'),
    padding: wp('4%'),
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dateDisplayText: {
    fontSize: wp('4.5%'),
    fontFamily: 'PlusSB',
    color: '#222',
    marginLeft: wp('3%'),
  },
  datePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9f9f9',
    borderRadius: wp('3%'),
    padding: wp('4%'),
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  datePickerText: {
    flex: 1,
    fontSize: wp('4.5%'),
    fontFamily: 'PlusSB',
    color: '#222',
    marginLeft: wp('3%'),
  },
  infoText: {
    fontSize: wp('3.2%'),
    fontFamily: 'PlusR',
    color: '#666',
    lineHeight: hp('2.5%'),
    marginTop: hp('1%'),
  },
  closeDayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e74c3c',
    paddingVertical: hp('1.8%'),
    borderRadius: wp('3%'),
    marginTop: hp('1%'),
    gap: wp('2%'),
  },
  openDayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#5aaf57',
    paddingVertical: hp('1.8%'),
    borderRadius: wp('3%'),
    marginTop: hp('1%'),
    gap: wp('2%'),
  },
  buttonText: {
    fontSize: wp('4%'),
    fontFamily: 'PlusSB',
    color: '#fff',
  },
  loadingContainer: {
    padding: wp('5%'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: hp('1.2%'),
    fontSize: wp('3.5%'),
    fontFamily: 'PlusR',
    color: '#666',
  },
});
