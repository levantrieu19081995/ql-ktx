/* eslint-disable @typescript-eslint/no-explicit-any */

let displayWin: Window | null = null;

// export async function openDisplayOnSecondary(terminalId = "6601") {
//   const url = `/customer-display?terminal=${encodeURIComponent(terminalId)}`;

//   // đã mở rồi thì focus
//   if (displayWin && !displayWin.closed) {
//     displayWin.focus();
//     return displayWin;
//   }

//   // fallback không có getScreenDetails
//   if (!("getScreenDetails" in window)) {
//     displayWin = window.open(url, "customerDisplay", "popup,width=480,height=800");
//     displayWin?.focus();
//     return displayWin;
//   }

//   // @ts-ignore
//   const details = await window.getScreenDetails();
//   // @ts-ignore
//   const screens = details.screens as any[];
//   // @ts-ignore
//   const current = details.currentScreen as any;

//   const secondary = screens.find((s) => s !== current) ?? screens[0];

//   const left = Math.round(secondary.availLeft ?? secondary.left ?? 0);
//   const top = Math.round(secondary.availTop ?? secondary.top ?? 0);
//   const width = Math.round(secondary.availWidth ?? secondary.width ?? 800);
//   const height = Math.round(secondary.availHeight ?? secondary.height ?? 600);

//   displayWin = window.open(
//     url,
//     "customerDisplay",
//     `popup=yes,left=${left},top=${top},width=${width},height=${height}`
//   );

//   displayWin?.focus();
//   return displayWin;
// }
 
 

export async function openDisplayOnSecondary(terminalId = "6601") {
  // const url = `/customer-display?terminal=${encodeURIComponent(terminalId)}`;

    // Lấy locale hiện tại từ path: /vi/abc -> vi
  const parts = window.location.pathname.split("/").filter(Boolean);
  const locale = parts[0]; // "vi", "en", ...

  const url = `/${locale}/customer-display?terminal=${encodeURIComponent(
    terminalId
  )}`;

  if (displayWin && !displayWin.closed) {
    displayWin.focus();
    return displayWin;
  }

  if (!("getScreenDetails" in window)) {
    displayWin = window.open(url, "customerDisplay", "popup,width=480,height=800");
    displayWin?.focus();
    return displayWin;
  }

  // @ts-ignore
  const details = await window.getScreenDetails();
  // @ts-ignore
  const screens = details.screens as any[];
  // @ts-ignore
  const current = details.currentScreen as any;

  const secondary = screens.find((s) => s !== current) ?? screens[0];

  const left = Math.round(secondary.availLeft ?? secondary.left ?? 0);
  const top = Math.round(secondary.availTop ?? secondary.top ?? 0);
  const width = Math.round(secondary.availWidth ?? secondary.width ?? 800);
  const height = Math.round(secondary.availHeight ?? secondary.height ?? 600);

  displayWin = window.open(
    url,
    "customerDisplay",
    `popup=yes,left=${left},top=${top},width=${width},height=${height}`
  );

  displayWin?.focus();
  return displayWin;
}


export function isDisplayOpened() {
  return !!displayWin && !displayWin.closed;
}

export function closeDisplay() {
  if (displayWin && !displayWin.closed) displayWin.close();
  displayWin = null;
}



let bc: BroadcastChannel | null = null;
let bcName = "";

// export function ensureBC(terminalId: string) {
//   const name = `POS_DISPLAY_${terminalId}`;
//   if (bc && bcName === name) return;
//   bc?.close();
//   bc = new BroadcastChannel(name);
//   bcName = name;
// }

// export function pushQRToDisplay(terminalId: string, qrCode: string, tongTien = 0) {
//   ensureBC(terminalId);
//   bc?.postMessage({ type: "QR", terminalId, qrCode, tongTien });
// }

export function clearDisplay(terminalId: string) {
  ensureBC(terminalId);
  bc?.postMessage({ type: "CLEAR", terminalId });
}

export function successDisplay(terminalId: string) {
  ensureBC(terminalId);
  bc?.postMessage({ type: "SUCCESS", terminalId });
}

export function ensureBC(terminalId: string) {
  const name = `POS_DISPLAY_${terminalId}`;
  if (bc && bcName === name) return;
  bc?.close();
  bc = new BroadcastChannel(name);
  bcName = name;
}
export function pushQRToDisplay(terminalId: string, qrCode: string, tongTien = 0, bienSo:string) {
  ensureBC(terminalId);
  bc?.postMessage({ type: "SHOW_QR", terminalId, qrCode, tongTien ,bienSo});
}
export const terminalId = "6601";


