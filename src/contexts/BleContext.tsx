import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BleManager, Device, State } from 'react-native-ble-plx';

interface BleDevice {
  id: string;
  name: string;
  macAddress: string;
  rssi: number;
  batteryLevel: number;
  isConnected: boolean;
}

interface VibrationCommand {
  channel: 'A' | 'B' | 'BOTH';
  intensity: number;
  duration: number;
  pattern?: string;
}

interface BleContextType {
  manager: BleManager | null;
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'scanning';
  connectedDevice: BleDevice | null;
  availableDevices: BleDevice[];
  
  startScan: () => Promise<void>;
  stopScan: () => void;
  connectToDevice: (deviceId: string) => Promise<void>;
  disconnectDevice: () => Promise<void>;
  sendCommand: (command: any) => Promise<void>;
  triggerVibration: (command: VibrationCommand) => Promise<void>;
}

const BleContext = createContext<BleContextType | undefined>(undefined);

export const BleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [manager] = useState(() => new BleManager());
  const [connectionStatus, setConnectionStatus] = useState<BleContextType['connectionStatus']>('disconnected');
  const [connectedDevice, setConnectedDevice] = useState<BleDevice | null>(null);
  const [availableDevices, setAvailableDevices] = useState<BleDevice[]>([]);

  useEffect(() => {
    const subscription = manager.onStateChange((state) => {
      if (state === State.PoweredOn) {
        console.log('Bluetooth is powered on');
      }
    }, true);

    return () => {
      subscription.remove();
    };
  }, [manager]);

  const startScan = async () => {
    setConnectionStatus('scanning');
    setAvailableDevices([]);

    manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.error('Scan error:', error);
        setConnectionStatus('disconnected');
        return;
      }

      if (device && device.name?.startsWith('SmartDevice')) {
        setAvailableDevices((prev) => {
          const exists = prev.find((d) => d.id === device.id);
          if (!exists) {
            return [
              ...prev,
              {
                id: device.id,
                name: device.name || 'Unknown Device',
                macAddress: device.id,
                rssi: device.rssi || 0,
                batteryLevel: 85, // Mock value
                isConnected: false,
              },
            ];
          }
          return prev;
        });
      }
    });

    // Stop scan after 10 seconds
    setTimeout(() => {
      stopScan();
    }, 10000);
  };

  const stopScan = () => {
    manager.stopDeviceScan();
    if (connectionStatus === 'scanning') {
      setConnectionStatus('disconnected');
    }
  };

  const connectToDevice = async (deviceId: string) => {
    try {
      setConnectionStatus('connecting');
      
      const device = await manager.connectToDevice(deviceId);
      await device.discoverAllServicesAndCharacteristics();
      
      const deviceInfo: BleDevice = {
        id: device.id,
        name: device.name || 'Smart Device',
        macAddress: device.id,
        rssi: -50, // Mock value
        batteryLevel: 85, // Mock value
        isConnected: true,
      };
      
      setConnectedDevice(deviceInfo);
      setConnectionStatus('connected');
    } catch (error) {
      console.error('Connection error:', error);
      setConnectionStatus('disconnected');
    }
  };

  const disconnectDevice = async () => {
    if (connectedDevice) {
      try {
        await manager.cancelDeviceConnection(connectedDevice.id);
      } catch (error) {
        console.error('Disconnect error:', error);
      }
    }
    
    setConnectedDevice(null);
    setConnectionStatus('disconnected');
  };

  const sendCommand = async (command: any) => {
    if (!connectedDevice || connectionStatus !== 'connected') {
      console.warn('Device not connected');
      return;
    }

    // Implementation would send actual BLE command
    console.log('Sending command:', command);
  };

  const triggerVibration = async (command: VibrationCommand) => {
    await sendCommand({
      type: 'vibration',
      ...command,
    });
  };

  return (
    <BleContext.Provider
      value={{
        manager,
        connectionStatus,
        connectedDevice,
        availableDevices,
        startScan,
        stopScan,
        connectToDevice,
        disconnectDevice,
        sendCommand,
        triggerVibration,
      }}
    >
      {children}
    </BleContext.Provider>
  );
};

export const useBle = () => {
  const context = useContext(BleContext);
  if (!context) {
    throw new Error('useBle must be used within a BleProvider');
  }
  return context;
};