// /* eslint-disable react-hooks/rules-of-hooks */
// /* eslint-disable @typescript-eslint/no-unused-expressions */
// // "use client";

// // import { useEffect, useMemo, useState } from "react";
// // import { QRCode } from "react-qrcode-logo";

// // type Payload = {
// //   terminalId: string;
// //   tongTien: number;
// //   listPhi: any[];
// //   qrCode: string;
// //   paymentStatus: string;
// //   thuHuong?: { hoTen: string; soTk: string; maNH: string };
// // };

// // export default function CustomerDisplayPage() {
// //   const params = useMemo(() => new URLSearchParams(window.location.search), []);
// //   const terminalId = params.get("terminal") || "6601";

// //   const [data, setData] = useState<Payload | null>(null);

// //   useEffect(() => {
// //     const bc = new BroadcastChannel(`POS_DISPLAY_${terminalId}`);

// //     bc.onmessage = (e) => {
// //       const msg = e.data;

// //       if (!msg) return;

// //       if (msg.type === "SHOW_QR" || msg.type === "UPDATE") {
// //         setData(msg);
// //       }

// //       if (msg.type === "CLEAR") {
// //         setData(null);
// //       }
// //     };

// //     return () => bc.close();
// //   }, [terminalId]);

// //   const hasQR =
// //     !!data?.qrCode &&
// //     data.qrCode !== "ERROR" &&
// //     data.qrCode.trim() !== "" &&
// //     data.paymentStatus !== "SUCCESS";

// //   return (
// //     <div
// //       style={{
// //         width: "100vw",
// //         height: "100vh",
// //         background: "#0b1220",
// //         color: "#fff",
// //       }}
// //     >
// //       <div
// //         style={{
// //           padding: 20,
// //           borderBottom: "1px solid rgba(255,255,255,0.12)",
// //         }}
// //       >
// //         <div style={{ fontSize: 22, fontWeight: 800 }}>THANH TOÁN QR</div>
// //         <div style={{ opacity: 0.85, marginTop: 6 }}>
// //           Quầy: <b>{terminalId}</b>
// //         </div>

// //         <div style={{ marginTop: 10, fontSize: 20 }}>
// //           Tổng tiền:{" "}
// //           <b style={{ color: "#7dd3fc" }}>
// //             {(data?.tongTien ?? 0).toLocaleString()} VNĐ
// //           </b>
// //         </div>

// //         {data?.thuHuong ? (
// //           <div style={{ marginTop: 8, opacity: 0.9, fontSize: 14 }}>
// //             <div>
// //               Thụ hưởng: <b>{data.thuHuong.hoTen}</b>
// //             </div>
// //             <div>
// //               STK: <b>{data.thuHuong.soTk}</b> | NH: <b>{data.thuHuong.maNH}</b>
// //             </div>
// //           </div>
// //         ) : null}
// //       </div>

// //       <div
// //         style={{
// //           display: "flex",
// //           gap: 24,
// //           padding: 24,
// //           height: "calc(100vh - 110px)",
// //         }}
// //       >
// //         {/* QR box */}
// //         <div
// //           style={{
// //             flex: "0 0 460px",
// //             background: "#fff",
// //             borderRadius: 18,
// //             display: "grid",
// //             placeItems: "center",
// //           }}
// //         >
// //           {data?.paymentStatus === "SUCCESS" ? (
// //             <div style={{ color: "#0f172a", fontSize: 26, fontWeight: 900 }}>
// //               ✅ ĐÃ THANH TOÁN
// //             </div>
// //           ) : hasQR ? (
// //             <QRCode
// //               value={data!.qrCode}
// //               size={380}
// //               qrStyle="dots"
// //               eyeRadius={10}
// //               fgColor="#1047a7"
// //               bgColor="#ffffff"
// //               logoImage="/images/LogoCUSC.png"
// //               logoWidth={80}
// //               logoPadding={10}
// //               logoPaddingStyle="circle"
// //               quietZone={12}
// //               ecLevel="H"
// //             />
// //           ) : (
// //             <div style={{ color: "#0f172a", fontSize: 18, fontWeight: 700 }}>
// //               Đang chờ mã QR...
// //             </div>
// //           )}
// //         </div>

// //         {/* list fee */}
// //         <div style={{ flex: 1, overflow: "auto" }}>
// //           <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 12 }}>
// //             Chi tiết phí
// //           </div>

