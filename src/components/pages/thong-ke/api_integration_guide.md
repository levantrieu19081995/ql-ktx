# Hướng dẫn Kết nối API Thống kê Ký túc xá

Tài liệu này hướng dẫn cách kết nối giao diện thống kê của dự án với hệ thống API thực tế tại URL gốc:
`https://qldaotaolaixe.cusc.vn` (Base URL).

---

## 1. Cấu hình Axios Client

Hãy đảm bảo tập tin cấu hình Axios của bạn (thường ở `src/utils/axios.ts` hoặc tương tự) đã trỏ đúng Base URL:

```typescript
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://qldaotaolaixe.cusc.vn',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Có thể thêm Interceptors để đính kèm Token xác thực nếu cần thiết
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;
```

---

## 2. Danh sách các API Thống kê cần kết nối

### 2.1. API Thống kê lượt ra vào chung
* **Endpoint**: `/ktx-service/thong-ke/luot-ra-vao`
* **Phương thức**: `POST`
* **Tham số yêu cầu (Request Payload)**:
  ```json
  {
    "tuNgay": "01/06/2026", // Định dạng: dd/MM/yyyy
    "denNgay": "25/06/2026", // Định dạng: dd/MM/yyyy
    "groupBy": "DAY" // Hoặc "HOUR", "MONTH"
  }
  ```
* **Cấu trúc phản hồi mẫu (Response)**:
  ```json
  {
    "status": 200,
    "message": "Thành công",
    "payload": [
      {
        "name": "Thứ 2",
        "vao": 120,
        "ra": 115
      },
      {
        "name": "Thứ 3",
        "vao": 140,
        "ra": 138
      }
    ]
  }
  ```

---

### 2.2. API Thống kê theo mã số (Sinh viên hoặc Cán bộ)
* **Endpoint**: `/ktx-service/thong-ke/theo-ma-so`
* **Phương thức**: `POST`
* **Tham số yêu cầu (Request Payload)**:
  ```json
  {
    "maSo": "B2100941", // MSSV hoặc Mã cán bộ cần tra cứu
    "tuNgay": "01/06/2026", // dd/MM/yyyy
    "denNgay": "25/06/2026"  // dd/MM/yyyy
  }
  ```
* **Cấu trúc phản hồi mẫu (Response)**:
  ```json
  {
    "status": 200,
    "payload": {
      "info": {
        "studentId": "B2100941",
        "hoTen": "Trần Thị Thu Thảo",
        "maNhom": "Sinh viên khóa 47",
        "avatarUrl": "https://api.dicebear.com/7.x/avataaars/svg?seed=Thao"
      },
      "summary": {
        "luotVao": 72,
        "luotRa": 69,
        "tongLuot": 141
      },
      "weeklyChart": [
        { "name": "Thứ 2", "Lượt vào": 10, "Lượt ra": 8 },
        { "name": "Thứ 3", "Lượt vào": 12, "Lượt ra": 11 }
      ],
      "history": [
        {
          "stt": 1,
          "time": "25/06/2026 14:15",
          "type": "Vào",
          "ktx": "Khu A",
          "room": "A302",
          "status": "Hợp lệ"
        }
      ]
    }
  }
  ```

---

### 2.3. API Thống kê sinh viên bị cấm (Nợ phí / Vi phạm)
* **Endpoint**: `/ktx-service/thong-ke/sv-bi-cam-no-phi`
* **Phương thức**: `POST` hoặc `GET` (tùy thuộc vào thiết kế phân trang)
* **Tham số yêu cầu (Request Payload)**:
  ```json
  {
    "page": 1,
    "pageSize": 10,
    "keyWord": "" // MSSV hoặc họ tên để lọc nhanh
  }
  ```
* **Cấu trúc phản hồi mẫu (Response)**:
  ```json
  {
    "status": 200,
    "payload": {
      "content": [
        {
          "studentId": "B2109999",
          "hoTen": "Nguyễn Văn Đạt",
          "room": "A203",
          "reason": "Vi phạm nội quy nhiều lần",
          "violationCount": 4,
          "status": "Khóa thẻ"
        }
      ],
      "totalElements": 24,
      "totalPages": 3
    }
  }
  ```

---

### 2.4. API Thống kê lượt ra vào của người lạ
* **Endpoint**: `/face-detect-service/face-web-check-time/paginate-nguoi-la`
* **Phương thức**: `POST`
* **Tham số yêu cầu (Request Payload)**:
  ```json
  {
    "page": "1",
    "pageSize": "10",
    "tuNgay": "06/01/2026", // Định dạng: MM/dd/yyyy
    "denNgay": "06/25/2026", // Định dạng: MM/dd/yyyy
    "maKhu": "-1" // -1 nghĩa là xem tất cả các khu
  }
  ```
* **Cấu trúc phản hồi mẫu (Response)**:
  ```json
  {
    "status": "SUCCESS",
    "payload": {
      "items": [
        {
          "id": 1024,
          "detectTime": "25/06/2026 15:30",
          "tenKhu": "Khu A",
          "viTri": "Cổng KTX A",
          "imageUrl": "https://...",
          "trangThai": "Cảnh báo"
        }
      ],
      "numberOfElements": 1,
      "totalPages": 1
    }
  }
  ```

---

## 3. Cách cập nhật trong component `ThongKePage.tsx`

Khi bạn muốn chuyển từ dữ liệu giả lập (Mock) sang dữ liệu thật từ API, hãy thực hiện theo các bước sau trong tập tin [ThongKePage.tsx](file:///c:/Users/LENOVO/quanlyktx/src/components/pages/thong-ke/ThongKePage.tsx):

1. **Khai báo hàm kết nối API** trong `src/services/dashboard/dashboardService.ts`:
   ```typescript
   export const fetchThongKeTheoMaSo = async (payload: { maSo: string; tuNgay: string; denNgay: string }) => {
     const res = await post<any>("/ktx-service/thong-ke/theo-ma-so", payload);
     return res;
   };
   
   export const fetchSvBiCam = async (payload: any) => {
     const res = await post<any>("/ktx-service/thong-ke/sv-bi-cam-no-phi", payload);
     return res;
   };
   ```

2. **Gọi API trong `useEffect`** dựa trên loại thống kê (`type`):
   ```typescript
   const [loading, setLoading] = useState(false);

   useEffect(() => {
     if (type === "theo-ma-so" && mssv.trim()) {
       setLoading(true);
       fetchThongKeTheoMaSo({
         maSo: mssv,
         tuNgay: tuNgay,
         denNgay: denNgay
       })
       .then(res => {
         if (res && res.payload) {
           setSelectedStudent(res.payload.info);
           // Đổ dữ liệu vào biểu đồ và bảng chi tiết ra vào
           setDetailsMap(prev => ({
             ...prev,
             [res.payload.info.studentId]: res.payload.history
           }));
         }
       })
       .catch(err => console.error("Lỗi khi tải thống kê theo mã số:", err))
       .finally(() => setLoading(false));
     }
   }, [type, mssv, tuNgay, denNgay]);
   ```

3. **Cập nhật trạng thái `loading` và hiển thị `Loader`** tương ứng trong giao diện để mang lại trải nghiệm người dùng mượt mà nhất.
