import { useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Client, StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { RootState } from "@/store";
import {
  setConnectionStatus,
  setWebSocketError,
  setLastMessage,
} from "@/store/slices/websocketSlice";
import {
  addMessageToCurrentTicket,
  updateTicketInList,
} from "@/store/slices/ticketsSlice";
import { WebSocketMessage } from "@/types";

export const useWebSocket = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth
  );
  const { connectionStatus } = useSelector(
    (state: RootState) => state.websocket
  );

  const clientRef = useRef<Client | null>(null);
  const subscriptionsRef = useRef<StompSubscription[]>([]);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (!isAuthenticated || !user) return;

    dispatch(setConnectionStatus("connecting"));

    const client = new Client({
      webSocketFactory: () =>
        new SockJS(
          import.meta.env.VITE_WEBSOCKET_URL || "ws://localhost:8080/ws"
        ),
      connectHeaders: {
        Authorization: `Bearer ${user.id}`,
      },
      debug: (str) => {
        console.log("STOMP Debug:", str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      console.log("WebSocket connected");
      dispatch(setConnectionStatus("connected"));
      reconnectAttempts.current = 0;

      const userSubscription = client.subscribe(
        `/user/${user.id}/queue/messages`,
        (message) => {
          try {
            const wsMessage: WebSocketMessage = JSON.parse(message.body);
            dispatch(setLastMessage(wsMessage));
            handleWebSocketMessage(wsMessage);
          } catch (error) {
            console.error("Error parsing WebSocket message:", error);
          }
        }
      );

      const notificationSubscription = client.subscribe(
        "/topic/notifications",
        (message) => {
          try {
            const wsMessage: WebSocketMessage = JSON.parse(message.body);
            dispatch(setLastMessage(wsMessage));
            handleWebSocketMessage(wsMessage);
          } catch (error) {
            console.error("Error parsing WebSocket message:", error);
          }
        }
      );

      subscriptionsRef.current = [userSubscription, notificationSubscription];
    };

    client.onStompError = (frame) => {
      console.error("STOMP error:", frame);
      dispatch(
        setWebSocketError("Connection error: " + frame.headers["message"])
      );
      handleReconnection();
    };

    client.onWebSocketClose = () => {
      console.log("WebSocket connection closed");
      dispatch(setConnectionStatus("disconnected"));
      handleReconnection();
    };

    client.onWebSocketError = (error) => {
      console.error("WebSocket error:", error);
      dispatch(setWebSocketError("WebSocket error"));
      handleReconnection();
    };

    clientRef.current = client;
    client.activate();
  }, [isAuthenticated, user, dispatch]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    subscriptionsRef.current.forEach((subscription) => {
      subscription.unsubscribe();
    });
    subscriptionsRef.current = [];

    if (clientRef.current?.active) {
      clientRef.current.deactivate();
    }
    clientRef.current = null;

    dispatch(setConnectionStatus("disconnected"));
  }, [dispatch]);

  const handleReconnection = useCallback(() => {
    if (reconnectAttempts.current < maxReconnectAttempts && isAuthenticated) {
      reconnectAttempts.current++;
      const delay = Math.min(
        1000 * Math.pow(2, reconnectAttempts.current),
        30000
      );

      console.log(
        `Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts.current}/${maxReconnectAttempts})`
      );

      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, delay);
    } else {
      console.log(
        "Max reconnection attempts reached or user not authenticated"
      );
      dispatch(
        setWebSocketError("Failed to reconnect after multiple attempts")
      );
    }
  }, [isAuthenticated, connect, dispatch]);

  const handleWebSocketMessage = useCallback(
    (message: WebSocketMessage) => {
      switch (message.type) {
        case "NEW_MESSAGE":
          dispatch(addMessageToCurrentTicket(message.payload));
          break;
        case "TICKET_UPDATED":
          dispatch(updateTicketInList(message.payload));
          break;
        case "TICKET_ASSIGNED":
          dispatch(updateTicketInList(message.payload));
          break;
        default:
          console.log("Unhandled WebSocket message type:", message.type);
      }
    },
    [dispatch]
  );

  const sendMessage = useCallback((destination: string, body: any) => {
    if (clientRef.current?.connected) {
      clientRef.current.publish({
        destination,
        body: JSON.stringify(body),
      });
    } else {
      console.error("WebSocket not connected, cannot send message");
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [isAuthenticated, user, connect, disconnect]);

  return {
    isConnected: connectionStatus === "connected",
    connectionStatus,
    connect,
    disconnect,
    sendMessage,
  };
};
