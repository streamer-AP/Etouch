import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Device {
  id: string;
  name: string;
  macAddress: string;
  firmwareVersion: string;
  batteryLevel: number;
  lastConnected: string;
}

interface DeviceState {
  registeredDevices: Device[];
  currentDeviceId: string | null;
  connectionHistory: Array<{
    deviceId: string;
    timestamp: string;
    duration: number;
  }>;
}

const initialState: DeviceState = {
  registeredDevices: [],
  currentDeviceId: null,
  connectionHistory: [],
};

const deviceSlice = createSlice({
  name: 'device',
  initialState,
  reducers: {
    registerDevice: (state, action: PayloadAction<Device>) => {
      const exists = state.registeredDevices.find(d => d.id === action.payload.id);
      if (!exists) {
        state.registeredDevices.push(action.payload);
      }
    },
    unregisterDevice: (state, action: PayloadAction<string>) => {
      state.registeredDevices = state.registeredDevices.filter(d => d.id !== action.payload);
      if (state.currentDeviceId === action.payload) {
        state.currentDeviceId = null;
      }
    },
    setCurrentDevice: (state, action: PayloadAction<string>) => {
      state.currentDeviceId = action.payload;
    },
    updateDeviceInfo: (state, action: PayloadAction<Partial<Device> & { id: string }>) => {
      const device = state.registeredDevices.find(d => d.id === action.payload.id);
      if (device) {
        Object.assign(device, action.payload);
      }
    },
    addConnectionHistory: (state, action: PayloadAction<{ deviceId: string; duration: number }>) => {
      state.connectionHistory.push({
        ...action.payload,
        timestamp: new Date().toISOString(),
      });
    },
  },
});

export const {
  registerDevice,
  unregisterDevice,
  setCurrentDevice,
  updateDeviceInfo,
  addConnectionHistory,
} = deviceSlice.actions;

export default deviceSlice.reducer;