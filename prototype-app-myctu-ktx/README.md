# Prototype app MyCTU KTX

Đây là bản mẫu giao diện tương tác cho phân hệ Ký túc xá trong app MyCTU, bám theo phạm vi chức năng của phụ lục hợp đồng.

## Cách xem

Mở trực tiếp file `index.html` bằng trình duyệt hiện đại. Prototype không cần cài thư viện, không cần kết nối Internet và không gọi API thật.

## Màn hình sinh viên

1. Tổng quan KTX và trạng thái hiện diện.
2. Lịch sử ra vào.
3. Chi tiết lượt ra vào.
4. Phản hồi sai thông tin.
5. Trạng thái xử lý phản hồi.
6. Tài khoản.

## Màn hình Phòng Công tác sinh viên

1. Tổng quan điều hành.
2. Danh mục báo cáo.
3. Thống kê lượt vào ra theo ngày, tuần, tháng và năm.
4. Thống kê theo khu KTX.
5. Thống kê theo từng sinh viên.
6. Danh sách sinh viên vắng mặt lâu ngày.
7. Thống kê phát hiện người lạ.
8. Thống kê sinh viên bị cấm.
9. Danh sách sinh viên đang có mặt tại KTX.
10. Tài khoản CTSV.

## Phạm vi prototype

- Dữ liệu hiển thị là dữ liệu minh họa.
- Các nút điều hướng, lọc, tìm kiếm và gửi phản hồi hoạt động trong trình duyệt.
- Chưa tích hợp SSO MyCTU, API KTX, camera hoặc dữ liệu nhận diện thật.
- Không chứa token, thông tin đăng nhập hoặc thư viện bên thứ ba.

## Nguyên tắc thiết kế

- Ít màu sắc, không dùng gradient.
- Bố cục ưu tiên khả năng đọc và thao tác một tay.
- Màu chủ đạo xanh đậm, màu cảnh báo chỉ xuất hiện khi có ý nghĩa.
- Giao diện responsive cho điện thoại và có bảng chọn màn hình khi xem trên máy tính.