export function waitForDisplayReady(terminalId: string, timeoutMs = 3000) {
  return new Promise<boolean>((resolve) => {
    const bc = new BroadcastChannel(`POS_DISPLAY_${terminalId}`);
    let done = false;

    const timer = setTimeout(() => {
      if (done) return;
      done = true;
      bc.close();
      resolve(false);
    }, timeoutMs);

    bc.onmessage = (e) => {
      const msg = e.data;
      if (msg?.type === "READY" && msg?.terminalId === terminalId) {
        if (done) return;
        done = true;
        clearTimeout(timer);
        bc.close();
        resolve(true);
      }
    };
  });
}


 // const logScreens = async () => {
  //   // Kiểm tra hỗ trợ
  //   if (!("getScreenDetails" in window)) {
  //     console.log(
  //       "❌ Trình duyệt không hỗ trợ getScreenDetails(). Dùng Chrome/Edge.",
  //     );
  //     return;
  //   }

  //   try {
  //     // @ts-ignore
  //     const details = await window.getScreenDetails();

  //     // @ts-ignore
  //     const screens = details.screens;
  //     // @ts-ignore
  //     const current = details.currentScreen;

  //     console.log("===== SCREEN DETAILS =====");
  //     console.log("screen.isExtended:", (window.screen as any).isExtended);
  //     console.log("Tổng số màn:", screens.length);

  //     screens.forEach((s: any, i: number) => {
  //       console.log(`--- Screen #${i} ---`);
  //       console.log("isCurrent:", s === current);
  //       console.log("left:", s.left, "top:", s.top);
  //       console.log("width:", s.width, "height:", s.height);
  //       console.log("availLeft:", s.availLeft, "availTop:", s.availTop);
  //       console.log("availWidth:", s.availWidth, "availHeight:", s.availHeight);
  //       console.log("devicePixelRatio:", s.devicePixelRatio);
  //       console.log("orientation:", s.orientation?.type);
  //       console.log("label:", s.label);
  //     });

  //     const secondary = screens.find((s: any) => !s.isCurrent); // nếu bạn map lại

  //     // Lấy thông số từ màn phụ (ưu tiên avail*)
  //     const left = Math.round(secondary.availLeft ?? secondary.left ?? 0);
  //     const top = Math.round(secondary.availTop ?? secondary.top ?? 0);
  //     const width = Math.round(secondary.availWidth ?? secondary.width ?? 800);
  //     const height = Math.round(
  //       secondary.availHeight ?? secondary.height ?? 600,
  //     );

  //     window.open(
  //       "/customer-display?terminal=6601",
  //       "customerDisplay",
  //       `popup=yes,left=${left},top=${top},width=${width},height=${height}`,
  //     );

  //     console.log("===== END =====");
  //   } catch (err) {
  //     console.log("❌ Lỗi khi lấy screen details:", err);
  //   }
  // };

  // // Mở màn phụ
  // const terminalId = "6601";
  // const channelName = `POS_DISPLAY_${terminalId}`;

  // const displayWinRef = useRef<Window | null>(null);
  // const bcRef = useRef<BroadcastChannel | null>(null);
  // // const openDisplayOnSecondary = async () => {
  // //   const url = `/customer-display?terminal=${terminalId}`;

  // //   // đã mở rồi thì focus
  // //   if (displayWinRef.current && !displayWinRef.current.closed) {
  // //     displayWinRef.current.focus();
  // //     return displayWinRef.current;
  // //   }

  // //   // fallback không có getScreenDetails
  // //   if (!("getScreenDetails" in window)) {
  // //     displayWinRef.current = window.open(
  // //       url,
  // //       "customerDisplay",
  // //       "popup,width=480,height=800",
  // //     );
  // //     displayWinRef.current?.focus();
  // //     return displayWinRef.current;
  // //   }

  // //   // @ts-ignore
  // //   const details = await window.getScreenDetails();
  // //   // @ts-ignore
  // //   const screens = details.screens as any[];
  // //   // @ts-ignore
  // //   const current = details.currentScreen as any;

  // //   const secondary = screens.find((s) => s !== current) ?? screens[0];

  // //   const left = Math.round(secondary.availLeft ?? secondary.left ?? 0);
  // //   const top = Math.round(secondary.availTop ?? secondary.top ?? 0);
  // //   const width = Math.round(secondary.availWidth ?? secondary.width ?? 800);
  // //   const height = Math.round(secondary.availHeight ?? secondary.height ?? 600);

  // //   displayWinRef.current = window.open(
  // //     url,
  // //     "customerDisplay",
  // //     `popup=yes,left=${left},top=${top},width=${width},height=${height}`,
  // //   );

  // //   displayWinRef.current?.focus();
  // //   return displayWinRef.current;
  // // };

  // const pushQRToDisplay = () => {
  //   bcRef.current?.postMessage({
  //     type: "QR",
  //     terminalId,
  //     qrCode: paymentInfo?.qrCode ?? "",
  //     tongTien: paymentInfo?.tongTien ?? 0,
  //   });
  // };

  // useEffect(() => {
  //   bcRef.current = new BroadcastChannel(channelName);
  //   return () => bcRef.current?.close();
  // }, []);

  // useEffect(() => {
  //   if (!hasValidQR) return;

  //   (async () => {
  //     const w = await openDisplayOnSecondary();

  //     // nếu popup bị chặn -> w sẽ null
  //     if (!w) return;

  //     pushQRToDisplay();
  //   })();
  // }, [hasValidQR, paymentInfo?.qrCode, paymentInfo?.tongTien]);