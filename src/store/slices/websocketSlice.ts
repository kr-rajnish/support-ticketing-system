import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { WebSocketMessage } from '@/types';

interface WebSocketState {
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  lastMessage: WebSocketMessage | null;
  error: string | null;
}

const initialState: WebSocketState = {
  isConnected: false,
  connectionStatus: 'disconnected',
  lastMessage: null,
  error: null,
};

const websocketSlice = createSlice({
  name: 'websocket',
  initialState,
  reducers: {
    setConnectionStatus: (state, action: PayloadAction<WebSocketState['connectionStatus']>) => {
      state.connectionStatus = action.payload;
      state.isConnected = action.payload === 'connected';
      if (action.payload === 'connected') {
        state.error = null;
      }
    },
    setWebSocketError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.connectionStatus = 'error';
      state.isConnected = false;
    },
    setLastMessage: (state, action: PayloadAction<WebSocketMessage>) => {
      state.lastMessage = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setConnectionStatus,
  setWebSocketError,
  setLastMessage,
  clearError,
} = websocketSlice.actions;

export default websocketSlice.reducer;