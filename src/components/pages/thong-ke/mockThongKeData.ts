export interface ThongKeOverview {
  stt: number;
  studentId: string;
  hoTen: string;
  maNhom: string;
  luotVao: number;
  luotRa: number;
  tongLuot: number;
  avatarUrl: string;
}

export interface ThongKeDetail {
  stt: number;
  time: string;
  type: "Vào" | "Ra";
  ktx: string;
  room: string;
  status: "Hợp lệ" | "Nghi vấn" | "Không hợp lệ";
}

export const MOCK_THONG_KE_OVERVIEW: ThongKeOverview[] = [
  {
    stt: 1,
    studentId: "B2100941",
    hoTen: "Trần Thị Thu Thảo",
    maNhom: "Sinh viên khóa 47",
    luotVao: 72,
    luotRa: 69,
    tongLuot: 141,
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Thao"
  },
  {
    stt: 2,
    studentId: "B2100822",
    hoTen: "Nguyễn Minh Quân",
    maNhom: "Sinh viên khóa 47",
    luotVao: 66,
    luotRa: 66,
    tongLuot: 132,
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Quan"
  },
  {
    stt: 3,
    studentId: "B2003512",
    hoTen: "Lê Hoàng Nam",
    maNhom: "Sinh viên khóa 46",
    luotVao: 52,
    luotRa: 50,
    tongLuot: 102,
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Nam"
  },
  {
    stt: 4,
    studentId: "B2201103",
    hoTen: "Phạm Minh Triết",
    maNhom: "Sinh viên khóa 48",
    luotVao: 51,
    luotRa: 49,
    tongLuot: 100,
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Triet"
  },
  {
    stt: 5,
    studentId: "B2101234",
    hoTen: "Huỳnh Ngọc Mai",
    maNhom: "Sinh viên khóa 47",
    luotVao: 48,
    luotRa: 45,
    tongLuot: 93,
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mai"
  }
];

export const MOCK_THONG_KE_DETAILS: { [key: string]: Omit<ThongKeDetail, "stt">[] } = {
  "B2100941": [
    { time: "25/06/2026 14:15", type: "Vào", ktx: "Khu A", room: "A302", status: "Hợp lệ" },
    { time: "25/06/2026 11:30", type: "Ra", ktx: "Khu A", room: "A302", status: "Hợp lệ" },
    { time: "25/06/2026 07:45", type: "Vào", ktx: "Khu A", room: "A302", status: "Hợp lệ" },
    { time: "24/06/2026 21:00", type: "Ra", ktx: "Khu A", room: "A302", status: "Hợp lệ" },
    { time: "24/06/2026 17:30", type: "Vào", ktx: "Khu A", room: "A302", status: "Nghi vấn" },
    { time: "24/06/2026 13:15", type: "Ra", ktx: "Khu A", room: "A302", status: "Hợp lệ" },
    { time: "24/06/2026 08:00", type: "Vào", ktx: "Khu A", room: "A302", status: "Hợp lệ" }
  ],
  "B2100822": [
    { time: "25/06/2026 13:40", type: "Vào", ktx: "Khu B", room: "B104", status: "Hợp lệ" },
    { time: "25/06/2026 12:00", type: "Ra", ktx: "Khu B", room: "B104", status: "Hợp lệ" },
    { time: "25/06/2026 08:15", type: "Vào", ktx: "Khu B", room: "B104", status: "Hợp lệ" },
    { time: "24/06/2026 19:45", type: "Ra", ktx: "Khu B", room: "B104", status: "Không hợp lệ" },
    { time: "24/06/2026 14:00", type: "Vào", ktx: "Khu B", room: "B104", status: "Hợp lệ" }
  ],
  "B2003512": [
    { time: "25/06/2026 15:02", type: "Vào", ktx: "Khu A", room: "A101", status: "Hợp lệ" },
    { time: "25/06/2026 10:12", type: "Ra", ktx: "Khu A", room: "A101", status: "Hợp lệ" },
    { time: "24/06/2026 18:22", type: "Vào", ktx: "Khu A", room: "A101", status: "Hợp lệ" },
    { time: "24/06/2026 07:11", type: "Ra", ktx: "Khu A", room: "A101", status: "Hợp lệ" }
  ],
  "B2201103": [
    { time: "25/06/2026 09:30", type: "Vào", ktx: "Khu B", room: "B205", status: "Hợp lệ" },
    { time: "24/06/2026 22:15", type: "Ra", ktx: "Khu B", room: "B205", status: "Hợp lệ" },
    { time: "24/06/2026 15:00", type: "Vào", ktx: "Khu B", room: "B205", status: "Hợp lệ" }
  ],
  "B2101234": [
    { time: "25/06/2026 10:05", type: "Vào", ktx: "Khu A", room: "A408", status: "Hợp lệ" },
    { time: "25/06/2026 07:10", type: "Ra", ktx: "Khu A", room: "A408", status: "Hợp lệ" },
    { time: "24/06/2026 20:30", type: "Vào", ktx: "Khu A", room: "A408", status: "Nghi vấn" }
  ]
};

