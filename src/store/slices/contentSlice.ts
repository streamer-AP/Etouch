import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Story {
  id: string;
  title: string;
  progress: number;
  completed: boolean;
  unlockedAt?: string;
}

interface AudioFile {
  id: string;
  name: string;
  path: string;
  duration: number;
  importedAt: string;
}

interface ContentState {
  stories: Story[];
  audioFiles: AudioFile[];
  currentStoryId: string | null;
  currentAudioId: string | null;
}

const initialState: ContentState = {
  stories: [],
  audioFiles: [],
  currentStoryId: null,
  currentAudioId: null,
};

const contentSlice = createSlice({
  name: 'content',
  initialState,
  reducers: {
    updateStoryProgress: (state, action: PayloadAction<{ id: string; progress: number }>) => {
      const story = state.stories.find(s => s.id === action.payload.id);
      if (story) {
        story.progress = action.payload.progress;
        if (action.payload.progress >= 100) {
          story.completed = true;
        }
      }
    },
    unlockStory: (state, action: PayloadAction<string>) => {
      const story = state.stories.find(s => s.id === action.payload);
      if (story) {
        story.unlockedAt = new Date().toISOString();
      }
    },
    addAudioFile: (state, action: PayloadAction<Omit<AudioFile, 'importedAt'>>) => {
      state.audioFiles.push({
        ...action.payload,
        importedAt: new Date().toISOString(),
      });
    },
    removeAudioFile: (state, action: PayloadAction<string>) => {
      state.audioFiles = state.audioFiles.filter(a => a.id !== action.payload);
    },
    setCurrentStory: (state, action: PayloadAction<string | null>) => {
      state.currentStoryId = action.payload;
    },
    setCurrentAudio: (state, action: PayloadAction<string | null>) => {
      state.currentAudioId = action.payload;
    },
  },
});

export const {
  updateStoryProgress,
  unlockStory,
  addAudioFile,
  removeAudioFile,
  setCurrentStory,
  setCurrentAudio,
} = contentSlice.actions;

export default contentSlice.reducer;