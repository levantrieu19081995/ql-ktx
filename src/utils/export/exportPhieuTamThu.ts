 
// export const exportPhieuTamThu = (data: any) => {
//   if (typeof window === "undefined") return;

//   const w = window.open("", "_blank");
//   if (!w) return;

//   const html = `
// <!DOCTYPE html>
// <html>
// <head>
//   <title>Phiếu tạm thu</title>
//   <style>
//     @page {
//       size: A5 portrait;
//       margin: 8mm;
//     }

//     body {
//       font-family: "Times New Roman", serif;
//       font-size: 13px;
//       line-height: 1.35;
//       margin: 0;
//       padding: 0;
//     }

//     .center { text-align: center; }
//     .right { text-align: right; }
//     .bold { font-weight: bold; }
//     .italic { font-style: italic; }
//     .underline { text-decoration: underline; }

//     table {
//       width: 100%;
//       border-collapse: collapse;
//     }

//     .header td {
//       vertical-align: top;
//     }

//     .left {
//       width: 45%;
//       font-size: 12px;
//     }

//     .right {
//       width: 55%;
//       font-size: 12px;
//     }

//     h2 {
//       margin: 12px 0 10px;
//       font-size: 16px;
//     }

//     .content {
//       margin-top: 6px;
//       font-size: 13px;
//     }

//     .content p {
//       margin: 4px 0;
//     }

//     .fee-table {
//       margin-top: 6px;
//       border: 1px solid #000;
//       font-size: 12px;
//     }

//     .fee-table th,
//     .fee-table td {
//       border: 1px solid #000;
//       padding: 4px;
//       text-align: center;
//     }

//     .sign {
//       margin-top: 12px;
//       text-align: right;
//       font-size: 13px;
//     }

//     .note {
//       margin-top: 8px;
//       font-size: 11.5px;
//       font-style: italic;
//     }
//   </style>
// </head>

// <body>

// <!-- HEADER -->
// <table class="header">
//   <tr>
//     <td class="left center bold">
//       SỞ XÂY DỰNG ĐỒNG THÁP<br>
//       TT ĐĂNG KIỂM PT CƠ GIỚI THỦY, BỘ<br>
//       Số: ${data.soPhieu ?? "……"} / PTT-ĐKTB
//     </td>

//     <td class="right center">
//       <div class="bold">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
//       <div class="bold underline italic">Độc lập - Tự do - Hạnh phúc</div>
//     </td>
//   </tr>
// </table>

// <h2 class="center bold">PHIẾU TẠM THU</h2>

// <div class="content">
//   <p>
//     Trung tâm Đăng kiểm Phương tiện cơ giới thủy, bộ Đồng Tháp tạm thu tiền kiểm định
//     của phương tiện mang biển số: <b>${data.bienSo ?? "……………"}</b>
//   </p>

//   <p><b>Tổng số tiền: ${data.tongTien}</b></p>
// </div>

// <!-- BẢNG CÔNG ĐOẠN KHÔNG ĐẠT -->
// <table class="fee-table">
//   <tr>
//     <th>Lượt KĐ</th>
//     <th colspan="5">Công đoạn không đạt</th>
//     <th>Khác</th>
//   </tr>
//   <tr>
//     <td></td><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td></td>
//   </tr>
//   <tr>
//     <td style="height: 18px;"></td>
//     <td></td><td></td><td></td><td></td><td></td><td></td>
//   </tr>
// </table>

// <div class="sign italic">
//   Tp. Cao Lãnh, ngày ${data.ngay} tháng ${data.thang} năm ${data.nam}
// </div>

// <div class="sign bold">Người lập phiếu</div>
// <div class="sign" style="margin-top: 30px;">
//   ${data.nguoiLap ?? ""}
// </div>

