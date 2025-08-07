// Development Configuration
export const config = {
  // API Gateway URL - For Android emulator use 10.0.2.2 instead of localhost
  API_BASE_URL: __DEV__ 
    ? Platform.OS === 'android' 
      ? 'http://10.0.2.2:3000/api'  // Android emulator
      : 'http://localhost:3000/api'  // iOS simulator or web
    : 'https://api.smartdevice.com/api', // Production URL
  
  // WebSocket URL
  WS_URL: __DEV__
    ? Platform.OS === 'android'
      ? 'ws://10.0.2.2:3001'  // Android emulator
      : 'ws://localhost:3001'  // iOS simulator
    : 'wss://ws.smartdevice.com',
  
  // BLE Configuration
  BLE_SCAN_DURATION: 10000, // 10 seconds
  BLE_CONNECTION_TIMEOUT: 15000, // 15 seconds
  
  // Feature Flags
  ENABLE_LIVE2D: true,
  ENABLE_ANALYTICS: false,
  ENABLE_CRASH_REPORTING: false,
  
  // Storage Keys
  STORAGE_KEYS: {
    AUTH_TOKEN: '@auth_token',
    REFRESH_TOKEN: '@refresh_token',
    USER_PREFERENCES: '@user_preferences',
    DEVICE_LIST: '@device_list',
  },
  
  // Debug Settings
  DEBUG: {
    SHOW_NETWORK_LOGS: __DEV__,
    SHOW_BLE_LOGS: __DEV__,
    MOCK_BLE_DEVICES: __DEV__, // Use mock devices in development
  }
};