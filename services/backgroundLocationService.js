import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from './api';
import moment from 'moment-timezone';

const BACKGROUND_LOCATION_TASK = 'background-location-task';
const API_URL = `${API_BASE_URL}/saveLocations`;

// Track last save to prevent duplicates
let lastSaveTimestamp = 0;
const MIN_SAVE_INTERVAL = 55000; // Minimum 55 seconds between saves to prevent duplicates

// Define the background location task
TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
  if (error) {
    console.error('❌ Background location task error:', error);
    return;
  }

  if (data) {
    const { locations } = data;
    
    if (locations && locations.length > 0) {
      const { latitude, longitude } = locations[0].coords;
      
      // Check if enough time has passed since last save (prevent duplicates)
      const now = Date.now();
      const timeSinceLastSave = now - lastSaveTimestamp;
      
      if (timeSinceLastSave < MIN_SAVE_INTERVAL) {
        console.log(`⏭️ Skipping duplicate save (${Math.round(timeSinceLastSave / 1000)}s since last save)`);
        return;
      }
      
      try {
        // Get authentication details
        const loginUserId = await SecureStore.getItemAsync('userid');
        const secretKey = await SecureStore.getItemAsync('auth_token');
        const currentDayDate = await SecureStore.getItemAsync('currentDayDate') || 
                               moment().format('YYYY-MM-DD');

        if (!loginUserId || !secretKey) {
          console.warn('⚠️ Background: Missing authentication details');
          return;
        }

        // IST timestamp
        const timestamp = moment.tz('Asia/Kolkata').format('YYYY-MM-DDTHH:mm:ss') + 'Z';

        const payload = {
          userId: Number(loginUserId),
          day: currentDayDate,
          latitude,
          longitude,
          timestamp,
          isBackground: true, // Flag to indicate this is a background save
        };

        console.log('📍 Background Location Task - Saving:', {
          lat: latitude.toFixed(6),
          lng: longitude.toFixed(6),
          time: moment().format('HH:mm:ss')
        });

        // Make API call with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            secret_key: secretKey,
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          console.log('✅ Background location saved successfully');
          lastSaveTimestamp = now; // Update last save timestamp
          // Store last save info
          await SecureStore.setItemAsync(
            'lastBackgroundSave', 
            JSON.stringify({
              timestamp: new Date().toISOString(),
              latitude,
              longitude,
            })
          );
        } else {
          console.warn('⚠️ Background save failed:', response.status);
        }
      } catch (err) {
        if (err.name === 'AbortError') {
          console.warn('⚠️ Background request timeout');
        } else {
          console.error('❌ Background location save error:', err.message);
        }
      }
    }
  }
});

// Start background location tracking
export const startBackgroundLocationTracking = async () => {
  try {
    // Check if task is already registered
    const isTaskDefined = await TaskManager.isTaskDefined(BACKGROUND_LOCATION_TASK);
    if (!isTaskDefined) {
      console.error('❌ Background location task is not defined');
      return false;
    }

    // Request background permissions
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
    if (foregroundStatus !== 'granted') {
      console.warn('⚠️ Foreground location permission not granted');
      return false;
    }

    const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
    if (backgroundStatus !== 'granted') {
      console.warn('⚠️ Background location permission not granted. Using foreground only.');
      // Continue anyway - foreground tracking will still work
    }

    // Check if already running
    const hasStarted = await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
    if (hasStarted) {
      console.log('ℹ️ Background location tracking is already running');
      return true;
    }

    // Start location updates
    await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 60000, // 1 minute
      distanceInterval: 0, // Track regardless of distance
      showsBackgroundLocationIndicator: true,
      foregroundService: {
        notificationTitle: '📍 Attendance Tracking Active',
        notificationBody: 'Your location is being tracked for attendance purposes.',
        notificationColor: '#5aaf57',
      },
    });

    console.log('✅ Background location tracking started');
    return true;
  } catch (error) {
    console.error('❌ Error starting background location tracking:', error);
    return false;
  }
};

// Stop background location tracking
export const stopBackgroundLocationTracking = async () => {
  try {
    const hasStarted = await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
    
    if (hasStarted) {
      await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
      console.log('✅ Background location tracking stopped');
    } else {
      console.log('ℹ️ Background location tracking was not running');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error stopping background location tracking:', error);
    return false;
  }
};

// Check if background tracking is active
export const isBackgroundLocationTrackingActive = async () => {
  try {
    const hasStarted = await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
    return hasStarted;
  } catch (error) {
    console.error('❌ Error checking background tracking status:', error);
    return false;
  }
};

// Get last background save info
export const getLastBackgroundSaveInfo = async () => {
  try {
    const lastSaveStr = await SecureStore.getItemAsync('lastBackgroundSave');
    if (lastSaveStr) {
      return JSON.parse(lastSaveStr);
    }
    return null;
  } catch (error) {
    console.error('❌ Error getting last background save info:', error);
    return null;
  }
};
