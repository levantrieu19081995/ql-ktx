/* eslint-disable react-hooks/exhaustive-deps */
// import {
//   createThanhToan,
//   previewInvoice,
//   doPayment,
//   fetchPaymentConfigSimple,
// } from "@/utils/acceptancePaymentFlow";

// export const useAcceptancePaymentFlow = ({
//   result,
//   payment,
//   paymentInfo,
//   setPaymentInfo,
//   setOpenedModalPayment,
//   setLoadingModalPayment,
//   setTransactionId,
//   setInvoiceParams,
//   setSelectedRows,
//   setInvoiceData,
//   setOpenedPreview,
//   selectedPreview,
//   connect,
//   setPayment,
// }: any) => {
//   const onCreateThanhToan = () =>
//     createThanhToan({
//       result,
//       setPaymentInfo,
//       setOpenedModalPayment,
//       setLoadingModalPayment,
//       handlePayment,
//     });

//   const handlePreviewInvoice = () =>
//     previewInvoice({
//       result,
//       selectedPreview,
//       setInvoiceParams,
//       setSelectedRows,
//       setInvoiceData,
//       setOpenedPreview,
//     });

//   const handlePayment = (danhSachPdv: []) =>
//     doPayment({
//       danhSachPdv,
//       result,
//       payment,
//       paymentInfo,
//       setPaymentInfo,
//       setTransactionId,
//       connect,
//       setLoadingModalPayment,
//     });

//   const initPaymentConfig = () => fetchPaymentConfigSimple(setPayment);

//   return {
//     onCreateThanhToan,
//     handlePreviewInvoice,
//     handlePayment,
//     initPaymentConfig,
//   };
// };
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { getSession } from "next-auth/react";
import { QLDK_SERVICE } from "@/constants/servicePaths";
import { buildSockJsUrl } from "@/utils/websocketUrl";

//   giữ nguyên các util cũ (nếu bạn vẫn dùng payment flow)
import {
  createThanhToan,
  previewInvoice,
  doPayment,
  fetchPaymentConfigSimple,
} from "@/utils/acceptancePaymentFlow";

// ==============================
// 1) Websocket tối ưu (internal)
// ==============================
function usePaymentWebSocket(transactionId?: string) {
  const [connected, setConnected] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);

  // ref giữ client/session để tránh rerender
  const clientRef = useRef<Client | null>(null);
  const sessionRef = useRef<any>(null);

  // messages: chỉ để debug (hạn chế rerender)
  const messagesRef = useRef<string[]>([]);
  const [messages, setMessages] = useState<string[]>([]);

  const addMsg = useCallback((msg: string) => {
    const line = `[${new Date().toLocaleTimeString()}] ${msg}`;
    messagesRef.current = [...messagesRef.current, line];

    if (messagesRef.current.length > 50) {
      messagesRef.current = messagesRef.current.slice(-50);
    }
    // vẫn setState nhưng giới hạn 50
    setMessages(messagesRef.current);
  }, []);

  // lấy session 1 lần
  useEffect(() => {
    let alive = true;
    (async () => {
      const s = await getSession();
      if (alive) sessionRef.current = s;
    })();
    return () => {
      alive = false;
    };
  }, []);

  const connect = useCallback(() => {
    if (!transactionId) return;

    const session = sessionRef.current;
    if (!session?.accessToken) return;

    // đã có client thì thôi
    if (clientRef.current) return;

    const socketUrl = buildSockJsUrl(QLDK_SERVICE);
    const client = new Client({
      webSocketFactory: () => new SockJS(socketUrl),
      connectHeaders: { jwt: `${session.accessToken}` },
      reconnectDelay: 5000,
      // debug: (msg) => console.log("STOMP DEBUG:", msg),
    });

    client.onConnect = () => {
      setConnected(true);

      client.subscribe("/topic/payment/notifications", (message) => {
        const data = JSON.parse(message.body);
        addMsg(`🔔 General: ${data.status} - ${data.message}`);
        setPaymentStatus(data.status);
      });

      client.subscribe(`/topic/payment/status/${transactionId}`, (message) => {
        const data = JSON.parse(message.body);
        addMsg(`💰 Tx ${transactionId}: ${data.status} - ${data.message}`);
        setPaymentStatus(data.status);
      });
    };

    client.onWebSocketClose = () => {
      setConnected(false);
      clientRef.current = null;
    };

    client.onStompError = (frame) => {
      addMsg(`❌ STOMP error: ${frame.headers?.message || "unknown"}`);
    };

    client.activate();
    clientRef.current = client;
  }, [transactionId, addMsg]);

  const disconnect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.deactivate();
      clientRef.current = null;
    }
    setConnected(false);
    setPaymentStatus(null);
  }, []);

  // auto connect khi đủ điều kiện
  useEffect(() => {
    if (!transactionId) return;

    const t = setInterval(() => {
      if (sessionRef.current?.accessToken && !clientRef.current) {
        connect();
        clearInterval(t);
      }
    }, 100);

    return () => clearInterval(t);
  }, [transactionId, connect]);

  // cleanup
  useEffect(() => {
    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
      }
    };
  }, []);

  return { connected, messages, paymentStatus, connect, disconnect };
}