// <div class="note">
//   <b>Lưu ý:</b> Xuất trình Phiếu tạm thu này cho đăng kiểm viên kiểm tra khi ra, vào khu vực Trung tâm Đăng kiểm.<br>
//   - Nếu có công đoạn nào không đạt, yêu cầu đưa phương tiện ra ngoài khu vực Trung tâm Đăng kiểm để sửa chữa.<br>
//   - Phiếu tạm thu này chỉ có giá trị thanh toán với Trung tâm Đăng kiểm đến <b>17h30</b> cùng ngày.
// </div>

// </body>
// </html>
//   `;

//   w.document.write(html);
//   w.document.close();

//   w.onload = () => {
//     w.focus();
//     w.print();
//   };
// };
 
// export const exportPhieuTamThu = (data: any) => {
//   if (typeof window === "undefined") return;

//   const w = window.open("", "_blank");
//   if (!w) return;

//   const html = `
// <!DOCTYPE html>
// <html>
// <head>
//   <title>Phiếu tạm thu</title>
//   <style>
//     @page {
//       size: A5 landscape;
//       margin: 8mm;
//     }

    
//     html, body { width: 100%; height: 100%; }
//     * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }

//     body {
//       font-family: "Times New Roman", serif;
//       font-size: 13px;
//       line-height: 1.35;
//       margin: 0;
//       padding: 0;
//     }


//     .center { text-align: center; }
//     .right { text-align: right; }
//     .bold { font-weight: bold; }
//     .italic { font-style: italic; }
//     .underline { text-decoration: underline; }

//     table {
//       width: 100%;
//       border-collapse: collapse;
//     }

//     .header td {
//       vertical-align: top;
//     }

//     .left {
//       width: 45%;
//       font-size: 12px;
//     }

//     .right {
//       width: 55%;
//       font-size: 12px;
//     }

//     h2 {
//       margin: 12px 0 10px;
//       font-size: 16px;
//     }

//     .content {
//       margin-top: 6px;
//       font-size: 13px;
//     }

//     .content p {
//       margin: 4px 0;
//     }

//     .fee-table {
//       margin-top: 6px;
//       border: 1px solid #000;
//       font-size: 12px;
//     }

//     .fee-table th,
//     .fee-table td {
//       border: 1px solid #000;
//       padding: 4px;
//       text-align: center;
//     }

//     .sign {
//       margin-top: 12px;
//       text-align: right;
//       font-size: 13px;
//     }

//     .note {
//       margin-top: 8px;
//       font-size: 11.5px;
//       font-style: italic;
//     }
//   </style>
// </head>

// <body>

// <!-- HEADER -->
// <table class="header">
//   <tr>
//     <td class="left center bold">
//       SỞ XÂY DỰNG ĐỒNG THÁP<br>
//       TT ĐĂNG KIỂM PT CƠ GIỚI THỦY, BỘ<br>
//       Số: ${data.soPhieu ?? "……"} / PTT-ĐKTB
//     </td>

//     <td class="right center">
//       <div class="bold">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
//       <div class="bold underline italic">Độc lập - Tự do - Hạnh phúc</div>
//     </td>
//   </tr>
// </table>

// <h2 class="center bold">PHIẾU TẠM THU</h2>

// <div class="content">
//   <p>
//     Trung tâm Đăng kiểm Phương tiện cơ giới thủy, bộ Đồng Tháp tạm thu tiền kiểm định
//     của phương tiện mang biển số: <b>${data.bienSo ?? "……………"}</b>
//   </p>

//   <p><b>Tổng số tiền: ${data.tongTien}</b></p>
// </div>

// <!-- BẢNG CÔNG ĐOẠN KHÔNG ĐẠT -->
// <table class="fee-table">
//   <tr>
//     <th>Lượt KĐ</th>
//     <th colspan="5">Công đoạn không đạt</th>
//     <th>Khác</th>
//   </tr>
//   <tr>
//     <td></td><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td></td>
//   </tr>
//   <tr>
//     <td style="height: 18px;"></td>
//     <td></td><td></td><td></td><td></td><td></td><td></td>
//   </tr>
// </table>

// <div class="sign italic">
//   Tp. Cao Lãnh, ngày ${data.ngay} tháng ${data.thang} năm ${data.nam}
// </div>

