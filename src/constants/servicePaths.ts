// // src/constants/servicePaths.ts
// export const USER_SERVICE = "/user-service";
// export const QLDK_SERVICE = "/quanlydangkiem-service";
// export const FILE_SERVICE = "/file-service";
// export const GATEWAY_SERVICE = "/gateway-service";
// // sau này thêm service khác chỉ cần thêm ở đây

// Cấu hình gọi host tạm và local
const mode = process.env.NEXT_PUBLIC_API_MODE;
const isDirect = mode === "direct";

const gateway = process.env.NEXT_PUBLIC_GATEWAY_URL || "";
const userUrl = process.env.NEXT_PUBLIC_USER_SERVICE_URL || "";
const ktxUrl = process.env.NEXT_PUBLIC_KTX_SERVICE_URL || "";
const faceUrl = process.env.NEXT_PUBLIC_FACE_DETECT_SERVICE_URL || "";

export const USER_SERVICE = isDirect ? userUrl : `${gateway}/user-service`;
export const KTX_SERVICE = isDirect ? ktxUrl : `${gateway}/ktx-service`;
export const FACE_DETECT_SERVICE = isDirect
  ? faceUrl
  : `${gateway}/face-detect-service`;

export const QLDK_SERVICE = isDirect ? ktxUrl : `${gateway}/quanlydangkiem-service`;
export const FILE_SERVICE = isDirect ? ktxUrl : `${gateway}/file-service`;
export const GATEWAY_SERVICE = gateway;
