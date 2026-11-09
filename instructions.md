# Yêu cầu Hệ thống (PRD) - Web Quản lý Quỹ Cầu Lông (Phase 1)

## 1. Bối cảnh Dự án
* **Mục tiêu:** Xây dựng một trang web tĩnh dạng sổ quỹ điện tử cho nhóm cầu lông (7 người) để theo dõi thu/chi, số dư quỹ và trạng thái đóng tiền.
* **Tech Stack:** React (khởi tạo qua Vite), Tailwind CSS (để dựng UI nhanh), Firebase (Cloud Firestore & Storage), triển khai miễn phí trên GitHub Pages.
* **Nguyên tắc thiết kế:** Giao diện mobile-first, tối giản, hiển thị các chỉ số trực quan dưới dạng Dashboard. Không cần login phức tạp ở Phase 1, dùng 1 nút "Chế độ Admin" (toggle state tạm thời) để mở khóa tính năng nhập liệu.

## 2. Cấu trúc CSDL (Firebase Firestore)
Dự án sử dụng 2 collections:
1. **`ledger_summary`** (Chỉ chứa 1 document duy nhất có ID là `current_month`):
   * `court_fee` (number): Tiền sân.
   * `guest_income` (number): Thu giao lưu.
   * `extra_expense` (number): Phí phát sinh.
   * `remaining_balance` (number): Quỹ còn thừa.
   * `qr_urls` (array of strings): Danh sách link ảnh QR code nhận tiền.
2. **`members`** (Chứa 7 documents tương ứng 7 thành viên):
   * `name` (string): Tên thành viên (cố định).
   * `is_paid` (boolean): Trạng thái đóng tiền (true = Đã đóng, false = Chưa đóng).

## 3. Cấu trúc Giao diện (UI Components)
Sử dụng Tailwind CSS để dựng các component sau:
* **`Header`**: Tiêu đề trang và một nút Toggle "Chế độ Admin" (bật/tắt quyền chỉnh sửa dữ liệu trên UI).
* **`DashboardStats`**: Hiển thị 4 thẻ Card (Tiền sân, Quỹ thừa, Thu giao lưu, Phí phát sinh).
  * *Chế độ xem:* Hiển thị dạng số (format VNĐ).
  * *Chế độ Admin:* Đổi thành ô `<input type="number">` để sửa số liệu trực tiếp và lưu lên Firestore.
* **`PaymentQR`**: Khu vực hiển thị ảnh QR code để thành viên quét chuyển khoản. 
  * *Chế độ Admin:* Nút upload ảnh lên Firebase Storage và cập nhật link vào `ledger_summary`.
* **`MemberList`**: Bảng danh sách 7 thành viên.
  * Cột Tên và Cột Trạng Thái (dùng Badge màu Xanh cho `is_paid: true`, màu Đỏ cho `is_paid: false`).
  * *Chế độ Admin:* Click vào Badge để đổi trạng thái đóng/chưa đóng (update Firestore).

## 4. Các bước thực thi cho AI Agent
1. Khởi tạo project với `npm create vite@latest . -- --template react` và cài đặt `tailwindcss`, `firebase`, `lucide-react` (icon).
2. Tạo file `src/firebase.js`, thiết lập kết nối Firestore và Storage (sử dụng biến môi trường hoặc placeholder cho firebaseConfig).
3. Code layout chính và các UI components (Header, DashboardStats, PaymentQR, MemberList) bằng giao diện giả (mock data) trước để kiểm tra responsive.
4. Tích hợp các hàm đọc/ghi dữ liệu thực từ Firebase vào các components.
5. Cấu hình file `vite.config.js` để chuẩn bị build ra thư mục `dist` deploy lên GitHub Pages.


Chào AI, tôi đã hoàn thiện xong toàn bộ giao diện tĩnh (mock UI) cho trang web Quản lý quỹ cầu lông bằng React và Tailwind CSS. Bây giờ, tôi muốn tích hợp Firebase Firestore vào các Component hiện tại để thay thế dữ liệu giả (mock data) bằng dữ liệu thật.

Dưới đây là các yêu cầu cụ thể để bạn thực hiện:

1. Setup Firebase:
- Hãy kiểm tra hoặc tạo giúp tôi file `src/firebase.js`. Viết sẵn khung khởi tạo Firebase app và export `db` (Firestore). Cứ để trống phần `firebaseConfig` để tôi tự điền key của tôi vào sau.

2. Tích hợp dữ liệu vào Dashboard (Tổng quan quỹ):
- Viết một custom hook hoặc hàm `useEffect` để fetch dữ liệu từ collection `ledger_summary` (document ID: `current_month`).
- Thay thế các con số cứng trên UI (Tiền sân, Quỹ thừa, Thu giao lưu, Phí phát sinh) bằng state đọc từ Firestore.

3. Tích hợp dữ liệu vào MemberList (Trạng thái đóng quỹ):
- Viết logic fetch danh sách từ collection `members`.
- Bind dữ liệu vào danh sách 7 thành viên hiện tại (Tên và trạng thái Đã đóng/Chưa đóng).
- Viết hàm xử lý sự kiện: Khi tôi bật "Chế độ Admin" và click vào nút trạng thái của một thành viên, hãy gọi API update doc đó trên Firestore để đổi giá trị trường `is_paid` (true <-> false), sau đó cập nhật lại state để UI tự động đổi màu.

4. Xử lý trạng thái Loading:
- Thêm hiệu ứng loading đơn giản (spinner hoặc text "Đang tải dữ liệu...") trong lúc chờ gọi API từ Firebase để UI không bị giật.

Hãy phân tích các file Component hiện tại của tôi và đưa ra đoạn code cần chỉnh sửa (hoặc code mới) để thực hiện các luồng logic trên nhé.