import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Text,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DeviceModal from '../device/DeviceModal';
import { useTheme } from '../../contexts/ThemeContext';
import { useBle } from '../../contexts/BleContext';

const DeviceButton: React.FC = () => {
  const { colors } = useTheme();
  const { connectionStatus, connectedDevice } = useBle();
  const [modalVisible, setModalVisible] = useState(false);
  const pulseAnim = new Animated.Value(1);

  useEffect(() => {
    if (connectionStatus === 'connected') {
      // Pulse animation when connected
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [connectionStatus]);

  const getButtonStyle = () => {
    switch (connectionStatus) {
      case 'connected':
        return { backgroundColor: colors.success };
      case 'connecting':
        return { backgroundColor: colors.warning };
      case 'disconnected':
        return { backgroundColor: colors.textSecondary };
      default:
        return { backgroundColor: colors.primary };
    }
  };

  const getIconName = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'bluetooth-connected';
      case 'connecting':
        return 'bluetooth-searching';
      case 'disconnected':
        return 'bluetooth-disabled';
      default:
        return 'add';
    }
  };

  const getBatteryLevel = () => {
    if (connectedDevice?.batteryLevel) {
      return `${connectedDevice.batteryLevel}%`;
    }
    return null;
  };

  return (
    <>
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.buttonWrapper,
            { transform: [{ scale: pulseAnim }] },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.button,
              getButtonStyle(),
              { shadowColor: colors.primary },
            ]}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.8}
          >
            <Icon name={getIconName()} size={28} color="#fff" />
            {connectionStatus === 'connected' && getBatteryLevel() && (
              <View style={styles.batteryBadge}>
                <Text style={styles.batteryText}>{getBatteryLevel()}</Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>

      <DeviceModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: '50%',
    marginLeft: -30,
    zIndex: 100,
  },
  buttonWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  batteryBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 30,
  },
  batteryText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default DeviceButton;