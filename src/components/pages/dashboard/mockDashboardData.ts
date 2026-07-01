export interface QuickStat {
  id: string;
  title: string;
  value: string | number;
  caption: string;
  iconType: 'total' | 'present' | 'out' | 'debt' | 'banned' | 'stranger';
  gradient: string;
  iconColor: string;
}

export interface InOutHistory {
  stt: number;
  time: string;
  studentId: string;
  avatarUrl: string;
  fullName: string;
  type: 'Vào' | 'Ra';
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
  ktx: string;
  count: number;
  color: string;
}

export const QUICK_STATS: QuickStat[] = [
  {
    id: 'total_sv',
    title: 'TỔNG SV KTX',
    value: '1.256',
    caption: 'Tổng số sinh viên',
    iconType: 'total',
    gradient: 'linear-gradient(135deg, #E3F2FD, #BBDEFB)',
    iconColor: '#1976D2',
  },
  {
    id: 'present',
    title: 'ĐANG CÓ MẶT',
    value: '842',
    caption: '67,0% tổng số SV',
    iconType: 'present',
    gradient: 'linear-gradient(135deg, #E0F2F1, #B2DFDB)',
    iconColor: '#00796B',
  },
  {
    id: 'out',
    title: 'ĐÃ RA NGOÀI',
    value: '414',
    caption: '33,0% tổng số SV',
    iconType: 'out',
    gradient: 'linear-gradient(135deg, #E8EAF6, #C5CAE9)',
    iconColor: '#3F51B5',
  },
  {
    id: 'debt',
    title: 'SINH VIÊN NỢ PHÍ',
    value: '23',
    caption: '1,8% tổng số SV',
    iconType: 'debt',
    gradient: 'linear-gradient(135deg, #FFF9C4, #FFF59D)',
    iconColor: '#FBC02D',
  },
  {
    id: 'banned',
    title: 'SINH VIÊN BỊ CẤM',
    value: '26',
    caption: '2,1% tổng số SV',
    iconType: 'banned',
    gradient: 'linear-gradient(135deg, #FFEBEE, #FFCDD2)',
    iconColor: '#D32F2F',
  },
  {
    id: 'stranger',
    title: 'NGƯỜI LẠ HÔM NAY',
    value: '12',
    caption: 'Phát hiện hôm nay',
    iconType: 'stranger',
    gradient: 'linear-gradient(135deg, #F3E5F5, #E1BEE7)',
    iconColor: '#7B1FA2',
  },
];

export const IN_OUT_HISTORY: InOutHistory[] = [
  {
    stt: 1,
    time: '01/06 20:15',
    studentId: 'B2112345',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=An',
    fullName: 'Nguyễn Văn An',
    type: 'Vào',
    ktx: 'KTX A',
    room: 'Phòng 101',
  },
  {
    stt: 2,
    time: '01/06 20:10',
    studentId: 'B2111111',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bich',
    fullName: 'Trần Thị Bích',
    type: 'Ra',
    ktx: 'KTX B',
    room: 'Phòng 102',
  },
  {
    stt: 3,
    time: '01/06 19:58',
    studentId: 'T2112221',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Cuong',
    fullName: 'Lê Văn Cường',
    type: 'Vào',
    ktx: 'KTX A',
    room: 'Phòng 103',
  },
  {
    stt: 4,
    time: '01/06 19:45',
    studentId: 'B2120019',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Duyen',
    fullName: 'Phan Thị Duyên',
    type: 'Ra',
    ktx: 'KTX C',
    room: 'Phòng 201',
  },
  {
    stt: 5,
    time: '01/06 19:30',
    studentId: 'B2113333',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nam',
    fullName: 'Đỗ Hoàng Nam',
    type: 'Vào',
    ktx: 'KTX D',
    room: 'Phòng 104',
  },
];

export const TIME_CHART_DATA: TimeChartData[] = [
  { time: '0h', vao: 5, ra: 2 },
  { time: '2h', vao: 50, ra: 20 },
  { time: '4h', vao: 220, ra: 200 },
  { time: '6h', vao: 370, ra: 300 },
  { time: '8h', vao: 200, ra: 160 },
  { time: '10h', vao: 90, ra: 80 },
  { time: '12h', vao: 140, ra: 120 },
  { time: '14h', vao: 290, ra: 450 },
  { time: '16h', vao: 480, ra: 340 },
  { time: '18h', vao: 220, ra: 150 },
  { time: '20h', vao: 120, ra: 100 },
  { time: '22h', vao: 70, ra: 50 },
];

export const TOP_STUDENTS: StudentActivity[] = [
  { name: 'Nguyễn Văn An', count: 150 },
  { name: 'Trần Thị Bích', count: 130 },
  { name: 'Lê Văn Cường', count: 120 },
  { name: 'Phan Thị Duyên', count: 90 },
  { name: 'Đỗ Hoàng Nam', count: 85 },
];

export const KTX_IN_OUT_DATA: KtxInOutData[] = [
  { name: 'KTX A', vao: 310, ra: 290 },
  { name: 'KTX B', vao: 260, ra: 240 },
  { name: 'KTX C', vao: 410, ra: 360 },
  { name: 'KTX D', vao: 150, ra: 140 },
];

export const KTX_DISTRIBUTION: KtxDistribution[] = [
  { name: 'KTX A', value: 250, percentage: 29.4, color: '#4CAF50' },
  { name: 'KTX B', value: 180, percentage: 21.2, color: '#1E88E5' },
  { name: 'KTX C', value: 320, percentage: 37.6, color: '#FF9800' },
  { name: 'KTX D', value: 100, percentage: 11.8, color: '#F44336' },
];

export const STRANGER_DETECTION: StrangerDetection[] = [
  { date: '07/06', count: 1 },
  { date: '08/06', count: 4 },
  { date: '09/06', count: 2 },
  { date: '10/06', count: 5 },
  { date: '11/06', count: 3 },
  { date: '12/06', count: 6 },
  { date: '13/06', count: 3 },
];

export const INTRUSION_ALERTS: IntrusionAlert[] = [
  { ktx: 'KTX A', count: 12, color: '#1976D2' },
  { ktx: 'KTX B', count: 8, color: '#1976D2' },
  { ktx: 'KTX C', count: 2, color: '#1976D2' },
  { ktx: 'KTX D', count: 5, color: '#1976D2' },
];
