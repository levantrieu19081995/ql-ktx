import API_URLS from '@/constants/apiUrls';
import {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  // Khi dev qua IP LAN (172.16.1.229) cần whitelisting HMR/WS:
  allowedDevOrigins: [
    "http://localhost:3000",
    "http://172.16.1.229:3000" // chỉnh theo IP máy bạn dùng
  ],
  // env: {
  //   // //server
  //   // API_BASE_URL: '',
  //   // NEXT_PUBLIC_API_BASE_URL: ' ',


  //   // //Local
  //   // API_BASE_URL: 'http://172.16.1.123:2001',
  //   // NEXT_PUBLIC_API_BASE_URL: 'http://172.16.1.123:2001',

  //   API_BASE_URL: 'http://172.16.1.123:8787',
  //   NEXT_PUBLIC_API_BASE_URL: 'http://172.16.1.123:8787',

  // },
  
  // Cấu hình tạm
  env: {
    API_BASE_URL: process.env.API_BASE_URL,
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,

    NEXT_PUBLIC_API_MODE: process.env.NEXT_PUBLIC_API_MODE,
    NEXT_PUBLIC_GATEWAY_URL: process.env.NEXT_PUBLIC_GATEWAY_URL,
    NEXT_PUBLIC_USER_SERVICE_URL: process.env.NEXT_PUBLIC_USER_SERVICE_URL,
    NEXT_PUBLIC_KTX_SERVICE_URL: process.env.NEXT_PUBLIC_KTX_SERVICE_URL,
    NEXT_PUBLIC_FACE_DETECT_SERVICE_URL: process.env.NEXT_PUBLIC_FACE_DETECT_SERVICE_URL,
  },


  // Bật tính năng middleware cho tất cả các route
  // middleware: true,
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);