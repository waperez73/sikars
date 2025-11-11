import QRCode from "qrcode";

export async function createQRCode(text) {
  return await QRCode.toBuffer(text, { width: 256 });
}