// <div class="sign bold">Người lập phiếu</div>
// <div class="sign" style="margin-top: 30px;">
//   ${data.nguoiLap ?? ""}
// </div>

// <div class="note">
//   <b>Lưu ý:</b> Xuất trình Phiếu tạm thu này cho đăng kiểm viên kiểm tra khi ra, vào khu vực Trung tâm Đăng kiểm.<br>
//   - Nếu có công đoạn nào không đạt, yêu cầu đưa phương tiện ra ngoài khu vực Trung tâm Đăng kiểm để sửa chữa.<br>
//   - Phiếu tạm thu này chỉ có giá trị thanh toán với Trung tâm Đăng kiểm đến <b>17h30</b> cùng ngày.
// </div>

// </body>
// </html>
//   `;

//   w.document.write(html);
//   w.document.close();

//   w.onload = () => {
//     w.focus();
//     w.print();
//   };
// };

//    @page {
//       size: A5 landscape;  
//       margin: 8mm;
//     }

// export const exportPhieuTamThu = (data: any) => { 
//   if (typeof window === "undefined") return;

//   const w = window.open("", "_blank");
//   if (!w) return;

//   const html = `
// <!DOCTYPE html>
// <html>
// <head>
//   <title>Phiếu tạm thu</title>
//   <style>
//     @page {
//       size: A4 portrait;
//       margin: 10mm;
//     }
// .sheet {
//   width: 100%;
//   min-height: calc(210mm - 16mm); /* A4 ngang: 210mm cao, trừ margin 2 bên nếu margin=8mm */
// }
    
//     html, body { width: 100%; height: 100%; }
//     * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }

//     body {
//       font-family: "Times New Roman", serif;
//       font-size: 13px;
//       line-height: 1.35;
//       margin: 0;
//       padding: 0;
//     }


//     .center { text-align: center; }
//     .right { text-align: right; }
//     .bold { font-weight: bold; }
//     .italic { font-style: italic; }
//     .underline { text-decoration: underline; }

//     table {
//       width: 100%;
//       border-collapse: collapse;
//     }

//     .header td {
//       vertical-align: top;
//     }

//     .left {
//       width: 45%;
//       font-size: 12px;
//     }

//     .right {
//       width: 55%;
//       font-size: 12px;
//     }

//     h2 {
//       margin: 12px 0 10px;
//       font-size: 16px;
//     }

//     .content {
//       margin-top: 6px;
//       font-size: 13px;
//     }

//     .content p {
//       margin: 4px 0;
//     }

//     .fee-table {
//       margin-top: 6px;
//       border: 1px solid #000;
//       font-size: 12px;
//     }

//     .fee-table th,
//     .fee-table td {
//       border: 1px solid #000;
//       padding: 4px;
//       text-align: center;
//     }

//     .sign {
//       margin-top: 12px;
//       text-align: right;
//       font-size: 13px;
//     }

//     .note {
//       margin-top: 8px;
//       font-size: 11.5px;
//       font-style: italic;
//     }

//     /* ===== DÒNG CHẤM VIẾT TAY ===== */
//     .dot-row {
//       width: 100%;
//       border-bottom: 1px dotted #000;
//       height: 1.2em;
//       margin-bottom: 6px;
//     }

//     /* ===== PAGE BREAK CHO MẶT SAU ===== */
//     .page-break {
//       page-break-before: always;
//     }

//     /* ===== MẶT SAU ===== */
//     .back-page {
//       padding-top: 6mm;
//     }

//     .back-title {
//       text-align: center;
//       font-weight: bold;
//       margin-bottom: 6mm;
//       font-size: 14px;
//     }

//   </style>
// </head>

// <body>

//   <!-- HEADER -->
//   <table class="header">
//     <tr>
//       <td class="left center bold">
//         SỞ XÂY DỰNG ĐỒNG THÁP<br>
//         TT ĐĂNG KIỂM PT CƠ GIỚI THỦY, BỘ<br>
//         Số: ${data.soPhieu ?? "……"} / PTT-ĐKTB
//       </td>