// //           {data?.listPhi?.length ? (
// //             <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
// //               {data.listPhi.map((x: any, idx: number) => (
// //                 <div
// //                   key={idx}
// //                   style={{
// //                     display: "flex",
// //                     justifyContent: "space-between",
// //                     padding: "12px 14px",
// //                     borderRadius: 14,
// //                     background: "rgba(255,255,255,0.08)",
// //                   }}
// //                 >
// //                   <div style={{ opacity: 0.92 }}>{x.tenPhi}</div>
// //                   <div style={{ fontWeight: 900 }}>
// //                     {(x.soTien ?? 0).toLocaleString()} VNĐ
// //                   </div>
// //                 </div>
// //               ))}
// //             </div>
// //           ) : (
// //             <div style={{ opacity: 0.7 }}>Chưa có dữ liệu phí</div>
// //           )}
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }
// "use client";

// import { useEffect, useMemo, useState } from "react";
// import { QRCode } from "react-qrcode-logo";

// type Msg =
//   | {
//       type: "SHOW_QR";
//       terminalId: string;
//       qrCode: string;
//       tongTien: number;
//       bienSo: string;
//     }
//   | { type: "SUCCESS"; terminalId: string }
//   | { type: "CLEAR"; terminalId: string };

// export default function customerDisplayPage() {
//   const params = useMemo(() => new URLSearchParams(window.location.search), []);
//   const terminalId = params.get("terminal") || "6601";

//   const [qrCode, setQrCode] = useState("");
//   const [tongTien, setTongTien] = useState(0);
//   const [status, setStatus] = useState<"IDLE" | "SHOW_QR" | "SUCCESS">("IDLE");
//   const [bienSo, setBienSo] = useState("");

//   //   useEffect(() => {
//   //     const bc = new BroadcastChannel(`POS_DISPLAY_${terminalId}`);
//   //     bc.onmessage = (e) => {
//   //       const msg = e.data as Msg;
//   //       if (msg?.type === "QR") {
//   //         setQrCode(msg.qrCode || "");
//   //         setTongTien(Number(msg.tongTien || 0));
//   //       }
//   //     };
//   //     return () => bc.close();
//   //   }, [terminalId]);

//   //   const hasQR = qrCode && qrCode !== "ERROR" && qrCode.trim() !== "";
//   const hasQR =
//     status === "SHOW_QR" &&
//     qrCode &&
//     qrCode !== "ERROR" &&
//     qrCode.trim() !== "";
//   bienSo.trim() !== "";

//   useEffect(() => {
//     const bc = new BroadcastChannel(`POS_DISPLAY_${terminalId}`);
//     bc.onmessage = (e) => {
//       const msg = e.data as Msg;
//       if (!msg) return;

//       if (msg.type === "SHOW_QR") {
//         setQrCode(msg.qrCode || "");
//         setBienSo(msg.bienSo || "");
//         setTongTien(Number(msg.tongTien || 0));
//         setStatus("SHOW_QR");
//       }

//       if (msg.type === "SUCCESS") {
//         setStatus("SUCCESS");
//         // optional: ẩn QR luôn
//         // setQrCode("");
//       }

//       if (msg.type === "CLEAR") {
//         setQrCode("");
//         setTongTien(0);
//         setStatus("IDLE");
//       }
//     };
//     return () => bc.close();
//   }, [terminalId]);

//   return (
//     // <div
//     //   style={{
//     //     width: "100vw",
//     //     height: "100vh",
//     //     background: "#0b1220",
//     //     color: "white",
//     //     display: "grid",
//     //     placeItems: "center",
//     //     gap: 16,
//     //     padding: 24,
//     //   }}
//     // >
//     <div
//       style={{
//         width: "100vw",
//         height: "100vh",
//         background: "#0b1220",
//         color: "white",
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//         justifyContent: "flex-start",
//         paddingTop: 24,
//         gap: 10, // khoảng cách giữa header và QR
//       }}
//     >
//       <div style={{ textAlign: "center" }}>
//         <div style={{ fontSize: 26, fontWeight: 900 }}>MÃ QR THANH TOÁN</div>
//         {status === "SUCCESS" ? (
//           <div
//             style={{
//               marginTop: 8,
//               fontSize: 22,
//               fontWeight: 900,
//               color: "#34d399",
//             }}
//           >
//             ✅ ĐÃ THANH TOÁN
//           </div>
//         ) : (
//           <div
//             style={{
//               marginTop: 8,
//               fontSize: 20,
//               display: "flex",
//               flexDirection: "column",
//               gap: 6,
//             }}
//           >
//             <div>
//               Biển số: <b style={{ color: "#7dd3fc" }}>{bienSo}</b>
//             </div>

