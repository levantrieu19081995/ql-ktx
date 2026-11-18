// Dữ liệu sơ đồ kết nối các phần của hệ thống (vẽ bằng SVG trong TutorialPage).
// Toạ độ theo viewBox DIAGRAM_SIZE. Muốn đổi nhãn hoặc thêm khối thì sửa ở đây.

export const DIAGRAM_SIZE = { width: 1160, height: 340 };

export interface DiagramNode {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  /** Dòng 1 (đậm) và dòng 2 (công nghệ). */
  line1: string;
  line2: string;
}

export interface DiagramEdge {
  id: string;
  /** Đường đi theo cú pháp path của SVG, chỉ dùng đoạn ngang và dọc. */
  d: string;
  /** true: mũi tên cả hai đầu (hỏi và trả lời). */
  both?: boolean;
  label: { text: string; x: number; y: number; anchor?: "start" | "middle" | "end" };
}

export const DIAGRAM_NODES: DiagramNode[] = [
  // Hàng trên: từ camera đến dữ liệu
  { id: "camera", x: 10, y: 30, w: 190, h: 64, line1: "Camera", line2: "Luồng hình ảnh" },
  { id: "ai", x: 290, y: 30, w: 230, h: 64, line1: "Nhận diện khuôn mặt", line2: "Python + FastAPI" },
  { id: "be", x: 670, y: 30, w: 250, h: 64, line1: "Máy chủ nghiệp vụ", line2: "Java: gateway + service" },
  { id: "db", x: 1000, y: 30, w: 150, h: 64, line1: "Dữ liệu", line2: "CSDL + kho ảnh" },
  // Hàng dưới: người dùng và nguồn bên ngoài
  { id: "user", x: 10, y: 250, w: 190, h: 64, line1: "Người dùng", line2: "Trình duyệt" },
  { id: "fe", x: 290, y: 250, w: 230, h: 64, line1: "Giao diện web", line2: "Next.js + React" },
  { id: "uiis", x: 1000, y: 250, w: 150, h: 64, line1: "UIIS", line2: "Hệ thống của trường" },
];

export const DIAGRAM_EDGES: DiagramEdge[] = [
  { id: "camera-ai", d: "M200 62 H290", label: { text: "hình ảnh", x: 245, y: 52, anchor: "middle" } },
  { id: "ai-be", d: "M520 62 H670", label: { text: "kết quả nhận diện", x: 595, y: 52, anchor: "middle" } },
  { id: "be-db", d: "M920 62 H1000", both: true, label: { text: "đọc, ghi", x: 960, y: 52, anchor: "middle" } },
  { id: "user-fe", d: "M200 282 H290", both: true, label: { text: "mở trang", x: 245, y: 272, anchor: "middle" } },
  {
    id: "fe-ai",
    d: "M405 250 V94",
    both: true,
    label: { text: "xem camera, nhật ký, lấy mẫu", x: 417, y: 178, anchor: "start" },
  },
  {
    id: "fe-be",
    d: "M520 282 H795 V94",
    both: true,
    label: { text: "dữ liệu nghiệp vụ, đăng nhập", x: 657, y: 272, anchor: "middle" },
  },
  { id: "uiis-be", d: "M1000 282 H880 V94", label: { text: "đồng bộ danh mục", x: 940, y: 306, anchor: "middle" } },
];
