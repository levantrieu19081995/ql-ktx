const state = {
  role: "student",
  screen: "student-home",
  historyFilter: "7 ngày",
  reportPeriod: "Tuần",
  selectedHistoryId: "LS-241028-0732",
  feedbackSubmitted: false,
  studentSearch: "",
  presentSearch: "",
};

const historyItems = [
  {
    id: "LS-241028-0732",
    type: "IN",
    label: "Vào KTX",
    time: "07:32",
    date: "28/10/2026",
    place: "Cổng chính Khu A",
    room: "A2.305",
    device: "Camera A-01",
    confidence: "98,7%",
  },
  {
    id: "LS-241027-1845",
    type: "OUT",
    label: "Ra khỏi KTX",
    time: "18:45",
    date: "27/10/2026",
    place: "Cổng phụ Khu A",
    room: "A2.305",
    device: "Camera A-03",
    confidence: "97,9%",
  },
  {
    id: "LS-241027-1138",
    type: "IN",
    label: "Vào KTX",
    time: "11:38",
    date: "27/10/2026",
    place: "Cổng chính Khu A",
    room: "A2.305",
    device: "Camera A-01",
    confidence: "99,1%",
  },
  {
    id: "LS-241026-0658",
    type: "OUT",
    label: "Ra khỏi KTX",
    time: "06:58",
    date: "26/10/2026",
    place: "Cổng chính Khu A",
    room: "A2.305",
    device: "Camera A-02",
    confidence: "98,3%",
  },
];

const presentStudents = [
  { id: "B2012345", name: "Nguyễn Minh Anh", room: "A2.305", area: "Khu A", since: "07:32", initials: "NA" },
  { id: "B2110872", name: "Trần Quang Huy", room: "A1.208", area: "Khu A", since: "08:04", initials: "TH" },
  { id: "B2206419", name: "Lê Hoài Phương", room: "B3.112", area: "Khu B", since: "06:55", initials: "LP" },
  { id: "B2301208", name: "Phạm Gia Hân", room: "C1.402", area: "Khu C", since: "09:18", initials: "PH" },
  { id: "B2103340", name: "Võ Thành Đạt", room: "B2.204", area: "Khu B", since: "10:21", initials: "VĐ" },
];

const screenDefinitions = {
  student: [
    {
      title: "Sinh viên",
      items: [
        ["student-home", "Tổng quan KTX", "home"],
        ["student-history", "Lịch sử ra vào", "history"],
        ["student-history-detail", "Chi tiết lượt ra vào", "detail"],
        ["student-feedback", "Phản hồi sai thông tin", "flag"],
        ["student-feedback-status", "Trạng thái phản hồi", "check"],
        ["student-account", "Tài khoản", "user"],
      ],
    },
  ],
  staff: [
    {
      title: "Điều hành",
      items: [
        ["staff-dashboard", "Tổng quan điều hành", "home"],
        ["staff-reports", "Danh mục báo cáo", "chart"],
        ["staff-present", "Sinh viên đang có mặt", "users"],
      ],
    },
    {
      title: "Báo cáo theo hợp đồng",
      items: [
        ["staff-inout", "Lượt vào ra", "history"],
        ["staff-area", "Theo khu KTX", "map"],
        ["staff-student", "Theo sinh viên", "search"],
        ["staff-absence", "Vắng mặt lâu ngày", "clock"],
        ["staff-stranger", "Phát hiện người lạ", "alert"],
        ["staff-banned", "Sinh viên bị cấm", "lock"],
        ["staff-account", "Tài khoản CTSV", "user"],
      ],
    },
  ],
};

const screenMeta = {
  "student-home": ["MYCTU", "Ký túc xá", false],
  "student-history": ["SINH VIÊN", "Lịch sử ra vào", false],
  "student-history-detail": ["LỊCH SỬ", "Chi tiết lượt ra vào", true],
  "student-feedback": ["PHẢN HỒI", "Báo sai thông tin", true],
  "student-feedback-status": ["PHẢN HỒI", "Trạng thái xử lý", true],
  "student-account": ["MYCTU", "Tài khoản", false],
  "staff-dashboard": ["PHÒNG CTSV", "Điều hành KTX", false],
  "staff-reports": ["PHÒNG CTSV", "Báo cáo thống kê", false],
  "staff-present": ["PHÒNG CTSV", "Sinh viên đang có mặt", false],
  "staff-inout": ["BÁO CÁO", "Lượt vào ra", true],
  "staff-area": ["BÁO CÁO", "Theo khu KTX", true],
  "staff-student": ["BÁO CÁO", "Theo sinh viên", true],
  "staff-absence": ["BÁO CÁO", "Vắng mặt lâu ngày", true],
  "staff-stranger": ["BÁO CÁO", "Phát hiện người lạ", true],
  "staff-banned": ["BÁO CÁO", "Sinh viên bị cấm", true],
  "staff-account": ["PHÒNG CTSV", "Tài khoản", false],
};

