import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  Animated,
  PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';
import { useBle } from '../contexts/BleContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface InteractionZone {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  action: string;
}

const CharacterScreen: React.FC = () => {
  const { colors } = useTheme();
  const { connectionStatus, triggerVibration } = useBle();
  const [currentCharacter, setCurrentCharacter] = useState(0);
  const [isInteracting, setIsInteracting] = useState(false);
  const swipeAnim = useRef(new Animated.Value(0)).current;

  // Mock character data
  const characters = [
    {
      id: '1',
      name: '小艾',
      image: require('../assets/characters/character1.png'),
      description: '活泼可爱的虚拟助手',
      unlocked: true,
    },
    {
      id: '2',
      name: '小雪',
      image: require('../assets/characters/character2.png'),
      description: '温柔体贴的陪伴者',
      unlocked: true,
    },
    {
      id: '3',
      name: '小风',
      image: require('../assets/characters/character3.png'),
      description: '神秘优雅的引导者',
      unlocked: false,
    },
  ];

  // Interaction zones for current character
  const interactionZones: InteractionZone[] = [
    { id: 'head', x: 0.4, y: 0.2, width: 0.2, height: 0.15, action: 'pat' },
    { id: 'face', x: 0.35, y: 0.35, width: 0.3, height: 0.2, action: 'touch' },
    { id: 'body', x: 0.3, y: 0.55, width: 0.4, height: 0.3, action: 'hug' },
  ];

  const handleCharacterSwipe = (direction: 'left' | 'right') => {
    const newIndex = direction === 'left' 
      ? Math.min(currentCharacter + 1, characters.length - 1)
      : Math.max(currentCharacter - 1, 0);
    
    if (newIndex !== currentCharacter) {
      Animated.spring(swipeAnim, {
        toValue: direction === 'left' ? -screenWidth : screenWidth,
        useNativeDriver: true,
        speed: 20,
      }).start(() => {
        setCurrentCharacter(newIndex);
        swipeAnim.setValue(0);
      });
    }
  };

  const handleInteraction = (zone: InteractionZone) => {
    setIsInteracting(true);
    
    // Trigger device vibration if connected
    if (connectionStatus === 'connected') {
      triggerVibration({
        channel: 'A',
        intensity: zone.action === 'pat' ? 30 : zone.action === 'touch' ? 50 : 70,
        duration: 500,
      });
    }

    // Show interaction feedback
    setTimeout(() => setIsInteracting(false), 500);
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 20;
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > 50) {
          handleCharacterSwipe('right');
        } else if (gestureState.dx < -50) {
          handleCharacterSwipe('left');
        }
      },
    })
  ).current;

  const renderCharacter = () => {
    const character = characters[currentCharacter];
    
    if (!character.unlocked) {
      return (
        <View style={styles.lockedCharacter}>
          <Icon name="lock" size={80} color={colors.textSecondary} />
          <Text style={[styles.lockedText, { color: colors.textSecondary }]}>
            完成更多剧情解锁
          </Text>
        </View>
      );
    }

    return (
      <Animated.View
        style={[
          styles.characterContainer,
          { transform: [{ translateX: swipeAnim }] },
        ]}
        {...panResponder.panHandlers}
      >
        <Image source={character.image} style={styles.characterImage} />
        
        {/* Interaction zones */}
        {interactionZones.map((zone) => (
          <TouchableOpacity
            key={zone.id}
            style={[
              styles.interactionZone,
              {
                left: `${zone.x * 100}%`,
                top: `${zone.y * 100}%`,
                width: `${zone.width * 100}%`,
                height: `${zone.height * 100}%`,
              },
            ]}
            onPress={() => handleInteraction(zone)}
            activeOpacity={0.1}
          />
        ))}
        
        {isInteracting && (
          <View style={styles.interactionFeedback}>
            <Icon name="favorite" size={40} color="#FF6B6B" />
          </View>
        )}
      </Animated.View>
    );
  };

  const renderCharacterInfo = () => {
    const character = characters[currentCharacter];
    
    return (
      <View style={[styles.infoContainer, { backgroundColor: colors.card }]}>
        <Text style={[styles.characterName, { color: colors.text }]}>
          {character.name}
        </Text>
        <Text style={[styles.characterDesc, { color: colors.textSecondary }]}>
          {character.description}
        </Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Icon name="favorite" size={20} color="#FF6B6B" />
            <Text style={[styles.statValue, { color: colors.text }]}>85</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              好感度
            </Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="star" size={20} color="#FFD700" />
            <Text style={[styles.statValue, { color: colors.text }]}>12</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              等级
            </Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="emoji-events" size={20} color="#4CAF50" />
            <Text style={[styles.statValue, { color: colors.text }]}>24</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              成就
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderDeviceStatus = () => {
    if (connectionStatus !== 'connected') {
      return (
        <TouchableOpacity style={[styles.devicePrompt, { backgroundColor: colors.card }]}>
          <Icon name="bluetooth-disabled" size={24} color={colors.warning} />
          <Text style={[styles.devicePromptText, { color: colors.text }]}>
            连接设备解锁更多互动
          </Text>
          <Icon name="chevron-right" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      );
    }

    return (
      <View style={[styles.deviceStatus, { backgroundColor: colors.success + '20' }]}>
        <Icon name="bluetooth-connected" size={20} color={colors.success} />
        <Text style={[styles.deviceStatusText, { color: colors.success }]}>
          设备已连接
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={['#1a1a1a', '#2d2d2d', '#1a1a1a']}
        style={styles.backgroundGradient}
      />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Character Display Area */}
        <View style={styles.characterArea}>
          {renderCharacter()}
          
          {/* Character Indicator */}
          <View style={styles.characterIndicator}>
            {characters.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicatorDot,
                  {
                    backgroundColor:
                      index === currentCharacter
                        ? colors.primary
                        : colors.textSecondary + '40',
                  },
                ]}
              />
            ))}
          </View>
        </View>

        {/* Character Info */}
        {renderCharacterInfo()}

        {/* Device Status */}
        {renderDeviceStatus()}

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
          >
            <Icon name="chat" size={24} color="#fff" />
            <Text style={styles.actionText}>对话</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.secondary }]}
          >
            <Icon name="menu-book" size={24} color="#fff" />
            <Text style={styles.actionText}>剧情</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.accent }]}
          >
            <Icon name="card-giftcard" size={24} color="#fff" />
            <Text style={styles.actionText}>礼物</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: screenHeight,
  },
  characterArea: {
    height: screenHeight * 0.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  characterContainer: {
    width: screenWidth * 0.8,
    height: screenHeight * 0.4,
    position: 'relative',
  },
  characterImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  interactionZone: {
    position: 'absolute',
    backgroundColor: 'transparent',
  },
  interactionFeedback: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -20,
    marginTop: -20,
  },
  lockedCharacter: {
    alignItems: 'center',
    justifyContent: 'center',
    height: screenHeight * 0.4,
  },
  lockedText: {
    marginTop: 20,
    fontSize: 16,
  },
  characterIndicator: {
    flexDirection: 'row',
    marginTop: 20,
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  infoContainer: {
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
    marginTop: 20,
  },
  characterName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  characterDesc: {
    fontSize: 14,
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  devicePrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
  },
  devicePromptText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
  },
  deviceStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 12,
    borderRadius: 8,
  },
  deviceStatusText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 20,
    marginTop: 30,
    marginBottom: 20,
  },
  actionButton: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    width: screenWidth * 0.25,
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 8,
    fontWeight: '500',
  },
});

export default CharacterScreen;