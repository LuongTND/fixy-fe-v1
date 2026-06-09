import { useEffect, useState, useRef } from "react";
import {
  HubConnectionBuilder,
  LogLevel,
  HttpTransportType,
} from "@microsoft/signalr";

/**
 * Custom hook to connect to the SignalR ChatHub.
 *
 * @param {string|null} bookingId - The unique identifier for the booking.
 * @param {string|null} token - JWT authentication token.
 * @param {function} onMessageReceived - Callback triggered when a new chat message is received.
 * @returns {object} { isConnected }
 */
export const useChatHub = (
  bookingId,
  token,
  onMessageReceived,
  isEnabled = true,
) => {
  const [isConnected, setIsConnected] = useState(false);
  const connectionRef = useRef(null);
  const onMessageReceivedRef = useRef(onMessageReceived);

  // Maintain callback reference to avoid stale closures inside connection event listeners
  useEffect(() => {
    onMessageReceivedRef.current = onMessageReceived;
  }, [onMessageReceived]);

  useEffect(() => {
    if (!isEnabled || !bookingId || !token || typeof window === "undefined") {
      return undefined;
    }

    let hubUrl =
      process.env.NEXT_PUBLIC_CHAT_HUB_URL ||
      (process.env.NEXT_PUBLIC_API_URL
        ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, "/hubs/chat")
        : "");

    if (!hubUrl) {
      console.warn("SignalR Chat Hub URL is not defined.");
      return undefined;
    }

    const separator = hubUrl.includes("?") ? "&" : "?";
    hubUrl = `${hubUrl}${separator}ngrok-skip-browser-warning=true`;

    // Initialize Hub connection
    const connection = new HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => token,
        transport: HttpTransportType.WebSockets | HttpTransportType.LongPolling,
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .configureLogging({
        log(logLevel, message) {
          // Suppress transient transport fallback errors caused by ngrok / environment limitations
          if (
            message.includes("Failed to start the transport") ||
            message.includes("WebSocket failed to connect") ||
            message.includes("EventSource failed to connect")
          ) {
            return;
          }
          if (logLevel >= LogLevel.Warning) {
            console.warn(`[SignalR] ${message}`);
          }
        },
      })
      .build();

    connectionRef.current = connection;

    let isMounted = true;

    const startConnection = async () => {
      try {
        await connection.start();
        if (!isMounted) {
          await connection.stop();
          return;
        }

        setIsConnected(true);
        console.log("SignalR Connected to ChatHub!");

        // Join room/group for the specific booking
        try {
          await connection.invoke("JoinChatGroup", bookingId);
          console.log(`Joined chat group for booking: ${bookingId}`);
        } catch (invokeError) {
          console.warn("Failed to invoke JoinChatGroup:", invokeError);
        }

        // Register listener for incoming chat messages
        connection.on("ReceiveChatMessage", (message) => {
          if (onMessageReceivedRef.current) {
            onMessageReceivedRef.current(message);
          }
        });
      } catch (err) {
        console.error("Error establishing SignalR connection:", err);
      }
    };

    startConnection();

    // Reconnection & connection state monitoring
    connection.onreconnecting((error) => {
      console.warn("SignalR reconnecting due to connection loss...", error);
      if (isMounted) setIsConnected(false);
    });

    connection.onreconnected((connectionId) => {
      console.log(
        "SignalR reconnected successfully. Connection ID:",
        connectionId,
      );
      if (isMounted) {
        setIsConnected(true);
        // Re-join booking group after reconnecting
        connection.invoke("JoinChatGroup", bookingId).catch((err) => {
          console.warn(
            "Failed to re-join booking group after reconnection:",
            err,
          );
        });
      }
    });

    connection.onclose((error) => {
      console.warn("SignalR connection closed.", error);
      if (isMounted) setIsConnected(false);
    });

    return () => {
      isMounted = false;
      if (connection) {
        connection
          .invoke("LeaveChatGroup", bookingId)
          .catch((err) => console.warn("Error invoking LeaveChatGroup:", err))
          .finally(() => {
            connection
              .stop()
              .then(() => console.log("SignalR ChatHub connection stopped."))
              .catch((err) =>
                console.error("Error stopping SignalR connection:", err),
              );
          });
      }
    };
  }, [bookingId, token, isEnabled]);

  return { isConnected: isEnabled && isConnected };
};

export default useChatHub;
