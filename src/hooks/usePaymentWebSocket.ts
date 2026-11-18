 
import { useEffect, useState, useCallback } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { getSession } from "next-auth/react";
import { QLDK_SERVICE } from "@/constants/servicePaths";
import { buildSockJsUrl } from "@/utils/websocketUrl";

// const SOCKET_URL = "http://172.16.10.191:3004/stomp";
// const SOCKET_URL = "https://api-qldk.cusc.vn/qldk-service/stomp";

export const usePaymentWebSocket = (transactionId?: string, token?: string) => {
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const [session, setSession] = useState<any>(null); // Store the session

  // Hàm addMsg được định nghĩa ở đây để tránh lỗi
  const addMsg = useCallback((msg: string) => {
    setMessages((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  }, []);

  // Lấy session từ next-auth khi component mount
  useEffect(() => {
    const fetchSession = async () => {
      const sessionData = await getSession();
      setSession(sessionData);
    };

    fetchSession();
  }, []);

  // Hàm connect riêng để gọi trực tiếp khi cần
  const connect = useCallback(() => {
    if (!transactionId || !session) {
      console.log("Missing transactionId, token, or session");
      return;
    }

    // Nếu stompClient đã có rồi, không cần kết nối lại
    if (stompClient) {
      console.log("WebSocket is already connected.");
      return;
    }

    // Tạo SockJS và client STOMP
    const socketUrl = buildSockJsUrl(QLDK_SERVICE);
    const client = new Client({
      webSocketFactory: () => new SockJS(socketUrl),
      connectHeaders: { jwt: `${session.accessToken}` }, // Sử dụng session.accessToken
      reconnectDelay: 5000, // tự động reconnect sau 5s
      debug: (msg) => console.log("STOMP DEBUG:", msg),
    });

    // Callback khi kết nối thành công
    client.onConnect = () => {
      console.log(" =======>  Connected to WebSocket   <========");
      setConnected(true); 

      // Subscriptions
      client.subscribe("/topic/payment/notifications", (message) => {
        const data = JSON.parse(message.body);
        addMsg(`🔔 General: ${data.status} - ${data.message}`);
        setPaymentStatus(data.status);
      });

      client.subscribe(`/topic/payment/status/${transactionId}`, (message) => {
        const data = JSON.parse(message.body);
        addMsg(`💰 Transaction ${transactionId}: ${data.status} - ${data.message}`);
        setPaymentStatus(data.status);
      });

      console.log(` =======> Subscribed to /topic/payment/status/${transactionId}`);
    };

    // Callback khi có lỗi STOMP
    client.onStompError = (frame) => {
      console.error("STOMP error:", frame);
      console.log(" =======> STOMP error, see console.");
    };

    // Callback khi có lỗi WebSocket
    client.onWebSocketError = (event) => {
      console.error("WebSocket error:", event);
      console.log(" =======> WebSocket error occurred.");
    };

    // Kích hoạt client STOMP
    client.activate();
    setStompClient(client); // Lưu stompClient để quản lý
  }, [transactionId, stompClient, session, addMsg]);

  // Hàm disconnect
  const disconnect = useCallback(() => {
    if (stompClient) {
      stompClient.deactivate(); // Deactivate STOMP client
      setConnected(false);
      setPaymentStatus(null); // Optional: Reset payment status
      setStompClient(null); 
      console.log(" =======> WebSocket disconnected");
    } else {
      console.log(" =======> No active WebSocket to disconnect");
    }
  }, [stompClient]);

  // Hàm dọn dẹp khi component unmount
  useEffect(() => {
    // Chỉ gọi connect khi transactionId đã có sẵn và session không phải null
    if (transactionId && session && !stompClient) { 
      connect(); // Gọi connect khi các điều kiện đã sẵn sàng
    }

    return () => {
      if (stompClient) {
        stompClient.deactivate(); // Đảm bảo tắt kết nối khi component unmount
        setConnected(false);
        console.log(" =======> WebSocket disconnected");
      }
    };
  }, [transactionId, connect, stompClient, session]);
 
// useEffect(() => {
//   const setupConnection = async () => {
//     if (transactionId && session) {
//       // Nếu đã có stompClient -> ngắt trước khi kết nối mới
//       if (stompClient) {
//         console.log("♻️ Transaction changed — reconnecting WebSocket...");
//         await (stompClient as Client).deactivate();
//         setStompClient(null);
//       }

//       // Gọi connect khi các điều kiện đã sẵn sàng
//       connect();
//     }
//   };

//   setupConnection(); // Gọi hàm async ở trong useEffect

//   // Cleanup khi unmount
//   return () => {
//     if (stompClient) {
//       (stompClient as Client).deactivate();
//       setConnected(false);
//       console.log(" =======> WebSocket disconnected (unmount)");
//     }
//   };
// }, [transactionId, connect, stompClient, session]);



  return { connected, messages, paymentStatus, connect, disconnect };
};
