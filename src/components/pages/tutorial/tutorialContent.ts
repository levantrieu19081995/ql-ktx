// Nội dung trang hướng dẫn sử dụng. Chỉ chứa dữ liệu: muốn thêm hoặc sửa hướng dẫn thì sửa file này.
// Tên menu, tên nút trong các bước lấy đúng theo giao diện hiện tại.

export type TutorialIcon =
  | "overview"
  | "monitor"
  | "category"
  | "statistics"
  | "admin"
  | "history"
  | "stranger"
  | "camera"
  | "sample"
  | "student"
  | "debt"
  | "room"
  | "area"
  | "banned"
  | "inout"
  | "present"
  | "absent"
  | "settings"
  | "users"
  | "roles";

/** Kích thước các ảnh chụp trong public/tutorial/. */
export const IMAGE_SIZE = { width: 1440, height: 900 };

export interface TutorialMark {
  x: number;
  y: number;
  /** Nhãn ngắn, 2 đến 5 chữ. */
  label: string;
}

export interface TutorialItem {
  id: string;
  title: string;
  icon: TutorialIcon;
  /** Đường dẫn của trang trong ứng dụng, dùng để hiện "Mở trang này". */
  path?: string;
  /** Vị trí trong menu bên trái của ứng dụng. */
  menu?: string;
  /** Ảnh chụp trang, nằm trong public/tutorial/. Có thì hiện nút "Xem hình ảnh". */
  image?: string;
  /** Một câu rất ngắn nói chức năng để làm gì (hiện ngay dưới tiêu đề slide). */
  tagline?: string;
  /**
   * Các chấm số đặt trên ảnh, toạ độ tính bằng điểm ảnh của ảnh gốc (IMAGE_SIZE).
   * Thứ tự trong mảng là số thứ tự chấm.
   */
  marks?: TutorialMark[];
  summary: string;
  steps: string[];
  notes?: string[];
}

export interface TutorialGroup {
  id: string;
  title: string;
  icon: TutorialIcon;
  summary: string;
  items: TutorialItem[];
}

export const TUTORIAL_GOAL = {
  title: "Mục tiêu của hệ thống",
  lead:
    "Hệ thống giúp Ban quản lý ký túc xá theo dõi sinh viên và cán bộ ra vào từng khu qua camera nhận diện khuôn mặt. Danh sách sinh viên, phòng và khu được lấy từ hệ thống của trường (UIIS).",
  points: [
    "Biết ai đã vào, ai đã ra và ai đang có mặt trong ký túc xá.",
    "Nhận cảnh báo khi có người lạ, sinh viên bị cấm hoặc sinh viên nợ phí.",
    "Xem số liệu theo ngày, tháng, khu và xuất ra Excel hoặc PDF.",
    "Quản lý danh mục khu, phòng, sinh viên và phân quyền cho người dùng.",
  ],
};