//             <div>
//               Tổng tiền:{" "}
//               <b style={{ color: "#7dd3fc" }}>
//                 {tongTien.toLocaleString()} VNĐ
//               </b>
//             </div>
//           </div>
//         )}
//       </div>

//       <div
//         style={{
//           background: "white",
//           borderRadius: 18,
//           padding: 18,
//           width: 420,
//           height: 420,
//           display: "grid",
//           placeItems: "center",
//           marginTop: 20,
//         }}
//       >
//         {status === "SUCCESS" ? (
//           <div style={{ color: "#111", fontWeight: 900, fontSize: 22 }}>
//             ✅ Thanh toán thành công
//           </div>
//         ) : hasQR ? (
//           <QRCode
//             value={qrCode}
//             size={360}
//             qrStyle="dots"
//             eyeRadius={10}
//             fgColor="#1047a7"
//             bgColor="#ffffff"
//             logoImage="/images/LogoCUSC.png"
//             logoWidth={70}
//             logoPadding={10}
//             logoPaddingStyle="circle"
//             quietZone={12}
//             ecLevel="H"
//           />
//         ) : (
//           <div style={{ color: "#111", fontWeight: 800 }}>
//             Đang chờ mã QR...
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { QRCode } from "react-qrcode-logo";

type Msg =
  | {
      type: "SHOW_QR";
      terminalId: string;
      qrCode: string;
      tongTien: number;
      bienSo: string;
    }
  | { type: "SUCCESS"; terminalId: string }
  | { type: "CLEAR"; terminalId: string };

export default function CustomerDisplayPage() {
  const searchParams = useSearchParams();
  const terminalId = searchParams?.get("terminal") || "6601";

  const [qrCode, setQrCode] = useState("");
  const [tongTien, setTongTien] = useState(0);
  const [status, setStatus] = useState<"IDLE" | "SHOW_QR" | "SUCCESS">("IDLE");
  const [bienSo, setBienSo] = useState("");

  const hasQR =
    status === "SHOW_QR" &&
    !!qrCode &&
    qrCode !== "ERROR" &&
    qrCode.trim() !== "";

  useEffect(() => {
    const bc = new BroadcastChannel(`POS_DISPLAY_${terminalId}`);
    bc.onmessage = (e) => {
      const msg = e.data as Msg;
      if (!msg) return;

      if (msg.type === "SHOW_QR") {
        setQrCode(msg.qrCode || "");
        setBienSo(msg.bienSo || "");
        setTongTien(Number(msg.tongTien || 0));
        setStatus("SHOW_QR");
      }

      if (msg.type === "SUCCESS") {
        setStatus("SUCCESS");
      }

      if (msg.type === "CLEAR") {
        setQrCode("");
        setBienSo("");
        setTongTien(0);
        setStatus("IDLE");
      }
    };
    return () => bc.close();
  }, [terminalId]);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#0b1220",
        color: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        paddingTop: 24,
        gap: 10,
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 26, fontWeight: 900 }}>MÃ QR THANH TOÁN</div>

        {status === "SUCCESS" ? (
          <div
            style={{
              marginTop: 8,
              fontSize: 22,
              fontWeight: 900,
              color: "#34d399",
            }}
          >
            ✅ ĐÃ THANH TOÁN
          </div>
        ) : (
          <div
            style={{
              marginTop: 8,
              fontSize: 20,
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <div>
              Biển số: <b style={{ color: "#7dd3fc" }}>{bienSo}</b>
            </div>
            <div>
              Tổng tiền:{" "}
              <b style={{ color: "#7dd3fc" }}>
                {tongTien.toLocaleString()} VNĐ
              </b>
            </div>
          </div>
        )}
      </div>

      <div
        style={{
          background: "white",
          borderRadius: 18,
          padding: 18,
          width: 420,
          height: 420,
          display: "grid",
          placeItems: "center",
          marginTop: 20,
        }}
      >
        {status === "SUCCESS" ? (
          <div style={{ color: "#111", fontWeight: 900, fontSize: 22 }}>
            ✅ Thanh toán thành công
          </div>
        ) : hasQR ? (
          <QRCode
            value={qrCode}
            size={360}
            qrStyle="dots"
            eyeRadius={10}
            fgColor="#1047a7"
            bgColor="#ffffff"
            logoImage="/images/LogoCUSC.png"
            logoWidth={70}
            logoPadding={10}
            logoPaddingStyle="circle"
            quietZone={12}
            ecLevel="H"
          />
        ) : (
          <div style={{ color: "#111", fontWeight: 800 }}>
            Đang chờ mã QR...
          </div>
        )}
      </div>
    </div>
  );
}