// ===========================================
// 2) Hook GIỮ NGUYÊN TÊN + INPUT/OUTPUT CŨ
// ===========================================
export const useAcceptancePaymentFlow = ({
  result,
  payment,
  paymentInfo,
  setPaymentInfo,
  setOpenedModalPayment,
  setLoadingModalPayment,
  setTransactionId,
  setInvoiceParams,
  setSelectedRows,
  setInvoiceData,
  setOpenedPreview,
  selectedPreview,
  // connect được truyền vào trước đây: giữ lại để khỏi vỡ,
  // nhưng mình sẽ override bằng connect nội bộ.
  connect: connectFromOutside,
  setPayment,
}: any) => {
  //   giữ transactionId tại đây để websocket hook hoạt động
  // nếu parent đã có state transactionId thì bạn vẫn dùng setTransactionId truyền vào
  const [txIdLocal, setTxIdLocal] = useState<string | undefined>(undefined);

  const ws = usePaymentWebSocket(txIdLocal);

  //   đảm bảo: mọi nơi dùng connect cũ vẫn chạy
  const connect = useCallback(() => {
    // ưu tiên connect nội bộ (tối ưu)
    ws.connect();
    // nếu bạn vẫn muốn gọi connect cũ ngoài (tuỳ), có thể bật lại:
    // connectFromOutside?.();
  }, [ws.connect]);

  const disconnect = useCallback(() => {
    ws.disconnect();
  }, [ws.disconnect]);

  // ---- y như flow cũ, chỉ khác: khi doPayment ra transactionId -> setTxIdLocal + setTransactionId ----
  const onCreateThanhToan = useCallback(() => {
    return createThanhToan({
      result,
      setPaymentInfo,
      setOpenedModalPayment,
      setLoadingModalPayment,
      handlePayment, // eslint: vẫn dùng handlePayment phía dưới
    });
  }, [
    result,
    setPaymentInfo,
    setOpenedModalPayment,
    setLoadingModalPayment,
    // handlePayment sẽ được hoist nhờ useCallback bên dưới (JS closure ok)
  ]);

  const handlePreviewInvoice = useCallback(() => {
    return previewInvoice({
      result,
      selectedPreview,
      setInvoiceParams,
      setSelectedRows,
      setInvoiceData,
      setOpenedPreview,
    });
  }, [
    result,
    selectedPreview,
    setInvoiceParams,
    setSelectedRows,
    setInvoiceData,
    setOpenedPreview,
  ]);

  const handlePayment = useCallback(
    async (danhSachPdv: []) => {
      // doPayment thường trả transactionId trong response (tuỳ code của bạn).
      // Mình làm theo kiểu: doPayment return response có transactionId.
      const res = await doPayment({
        danhSachPdv,
        result,
        payment,
        paymentInfo,
        setPaymentInfo,
        setTransactionId: (id: any) => {
          //   giữ behavior cũ: update state ở parent nếu có
          setTransactionId?.(id);

          //   thêm: set local tx để websocket tự connect
          const s = id != null ? String(id) : undefined;
          setTxIdLocal(s);
        },
        connect, //   dùng connect nội bộ
        setLoadingModalPayment,
      });

      // nếu doPayment không gọi setTransactionId bên trong mà trả về:
      const returnedId =
        (res as any)?.transactionId ?? (res as any)?.payload?.transactionId;
      if (returnedId != null) {
        const s = String(returnedId);
        setTransactionId?.(s);
        setTxIdLocal(s);
      }

      return res;
    },
    [
      result,
      payment,
      paymentInfo,
      setPaymentInfo,
      setTransactionId,
      connect,
      setLoadingModalPayment,
    ]
  );

  const initPaymentConfig = useCallback(() => {
    return fetchPaymentConfigSimple(setPayment);
  }, [setPayment]);

  // nếu parent setTransactionId từ nơi khác, bạn có thể sync vào local txId:
  // (tuỳ bạn có field đó trong paymentInfo/result không)
  useEffect(() => {
    // ví dụ: nếu paymentInfo có transactionId
    const tid =
      paymentInfo?.transactionId ??
      paymentInfo?.payload?.transactionId ??
      null;
    if (tid != null) setTxIdLocal(String(tid));
  }, [paymentInfo]);

  // Output giữ nguyên + thêm ws debug nếu muốn
  return useMemo(
    () => ({
      onCreateThanhToan,
      handlePreviewInvoice,
      handlePayment,
      initPaymentConfig,

      // thêm để bạn dùng debug/tracking nếu cần
      connected: ws.connected,
      messages: ws.messages,
      paymentStatus: ws.paymentStatus,
      connect,
      disconnect,
    }),
    [
      onCreateThanhToan,
      handlePreviewInvoice,
      handlePayment,
      initPaymentConfig,
      ws.connected,
      ws.messages,
      ws.paymentStatus,
      connect,
      disconnect,
    ]
  );
};