export const TUTORIAL_GROUPS: TutorialGroup[] = [
  {
    id: "tong-quan",
    title: "Tổng quan",
    icon: "overview",
    summary: "Màn hình đầu tiên sau khi đăng nhập.",
    items: [
      {
        id: "dashboard",
        title: "Màn hình Tổng quan",
        icon: "overview",
        path: "/dashboard",
        menu: "Tổng quan",
        image: "/tutorial/dashboard.png",
        tagline: "Tình hình ra vào trong khoảng ngày đã chọn.",
        marks: [
          { x: 1160, y: 182, label: "Chọn khoảng ngày" },
          { x: 850, y: 385, label: "Số liệu nhanh" },
          { x: 850, y: 700, label: "Biểu đồ" },
        ],
        summary:
          "Cho biết tình hình ra vào trong khoảng ngày đang chọn, gồm số liệu nhanh, biểu đồ và các lượt ra vào mới nhất.",
        steps: [
          "Sáu thẻ ở mục Thống kê nhanh cho biết: tổng sinh viên, đang có mặt, đã ra ngoài, sinh viên nợ phí, sinh viên bị cấm và người lạ xuất hiện.",
          "Chọn Từ ngày và Đến ngày ở góc trên bên phải để đổi dữ liệu của các biểu đồ. Dòng nhỏ bên dưới cho biết đã tải bao nhiêu lượt ra vào trong khoảng đó.",
          "Biểu đồ lượt vào và ra chia theo giờ nếu chọn một ngày, theo ngày nếu chọn đến 31 ngày, theo tháng nếu chọn dài hơn.",
          "Các biểu đồ còn lại cho biết lượt vào ra theo từng khu, số sinh viên mỗi khu, số người lạ theo ngày và 10 sinh viên ra vào nhiều nhất.",
          "Bảng ở cuối trang liệt kê các lượt ra vào mới nhất kèm khu và phòng.",
        ],
        notes: [
          "Số đang có mặt và đã ra ngoài tính theo lần quét cuối của mỗi sinh viên trong khoảng ngày đang chọn.",
          "Lịch sử ra vào chỉ lấy tối đa 31 ngày cuối của khoảng đã chọn. Chọn khoảng dài thì trang tải lâu hơn.",
        ],
      },
    ],
  },
  {
    id: "giam-sat",
    title: "Lịch sử và giám sát",
    icon: "monitor",
    summary: "Xem lịch sử ra vào, người lạ và hình ảnh từ camera.",
    items: [
      {
        id: "lich-su",
        title: "Lịch sử ra vào",
        icon: "history",
        path: "/history",
        menu: "Lịch sử/Cảnh báo > Lịch sử ra vào",
        image: "/tutorial/lich-su.png",
        tagline: "Tra cứu từng lượt vào, ra trong một ngày.",
        marks: [
          { x: 470, y: 282, label: "Chọn ngày, khu" },
          { x: 410, y: 335, label: "Tìm kiếm" },
          { x: 725, y: 335, label: "Xuất Excel / PDF" },
          { x: 1100, y: 498, label: "Bấm dòng xem chi tiết" },
        ],
        summary: "Tra cứu từng lượt vào, ra của sinh viên và cán bộ trong một ngày.",
        steps: [
          "Chọn Ngày cần xem. Mỗi lần chỉ xem được một ngày.",
          "Chọn Khu KTX hoặc Loại đối tượng nếu muốn lọc. Nhập họ tên hoặc MSSV để tìm một người.",
          "Bấm Tìm kiếm. Bấm Làm mới để về bộ lọc mặc định.",
          "Bảng có các cột: thời gian, họ tên, hình ảnh lúc quét, thiết bị (cổng), nhóm và khu KTX. Bấm vào một dòng để xem chi tiết.",
          "Bấm Xuất Excel hoặc Xuất PDF để lưu toàn bộ kết quả theo bộ lọc đang dùng.",
        ],
        notes: [
          "Kết quả xếp theo thời gian, mới nhất ở trên.",
          "Xuất file với ngày có nhiều lượt quét có thể mất vài giây.",
        ],
      },
      {
        id: "nguoi-la",
        title: "Cảnh báo người lạ",
        icon: "stranger",
        path: "/warnings",
        menu: "Lịch sử/Cảnh báo > Cảnh báo người lạ",
        image: "/tutorial/nguoi-la.png",
        tagline: "Những khuôn mặt camera chưa nhận ra.",
        marks: [
          { x: 600, y: 290, label: "Chọn ngày" },
          { x: 418, y: 424, label: "Tìm kiếm" },
          { x: 1185, y: 584, label: "Người giống nhất" },
        ],
        summary:
          "Danh sách các khuôn mặt camera chưa nhận ra là ai, theo ngày và theo camera.",
        steps: [
          "Chọn Ngày và Camera. Có thể gõ một phần ID hoặc tên vào ô ID / Tên.",
          "Chọn Ẩn khuôn mặt đã thêm vào ảnh đăng ký nếu chỉ muốn xem những khuôn mặt chưa xử lý.",
          "Bấm Tìm kiếm. Mỗi dòng có giờ phát hiện, ảnh, camera, khu KTX và cột Dự đoán.",
          "Cột Dự đoán gợi ý người giống nhất, kèm mã số và phần trăm giống. Bấm vào một dòng để xem ảnh lớn.",
          "Xuất Excel hoặc PDF để lưu danh sách.",
        ],
        notes: [
          "Dữ liệu lấy từ hệ thống camera, mỗi lần tải tối đa 500 bản ghi. Xuất file nhiều ngày sẽ tải nhiều lần nên chậm hơn.",
        ],
      },
      {
        id: "camera",
        title: "Giám sát camera",
        icon: "camera",
        path: "/camera",
        menu: "Lịch sử/Cảnh báo > Giám sát Camera",
        image: "/tutorial/camera.png",
        tagline: "Xem camera trực tiếp và nhận diện tại chỗ.",
        marks: [
          { x: 345, y: 249, label: "Chọn 1, 4 hoặc 9 màn hình" },
          { x: 720, y: 204, label: "Nhật ký nhận diện" },
          { x: 1260, y: 300, label: "Danh sách camera" },
        ],
        summary: "Xem hình trực tiếp từ camera và các lượt nhận diện đang diễn ra.",
        steps: [
          "Dòng đầu cho biết số camera đang hoạt động (ví dụ 0/19). Chọn số khung hình mỗi giây (fps) và chất lượng hình. Chọn chất lượng thấp hơn nếu mạng chậm.",
          "Ba nút vuông ở dưới là cách xem: một camera, lưới 4 hoặc lưới 9 camera. Bấm vào một ô trong lưới để xem riêng camera đó.",
          "Gõ tên camera vào ô tìm rồi bấm Tìm, hoặc mở Danh sách Camera để chọn. Bấm Chụp ảnh ở góc video để lưu một khung hình.",
          "Bật công tắc Khung nhận diện để vẽ khung quanh mặt trên video. Xanh là bình thường, vàng là người lạ hoặc nợ phí, đỏ là bị cấm hoặc nghi giả mạo.",
          "Bật công tắc Popup cảnh báo để hiện thông báo ở góc màn hình khi có người lạ, sinh viên bị cấm, nợ phí hoặc nghi giả mạo.",
          "Bấm Nhật ký nhận diện để xem các lượt nhận diện ở bốn tab: Trực tiếp, Nhận diện, Người lạ và Theo người.",
        ],
        notes: [
          "Camera đang tắt hoặc mất kết nối sẽ hiện thông báo trong khung hình. Bấm Thử lại để tải lại.",
          "Lựa chọn bật hoặc tắt thông báo được nhớ lại trên trình duyệt đang dùng.",
        ],
      },
      {
        id: "lay-mau",
        title: "Lấy mẫu khuôn mặt",
        icon: "sample",
        path: "/camera",
        menu: "Lịch sử/Cảnh báo > Giám sát Camera",
        image: "/tutorial/lay-mau.png",
        tagline: "Thêm khuôn mặt mới để camera nhận ra.",
        marks: [
          { x: 620, y: 306, label: "Người mới" },
          { x: 620, y: 376, label: "Mã số, họ tên" },
          { x: 720, y: 584, label: "Chọn ảnh" },
          { x: 884, y: 638, label: "Lấy mẫu" },
        ],
        summary:
          "Thêm hoặc xóa ảnh mẫu để camera nhận ra đúng người. Các thao tác này nằm trong Nhật ký nhận diện của trang Giám sát camera.",
        steps: [
          "Bấm Nhật ký nhận diện, rồi bấm nút Lấy mẫu ở đầu cột bên phải. Cửa sổ Lấy mẫu khuôn mặt hiện ra.",
          "Với người mới, giữ tab Người mới. Nhập Mã số (MSSV hoặc mã cán bộ) và Họ tên, chọn Nhóm và Khu vực.",
          "Chọn Ảnh (tối đa 20) rồi bấm Chọn ảnh, hoặc chọn Video. Bấm Lấy mẫu để lưu.",
          "Để thêm ảnh cho người đã có mẫu, chọn tab Thêm ảnh cho người đã có và nhập mã của người đó.",
          "Với khuôn mặt lạ trong tab Người lạ, bấm Cập nhật mẫu, nhập mã số của người đó và kiểm tra độ giống trước khi lưu.",
          "Để xóa, bấm Xóa dữ liệu, nhập mã số rồi tra cứu. Có thể xóa từng ảnh hoặc xóa toàn bộ người đó.",
        ],
        notes: [
          "Xóa mẫu không hoàn tác được. Hệ thống luôn hỏi xác nhận trước khi xóa.",
          "Mã số phải đúng mã của sinh viên hoặc cán bộ để kết quả nhận diện gắn đúng người.",
        ],
      },
    ],
  },
  {
    id: "danh-muc",
    title: "Danh mục",
    icon: "category",
    summary: "Dữ liệu nền: sinh viên, phòng, khu và danh sách bị cấm.",
    items: [
      {
        id: "dm-sinh-vien",
        title: "Sinh viên ký túc xá",
        icon: "student",
        path: "/danh-muc/sinh-vien-ktx",
        menu: "Danh mục > Sinh viên ký túc xá",
        image: "/tutorial/dm-sinh-vien.png",
        tagline: "Sinh viên đang ở ký túc xá, theo khu và phòng.",
        marks: [
          { x: 450, y: 251, label: "Lọc khu, phòng" },
          { x: 400, y: 303, label: "Tìm kiếm" },
          { x: 682, y: 303, label: "Đồng bộ từ UIIS" },
        ],
        summary: "Danh sách sinh viên đang ở ký túc xá, theo khu và phòng.",
        steps: [
          "Chọn Khu và Phòng, hoặc nhập mã sinh viên, họ tên rồi bấm Tìm kiếm.",
          "Bấm Làm mới để xóa bộ lọc.",
          "Để cập nhật dữ liệu từ trường, bấm Đồng bộ từ UIIS, chọn khu rồi xem trước kết quả.",
          "Mỗi dòng xem trước có nhãn Mới, Thay đổi hoặc Giống. Kiểm tra xong thì bấm Xác nhận đồng bộ.",
        ],
        notes: [
          "Chỉ xem trước thì dữ liệu chưa thay đổi. Dữ liệu chỉ ghi vào hệ thống sau khi bấm Xác nhận đồng bộ.",
          "Danh sách lớn được tải theo từng trang nên bước xem trước có thể lâu hơn bình thường.",
        ],
      },
      {
        id: "dm-no-phi",
        title: "Sinh viên vi phạm (nợ phí)",
        icon: "debt",
        path: "/danh-muc/sinh-vien-no-phi",
        menu: "Danh mục > Sinh viên vi phạm",
        image: "/tutorial/dm-no-phi.png",
        tagline: "Sinh viên vi phạm hoặc nợ phí, lấy từ UIIS.",
        marks: [
          { x: 626, y: 251, label: "Chọn khu" },
          { x: 986, y: 251, label: "Tìm kiếm" },
          { x: 1293, y: 251, label: "Đồng bộ từ UIIS" },
        ],
        summary:
          "Danh sách sinh viên đang nợ phí. Camera dùng danh sách này để cảnh báo khi sinh viên đó ra vào.",
        steps: [
          "Chọn Khu ký túc xá rồi bấm Tìm kiếm. Bảng có các cột lớp, khu, phòng, loại sự kiện, mô tả và số tiền nợ.",
          "Bấm Đồng bộ từ UIIS để lấy danh sách mới nhất từ hệ thống trường.",
          "Xem lại các dòng Mới, Thay đổi, Giống rồi bấm Xác nhận đồng bộ.",
        ],
        notes: ["Sinh viên nợ phí được tính vào thẻ Sinh viên nợ phí ở màn hình Tổng quan."],
      },
      {
        id: "dm-phong",
        title: "Phòng ký túc xá",
        icon: "room",
        path: "/danh-muc/phong-ktx",
        menu: "Danh mục > Phòng ký túc xá",
        image: "/tutorial/dm-phong.png",
        tagline: "Danh sách phòng theo khu, kèm số chỗ.",
        marks: [
          { x: 475, y: 251, label: "Chọn khu, phòng" },
          { x: 986, y: 251, label: "Tìm kiếm" },
          { x: 1293, y: 251, label: "Đồng bộ từ UIIS" },
        ],
        summary: "Danh sách phòng, sức chứa và số chỗ đang có người ở.",
        steps: [
          "Chọn Khu và Phòng rồi bấm Tìm kiếm.",
          "Bấm vào một phòng để xem danh sách sinh viên đang ở phòng đó.",
          "Bấm Đồng bộ từ UIIS để cập nhật phòng từ hệ thống trường, kiểm tra kết quả xem trước rồi bấm Xác nhận đồng bộ.",
        ],
      },
      {
        id: "dm-khu",
        title: "Khu ký túc xá",
        icon: "area",
        path: "/danh-muc/khu-ktx",
        menu: "Danh mục > Khu ký túc xá",
        image: "/tutorial/dm-khu.png",
        tagline: "Các khu và số phòng của từng khu.",
        marks: [
          { x: 634, y: 251, label: "Nhập mã khu" },
          { x: 1016, y: 251, label: "Tìm kiếm" },
          { x: 1308, y: 251, label: "Đồng bộ từ UIIS" },
        ],
        summary: "Danh sách các khu và số phòng của mỗi khu.",
        steps: [
          "Chọn hoặc nhập Mã khu rồi bấm Tìm kiếm. Bảng cho biết mã khu, tên khu, số lượng phòng và mô tả.",
          "Bấm Đồng bộ từ UIIS để cập nhật danh sách khu từ hệ thống trường, kiểm tra kết quả xem trước rồi bấm Xác nhận đồng bộ.",
        ],
        notes: ["Nên đồng bộ Khu trước, sau đó Phòng, rồi mới đến Sinh viên."],
      },
      {
        id: "dm-bi-cam",
        title: "Sinh viên bị cấm",
        icon: "banned",
        path: "/danh-muc/sinh-vien-bi-cam",
        menu: "Danh mục > Sinh viên bị cấm",
        image: "/tutorial/dm-bi-cam.png",
        tagline: "Sinh viên bị cấm ra vào ký túc xá.",
        marks: [
          { x: 628, y: 251, label: "Mã sinh viên" },
          { x: 1294, y: 251, label: "Thêm sinh viên" },
          { x: 1347, y: 401, label: "Sửa" },
        ],
        summary: "Danh sách sinh viên bị cấm ra vào, kèm lý do và thời hạn.",
        steps: [
          "Nhập mã sinh viên rồi bấm Tìm kiếm để lọc danh sách.",
          "Bấm Thêm sinh viên. Gõ mã sinh viên và chọn đúng người trong danh sách gợi ý.",
          "Nhập lý do, chọn ngày bắt đầu. Ngày kết thúc có thể để trống nếu chưa có thời hạn.",
          "Bấm lưu. Để sửa, bấm biểu tượng cây bút ở cột Hành động của dòng cần sửa.",
        ],
        notes: [
          "Mã sinh viên, lý do và ngày bắt đầu là bắt buộc.",
          "Camera sẽ cảnh báo màu đỏ khi sinh viên trong danh sách này đi qua.",
        ],
      },
    ],
  },
  {
    id: "thong-ke",
    title: "Thống kê",
    icon: "statistics",
    summary: "Số liệu theo khoảng ngày, có thể xuất ra file.",
    items: [
      {
        id: "tk-ra-vao",
        title: "Thống kê lượt ra vào",
        icon: "inout",
        path: "/thong-ke/luot-ra-vao",
        menu: "Thống kê > Thống kê lượt ra vào",
        image: "/tutorial/tk-ra-vao.png",
        tagline: "Số lượt ra vào theo ngày hoặc tháng.",
        marks: [
          { x: 400, y: 281, label: "Theo ngày hoặc tháng" },
          { x: 830, y: 281, label: "Tìm kiếm" },
          { x: 1176, y: 281, label: "Xuất Excel / PDF" },
        ],
        summary: "Số lượt vào và ra của từng người trong khoảng ngày.",
        steps: [
          "Chọn Loại thời gian (theo ngày hoặc theo tháng), Từ ngày và Đến ngày.",
          "Bấm Tìm kiếm. Biểu đồ Top 10 ra vào nhiều nhất và biểu đồ phân bố theo trạng thái hiện ở đầu trang.",
          "Bảng thống kê bên dưới cho biết mỗi người có bao nhiêu lượt vào, lượt ra và tổng lượt.",
          "Cột trạng thái gồm Hợp lệ, Nghi vấn và Không hợp lệ.",
          "Mở một dòng để xem từng lần quét kèm ảnh và giờ.",
          "Bấm Xuất Excel hoặc Xuất PDF để lưu bảng.",
        ],
        notes: [
          "Chọn theo tháng thì chỉ được chọn tối đa hai tháng liền nhau.",
          "Không hợp lệ là sinh viên đang nằm trong danh sách bị cấm. Nghi vấn là sinh viên nợ phí.",
        ],
      },
      {
        id: "tk-co-mat",
        title: "Sinh viên đang có mặt",
        icon: "present",
        path: "/thong-ke/dang-co-mat",
        menu: "Thống kê > Sinh viên đang có mặt",
        image: "/tutorial/tk-co-mat.png",
        tagline: "Ai đang ở trong ký túc xá lúc này.",
        marks: [
          { x: 440, y: 282, label: "Chọn số ngày" },
          { x: 495, y: 460, label: "Số đang có mặt" },
          { x: 1240, y: 337, label: "Xuất Excel / PDF" },
        ],
        summary: "Những sinh viên có lần quét gần nhất là lượt vào.",
        steps: [
          "Ở ô Tính từ log vào/ra của, chọn số ngày muốn xét. Mặc định là 3 ngày gần nhất.",
          "Lọc theo Khu KTX hoặc gõ mã, họ tên vào ô Mã hoặc họ tên.",
          "Ba thẻ ở đầu trang cho biết số đang có mặt, tổng số sinh viên KTX và số có mặt theo từng khu.",
          "Mỗi dòng trong bảng cho biết mã sinh viên, họ tên, khu, phòng, giờ vào gần nhất và cổng hoặc camera đã quét.",
          "Xuất Excel hoặc PDF để lưu danh sách.",
        ],
        notes: [
          "Trang tự làm mới mỗi phút khi bạn đang mở tab này. Bấm Làm mới nếu cần cập nhật ngay.",
          "Sinh viên chưa có lần quét nào trong số ngày đã chọn sẽ không có trong danh sách.",
        ],
      },
      {
        id: "tk-vang-mat",
        title: "Sinh viên vắng mặt lâu ngày",
        icon: "absent",
        path: "/thong-ke/vang-mat",
        menu: "Thống kê > Sinh viên vắng mặt lâu ngày",
        image: "/tutorial/tk-vang-mat.png",
        tagline: "Sinh viên vắng mặt nhiều ngày liền.",
        marks: [
          { x: 454, y: 282, label: "Ngày tham chiếu" },
          { x: 690, y: 282, label: "Số ngày tối thiểu" },
          { x: 888, y: 281, label: "Tìm kiếm" },
          { x: 860, y: 520, label: "Biểu đồ theo khu" },
        ],
        summary: "Sinh viên không có lượt quét nào trong nhiều ngày liên tiếp.",
        steps: [
          "Chọn Ngày tham chiếu, là ngày dùng để tính số ngày vắng.",
          "Nhập Số ngày vắng tối thiểu. Mặc định là 5 ngày.",
          "Bấm Tìm kiếm. Biểu đồ ở đầu trang đếm sinh viên theo ba mức: 5 đến 10 ngày, 11 đến 15 ngày và trên 15 ngày.",
          "Bảng bên dưới cho biết khu, phòng, số ngày vắng mặt, lần hoạt động cuối và trạng thái của từng sinh viên.",
          "Xuất Excel hoặc PDF để lưu danh sách.",
        ],
        notes: [
          "Trạng thái theo số ngày vắng: trên 15 ngày là Cảnh báo, trên 7 ngày là Nghi vấn, còn lại là Hợp lệ.",
        ],
      },
      {
        id: "tk-nguoi-la",
        title: "Thống kê người lạ",
        icon: "stranger",
        path: "/thong-ke/nguoi-la",
        menu: "Thống kê > Thống kê người lạ",
        image: "/tutorial/tk-nguoi-la.png",
        tagline: "Người lạ xuất hiện theo ngày và khu.",
        marks: [
          { x: 500, y: 281, label: "Từ ngày, đến ngày" },
          { x: 752, y: 281, label: "Chọn khu" },
          { x: 903, y: 281, label: "Tìm kiếm" },
          { x: 850, y: 560, label: "Biểu đồ theo ngày" },
        ],
        summary: "Số lần phát hiện người lạ theo ngày và theo khu.",
        steps: [
          "Chọn Từ ngày, Đến ngày và Khu rồi bấm Tìm kiếm.",
          "Biểu đồ Tần suất phát hiện người lạ cho biết số người lạ mỗi ngày.",
          "Cuộn xuống để xem bảng lịch sử, liệt kê từng lần phát hiện kèm ảnh.",
          "Mục Chi tiết người lạ trong ngày cho biết các lần phát hiện của từng ngày.",
        ],
        notes: ["Khoảng ngày bắt đầu không được lớn hơn ngày kết thúc."],
      },
      {
        id: "tk-bi-cam",
        title: "Thống kê sinh viên bị cấm",
        icon: "banned",
        path: "/thong-ke/bi-cam",
        menu: "Thống kê > Sinh viên bị cấm",
        image: "/tutorial/tk-bi-cam.png",
        tagline: "Lượt camera thấy sinh viên bị cấm hoặc nợ phí.",
        marks: [
          { x: 505, y: 285, label: "Từ ngày, đến ngày" },
          { x: 760, y: 285, label: "Họ tên hoặc MSSV" },
          { x: 911, y: 285, label: "Tìm kiếm" },
        ],
        summary:
          "Số lần camera phát hiện sinh viên bị cấm hoặc nợ phí trong khoảng ngày.",
        steps: [
          "Chọn Từ ngày, Đến ngày, có thể nhập Họ tên hoặc MSSV rồi bấm Tìm kiếm.",
          "Biểu đồ Thống kê lượt phát hiện cho biết số lần camera phát hiện sinh viên bị cấm và sinh viên nợ phí.",
          "Mở một sinh viên để xem chi tiết ở ba tab: bị cấm, nợ phí và các lần phát hiện.",
          "Từ trang này có thể thêm sinh viên bị cấm hoặc sửa thông tin cấm.",
        ],
      },
    ],
  },
  {
    id: "quan-tri",
    title: "Quản trị",
    icon: "admin",
    summary: "Dành cho người quản trị hệ thống.",
    items: [
      {
        id: "qt-he-thong",
        title: "Quản lý hệ thống",
        icon: "settings",
        path: "/settings",
        menu: "Quản lý hệ thống > Quản lý hệ thống",
        image: "/tutorial/qt-he-thong.png",
        tagline: "Tên, logo và thông tin liên hệ hiển thị.",
        marks: [
          { x: 580, y: 293, label: "Sửa thông tin" },
          { x: 507, y: 653, label: "Chọn logo" },
          { x: 762, y: 765, label: "Lưu thay đổi" },
        ],
        summary: "Đổi tên, màu, thông tin liên hệ và logo hiển thị của hệ thống.",
        steps: [
          "Ở khung Thông tin hiển thị, sửa Tên, Màu chủ đạo, Email, Số điện thoại, Địa chỉ và Mô tả.",
          "Bấm Chọn logo để đổi logo công ty. Nên dùng ảnh PNG nền trong suốt, dưới 1,5 MB.",
          "Khung Xem trước bên phải cho thấy kết quả ngay khi bạn sửa.",
          "Bấm Lưu thay đổi. Dòng báo đã lưu hiện ở đầu trang.",
        ],
      },
      {
        id: "qt-nguoi-dung",
        title: "Quản lý người dùng",
        icon: "users",
        path: "/manage-users",
        menu: "Quản lý hệ thống > Quản lý người dùng",
        image: "/tutorial/qt-nguoi-dung.png",
        tagline: "Tài khoản người dùng và vai trò của họ.",
        marks: [
          { x: 568, y: 245, label: "Tìm người dùng" },
          { x: 1304, y: 345, label: "Thêm người dùng" },
          { x: 1308, y: 500, label: "Sửa, gán vai, xóa" },
        ],
        summary: "Danh sách tài khoản, vai trò và đơn vị của từng người.",
        steps: [
          "Gõ tên, email hoặc đơn vị vào ô tìm. Lọc thêm theo Vai trò và Trạng thái, rồi bấm Tìm. Bấm Đặt lại để xóa bộ lọc.",
          "Bấm Thêm người dùng để tạo tài khoản mới.",
          "Cột Hành động ở mỗi dòng có ba nút: cây bút màu xanh là Cập nhật, biểu tượng người màu cam là Xóa khỏi đơn vị, thùng rác màu đỏ là Xóa tài khoản.",
          "Xóa khỏi đơn vị chỉ gỡ tài khoản khỏi đơn vị, tài khoản vẫn còn. Xóa tài khoản là xóa hẳn. Hệ thống hỏi xác nhận trước khi xóa.",
        ],
      },
      {
        id: "qt-vai-tro",
        title: "Quản lý vai trò",
        icon: "roles",
        path: "/manage-roles",
        menu: "Quản lý hệ thống > Quản lý vai trò",
        image: "/tutorial/qt-vai-tro.png",
        tagline: "Các vai trò và quyền của từng vai trò.",
        marks: [
          { x: 802, y: 245, label: "Tìm vai trò" },
          { x: 1322, y: 322, label: "Thêm vai trò" },
          { x: 1310, y: 462, label: "Gán, sửa, xóa" },
        ],
        summary: "Tạo vai trò và quy định vai trò đó được vào những chức năng nào.",
        steps: [
          "Gõ tên vào ô tìm rồi bấm Tìm. Bấm Thêm vai trò để tạo vai trò mới.",
          "Cột Hành động ở mỗi dòng có ba nút: biểu tượng người màu xanh lá là Quản lý chức năng, phân quyền; cây bút màu xanh là Cập nhật; thùng rác màu đỏ là Xóa.",
          "Bấm nút Quản lý chức năng, phân quyền để chọn các chức năng của vai trò.",
          "Với mỗi chức năng, chọn các quyền được cho phép. Quyền xem quyết định chức năng có hiện trong menu hay không.",
        ],
        notes: [
          "Người dùng không có quyền xem một chức năng sẽ không thấy mục đó trong menu và bị chuyển về trang báo không có quyền khi vào thẳng đường dẫn.",
        ],
      },
    ],
  },
];

