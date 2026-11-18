export interface QuickStat {
  id: string;
  title: string;
  value: string | number;
  caption: string;
  iconType: "total" | "present" | "out" | "debt" | "banned" | "stranger";
  gradient: string;
  iconColor: string;
}

export interface InOutHistory {
  stt: number;
  time: string;
  studentId: string;
  avatarUrl: string | null;
  fullName: string;
  type: "Vào" | "Ra";
  ktx: string;
  room: string;
}

export interface TimeChartData {
  time: string;
  vao: number;
  ra: number;
}

export interface StudentActivity {
  name: string;
  studentId?: string;
  displayLabel?: string;
  count: number;
}

export interface KtxInOutData {
  name: string;
  vao: number;
  ra: number;
}

export interface KtxDistribution {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

export interface StrangerDetection {
  date: string;
  count: number;
}

export interface IntrusionAlert {
  label: string;
  count: number;
  color: string;
}

export const INITIAL_QUICK_STATS: QuickStat[] = [
  {
    id: "total_sv",
    title: "TỔNG SV KTX",
    value: "0",
    caption: "Tổng số sinh viên",
    iconType: "total",
    gradient: "linear-gradient(135deg, #E3F2FD, #BBDEFB)",
    iconColor: "#1976D2",
  },
  {
    id: "present",
    title: "ĐANG CÓ MẶT",
    value: "0",
    caption: "0% tổng số SV",
    iconType: "present",
    gradient: "linear-gradient(135deg, #E0F2F1, #B2DFDB)",
    iconColor: "#00796B",
  },
  {
    id: "out",
    title: "ĐÃ RA NGOÀI",
    value: "0",
    caption: "0% tổng số SV",
    iconType: "out",
    gradient: "linear-gradient(135deg, #E8EAF6, #C5CAE9)",
    iconColor: "#3F51B5",
  },
  {
    id: "debt",
    title: "SINH VIÊN NỢ PHÍ",
    value: "0",
    caption: "0% tổng số SV",
    iconType: "debt",
    gradient: "linear-gradient(135deg, #FFF9C4, #FFF59D)",
    iconColor: "#FBC02D",
  },
  {
    id: "banned",
    title: "SINH VIÊN BỊ CẤM",
    value: "0",
    caption: "0% tổng số SV",
    iconType: "banned",
    gradient: "linear-gradient(135deg, #FFEBEE, #FFCDD2)",
    iconColor: "#D32F2F",
  },
  {
    id: "stranger",
    title: "NGƯỜI LẠ HÔM NAY",
    value: "0",
    caption: "Phát hiện hôm nay",
    iconType: "stranger",
    gradient: "linear-gradient(135deg, #F3E5F5, #E1BEE7)",
    iconColor: "#7B1FA2",
  },
];
