import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';

const { width: screenWidth } = Dimensions.get('window');

interface ExperienceModule {
  id: string;
  title: string;
  icon: string;
  color: string;
  route: string;
}

interface Story {
  id: string;
  title: string;
  description: string;
  duration: number;
  thumbnail: string;
  locked: boolean;
  progress: number;
}

const ExperienceScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [selectedModule, setSelectedModule] = useState('story');

  const modules: ExperienceModule[] = [
    { id: 'story', title: '剧情演出', icon: 'auto-stories', color: '#FF6B6B', route: 'StoryDetail' },
    { id: 'audio', title: '音频体验', icon: 'music-note', color: '#4ECDC4', route: 'AudioPlayer' },
    { id: 'import', title: '导入解析', icon: 'file-upload', color: '#95E1D3', route: 'AudioImport' },
    { id: 'realtime', title: '实时捕捉', icon: 'graphic-eq', color: '#F38181', route: 'RealtimeCapture' },
  ];

  const stories: Story[] = [
    {
      id: '1',
      title: '初次见面',
      description: '与小艾的第一次相遇',
      duration: 15,
      thumbnail: 'https://placeholder.com/150',
      locked: false,
      progress: 100,
    },
    {
      id: '2',
      title: '心动时刻',
      description: '一起度过的浪漫时光',
      duration: 20,
      thumbnail: 'https://placeholder.com/150',
      locked: false,
      progress: 60,
    },
    {
      id: '3',
      title: '深夜谈心',
      description: '分享彼此的秘密',
      duration: 25,
      thumbnail: 'https://placeholder.com/150',
      locked: false,
      progress: 0,
    },
    {
      id: '4',
      title: '特别的日子',
      description: '一起庆祝重要时刻',
      duration: 30,
      thumbnail: 'https://placeholder.com/150',
      locked: true,
      progress: 0,
    },
  ];

  const renderModuleCard = ({ item }: { item: ExperienceModule }) => (
    <TouchableOpacity
      style={[styles.moduleCard, { backgroundColor: item.color + '20' }]}
      onPress={() => {
        setSelectedModule(item.id);
        if (item.route) {
          navigation.navigate(item.route as never);
        }
      }}
      activeOpacity={0.8}
    >
      <View style={[styles.moduleIconContainer, { backgroundColor: item.color }]}>
        <Icon name={item.icon} size={28} color="#fff" />
      </View>
      <Text style={[styles.moduleTitle, { color: colors.text }]}>{item.title}</Text>
    </TouchableOpacity>
  );

  const renderStoryCard = (story: Story) => (
    <TouchableOpacity
      key={story.id}
      style={[styles.storyCard, { backgroundColor: colors.card }]}
      onPress={() => {
        if (!story.locked) {
          navigation.navigate('StoryDetail' as never, { storyId: story.id } as never);
        }
      }}
      activeOpacity={story.locked ? 1 : 0.8}
    >
      <View style={styles.storyThumbnail}>
        {story.locked ? (
          <View style={styles.lockedOverlay}>
            <Icon name="lock" size={24} color="#fff" />
          </View>
        ) : (
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.thumbnailGradient}
          />
        )}
      </View>
      
      <View style={styles.storyInfo}>
        <Text style={[styles.storyTitle, { color: colors.text }]}>{story.title}</Text>
        <Text style={[styles.storyDesc, { color: colors.textSecondary }]}>
          {story.description}
        </Text>
        
        <View style={styles.storyMeta}>
          <View style={styles.storyDuration}>
            <Icon name="schedule" size={14} color={colors.textSecondary} />
            <Text style={[styles.durationText, { color: colors.textSecondary }]}>
              {story.duration}分钟
            </Text>
          </View>
          
          {story.progress > 0 && !story.locked && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${story.progress}%`,
                      backgroundColor: colors.primary,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.progressText, { color: colors.textSecondary }]}>
                {story.progress}%
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderAudioSection = () => (
    <View style={styles.audioSection}>
      <TouchableOpacity
        style={[styles.audioCard, { backgroundColor: colors.card }]}
        onPress={() => navigation.navigate('AudioPlayer' as never)}
      >
        <View style={styles.audioWaveform}>
          {[...Array(20)].map((_, i) => (
            <View
              key={i}
              style={[
                styles.waveBar,
                {
                  height: Math.random() * 40 + 10,
                  backgroundColor: colors.primary,
                },
              ]}
            />
          ))}
        </View>
        <Text style={[styles.audioTitle, { color: colors.text }]}>
          开始音频体验
        </Text>
        <Text style={[styles.audioSubtitle, { color: colors.textSecondary }]}>
          播放音频并同步设备震动
        </Text>
      </TouchableOpacity>

      <View style={styles.audioActions}>
        <TouchableOpacity
          style={[styles.audioActionBtn, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('AudioImport' as never)}
        >
          <Icon name="add" size={24} color="#fff" />
          <Text style={styles.audioActionText}>导入音频</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.audioActionBtn, { backgroundColor: colors.secondary }]}
        >
          <Icon name="library-music" size={24} color="#fff" />
          <Text style={styles.audioActionText}>音频库</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Module Selector */}
        <View style={styles.modulesContainer}>
          <FlatList
            horizontal
            data={modules}
            renderItem={renderModuleCard}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.modulesList}
          />
        </View>

        {/* Content based on selected module */}
        {selectedModule === 'story' && (
          <View style={styles.contentSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              推荐剧情
            </Text>
            <View style={styles.storiesGrid}>
              {stories.slice(0, 2).map(renderStoryCard)}
            </View>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              全部剧情
            </Text>
            <View style={styles.storiesList}>
              {stories.map(renderStoryCard)}
            </View>
          </View>
        )}

        {selectedModule === 'audio' && renderAudioSection()}

        {selectedModule === 'import' && (
          <View style={styles.importSection}>
            <TouchableOpacity
              style={[styles.importCard, { borderColor: colors.border }]}
              onPress={() => navigation.navigate('AudioImport' as never)}
            >
              <Icon name="cloud-upload" size={48} color={colors.primary} />
              <Text style={[styles.importTitle, { color: colors.text }]}>
                点击导入音频文件
              </Text>
              <Text style={[styles.importSubtitle, { color: colors.textSecondary }]}>
                支持 MP3, WAV, AAC, M4A 格式
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {selectedModule === 'realtime' && (
          <View style={styles.realtimeSection}>
            <View style={[styles.realtimeCard, { backgroundColor: colors.card }]}>
              <View style={styles.realtimeVisualizer}>
                <View style={styles.frequencyBars}>
                  {[...Array(15)].map((_, i) => (
                    <View
                      key={i}
                      style={[
                        styles.frequencyBar,
                        {
                          height: Math.random() * 80 + 20,
                          backgroundColor: colors.primary,
                        },
                      ]}
                    />
                  ))}
                </View>
              </View>
              
              <TouchableOpacity
                style={[styles.captureButton, { backgroundColor: colors.primary }]}
              >
                <Icon name="mic" size={32} color="#fff" />
              </TouchableOpacity>
              
              <Text style={[styles.captureText, { color: colors.text }]}>
                点击开始实时音频捕捉
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modulesContainer: {
    marginTop: 16,
  },
  modulesList: {
    paddingHorizontal: 16,
  },
  moduleCard: {
    width: screenWidth * 0.25,
    aspectRatio: 1,
    marginHorizontal: 8,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduleIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  moduleTitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  contentSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 16,
  },
  storiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  storiesList: {
    marginTop: 8,
  },
  storyCard: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  storyThumbnail: {
    width: '100%',
    height: 120,
    backgroundColor: '#333',
    position: 'relative',
  },
  thumbnailGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
  },
  lockedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyInfo: {
    padding: 12,
  },
  storyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  storyDesc: {
    fontSize: 12,
    marginBottom: 8,
  },
  storyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  storyDuration: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationText: {
    fontSize: 12,
    marginLeft: 4,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 12,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 10,
    marginLeft: 8,
  },
  audioSection: {
    padding: 16,
  },
  audioCard: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  audioWaveform: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
    marginBottom: 16,
  },
  waveBar: {
    width: 3,
    marginHorizontal: 2,
    borderRadius: 2,
  },
  audioTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  audioSubtitle: {
    fontSize: 14,
  },
  audioActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  audioActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  audioActionText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  importSection: {
    padding: 16,
    alignItems: 'center',
  },
  importCard: {
    width: '100%',
    padding: 40,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 16,
    alignItems: 'center',
  },
  importTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  importSubtitle: {
    fontSize: 14,
  },
  realtimeSection: {
    padding: 16,
  },
  realtimeCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  realtimeVisualizer: {
    width: '100%',
    height: 120,
    marginBottom: 24,
  },
  frequencyBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    height: '100%',
  },
  frequencyBar: {
    width: 8,
    marginHorizontal: 2,
    borderRadius: 4,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  captureText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ExperienceScreen;