//       <td class="right center bold">
//         <div class="bold">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
//         <div class="bold underline italic ">Độc lập - Tự do - Hạnh phúc</div>
//       </td>
//     </tr>
//   </table>

//   <h2 class="center bold">PHIẾU TẠM THU</h2>

//   <div class="content">
//     <p>
//       Trung tâm Đăng kiểm Phương tiện cơ giới thủy, bộ Đồng Tháp tạm thu tiền kiểm định
//       của phương tiện mang biển số: <b>${data.bienSo ?? "……………"}</b>
//     </p>

//     <p><b>Tổng số tiền: ${data.tongTien}</b></p>
//   </div>

//   <!-- BẢNG CÔNG ĐOẠN KHÔNG ĐẠT -->
//   <table class="fee-table">
//     <tr>
//       <th>Lượt KĐ</th>
//       <th colspan="5">Công đoạn không đạt</th>
//       <th>Khác</th>
//     </tr>
//     <tr>
//       <td></td><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td></td>
//     </tr>
//     <tr>
//       <td style="height: 18px;"></td>
//       <td></td><td></td><td></td><td></td><td></td><td></td>
//     </tr>
//   </table>

//   <div class="sign italic">
//     Tp. Cao Lãnh, ngày ${data.ngay} tháng ${data.thang} năm ${data.nam}
//   </div>

//   <div class="sign bold">Người lập phiếu</div>
//   <div class="sign" style="margin-top: 30px;">
//     ${data.nguoiLap ?? ""}
//   </div>

//   <div class="note">
//     <b>Lưu ý:</b> Xuất trình Phiếu tạm thu này cho đăng kiểm viên kiểm tra khi ra, vào khu vực Trung tâm Đăng kiểm.<br>
//     - Nếu có công đoạn nào không đạt, yêu cầu đưa phương tiện ra ngoài khu vực Trung tâm Đăng kiểm để sửa chữa.<br>
//     - Phiếu tạm thu này chỉ có giá trị thanh toán với Trung tâm Đăng kiểm đến <b>17h30</b> cùng ngày.
//   </div>

 

//   <div class="back-page">

//     <div class="back-title">
//       GHI CHÚ / NỘI DUNG BỔ SUNG
//     </div>

//     <!-- Các dòng chấm viết tay -->
//     <div class="dot-row"></div>
//     <div class="dot-row"></div>
//     <div class="dot-row"></div>
//     <div class="dot-row"></div>
//     <div class="dot-row"></div>

//     <div class="dot-row"></div>
//     <div class="dot-row"></div>
//     <div class="dot-row"></div>
//     <div class="dot-row"></div>
//     <div class="dot-row"></div> 
//     <div style="margin-top: 10mm;"></div> 

//     <!-- Khu vực ký xác nhận nếu cần -->
//     <div style="display: flex; justify-content: space-between; margin-top: 15mm;">
//       <div style="width: 40%; text-align: center;">
//         Người ghi chú
//         <div style="margin-top: 20mm;"></div>
//         <div class="dot-row"></div>
//       </div>

//       <div style="width: 40%; text-align: center;">
//         Xác nhận
//         <div style="margin-top: 20mm;"></div>
//         <div class="dot-row"></div>
//       </div>
//     </div> 
//   </div> 
// </body>
// </html>
//   `;

//   w.document.write(html);
//   w.document.close();

//   w.onload = () => {
//     w.focus();
//     w.print();
//   };
// };



export function getRunningNo(hsMa: string): string {
  if (!hsMa) return "";
  const parts = hsMa.split("-");
  return parts[parts.length - 1] || "";
}