const iconPaths = {
  home: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10.5V20h13v-9.5"/><path d="M9 20v-6h6v6"/>',
  history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l3 2"/>',
  chart: '<path d="M4 20V10"/><path d="M10 20V4"/><path d="M16 20v-7"/><path d="M22 20H2"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  detail: '<path d="M5 3h14v18H5z"/><path d="M8 8h8M8 12h8M8 16h5"/>',
  flag: '<path d="M5 21V4"/><path d="M5 5h11l-1 4 1 4H5"/>',
  check: '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
  map: '<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3z"/><path d="M9 3v15M15 6v15"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  alert: '<path d="M10.3 3.6 2.4 18a2 2 0 0 0 1.8 3h15.6a2 2 0 0 0 1.8-3L13.7 3.6a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/>',
  lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
  in: '<path d="M14 5v4h-9v6h9v4"/><path d="m10 12 4-4 4 4"/>',
  out: '<path d="M10 5v4h9v6h-9v4"/><path d="m14 12-4-4-4 4"/>',
  chevron: '<path d="m9 18 6-6-6-6"/>',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/>',
  building: '<path d="M4 21V5h10v16M14 9h6v12M8 9h2M8 13h2M8 17h2M17 13h1M17 17h1M2 21h20"/>',
};

function icon(name, className = "") {
  const paths = iconPaths[name] || iconPaths.detail;
  return `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
}

function heading(title, description) {
  return `<div class="screen-heading"><h2>${title}</h2><p>${description}</p></div>`;
}

function activityItem(item, clickable = true) {
  const tone = item.type === "IN" ? "success" : "";
  const tag = item.type === "IN" ? "Vào" : "Ra";
  const content = `
    <span class="item-icon ${tone}">${icon(item.type === "IN" ? "in" : "out")}</span>
    <span class="item-main"><strong>${item.place}</strong><span>${item.date} · ${item.time} · ${item.device}</span></span>
    <span class="item-side"><strong>${tag}</strong>${clickable ? icon("chevron") : ""}</span>`;
  return clickable
    ? `<button class="activity-item" type="button" data-history-id="${item.id}">${content}</button>`
    : `<div class="activity-item">${content}</div>`;
}

function reportItem(screen, iconName, title, subtitle, tone = "") {
  return `<button class="report-item" type="button" data-nav="${screen}">
    <span class="item-icon ${tone}">${icon(iconName)}</span>
    <span class="item-main"><strong>${title}</strong><span>${subtitle}</span></span>
    <span class="chevron">${icon("chevron")}</span>
  </button>`;
}

function lineChart() {
  return `<svg class="mini-chart" viewBox="0 0 360 148" role="img" aria-label="Biểu đồ lượt vào và ra trong bảy ngày">
    <g stroke="#e4e9ef" stroke-width="1">
      <line x1="32" y1="20" x2="344" y2="20"/><line x1="32" y1="60" x2="344" y2="60"/>
      <line x1="32" y1="100" x2="344" y2="100"/><line x1="32" y1="126" x2="344" y2="126"/>
    </g>
    <polyline points="32,97 82,75 132,82 182,48 232,58 282,32 334,47" fill="none" stroke="#174a7e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <polyline points="32,110 82,92 132,101 182,72 232,79 282,58 334,67" fill="none" stroke="#8ca2b7" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <g fill="#667085" font-family="Segoe UI, Arial" font-size="10" text-anchor="middle">
      <text x="32" y="143">T2</text><text x="82" y="143">T3</text><text x="132" y="143">T4</text>
      <text x="182" y="143">T5</text><text x="232" y="143">T6</text><text x="282" y="143">T7</text><text x="334" y="143">CN</text>
    </g>
  </svg>`;
}

function studentHome() {
  return `<section class="screen">
    ${heading("Chào Minh Anh", "Thông tin ra vào KTX của bạn hôm nay")}
    <div class="panel status-panel">
      <div class="status-row">
        <div><span class="muted-on-dark">Trạng thái hiện tại</span><div class="status-value">Đang có mặt</div></div>
        <span class="status-badge">Đã xác nhận</span>
      </div>
      <p class="muted-on-dark">Ghi nhận lúc 07:32 tại Cổng chính Khu A</p>
    </div>

    <div class="metrics-grid">
      <div class="metric"><span class="metric-label">Lượt vào tháng này</span><strong class="metric-value primary">24</strong></div>
      <div class="metric"><span class="metric-label">Lượt ra tháng này</span><strong class="metric-value">23</strong></div>
      <div class="metric"><span class="metric-label">Phản hồi đang xử lý</span><strong class="metric-value">01</strong></div>
    </div>

    <div class="section-title"><h3>Hoạt động gần đây</h3><button type="button" data-nav="student-history">Xem tất cả</button></div>
    <div class="activity-list">${historyItems.slice(0, 3).map((item) => activityItem(item)).join("")}</div>

    <div class="section-title"><h3>Hỗ trợ nhanh</h3></div>
    <button class="report-item" type="button" data-nav="student-feedback">
      <span class="item-icon warning">${icon("flag")}</span>
      <span class="item-main"><strong>Báo sai lịch sử ra vào</strong><span>Gửi yêu cầu đến Phòng Công tác sinh viên</span></span>
      <span class="chevron">${icon("chevron")}</span>
    </button>
  </section>`;
}

function studentHistory() {
  return `<section class="screen">
    ${heading("Lịch sử của bạn", "Các lượt ra vào được hệ thống nhận diện")}
    <div class="chip-row" aria-label="Khoảng thời gian">
      ${["Hôm nay", "7 ngày", "30 ngày", "Tùy chọn"].map((label) => `<button type="button" class="chip ${state.historyFilter === label ? "is-active" : ""}" data-history-filter="${label}">${label}</button>`).join("")}
    </div>
    <div class="summary-strip">
      <div class="summary-cell"><span>Tổng lượt vào</span><strong>08</strong></div>
      <div class="summary-cell"><span>Tổng lượt ra</span><strong>07</strong></div>
    </div>
    <div class="section-title"><h3>Gần nhất</h3><span>15 bản ghi</span></div>
    <div class="activity-list">${historyItems.map((item) => activityItem(item)).join("")}</div>
  </section>`;
}

function studentHistoryDetail() {
  const item = historyItems.find((entry) => entry.id === state.selectedHistoryId) || historyItems[0];
  return `<section class="screen">
    <div class="detail-hero">
      <span class="detail-code">${item.id}</span>
      <h2>${item.label}</h2>
      <p>${item.date} lúc ${item.time}</p>
    </div>
    <div class="detail-grid">
      <div class="detail-row"><span>Vị trí ghi nhận</span><strong>${item.place}</strong></div>
      <div class="detail-row"><span>Thiết bị</span><strong>${item.device}</strong></div>
      <div class="detail-row"><span>Khu vực lưu trú</span><strong>${item.room}</strong></div>
      <div class="detail-row"><span>Độ tin cậy</span><strong>${item.confidence}</strong></div>
      <div class="detail-row"><span>Trạng thái</span><strong><span class="tag success">Đã xác nhận</span></strong></div>
    </div>
    <div class="message-box" style="margin-top:16px">${icon("alert")}<span>Nếu thời gian hoặc trạng thái không đúng, bạn có thể gửi phản hồi để Phòng CTSV kiểm tra.</span></div>
    <div class="button-row">
      <button class="button" type="button" data-nav="student-history">Đóng</button>
      <button class="button primary" type="button" data-nav="student-feedback">Phản hồi sai</button>
    </div>
  </section>`;
}

function studentFeedback() {
  const item = historyItems.find((entry) => entry.id === state.selectedHistoryId) || historyItems[0];
  return `<section class="screen">
    ${heading("Phản hồi sai thông tin", "Yêu cầu sẽ được chuyển đến Phòng Công tác sinh viên")}
    <div class="panel" style="margin-bottom:18px">
      <span class="detail-code">BẢN GHI ĐƯỢC CHỌN</span>
      <div style="margin-top:8px">${activityItem(item, false)}</div>
    </div>
    <form id="feedbackForm" novalidate>
      <div class="field">
        <label for="feedbackReason">Thông tin chưa chính xác</label>
        <select class="form-select" id="feedbackReason" required>
          <option value="">Chọn nội dung</option>
          <option value="time">Sai thời gian</option>
          <option value="direction">Sai trạng thái vào hoặc ra</option>
          <option value="location">Sai khu vực ghi nhận</option>
          <option value="identity">Không phải lượt ra vào của tôi</option>
          <option value="other">Nội dung khác</option>
        </select>
      </div>
      <div class="field">
        <label for="feedbackContent">Mô tả chi tiết</label>
        <textarea class="form-textarea" id="feedbackContent" placeholder="Mô tả thông tin đúng để cán bộ kiểm tra..." required></textarea>
        <span class="field-hint">Không nhập thông tin nhạy cảm không liên quan.</span>
      </div>
      <div id="feedbackError" class="message-box" hidden>${icon("alert")}<span>Vui lòng chọn nội dung và nhập mô tả phản hồi.</span></div>
      <button class="button primary block" type="submit">Gửi phản hồi</button>
    </form>
  </section>`;
}

function studentFeedbackStatus() {
  return `<section class="screen">
    ${heading("Phản hồi đã gửi", "Mã yêu cầu PH-20261028-014")}
    <div class="message-box success">${icon("check")}<span>Yêu cầu của bạn đã được ghi nhận. Kết quả sẽ cập nhật tại màn hình này.</span></div>
    <div class="panel" style="margin-top:14px">
      <div class="detail-row"><span>Bản ghi</span><strong>LS-241028-0732</strong></div>
      <div class="detail-row"><span>Nội dung</span><strong>Sai trạng thái vào/ra</strong></div>
      <div class="detail-row"><span>Ngày gửi</span><strong>28/10/2026 10:42</strong></div>
      <div class="detail-row"><span>Trạng thái</span><strong><span class="tag warning">Đang xử lý</span></strong></div>
    </div>
    <div class="section-title"><h3>Tiến trình</h3></div>
    <div class="timeline">
      <div class="timeline-item"><span class="timeline-dot">✓</span><div class="timeline-copy"><strong>Đã tiếp nhận</strong><span>28/10/2026 10:42</span></div></div>
      <div class="timeline-item"><span class="timeline-dot">2</span><div class="timeline-copy"><strong>Phòng CTSV đang kiểm tra</strong><span>Dự kiến phản hồi trong 2 ngày làm việc</span></div></div>
      <div class="timeline-item"><span class="timeline-dot" style="background:#eef1f4;color:#8791a0">3</span><div class="timeline-copy"><strong>Hoàn tất xử lý</strong><span>Chưa có kết quả</span></div></div>
    </div>
    <button class="button block" type="button" data-nav="student-history">Về lịch sử ra vào</button>
  </section>`;
}

function accountScreen(role) {
  const isStudent = role === "student";
  return `<section class="screen">
    <div class="panel">
      <div class="profile-head">
        <span class="avatar">${isStudent ? "NA" : "CT"}</span>
        <div><h2>${isStudent ? "Nguyễn Minh Anh" : "Phòng Công tác sinh viên"}</h2><p>${isStudent ? "B2012345 · Phòng A2.305" : "Tài khoản nghiệp vụ KTX"}</p></div>
      </div>
      <div class="setting-list">
        <button class="setting-row" type="button"><span>Thông tin tài khoản</span><span>›</span></button>
        <button class="setting-row" type="button"><span>Thông báo</span><span>Đang bật</span></button>
        <button class="setting-row" type="button"><span>Quyền riêng tư dữ liệu</span><span>›</span></button>
        <button class="setting-row" type="button"><span>Trợ giúp</span><span>›</span></button>
      </div>
    </div>
    <div class="section-title"><h3>Chuyển vai trò bản mẫu</h3></div>
    <div class="message-box">${icon("alert")}<span>Nút bên dưới chỉ dùng để duyệt prototype, không phải chức năng dành cho người dùng thật.</span></div>
    <button class="button block" style="margin-top:12px" type="button" data-switch-role="${isStudent ? "staff" : "student"}">Xem giao diện ${isStudent ? "Phòng CTSV" : "Sinh viên"}</button>
  </section>`;
}

function staffDashboard() {
  return `<section class="screen">
    ${heading("Tổng quan hôm nay", "Cập nhật lúc 10:45 · 28/10/2026")}
    <div class="metrics-grid">
      <div class="metric"><span class="metric-label">Đang có mặt</span><strong class="metric-value primary">1.248</strong><span class="metric-note">79,4% sinh viên</span></div>
      <div class="metric"><span class="metric-label">Vắng trên 5 ngày</span><strong class="metric-value">36</strong><span class="metric-note">Cần theo dõi</span></div>
      <div class="metric"><span class="metric-label">Cảnh báo hôm nay</span><strong class="metric-value danger">08</strong><span class="metric-note">3 chưa xem</span></div>
    </div>
    <div class="chart-panel">
      <div class="chart-head"><div><strong>Lưu lượng 7 ngày</strong><span>Tổng lượt ghi nhận theo ngày</span></div><div class="chart-legend"><span class="legend-item">Vào</span><span class="legend-item out">Ra</span></div></div>
      ${lineChart()}
    </div>
    <div class="section-title"><h3>Truy cập nhanh</h3><button type="button" data-nav="staff-reports">Tất cả</button></div>
    <div class="report-list">
      ${reportItem("staff-present", "users", "Sinh viên đang có mặt", "1.248 sinh viên tại 3 khu", "success")}
      ${reportItem("staff-absence", "clock", "Vắng mặt lâu ngày", "36 sinh viên vắng từ 5 ngày", "warning")}
      ${reportItem("staff-stranger", "alert", "Cảnh báo người lạ", "5 lượt phát hiện trong hôm nay", "danger")}
    </div>
  </section>`;
}

function staffReports() {
  return `<section class="screen">
    ${heading("Báo cáo thống kê", "Các chỉ số theo phạm vi phụ lục hợp đồng")}
    <div class="report-list">
      ${reportItem("staff-inout", "history", "Lượt vào ra", "Theo ngày, tháng và năm")}
      ${reportItem("staff-area", "map", "Theo khu KTX", "So sánh lưu lượng từng khu")}
      ${reportItem("staff-student", "search", "Theo sinh viên", "Tra cứu một sinh viên cụ thể")}
      ${reportItem("staff-absence", "clock", "Vắng mặt lâu ngày", "Danh sách cần theo dõi", "warning")}
      ${reportItem("staff-stranger", "alert", "Phát hiện người lạ", "Số lượt và lịch sử phát hiện", "danger")}
      ${reportItem("staff-banned", "lock", "Sinh viên bị cấm", "Số lượt cảnh báo và chi tiết", "danger")}
    </div>
  </section>`;
}

function staffInOut() {
  return `<section class="screen">
    ${heading("Lượt vào ra", "Theo dõi lưu lượng sinh viên qua các cổng KTX")}
    <div class="chip-row">
      ${["Ngày", "Tuần", "Tháng", "Năm"].map((label) => `<button class="chip ${state.reportPeriod === label ? "is-active" : ""}" type="button" data-report-period="${label}">${label}</button>`).join("")}
    </div>
    <div class="summary-strip">
      <div class="summary-cell"><span>Lượt vào</span><strong>2.846</strong></div>
      <div class="summary-cell"><span>Lượt ra</span><strong>2.799</strong></div>
    </div>
    <div class="chart-panel">
      <div class="chart-head"><div><strong>Phân bố theo ngày</strong><span>Tuần 26/10 - 01/11</span></div><div class="chart-legend"><span class="legend-item">Vào</span><span class="legend-item out">Ra</span></div></div>
      ${lineChart()}
    </div>
    <div class="section-title"><h3>Khung giờ cao điểm</h3></div>
    <div class="bar-list panel">
      ${bar("06:00 - 08:00", 82, "624 lượt")}
      ${bar("11:00 - 13:00", 64, "487 lượt")}
      ${bar("17:00 - 19:00", 100, "759 lượt")}
      ${bar("19:00 - 22:00", 73, "551 lượt")}
    </div>
  </section>`;
}

function bar(label, percent, value, tone = "") {
  return `<div><div class="bar-label"><span>${label}</span><strong>${value}</strong></div><div class="bar-track"><div class="bar-fill ${tone}" style="width:${percent}%"></div></div></div>`;
}

function staffArea() {
  return `<section class="screen">
    ${heading("Theo khu KTX", "So sánh lưu lượng và số sinh viên hiện diện")}
    <div class="field"><label for="areaPeriod">Khoảng thời gian</label><select id="areaPeriod" class="form-select"><option>Tháng 10/2026</option><option>Tháng 09/2026</option><option>Quý III/2026</option></select></div>
    <div class="panel bar-list">
      ${bar("Khu A", 100, "18.426 lượt")}
      ${bar("Khu B", 76, "14.032 lượt", "muted")}
      ${bar("Khu C", 58, "10.684 lượt", "muted")}
    </div>
    <div class="section-title"><h3>Chi tiết từng khu</h3></div>
    <div class="table-wrap"><table class="data-table"><thead><tr><th>Khu</th><th>Đang có mặt</th><th>Vắng</th><th>Tỷ lệ</th></tr></thead><tbody>
      <tr><td><strong>Khu A</strong></td><td>526</td><td>114</td><td>82,2%</td></tr>
      <tr><td><strong>Khu B</strong></td><td>431</td><td>129</td><td>77,0%</td></tr>
      <tr><td><strong>Khu C</strong></td><td>291</td><td>83</td><td>77,8%</td></tr>
    </tbody></table></div>
  </section>`;
}

function staffStudent() {
  const query = state.studentSearch.toLowerCase();
  const hasMatch = !query || "b2012345 nguyễn minh anh".includes(query);
  return `<section class="screen">
    ${heading("Theo sinh viên", "Tra cứu lịch sử và thống kê của từng sinh viên")}
    <div class="filter-bar">
      <label class="search-field">${icon("search")}<input id="studentSearch" value="${state.studentSearch}" placeholder="Mã SV hoặc họ tên" aria-label="Tìm sinh viên"></label>
      <button class="button primary" type="button" id="studentSearchButton">Tìm</button>
    </div>
    ${hasMatch ? `<div class="panel">
      <div class="profile-head"><span class="avatar">NA</span><div><h2>Nguyễn Minh Anh</h2><p>B2012345 · Khu A · Phòng A2.305</p></div></div>
      <div class="metrics-grid">
        <div class="metric"><span class="metric-label">Lượt vào</span><strong class="metric-value primary">24</strong></div>
        <div class="metric"><span class="metric-label">Lượt ra</span><strong class="metric-value">23</strong></div>
        <div class="metric"><span class="metric-label">Vắng dài nhất</span><strong class="metric-value">3 ngày</strong></div>
      </div>
      <div class="detail-grid"><div class="detail-row"><span>Trạng thái hiện tại</span><strong><span class="tag success">Đang có mặt</span></strong></div><div class="detail-row"><span>Lần ghi nhận gần nhất</span><strong>28/10/2026 07:32</strong></div></div>
    </div>
    <div class="section-title"><h3>Lịch sử gần đây</h3></div><div class="activity-list">${historyItems.slice(0, 3).map((item) => activityItem(item, false)).join("")}</div>` : `<div class="empty-state"><strong>Không tìm thấy sinh viên</strong><span>Kiểm tra lại mã sinh viên hoặc họ tên.</span></div>`}
  </section>`;
}

function staffAbsence() {
  const rows = [
    ["B2018391", "Trương Mỹ Linh", "A3.202", "12 ngày"],
    ["B2115520", "Lý Hoàng Nam", "B1.104", "9 ngày"],
    ["B2209348", "Ngô Thảo Vy", "C2.305", "7 ngày"],
    ["B2304821", "Đặng Minh Khoa", "A1.408", "6 ngày"],
  ];
  return `<section class="screen">
    ${heading("Vắng mặt lâu ngày", "Sinh viên không có lượt vào KTX trong thời gian theo dõi")}
    <div class="field"><label for="absenceDays">Ngưỡng cảnh báo</label><select id="absenceDays" class="form-select"><option>Từ 5 ngày</option><option>Từ 7 ngày</option><option>Từ 14 ngày</option><option>Từ 30 ngày</option></select></div>
    <div class="summary-strip"><div class="summary-cell"><span>Cần theo dõi</span><strong>36</strong></div><div class="summary-cell"><span>Tăng so với tuần trước</span><strong>+4</strong></div></div>
    <div class="section-title"><h3>Danh sách ưu tiên</h3><span>Cập nhật 10:30</span></div>
    <div class="person-list">${rows.map((row, index) => `<button class="person-item" type="button"><span class="avatar">${row[1].split(" ").slice(-2).map((v) => v[0]).join("")}</span><span class="item-main"><strong>${row[1]}</strong><span>${row[0]} · Phòng ${row[2]}</span></span><span class="tag ${index < 2 ? "danger" : "warning"}">${row[3]}</span></button>`).join("")}</div>
  </section>`;
}

function staffStranger() {
  return `<section class="screen">
    ${heading("Phát hiện người lạ", "Thống kê các lượt không nhận diện được danh tính")}
    <div class="metrics-grid">
      <div class="metric"><span class="metric-label">Hôm nay</span><strong class="metric-value danger">05</strong></div>
      <div class="metric"><span class="metric-label">Tuần này</span><strong class="metric-value">27</strong></div>
      <div class="metric"><span class="metric-label">Chưa kiểm tra</span><strong class="metric-value danger">03</strong></div>
    </div>
    <div class="chart-panel"><div class="chart-head"><div><strong>Phát hiện theo khu</strong><span>7 ngày gần nhất</span></div></div><div class="bar-list">${bar("Khu A", 100, "13 lượt", "warning")}${bar("Khu B", 69, "9 lượt", "warning")}${bar("Khu C", 38, "5 lượt", "warning")}</div></div>
    <div class="section-title"><h3>Gần đây</h3></div>
    <div class="activity-list">
      ${alertRecord("10:14", "Cổng phụ Khu B", "Chưa xác minh", "danger")}
      ${alertRecord("09:52", "Cổng chính Khu A", "Đã kiểm tra", "success")}
      ${alertRecord("08:37", "Cổng Khu C", "Chưa xác minh", "danger")}
    </div>
  </section>`;
}

function alertRecord(time, place, status, tone) {
  return `<button class="activity-item" type="button"><span class="item-icon ${tone}">${icon("alert")}</span><span class="item-main"><strong>${place}</strong><span>28/10/2026 · ${time}</span></span><span class="tag ${tone}">${status}</span></button>`;
}

function staffBanned() {
  return `<section class="screen">
    ${heading("Sinh viên bị cấm", "Các lượt nhận diện trùng với danh sách cảnh báo")}
    <div class="summary-strip"><div class="summary-cell"><span>Hôm nay</span><strong>03 lượt</strong></div><div class="summary-cell"><span>Tháng này</span><strong>18 lượt</strong></div></div>
    <div class="section-title"><h3>Lượt phát hiện mới</h3></div>
    <div class="person-list">
      ${bannedPerson("B2008392", "Trần Văn Phúc", "Nợ phí quá hạn", "Cổng Khu A · 09:17")}
      ${bannedPerson("B2114408", "Lê Minh Triết", "Vi phạm nội quy", "Cổng Khu C · 08:42")}
      ${bannedPerson("B1907721", "Nguyễn Hoàng Sơn", "Quyết định tạm cấm", "Cổng Khu B · 07:58")}
    </div>
    <div class="message-box" style="margin-top:14px">${icon("lock")}<span>App chỉ hiển thị số liệu và cảnh báo. Việc cập nhật danh sách cấm được thực hiện trên hệ thống web.</span></div>
  </section>`;
}

function bannedPerson(id, name, reason, place) {
  const initials = name.split(" ").slice(-2).map((part) => part[0]).join("");
  return `<button class="person-item" type="button"><span class="avatar">${initials}</span><span class="item-main"><strong>${name}</strong><span>${id} · ${place}</span></span><span class="tag danger">${reason}</span></button>`;
}

function staffPresent() {
  const query = state.presentSearch.toLowerCase();
  const filtered = presentStudents.filter((student) => `${student.id} ${student.name} ${student.room} ${student.area}`.toLowerCase().includes(query));
  return `<section class="screen">
    ${heading("Đang có mặt tại KTX", "Trạng thái được tính từ lượt vào hoặc ra gần nhất")}
    <div class="filter-bar">
      <label class="search-field">${icon("search")}<input id="presentSearch" value="${state.presentSearch}" placeholder="Tên, mã SV hoặc phòng" aria-label="Tìm sinh viên đang có mặt"></label>
      <button class="button" type="button" id="presentSearchButton">Lọc</button>
    </div>
    <div class="summary-strip"><div class="summary-cell"><span>Đang có mặt</span><strong>1.248</strong></div><div class="summary-cell"><span>Tổng sinh viên</span><strong>1.572</strong></div></div>
    <div class="section-title"><h3>Danh sách</h3><span>${filtered.length} kết quả mẫu</span></div>
    <div class="person-list">${filtered.length ? filtered.map((student) => `<button class="person-item" type="button"><span class="avatar">${student.initials}</span><span class="item-main"><strong>${student.name}</strong><span>${student.id} · ${student.area} · ${student.room}</span></span><span class="item-side"><strong>${student.since}</strong>Ghi nhận vào</span></button>`).join("") : `<div class="empty-state"><strong>Không có kết quả</strong><span>Thử lại với từ khóa khác.</span></div>`}</div>
  </section>`;
}

function renderScreenContent() {
  switch (state.screen) {
    case "student-home": return studentHome();
    case "student-history": return studentHistory();
    case "student-history-detail": return studentHistoryDetail();
    case "student-feedback": return studentFeedback();
    case "student-feedback-status": return studentFeedbackStatus();
    case "student-account": return accountScreen("student");
    case "staff-dashboard": return staffDashboard();
    case "staff-reports": return staffReports();
    case "staff-present": return staffPresent();
    case "staff-inout": return staffInOut();
    case "staff-area": return staffArea();
    case "staff-student": return staffStudent();
    case "staff-absence": return staffAbsence();
    case "staff-stranger": return staffStranger();
    case "staff-banned": return staffBanned();
    case "staff-account": return accountScreen("staff");
    default: return studentHome();
  }
}

function renderScreenMap() {
  const definitions = screenDefinitions[state.role];
  document.getElementById("screenList").innerHTML = definitions.map((group) => `
    <section class="screen-group">
      <h2 class="screen-group-title">${group.title}</h2>
      ${group.items.map(([id, label, iconName]) => `<button type="button" class="screen-link ${state.screen === id ? "is-active" : ""}" data-nav="${id}">${icon(iconName)}<span>${label}</span></button>`).join("")}
    </section>`).join("");

  document.querySelectorAll("[data-role]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.role === state.role);
  });
}

function renderHeader() {
  const [eyebrow, title, canGoBack] = screenMeta[state.screen] || screenMeta["student-home"];
  document.getElementById("headerEyebrow").textContent = eyebrow;
  document.getElementById("headerTitle").textContent = title;
  document.getElementById("backButton").hidden = !canGoBack;
  document.getElementById("roleBadgeText").textContent = state.role === "student" ? "Sinh viên" : "Phòng CTSV";
}

function renderBottomNav() {
  const items = state.role === "student"
    ? [
        ["student-home", "home", "Tổng quan"],
        ["student-history", "history", "Lịch sử"],
        ["student-feedback-status", "flag", "Phản hồi"],
        ["student-account", "user", "Tài khoản"],
      ]
    : [
        ["staff-dashboard", "home", "Tổng quan"],
        ["staff-reports", "chart", "Báo cáo"],
        ["staff-present", "users", "Có mặt"],
        ["staff-account", "user", "Tài khoản"],
      ];

  const activeRoot = getActiveRoot();
  document.getElementById("bottomNav").innerHTML = items.map(([screen, iconName, label]) => `<button type="button" class="nav-button ${activeRoot === screen ? "is-active" : ""}" data-nav="${screen}">${icon(iconName)}<span>${label}</span></button>`).join("");
}

function getActiveRoot() {
  if (state.role === "student") {
    if (["student-history", "student-history-detail"].includes(state.screen)) return "student-history";
    if (["student-feedback", "student-feedback-status"].includes(state.screen)) return "student-feedback-status";
    return state.screen;
  }
  if (["staff-inout", "staff-area", "staff-student", "staff-absence", "staff-stranger", "staff-banned"].includes(state.screen)) return "staff-reports";
  return state.screen;
}

function render() {
  renderHeader();
  renderScreenMap();
  renderBottomNav();
  document.getElementById("appContent").innerHTML = renderScreenContent();
  document.querySelector(".app-content").scrollTop = 0;
}

function navigate(screen) {
  if (!screenMeta[screen]) return;
  state.screen = screen;
  render();
  closeMap();
}

function switchRole(role) {
  state.role = role;
  state.screen = role === "student" ? "student-home" : "staff-dashboard";
  render();
  closeMap();
  showToast(`Đang xem giao diện ${role === "student" ? "Sinh viên" : "Phòng CTSV"}`);
}

function goBack() {
  const backMap = {
    "student-history-detail": "student-history",
    "student-feedback": "student-history-detail",
    "student-feedback-status": "student-feedback",
    "staff-inout": "staff-reports",
    "staff-area": "staff-reports",
    "staff-student": "staff-reports",
    "staff-absence": "staff-reports",
    "staff-stranger": "staff-reports",
    "staff-banned": "staff-reports",
  };
  navigate(backMap[state.screen] || (state.role === "student" ? "student-home" : "staff-dashboard"));
}

function openMap() {
  document.getElementById("screenMap").classList.add("is-open");
  document.getElementById("mapBackdrop").classList.add("is-open");
}

function closeMap() {
  document.getElementById("screenMap").classList.remove("is-open");
  document.getElementById("mapBackdrop").classList.remove("is-open");
}

let toastTimer;
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2200);
}

document.addEventListener("click", (event) => {
  const navTarget = event.target.closest("[data-nav]");
  if (navTarget) {
    navigate(navTarget.dataset.nav);
    return;
  }

  const historyTarget = event.target.closest("[data-history-id]");
  if (historyTarget) {
    state.selectedHistoryId = historyTarget.dataset.historyId;
    navigate("student-history-detail");
    return;
  }

  const roleTarget = event.target.closest("[data-role]");
  if (roleTarget) {
    switchRole(roleTarget.dataset.role);
    return;
  }

  const switchTarget = event.target.closest("[data-switch-role]");
  if (switchTarget) {
    switchRole(switchTarget.dataset.switchRole);
    return;
  }

  const historyFilter = event.target.closest("[data-history-filter]");
  if (historyFilter) {
    state.historyFilter = historyFilter.dataset.historyFilter;
    render();
    showToast(`Đã lọc: ${state.historyFilter}`);
    return;
  }

  const periodTarget = event.target.closest("[data-report-period]");
  if (periodTarget) {
    state.reportPeriod = periodTarget.dataset.reportPeriod;
    render();
    showToast(`Đã chọn báo cáo theo ${state.reportPeriod.toLowerCase()}`);
    return;
  }

  if (event.target.closest("#studentSearchButton")) {
    state.studentSearch = document.getElementById("studentSearch").value.trim();
    render();
    return;
  }

  if (event.target.closest("#presentSearchButton")) {
    state.presentSearch = document.getElementById("presentSearch").value.trim();
    render();
  }
});

document.addEventListener("submit", (event) => {
  if (event.target.id !== "feedbackForm") return;
  event.preventDefault();
  const reason = document.getElementById("feedbackReason").value;
  const content = document.getElementById("feedbackContent").value.trim();
  const errorBox = document.getElementById("feedbackError");
  if (!reason || content.length < 5) {
    errorBox.hidden = false;
    return;
  }
  state.feedbackSubmitted = true;
  navigate("student-feedback-status");
  showToast("Đã gửi phản hồi");
});

document.getElementById("openMap").addEventListener("click", openMap);
document.getElementById("closeMap").addEventListener("click", closeMap);
document.getElementById("mapBackdrop").addEventListener("click", closeMap);
document.getElementById("backButton").addEventListener("click", goBack);
document.getElementById("roleBadge").addEventListener("click", () => switchRole(state.role === "student" ? "staff" : "student"));

render();
