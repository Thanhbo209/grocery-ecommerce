// src/config/payment.config.js
// Đọc từ .env — admin cấu hình 1 lần, tất cả đơn hàng dùng chung

export const BANK_CONFIG = {
  // Tên ngân hàng viết tắt theo chuẩn VietQR (xem danh sách tại img.vietqr.io/image)
  bankId: process.env.BANK_ID || "MB", // MB, VCB, TCB, ACB, VPB...
  accountNumber: process.env.BANK_ACCOUNT || "0123456789",
  accountName: process.env.BANK_OWNER || "NGUYEN VAN A",
  // Thông tin hiển thị cho khách
  displayName: process.env.BANK_DISPLAY || "MBBank",
  branch: process.env.BANK_BRANCH || "", // tuỳ chọn
};

// Template QR VietQR — không cần API key, không cần đăng ký
// Docs: https://www.vietqr.io/danh-sach-api/tao-ma-qr-tinh
export function buildVietQRUrl({ amount, orderCode, template = "compact2" }) {
  const { bankId, accountNumber, accountName } = BANK_CONFIG;
  const info = encodeURIComponent(`Thanh toan ${orderCode}`);
  const name = encodeURIComponent(accountName);
  return `https://img.vietqr.io/image/${bankId}-${accountNumber}-${template}.png?amount=${amount}&addInfo=${info}&accountName=${name}`;
}
