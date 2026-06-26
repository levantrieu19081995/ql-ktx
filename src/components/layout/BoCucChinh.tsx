'use client';

import React from 'react';
import DauTrang from './DauTrang';
import ChanTrang from './ChanTrang';

// Định nghĩa thuộc tính cho Bố cục chính
interface ThuocTinhBoCucChinh {
  // Nội dung con hiển thị bên trong phần thân bố cục
  children: React.ReactNode;
}

/**
 * Component Bố cục chính (MainLayout) của toàn bộ các trang nội bộ.
 * Chức năng: Tích hợp DauTrang và ChanTrang tạo nên bố cục cơ bản của hệ thống.
 */
export const BoCucChinh: React.FC<ThuocTinhBoCucChinh> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col font-sans overflow-hidden">
      <DauTrang />
      <div className="flex-1 flex flex-row overflow-hidden">
        <div className="flex flex-col flex-1 bg-[#F5F7FA] overflow-y-auto">
          <main className="p-6 flex-1">
            {children}
          </main>
        </div>
      </div>
      <ChanTrang />
    </div>
  );
};

export default BoCucChinh;

