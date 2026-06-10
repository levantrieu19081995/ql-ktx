"use client";

import { Card, Table, Badge, Group, Box } from "@mantine/core";
import BienSoComponent from "./BienSoComponent";
import CustomPagination from "@/components/common/CustomPagination";
import React from "react";

export default function RecentPaymentsCard({
  paginatedData = [],
  page = 1,
  pageSize = 5,
  totalItems = 0,
  totalPages = 1,
  setPage,
  setPageSize,
  fetchChiTietPhiDichVu,
  fetchData,
}: any) {
  const getFeeColor = (value: number) => {
    if (value > 1_000_000) return "grape";
    if (value > 700_000) return "blue";
    if (value > 400_000) return "teal";
    return "gray";
  };

  return (
    <>
      <Card withBorder radius="lg" p="lg">
        <h3 style={{ marginBottom: 12 }}>Danh sách thu phí dịch vụ</h3>

        {/* DESKTOP TABLE */}
        <div className="recent-desktop">
          <Table
            highlightOnHover
            verticalSpacing="sm"
            style={{ borderRadius: 12 }}
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Biển kiểm soát</Table.Th>
                <Table.Th>Phương tiện</Table.Th>
                <Table.Th>Tổng phí dịch vụ</Table.Th>
                <Table.Th style={{ width: 120, textAlign: "center" }}>
                  Thao tác
                </Table.Th>
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {(paginatedData ?? []).map((row: any, idx: any) => (
                <Table.Tr
                  key={idx}
                  onClick={() => fetchChiTietPhiDichVu(row.hsId, row)}
                  style={{
                    cursor: "pointer",
                    transition: "0.2s",
                  }}
                >
                  <Table.Td>
                    <BienSoComponent value={row.bienKiemSoat} />
                  </Table.Td>

                  <Table.Td>{row.lptTen}</Table.Td>

                  <Table.Td>
                    <Badge
                      variant="gradient"
                      gradient={{ from: "#6E7CF6", to: "#8B5CF6", deg: 90 }}
                      color={getFeeColor(row.tongPhiDichVu || 0)}
                      size="lg"
                    >
                      {row.tongPhiDichVu?.toLocaleString() ?? 0} đ
                    </Badge>
                  </Table.Td>

                  <Table.Td align="center">
                    <Badge color="teal" variant="light">
                      Chi tiết
                    </Badge>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </div>

        {/* MOBILE VERSION */}
        <div className="recent-mobile">
          {(paginatedData ?? []).map((row: any, idx: any) => (
            <div
              key={idx}
              className="mobile-card"
              onClick={() => fetchChiTietPhiDichVu(row.hsId, row)}
            >
              <p>
                Biển số: <b>{row.bienKiemSoat}</b>
              </p>
              <p>
                Phương tiện: <b>{row.lptTen}</b>
              </p>
              <p>
                Tổng phí: <b>{row.tongPhiDichVu?.toLocaleString()} đ</b>
              </p>
            </div>
          ))}
        </div>

        <Group justify="right" mt="md">
          <CustomPagination
            totalItems={totalItems}
            totalPages={totalPages}
            page={page}
            pageSize={pageSize}
            setPage={setPage}
            setPageSize={setPageSize}
            fetchData={fetchData}
          />
        </Group>
      </Card>

      <style jsx global>{`
        .recent-mobile {
          display: none;
        }

        @media (max-width: 768px) {
          .recent-desktop {
            display: none;
          }
          .recent-mobile {
            display: block;
          }

          .mobile-card {
            background: #f8f9fa;
            padding: 14px;
            border-radius: 12px;
            margin-bottom: 12px;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
          }

          .mobile-card p {
            margin: 6px 0;
            display: flex;
            justify-content: space-between;
          }

          .mobile-card b {
            margin-left: auto;
            font-weight: 600;
            text-align: right;
          }
        }
      `}</style>
    </>
  );
}
