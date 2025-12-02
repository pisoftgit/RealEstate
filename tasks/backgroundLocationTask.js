import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store';
import moment from 'moment-timezone';
import { API_BASE_URL } from '../services/api';

const TASK_NAME = 'background-location-task';

// Track last save time to prevent duplicates
let lastSaveTime = 0;
const MIN_INTERVAL = 55000; // 55 seconds minimum between saves

// Define the background location task
TaskManager.defineTask(TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('❌ Background location task error:', error);
    return;
  }

  if (data) {
    const { locations } = data;
    console.log(`📍 Background task received ${locations.length} location(s)`);
    
    // Process each location update
    for (const location of locations) {
      const { latitude, longitude } = location.coords;
      
      // Prevent too frequent updates
      const currentTime = Date.now();
      if (currentTime - lastSaveTime < MIN_INTERVAL) {
        console.log("⏭️ Skipping location update (too soon)");
        continue;
      }
      
      try {
        // Get required data from SecureStore
        const loginUserId = await SecureStore.getItemAsync('userid');
        const secretKey = await SecureStore.getItemAsync('auth_token');
        const currentDayDate = await SecureStore.getItemAsync('currentDayDate');

        if (!loginUserId || !secretKey) {
          console.error('❌ Missing authentication details in background task');
          continue;
        }

        // Format timestamp in IST
        const timestamp = moment.tz('Asia/Kolkata')
          .format('YYYY-MM-DDTHH:mm:ss') + 'Z';

        const payload = {
          userId: Number(loginUserId),
          day: currentDayDate,
          latitude,
          longitude,
          timestamp,
        };

        console.log("📤 Sending background location:", {
          lat: latitude.toFixed(6),
          lng: longitude.toFixed(6),
          time: timestamp
        });

        // Send location to API
        const response = await fetch(`${API_BASE_URL}/saveLocations`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'secret_key': secretKey,
          },
          body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (!response.ok) {
          console.error('❌ Failed to save background location:', result.message);
        } else {
          lastSaveTime = currentTime; // Update last save time
          console.log('✅ Background location saved successfully at', timestamp);
        }
      } catch (error) {
        console.error('❌ Error in background location task:', error.message);
      }
    }
  }
});

export { TASK_NAME };
