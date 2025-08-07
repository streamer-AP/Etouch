import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  isLoggedIn: boolean;
  userId: string | null;
  username: string | null;
  email: string | null;
  avatar: string | null;
  preferences: {
    theme: 'light' | 'dark';
    language: string;
    notifications: boolean;
  };
}

const initialState: UserState = {
  isLoggedIn: false,
  userId: null,
  username: null,
  email: null,
  avatar: null,
  preferences: {
    theme: 'dark',
    language: 'zh-CN',
    notifications: true,
  },
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<Omit<UserState, 'isLoggedIn' | 'preferences'>>) => {
      state.isLoggedIn = true;
      state.userId = action.payload.userId;
      state.username = action.payload.username;
      state.email = action.payload.email;
      state.avatar = action.payload.avatar;
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.userId = null;
      state.username = null;
      state.email = null;
      state.avatar = null;
    },
    updatePreferences: (state, action: PayloadAction<Partial<UserState['preferences']>>) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
  },
});

export const { login, logout, updatePreferences } = userSlice.actions;
export default userSlice.reducer;