export const exportPhieuTamThu = (data: any) => {
  if (typeof window === "undefined") return;

  const w = window.open("", "_blank");
  if (!w) return;

  const safe = (v: any, fallback = "") =>
    v === null || v === undefined || v === "" ? fallback : String(v);

  const soPhieu = safe(data.soPhieu, ".............");
  const bienSo = safe(data.bienSo, "");
  const tongTien = safe(data.tongTien, "");
  const ngay = safe(data.ngay, ".....");
  const thang = safe(data.thang, ".....");
  const nam = safe(data.nam, "202.....");
  const nguoiLap = safe(data.nguoiLap, "");

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Phiếu tạm thu</title>
  <style>
    @page { size: A5 landscape; margin: 8mm; }

    html, body { width: 100%; height: 100%; }
    body {
      font-family: "Times New Roman", serif;
      font-size: 13px;
      line-height: 1.25;
      margin: 0;
      padding: 0;
      color: #000;
    }

    .row { display: flex; align-items: flex-start; }
    .col { display: block; }
    .center { text-align: center; }
    .right { text-align: right; }
    .bold { font-weight: 700; }
    .italic { font-style: italic; }
    .underline { text-decoration: underline; }

    /* ===== HEADER ===== */
    .header {
      display: flex;
      justify-content: space-between;
      gap: 10mm;
      margin-bottom: 3mm;
    }
    .h-left {
      width: 48%;
      font-size: 13px;
      font-weight: 700;
      text-align: center;
    }
    .h-right {
      width: 52%;
      font-size: 13px;
      text-align: center;
      font-weight: 700;
    }
    .h-left .sub {
      font-weight: 700;
    }
    .so-row {
      margin-top: 4mm;
      text-align: left;
      font-weight: 700;
      font-size: 13px;
    }
    .so-row .label { display: inline-block; width: 24mm; }
    .so-row .value { font-weight: 700; }

    .so-row2 {
      margin-top: 4mm;
      display: inline-flex;
      align-items: baseline;
      gap: 2mm;              /* chỉnh 1mm-2mm là sát đẹp */
      font-weight: 700;
      font-size: 13px;
    }

    .so-row2 .label {
      width: auto;           /* bỏ width cố định */
      display: inline;       /* sát lại */
    }

    .so-row2 .value {
      font-weight: 700;
    }

    /* ===== TITLE ===== */
    .title {
      text-align: center;
      font-weight: 700;
      font-size: 18px;
      letter-spacing: 0.5px;
      margin: 2mm 0 3mm;
    }

    /* ===== DOT LEADER LINE ===== */
    .line {
      display: flex;
      align-items: baseline;
      gap: 2mm;
      margin: 2mm 0;
    }
    .line .label { white-space: nowrap; }
    .dots {
      flex: 1;
      border-bottom: 1px dotted #000;
      height: 0.95em;
      transform: translateY(-1px);
    }
    .line .value {
      white-space: nowrap;
      font-weight: 700;
    }

    /* ===== CONTENT PARAGRAPH (with dots) ===== */
    .p {
      margin: 0;
    }
    .para {
      margin-top: 1mm;
    }

    /* ===== MIDDLE AREA ===== */
    .mid {
      display: flex;
      justify-content: space-between;
      margin-top: 2mm;
      gap: 8mm;
    }

    /* ===== TABLE ===== */
    table {
      border-collapse: collapse;
      width: 58%;
      font-size: 13px;
    }
    th, td {
      border: 1px solid #000;
      padding: 3px 4px;
      text-align: center;
      vertical-align: middle;
      height: 9mm;
    }
    th { font-weight: 700; }
    .th-small { font-weight: 700; }
    .col-luot { width: 18mm; }
    .col-n { width: 12mm; }
    .col-khac { width: 18mm; }

    .table-head-1 th {
      height: 8mm;
      padding-top: 2px;
      padding-bottom: 2px;
    }
    .table-head-2 td {
      height: 7mm;
      font-weight: 700;
    }
    .table-empty td { height: 10mm; }

    /* ===== SIGN RIGHT ===== */
    .sign {
      width: 42%;
      font-size: 13px;
      padding-top: 2mm;
    }
    .sign .place-date {
      text-align: left;
      margin-top: 6mm;
      margin-bottom: 2mm;
      font-style: italic;
    }
    .sign .whotitle {
      text-align: center; 
    }
    .sign .who {
      text-align: center;
      font-weight: 700;
      margin-top: 2mm;
    }
    .sign .name {
      text-align: center;
      margin-top: 16mm;
      font-weight: 700;
      min-height: 6mm;
    }

    /* ===== NOTE ===== */
    .note {
      margin-top: 4mm;
      font-size: 12.5px;
      font-style: italic;
    }
    .note .b { font-weight: 700; font-style: italic; }
    .note .li { margin-top: 1mm; }

    /* Keep exactly 1 page */
    .sheet { width: 100%; height: auto; }

     /* ===== DOC ===== */
    .back-title {
      text-align: center;
      font-weight: bold; 
      font-size: 14px;
      margin-top: 3mm;
    }

    .dot-row {
      width: 100%;
      border-bottom: 1px dotted #000;
      height: 1.2em;
      margin-bottom: 5px;
    }
  </style>
</head>

<body>
  <div class="sheet">

    <div class="header">
      <div class="h-left">
        BAN QUẢN LÝ KÝ TÚC XÁ<br/>
        <span class="sub">KÝ TÚC XÁ ĐH CẦN THƠ</span>
        <div class="so-row2">
          <span class="label">Số:</span>
          <span class="value">${soPhieu}</span> / PTT-KTX
        </div>
      </div>

      <div class="h-right">
        CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM<br/>
        <span class="underline">Độc lập - Tự do - Hạnh phúc</span>
      </div>
    </div>

    <div class="title">PHIẾU TẠM THU</div>

    <div class="para">
      <p class="p">
        Ban quản lý Ký túc xá Đại học Cần Thơ có tạm thu tiền nội trú của sinh viên có MSSV: <span class="bold">${bienSo ? bienSo : ""}</span> 
      </p> 
      <div class="line">
        <div class="label bold">Tổng số tiền:</div> 
        <div class="value">${tongTien ? tongTien : ""}</div>
      </div>
    </div>

    <div class="mid">
      <!-- TABLE LEFT -->
      <table>
        <tr class="table-head-1">
          <th class="col-luot" rowspan="2">Lượt<br/>KĐ</th>
          <th colspan="6">Công đoạn không đạt</th>
        </tr>
        <tr class="table-head-2">
          <td class="col-n">1</td>
          <td class="col-n">2</td>
          <td class="col-n">3</td>
          <td class="col-n">4</td>
          <td class="col-n">5</td>
          <td class="col-khac">Khác</td>
        </tr>

        <!-- 2 dòng trống như mẫu -->
        <tr class="table-empty">
          <td></td><td></td><td></td><td></td><td></td><td></td><td></td>
        </tr>
        <tr class="table-empty">
          <td></td><td></td><td></td><td></td><td></td><td></td><td></td>
        </tr> 
      </table>

      <!-- SIGN RIGHT -->
      <div class="sign">
        <div class="place-date whotitle">
          P. Mỹ Trà, ngày ${ngay} tháng ${thang} năm ${nam}
        </div>
        <div class="who">Người lập phiếu</div>
        <div class="name">...............</div>
      </div>
    </div>

    <div class="note">
      <span class="b">Lưu ý:-</span> Xuất trình Phiếu tạm thu này cho cán bộ quản lý kiểm tra khi ra, vào khu vực Ký túc xá<br/>
      <div class="li">- Lưu ý giữ gìn vệ sinh và trật tự chung trong khu vực Ký túc xá</div>
      <div class="li">- Phiếu tạm thu này chỉ có giá trị thanh toán với Ban Quản lý Ký túc xá đến <span class="bold">17h30'</span> cùng ngày.</div>
    </div>

    <div class="back-title">
      GHI CHÚ / NỘI DUNG SỬA CHỬA
    </div>

    <!-- Các dòng chấm viết tay -->
    <div class="dot-row"></div>
    <div class="dot-row"></div>
    <div class="dot-row"></div>
    <div class="dot-row"></div>

  </div>

  <script>
    window.onload = function () {
      window.focus();
      window.print();
    };
  </script>
</body>
</html>`;

  w.document.open();
  w.document.write(html);
  w.document.close();
};
