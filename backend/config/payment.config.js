for (const key of ["BANK_ID", "BANK_ACCOUNT", "BANK_OWNER"]) {
  if (!process.env[key]) {
    throw new Error(`Missing required env: ${key}`);
  }
}
export const BANK_CONFIG = {
  bankId: process.env.BANK_ID,
  accountNumber: process.env.BANK_ACCOUNT,
  accountName: process.env.BANK_OWNER,
  displayName: process.env.BANK_DISPLAY || process.env.BANK_ID,
  branch: process.env.BANK_BRANCH || "",
};
// Template QR VietQR — không cần API key, không cần đăng ký
// Docs: https://www.vietqr.io/danh-sach-api/tao-ma-qr-tinh
export function buildVietQRUrl({ amount, orderCode, template = "compact2" }) {
  const { bankId, accountNumber, accountName } = BANK_CONFIG;
  const info = encodeURIComponent(`Thanh toan ${orderCode}`);
  const name = encodeURIComponent(accountName);
  return `https://img.vietqr.io/image/${bankId}-${accountNumber}-${template}.png?amount=${amount}&addInfo=${info}&accountName=${name}`;
}