export interface TutorialStack {
  id: string;
  name: string;
  /** Công nghệ và ngôn ngữ, hiện dạng nhãn nhỏ. */
  tech: string[];
  /** Phần này dùng để làm gì. */
  purpose: string;
}

export const TUTORIAL_TECH = {
  title: "Công nghệ và cách kết nối",
  lead:
    "Hệ thống gồm bốn phần chạy riêng, nối với nhau qua mạng nội bộ. Người dùng chỉ làm việc trên giao diện web, các phần còn lại chạy phía sau.",
  stacks: [
    {
      id: "fe",
      name: "Giao diện web",
      tech: ["Next.js", "React", "TypeScript", "Mantine"],
      purpose:
        "Hiển thị Tổng quan, Lịch sử, Camera, Thống kê và Danh mục cho người quản lý. Máy chủ Next.js giữ phiên đăng nhập và chuyển yêu cầu tới Java và Python, trình duyệt không gọi thẳng vào các máy chủ đó.",
    },
    {
      id: "be",
      name: "Máy chủ nghiệp vụ",
      tech: ["Java", "API Gateway", "Nhiều service"],
      purpose:
        "Quản lý tài khoản, vai trò, phân quyền, danh mục sinh viên, phòng, khu, danh sách bị cấm và nợ phí. Trả số liệu thống kê, lịch sử ra vào và đồng bộ danh mục từ UIIS.",
    },
    {
      id: "ai",
      name: "Nhận diện khuôn mặt (AI)",
      tech: ["Python", "FastAPI"],
      purpose:
        "Nhận hình từ camera, nhận diện sinh viên và cán bộ, phát hiện người lạ và nghi giả mạo, kiểm tra bị cấm hoặc nợ phí. Cũng là nơi lưu mẫu khuôn mặt khi lấy mẫu mới.",
    },
    {
      id: "data",
      name: "Dữ liệu",
      tech: ["Cơ sở dữ liệu", "Kho ảnh"],
      purpose:
        "Lưu danh mục, lịch sử ra vào, danh sách bị cấm và nợ phí, tài khoản, phân quyền và ảnh chụp lúc quét. Dữ liệu sinh viên, phòng, khu được đồng bộ từ UIIS.",
    },
  ] as TutorialStack[],
};
