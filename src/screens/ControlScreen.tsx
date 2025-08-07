import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Slider from '@react-native-community/slider';
import { useTheme } from '../contexts/ThemeContext';
import { useBle } from '../contexts/BleContext';

const { width: screenWidth } = Dimensions.get('window');

interface PresetMode {
  id: string;
  name: string;
  icon: string;
  color: string;
  pattern: {
    channelA: number;
    channelB: number;
    frequency: number;
    wave: string;
  };
}

const ControlScreen: React.FC = () => {
  const { colors } = useTheme();
  const { connectionStatus, connectedDevice, sendCommand } = useBle();
  
  const [channelAEnabled, setChannelAEnabled] = useState(true);
  const [channelBEnabled, setChannelBEnabled] = useState(true);
  const [channelAIntensity, setChannelAIntensity] = useState(50);
  const [channelBIntensity, setChannelBIntensity] = useState(50);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const presetModes: PresetMode[] = [
    {
      id: 'gentle',
      name: '轻柔',
      icon: 'spa',
      color: '#B2DFDB',
      pattern: { channelA: 30, channelB: 30, frequency: 1, wave: 'sine' },
    },
    {
      id: 'pulse',
      name: '脉冲',
      icon: 'favorite',
      color: '#FFCDD2',
      pattern: { channelA: 60, channelB: 60, frequency: 2, wave: 'pulse' },
    },
    {
      id: 'wave',
      name: '波浪',
      icon: 'waves',
      color: '#BBDEFB',
      pattern: { channelA: 70, channelB: 50, frequency: 1.5, wave: 'wave' },
    },
    {
      id: 'rhythm',
      name: '节奏',
      icon: 'music-note',
      color: '#D1C4E9',
      pattern: { channelA: 80, channelB: 80, frequency: 3, wave: 'square' },
    },
    {
      id: 'random',
      name: '随机',
      icon: 'shuffle',
      color: '#FFE0B2',
      pattern: { channelA: 0, channelB: 0, frequency: 0, wave: 'random' },
    },
    {
      id: 'custom',
      name: '自定义',
      icon: 'tune',
      color: '#F8BBD0',
      pattern: { channelA: 50, channelB: 50, frequency: 2, wave: 'custom' },
    },
  ];

  const handleChannelToggle = (channel: 'A' | 'B') => {
    if (channel === 'A') {
      setChannelAEnabled(!channelAEnabled);
      if (connectionStatus === 'connected') {
        sendCommand({
          type: 'channel_control',
          channel: 'A',
          enabled: !channelAEnabled,
        });
      }
    } else {
      setChannelBEnabled(!channelBEnabled);
      if (connectionStatus === 'connected') {
        sendCommand({
          type: 'channel_control',
          channel: 'B',
          enabled: !channelBEnabled,
        });
      }
    }
  };

  const handleIntensityChange = (channel: 'A' | 'B', value: number) => {
    if (channel === 'A') {
      setChannelAIntensity(value);
    } else {
      setChannelBIntensity(value);
    }
    
    if (connectionStatus === 'connected') {
      sendCommand({
        type: 'intensity',
        channel,
        value: Math.round(value),
      });
    }
  };

  const handlePresetSelect = (preset: PresetMode) => {
    setSelectedPreset(preset.id);
    setChannelAIntensity(preset.pattern.channelA);
    setChannelBIntensity(preset.pattern.channelB);
    
    if (connectionStatus === 'connected') {
      sendCommand({
        type: 'preset',
        presetId: preset.id,
        pattern: preset.pattern,
      });
    }
  };

  const renderDeviceCard = () => {
    if (connectionStatus !== 'connected') {
      return (
        <View style={[styles.deviceCard, styles.deviceDisconnected, { backgroundColor: colors.card }]}>
          <Icon name="bluetooth-disabled" size={48} color={colors.textSecondary} />
          <Text style={[styles.deviceDisconnectedText, { color: colors.textSecondary }]}>
            请先连接设备
          </Text>
          <TouchableOpacity style={[styles.connectButton, { backgroundColor: colors.primary }]}>
            <Text style={styles.connectButtonText}>连接设备</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={[styles.deviceCard, { backgroundColor: colors.card }]}>
        <View style={styles.deviceHeader}>
          <View style={styles.deviceInfo}>
            <Text style={[styles.deviceName, { color: colors.text }]}>
              {connectedDevice?.name || 'Smart Device'}
            </Text>
            <View style={styles.deviceStatus}>
              <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
              <Text style={[styles.statusText, { color: colors.textSecondary }]}>
                已连接
              </Text>
            </View>
          </View>
          <View style={styles.deviceBattery}>
            <Icon name="battery-full" size={24} color={colors.success} />
            <Text style={[styles.batteryText, { color: colors.text }]}>
              {connectedDevice?.batteryLevel || 85}%
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderChannelControl = (channel: 'A' | 'B') => {
    const isEnabled = channel === 'A' ? channelAEnabled : channelBEnabled;
    const intensity = channel === 'A' ? channelAIntensity : channelBIntensity;

    return (
      <View style={[styles.channelCard, { backgroundColor: colors.card }]}>
        <View style={styles.channelHeader}>
          <Text style={[styles.channelTitle, { color: colors.text }]}>
            通道 {channel}
          </Text>
          <TouchableOpacity
            style={[
              styles.channelToggle,
              { backgroundColor: isEnabled ? colors.primary : colors.border },
            ]}
            onPress={() => handleChannelToggle(channel)}
          >
            <View style={[
              styles.toggleThumb,
              { 
                backgroundColor: '#fff',
                transform: [{ translateX: isEnabled ? 20 : 0 }],
              },
            ]} />
          </TouchableOpacity>
        </View>

        <View style={styles.intensityControl}>
          <Text style={[styles.intensityLabel, { color: colors.textSecondary }]}>
            强度
          </Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={100}
            value={intensity}
            onValueChange={(value) => handleIntensityChange(channel, value)}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.border}
            thumbTintColor={colors.primary}
            disabled={!isEnabled}
          />
          <Text style={[styles.intensityValue, { color: colors.text }]}>
            {Math.round(intensity)}%
          </Text>
        </View>

        <View style={styles.channelStats}>
          <View style={styles.statItem}>
            <Icon name="speed" size={16} color={colors.textSecondary} />
            <Text style={[styles.statText, { color: colors.textSecondary }]}>
              2.5 Hz
            </Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="timeline" size={16} color={colors.textSecondary} />
            <Text style={[styles.statText, { color: colors.textSecondary }]}>
              正弦波
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderPresetModes = () => (
    <View style={styles.presetsContainer}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        预设模式
      </Text>
      <View style={styles.presetsGrid}>
        {presetModes.map((preset) => (
          <TouchableOpacity
            key={preset.id}
            style={[
              styles.presetCard,
              {
                backgroundColor: preset.color + '20',
                borderColor: selectedPreset === preset.id ? preset.color : 'transparent',
                borderWidth: selectedPreset === preset.id ? 2 : 0,
              },
            ]}
            onPress={() => handlePresetSelect(preset)}
          >
            <Icon name={preset.icon} size={32} color={preset.color} />
            <Text style={[styles.presetName, { color: colors.text }]}>
              {preset.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderControlActions = () => (
    <View style={styles.actionsContainer}>
      <TouchableOpacity
        style={[styles.actionButton, styles.stopButton, { backgroundColor: colors.error }]}
        onPress={() => {
          if (connectionStatus === 'connected') {
            sendCommand({ type: 'stop' });
          }
        }}
      >
        <Icon name="stop" size={24} color="#fff" />
        <Text style={styles.actionButtonText}>停止</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: colors.primary }]}
        onPress={() => {
          if (connectionStatus === 'connected') {
            sendCommand({ type: 'test' });
          }
        }}
      >
        <Icon name="play-arrow" size={24} color="#fff" />
        <Text style={styles.actionButtonText}>测试</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: colors.secondary }]}
      >
        <Icon name="save" size={24} color="#fff" />
        <Text style={styles.actionButtonText}>保存</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Device Status Card */}
        {renderDeviceCard()}

        {/* Channel Controls */}
        <View style={styles.channelsContainer}>
          {renderChannelControl('A')}
          {renderChannelControl('B')}
        </View>

        {/* Preset Modes */}
        {renderPresetModes()}

        {/* Control Actions */}
        {renderControlActions()}

        {/* Advanced Settings */}
        <TouchableOpacity
          style={[styles.advancedButton, { backgroundColor: colors.card }]}
        >
          <Icon name="settings" size={20} color={colors.text} />
          <Text style={[styles.advancedText, { color: colors.text }]}>
            高级设置
          </Text>
          <Icon name="chevron-right" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  deviceCard: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
  },
  deviceDisconnected: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  deviceDisconnectedText: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  connectButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  connectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  deviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  deviceStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
  },
  deviceBattery: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  batteryText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  channelsContainer: {
    paddingHorizontal: 16,
  },
  channelCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  channelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  channelTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  channelToggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    padding: 3,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  intensityControl: {
    marginBottom: 16,
  },
  intensityLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  slider: {
    height: 40,
  },
  intensityValue: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 8,
  },
  channelStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    marginLeft: 4,
  },
  presetsContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  presetCard: {
    width: (screenWidth - 48) / 3,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    marginBottom: 16,
  },
  presetName: {
    fontSize: 12,
    marginTop: 8,
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  stopButton: {
    paddingHorizontal: 32,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  advancedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
  },
  advancedText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
});

export default ControlScreen;