export interface AbsentStudent {
  stt: number;
  studentId: string;
  hoTen: string;
  ktx: string;
  room: string;
  absentDays: number;
  lastScan: string;
  status: "Cảnh báo" | "Bình thường" | "Nghi vấn";
}

export const MOCK_ABSENT_STUDENTS: AbsentStudent[] = [
  { stt: 1, studentId: "B2101111", hoTen: "Võ Văn Hùng", ktx: "Khu A", room: "A102", absentDays: 14, lastScan: "11/06/2026 18:20", status: "Cảnh báo" },
  { stt: 2, studentId: "B2102222", hoTen: "Trần Thị Lan", ktx: "Khu B", room: "B204", absentDays: 9, lastScan: "16/06/2026 07:45", status: "Nghi vấn" },
  { stt: 3, studentId: "B2003333", hoTen: "Phạm Quốc Bảo", ktx: "Khu A", room: "A305", absentDays: 5, lastScan: "20/06/2026 12:15", status: "Bình thường" },
  { stt: 4, studentId: "B2204444", hoTen: "Lê Minh Tuấn", ktx: "Khu B", room: "B102", absentDays: 4, lastScan: "21/06/2026 19:30", status: "Bình thường" },
  { stt: 5, studentId: "B2105555", hoTen: "Hoàng Ngọc Linh", ktx: "Khu A", room: "A208", absentDays: 3, lastScan: "22/06/2026 21:00", status: "Bình thường" }
];

export const MOCK_ABSENT_CHART = [
  { name: "3 - 5 ngày", value: 15 },
  { name: "5 - 10 ngày", value: 8 },
  { name: "Trên 10 ngày", value: 3 }
];

export interface StrangerDetection {
  stt: number;
  time: string;
  ktx: string;
  gate: string;
  imageUrl: string;
  status: "Hợp lệ" | "Cảnh báo";
}

export const MOCK_STRANGER_DETECTIONS: StrangerDetection[] = [
  { stt: 1, time: "25/06/2026 15:30", ktx: "Khu A", gate: "Cổng KTX A", imageUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=stranger1", status: "Cảnh báo" },
  { stt: 2, time: "25/06/2026 14:22", ktx: "Khu B", gate: "Cổng KTX B", imageUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=stranger2", status: "Hợp lệ" },
  { stt: 3, time: "24/06/2026 21:45", ktx: "Khu A", gate: "Cổng KTX A", imageUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=stranger3", status: "Cảnh báo" },
  { stt: 4, time: "24/06/2026 10:15", ktx: "Khu B", gate: "Cổng phụ", imageUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=stranger4", status: "Hợp lệ" },
  { stt: 5, time: "23/06/2026 19:00", ktx: "Khu A", gate: "Cổng chính", imageUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=stranger5", status: "Cảnh báo" }
];

export const MOCK_STRANGER_CHART = [
  { date: "19/06", "Khu A": 4, "Khu B": 2 },
  { date: "20/06", "Khu A": 3, "Khu B": 5 },
  { date: "21/06", "Khu A": 6, "Khu B": 1 },
  { date: "22/06", "Khu A": 2, "Khu B": 4 },
  { date: "23/06", "Khu A": 5, "Khu B": 3 },
  { date: "24/06", "Khu A": 7, "Khu B": 2 },
  { date: "25/06", "Khu A": 4, "Khu B": 6 }
];

export interface BannedViolation {
  stt: number;
  studentId: string;
  hoTen: string;
  room: string;
  reason: string;
  violationCount: number;
  status: "Chờ xử lý" | "Đã nhắc nhở" | "Khóa thẻ";
}

export const MOCK_BANNED_VIOLATIONS: BannedViolation[] = [
  { stt: 1, studentId: "B2109999", hoTen: "Nguyễn Văn Đạt", room: "A203", reason: "Vi phạm nội quy nhiều lần", violationCount: 4, status: "Khóa thẻ" },
  { stt: 2, studentId: "B2008888", hoTen: "Trần Minh Tiến", room: "B105", reason: "Chưa nộp học phí nội trú", violationCount: 3, status: "Chờ xử lý" },
  { stt: 3, studentId: "B2207777", hoTen: "Lê Văn Tùng", room: "A108", reason: "Gây mất trật tự phòng", violationCount: 2, status: "Đã nhắc nhở" },
  { stt: 4, studentId: "B2106666", hoTen: "Phạm Thanh Hải", room: "B302", reason: "Mang xe ngoài vào KTX trái quy định", violationCount: 1, status: "Đã nhắc nhở" }
];

export const MOCK_BANNED_CHART = [
  { name: "Khu A", value: 6 },
  { name: "Khu B", value: 4 }
];
