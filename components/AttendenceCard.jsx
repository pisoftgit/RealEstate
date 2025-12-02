import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Dimensions, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import LottieView from 'lottie-react-native';
import moment from 'moment';
import usePostAttendance from '../hooks/usePostAttendence';
import useFetchAttendance from '../hooks/useFetchAttendance';
import useSaveLocation from '../hooks/useSaveLocation';
import * as SecureStore from 'expo-secure-store';
import '../tasks/backgroundLocationTask'; // Import to register the task

const { width, height } = Dimensions.get('window');

const AttendanceCard = () => {
  const [clock, setClock] = useState('');
  const [date, setDate] = useState('');
  const [clickedIn, setClickedIn] = useState(false);
  const [clickInTime, setClickInTime] = useState(null);
  const [clickOutTime, setClickOutTime] = useState(null);
  const [hoursWorked, setHoursWorked] = useState('');
  const [locationLogs, setLocationLogs] = useState([]);
  const intervalRef = useRef(null);

  const animationRef = useRef(null);
  const { postAttendance } = usePostAttendance();
  const { attendance, loading, error, refetch } = useFetchAttendance();
  const { saveLocation } = useSaveLocation();

  const loadDate = async () => {
    try {
      const currentDayDate = await SecureStore.getItemAsync('currentDayDate');
      const formattedDate = moment(currentDayDate).format('dddd, MMMM DD, YYYY');
      setDate(formattedDate);
    } catch (e) {
      console.error('Date formatting error:', e);
    }
  };

  useEffect(() => {
    loadDate();
    const interval = setInterval(() => {
      setClock(moment().format('hh:mm A'));
    }, 1000);
    
    // Cleanup on unmount
    return () => {
      clearInterval(interval);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      // Stop background tracking if component unmounts
      Location.hasStartedLocationUpdatesAsync('background-location-task')
        .then(hasStarted => {
          if (hasStarted && !clickOutTime) {
            // Only stop if user hasn't checked out yet
            // This ensures tracking continues even if component unmounts
            console.log("Component unmounting but tracking continues...");
          }
        })
        .catch(err => console.error('Error checking background task:', err));
    };
  }, []);

  useEffect(() => {
    if (attendance) {
      setClickInTime(attendance.checkIn || null);
      setClickOutTime(attendance.checkOut || null);
      setHoursWorked(attendance.workedHoursAndMins || '');
      const hasCheckIn = !!attendance.checkIn;
      const hasCheckOut = !!attendance.checkOut;

      if (hasCheckOut) {
        setClickedIn(false);
        animationRef.current?.play(30, 60);
        clearInterval(intervalRef.current);
        // ✅ Stop background tracking if checked out
        stopBackgroundTracking();
      } else if (hasCheckIn) {
        setClickedIn(true);
        animationRef.current?.play(0, 30);
        // ✅ Resume background tracking if already checked in
        resumeBackgroundTracking();
      } else {
        setClickedIn(false);
        animationRef.current?.reset();
      }
    }
  }, [attendance]);

  // ✅ Helper function to stop background tracking
  const stopBackgroundTracking = async () => {
    try {
      const hasStarted = await Location.hasStartedLocationUpdatesAsync('background-location-task');
      if (hasStarted) {
        await Location.stopLocationUpdatesAsync('background-location-task');
        console.log("Background tracking stopped (checked out)");
      }
    } catch (error) {
      console.error("Error stopping background tracking:", error);
    }
  };

  // ✅ Helper function to resume background tracking if already checked in
  const resumeBackgroundTracking = async () => {
    try {
      const hasStarted = await Location.hasStartedLocationUpdatesAsync('background-location-task');
      if (!hasStarted) {
        // Check permissions first
        const { status: foregroundStatus } = await Location.getForegroundPermissionsAsync();
        const { status: backgroundStatus } = await Location.getBackgroundPermissionsAsync();
        
        if (foregroundStatus === 'granted' && backgroundStatus === 'granted') {
          await Location.startLocationUpdatesAsync('background-location-task', {
            accuracy: Location.Accuracy.High,
            timeInterval: 60000, // 1 minute
            distanceInterval: 0,
            foregroundService: {
              notificationTitle: 'Location Tracking Active',
              notificationBody: 'Your location is being tracked for attendance.',
              notificationColor: '#5aaf57',
            },
            pausesUpdatesAutomatically: false,
            activityType: Location.ActivityType.Other,
            showsBackgroundLocationIndicator: true,
          });
          console.log("Background tracking resumed (already checked in)");
        } else {
          console.log("Background permissions not granted, cannot resume tracking");
        }
      } else {
        console.log("Background tracking already running");
      }
    } catch (error) {
      console.error("Error resuming background tracking:", error);
    }
  };

  // ✅ Debug helper to check tracking status
  const checkTrackingStatus = async () => {
    try {
      const hasStarted = await Location.hasStartedLocationUpdatesAsync('background-location-task');
      const foregroundPerms = await Location.getForegroundPermissionsAsync();
      const backgroundPerms = await Location.getBackgroundPermissionsAsync();
      
      console.log("🔍 Tracking Status Check:");
      console.log("- Background Task Running:", hasStarted);
      console.log("- Foreground Permission:", foregroundPerms.status);
      console.log("- Background Permission:", backgroundPerms.status);
      console.log("- Checked In:", clickedIn);
      console.log("- Interval Active:", !!intervalRef.current);
    } catch (error) {
      console.error("Error checking tracking status:", error);
    }
  };

  // Run status check every 2 minutes when checked in
  useEffect(() => {
    if (clickedIn && !clickOutTime) {
      const statusInterval = setInterval(checkTrackingStatus, 120000); // 2 minutes
      checkTrackingStatus(); // Run immediately
      return () => clearInterval(statusInterval);
    }
  }, [clickedIn, clickOutTime]);

  const handleClick = async () => {
    if (clickedIn) {
      Alert.alert(
        'Confirm Click Out',
        'Are you sure you want to Click Out?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Yes, Click Out',
            onPress: async () => await proceedWithAttendance(),
          },
        ],
        { cancelable: true }
      );
    } else {
      await proceedWithAttendance();
    }
  };


  
  const proceedWithAttendance = async () => {
    // Request both foreground and background permissions
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
    if (foregroundStatus !== 'granted') {
      console.log('Permission to access location was denied');
      return;
    }

    const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
    if (backgroundStatus !== 'granted') {
      Alert.alert(
        'Background Permission Required',
        'Please enable background location access for continuous tracking.',
        [{ text: 'OK' }]
      );
    }

    const location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;

    // Fetch currentDayDate from SecureStore for API payload
    let currentDayDate = await SecureStore.getItemAsync('currentDayDate');
    // Fallback to today if not found
    if (!currentDayDate) {
      currentDayDate = moment().format('YYYY-MM-DD');
    } else {
      currentDayDate = moment(currentDayDate).format('YYYY-MM-DD');
    }

    if (!clickedIn) {
      // ✅ Check In
      animationRef.current?.play(0, 30);
      setClickedIn(true);

      // Start background location tracking
      try {
        await Location.startLocationUpdatesAsync('background-location-task', {
          accuracy: Location.Accuracy.High,
          timeInterval: 60000, // 1 minute
          distanceInterval: 0,
          foregroundService: {
            notificationTitle: 'Location Tracking Active',
            notificationBody: 'Your location is being tracked for attendance.',
            notificationColor: '#5aaf57',
          },
          pausesUpdatesAutomatically: false,
          activityType: Location.ActivityType.Other,
          showsBackgroundLocationIndicator: true,
        });
        console.log("Background location tracking started");
      } catch (error) {
        console.error("Error starting background tracking:", error);
      }

      // Also keep foreground tracking as backup
      intervalRef.current = setInterval(async () => {
        try {
          const loc = await Location.getCurrentPositionAsync({});
          const { latitude, longitude } = loc.coords;
          await saveLocation(latitude, longitude);
          const log = {
            latitude,
            longitude,
            timestamp: moment().format("YYYY-MM-DD hh:mm:ss A"),
          };
         
          setLocationLogs(prev => [...prev, log]);
          console.log("Foreground location saved:", latitude, longitude);
        } catch (error) {
          console.error("Error saving location:", error);
        }
      }, 60000);

    } else {
      // ✅ Check Out
      animationRef.current?.play(30, 60);
      setClickedIn(false);
      
      // Stop background location tracking
      try {
        const hasStarted = await Location.hasStartedLocationUpdatesAsync('background-location-task');
        if (hasStarted) {
          await Location.stopLocationUpdatesAsync('background-location-task');
          console.log("Background location tracking stopped");
        }
      } catch (error) {
        console.error("Error stopping background tracking:", error);
      }
      
      // Stop foreground tracking
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      console.log("Location tracking stopped. All locations saved to API:", locationLogs.length, "entries");
    }

    // Use SecureStore date for day, device time for timestamp
    await postAttendance({
      day: currentDayDate,
      latitude,
      longitude,
      timestamp: moment().toISOString(),
    });
    await refetch();
  };

  const isButtonDisabled = !!clickOutTime;

  if (loading) {
    return (
      <View style={styles.card}>
        <ActivityIndicator size="large" color="#5aaf57" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.card}>
        <Text style={styles.errorText}>Error loading attendance: {error}</Text>
        <TouchableOpacity onPress={refetch} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.mark}><Text style={styles.mark1}>Mark </Text> Attendance</Text>
      <Text style={styles.clock}>{clock}</Text>
      <Text style={styles.date}>{date}</Text>

      <TouchableOpacity
        onPress={handleClick}
        style={styles.button}
        disabled={isButtonDisabled}
      >
        <LottieView
          ref={animationRef}
          source={require('../assets/svg/clickin.json')}
          autoPlay={false}
          loop={false}
          style={styles.lottie}
        />
      </TouchableOpacity>

      <View style={styles.footerRow}>
        <View style={styles.footerItem}>
          <Text style={styles.footerLabel}>In:</Text>
          <Text style={styles.footerValue}>
            {clickInTime ? clickInTime : '--'}
          </Text>
        </View>
        <View style={styles.footerItem}>
          <Text style={styles.footerLabel}>Out:</Text>
          <Text style={styles.footerValue}>
            {clickOutTime ? clickOutTime : '--'}
          </Text>
        </View>
        <View style={styles.footerItem}>
          <Text style={styles.footerLabel}>Hours:</Text>
          <Text style={styles.footerValue}>
            {hoursWorked ? hoursWorked : '--'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: width - 70,
    height: height / 2.5,
    marginHorizontal: 14,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#5aaf57',
    shadowOffset: { width: 1, height: 9 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    marginTop: 10,
    justifyContent: 'center',
  },
  clock: { fontSize: 26, fontFamily: 'PlusSB', marginBottom: 6 },
  date: { fontSize: 14, fontFamily: 'PlusR', color: '#444', marginBottom: 10 },
  button: { alignItems: 'center', marginBottom: 12 },
  lottie: { width: 100, height: 100 },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 6,
    marginTop: 8,
  },
  footerItem: { alignItems: 'center', flex: 1 },
  footerLabel: { fontSize: 13, color: '#666', fontFamily: 'PlusR' },
  footerValue: { fontSize: 16, fontFamily: 'PlusSB', color: '#222', marginTop: 4 },
  errorText: {
    fontSize: 16,
    color: '#FF0000',
    fontFamily: 'PlusR',
    textAlign: 'center',
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: '#5aaf57',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  mark: { padding: 10, color: "#333", fontSize: 22, fontFamily: "PlusSB" },
  mark1: { padding: 10, color: "#5aaf57", fontSize: 22, fontFamily: "PlusSB" },
  retryButtonText: { color: '#fff', fontSize: 16, fontFamily: 'PlusSB' },
});

export default AttendanceCard;
