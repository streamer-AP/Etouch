import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { TouchableOpacity, View, StyleSheet } from 'react-native';

// Screens
import CharacterScreen from '../screens/CharacterScreen';
import ExperienceScreen from '../screens/ExperienceScreen';
import ControlScreen from '../screens/ControlScreen';
import ProfileScreen from '../screens/ProfileScreen';

// Sub Screens
import StoryDetailScreen from '../screens/experience/StoryDetailScreen';
import AudioPlayerScreen from '../screens/experience/AudioPlayerScreen';
import AudioImportScreen from '../screens/experience/AudioImportScreen';
import DeviceSettingsScreen from '../screens/device/DeviceSettingsScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';

// Components
import DeviceButton from '../components/navigation/DeviceButton';
import { useTheme } from '../contexts/ThemeContext';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack navigators for each tab
const CharacterStack = () => {
  const { colors } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <Stack.Screen 
        name="CharacterMain" 
        component={CharacterScreen} 
        options={{ title: '角色' }}
      />
    </Stack.Navigator>
  );
};

const ExperienceStack = () => {
  const { colors } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <Stack.Screen 
        name="ExperienceMain" 
        component={ExperienceScreen} 
        options={{ title: '沉浸体验' }}
      />
      <Stack.Screen 
        name="StoryDetail" 
        component={StoryDetailScreen} 
        options={{ title: '剧情详情' }}
      />
      <Stack.Screen 
        name="AudioPlayer" 
        component={AudioPlayerScreen} 
        options={{ title: '音频播放' }}
      />
      <Stack.Screen 
        name="AudioImport" 
        component={AudioImportScreen} 
        options={{ title: '音频导入' }}
      />
    </Stack.Navigator>
  );
};

const ControlStack = () => {
  const { colors } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <Stack.Screen 
        name="ControlMain" 
        component={ControlScreen} 
        options={{ title: '控制' }}
      />
    </Stack.Navigator>
  );
};

const ProfileStack = () => {
  const { colors } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <Stack.Screen 
        name="ProfileMain" 
        component={ProfileScreen} 
        options={{ title: '个人中心' }}
      />
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ title: '设置' }}
      />
      <Stack.Screen 
        name="DeviceSettings" 
        component={DeviceSettingsScreen} 
        options={{ title: '设备设置' }}
      />
    </Stack.Navigator>
  );
};

const AppNavigator: React.FC = () => {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string = '';

          switch (route.name) {
            case 'Character':
              iconName = 'face';
              break;
            case 'Experience':
              iconName = 'play-circle-outline';
              break;
            case 'Control':
              iconName = 'tune';
              break;
            case 'Profile':
              iconName = 'person-outline';
              break;
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      })}
      tabBar={(props) => (
        <View>
          <Tab.Navigator {...props}>
            {props.state.routes.map((route, index) => {
              const isFocused = props.state.index === index;
              
              return (
                <TouchableOpacity
                  key={route.key}
                  accessibilityRole="button"
                  accessibilityState={isFocused ? { selected: true } : {}}
                  onPress={() => {
                    const event = props.navigation.emit({
                      type: 'tabPress',
                      target: route.key,
                      canPreventDefault: true,
                    });

                    if (!isFocused && !event.defaultPrevented) {
                      props.navigation.navigate(route.name);
                    }
                  }}
                  style={styles.tabItem}
                >
                  {props.descriptors[route.key].options.tabBarIcon?.({
                    focused: isFocused,
                    color: isFocused ? colors.primary : colors.textSecondary,
                    size: 24,
                  })}
                </TouchableOpacity>
              );
            })}
          </Tab.Navigator>
          
          {/* Central Device Button */}
          <DeviceButton />
        </View>
      )}
    >
      <Tab.Screen 
        name="Character" 
        component={CharacterStack}
        options={{ tabBarLabel: '角色' }}
      />
      <Tab.Screen 
        name="Experience" 
        component={ExperienceStack}
        options={{ tabBarLabel: '体验' }}
      />
      <Tab.Screen 
        name="Control" 
        component={ControlStack}
        options={{ tabBarLabel: '控制' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileStack}
        options={{ tabBarLabel: '我的' }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
});

export default AppNavigator;