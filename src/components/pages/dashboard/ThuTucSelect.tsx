import { Select } from "@mantine/core";
import { IconChevronDown } from "@tabler/icons-react";

export function ThuTucSelect({ value, onChange }: any) {
  return (
    <>
      <Select
        classNames={{
          input: "thu-tuc-input",
        }}
        value={value}
        onChange={onChange}
        placeholder="Chọn thủ tục"
        data={[
          { value: "dang_kiem", label: "Đăng kiểm" },
          { value: "cap_dang_ky", label: "Cấp đăng ký mới" },
          { value: "kia_han", label: "Gia hạn đăng kiểm" },
          { value: "kiem_tra", label: "Kiểm tra thông số kỹ thuật" },
        ]}
        radius="lg"
        rightSection={<IconChevronDown size={18} stroke={1.5} />}
        rightSectionWidth={30}
        styles={{
          root: {
            flex: 1,
            height: "85px",
          },

          wrapper: {
            height: "100%",
          },

          input: {
            height: "100%",
            display: "flex",
            alignItems: "center",
            background: "#f2f3f7",
            border: "1px solid #ececec",
            boxShadow: "4px 4px 10px #d1d5e0, -4px -4px 10px #ffffff",
            paddingLeft: 16,
            paddingRight: 40,
            fontWeight: 600,
            fontSize: 15,
          },

          dropdown: {
            borderRadius: 16,
            padding: 6,
            background: "#ffffffee",
            backdropFilter: "blur(6px)",
            boxShadow:
              "0px 6px 18px rgba(0,0,0,0.1), inset 0px -2px 4px rgba(255,255,255,0.3)",
          },
        }}
      />

      <style>
        {`
            /*  Placeholder đậm y như text trong thẻ ngày */
            .thu-tuc-input::placeholder {
                font-weight: 600 !important;
                font-size: 16px !important;
                color: #5e5f61ff !important;
                opacity: 1 !important;
            }

            /*  Mantine còn dùng data-placeholder để xác định trạng thái */
            .thu-tuc-input[data-placeholder] {
                font-weight: 600 !important;
                font-size: 16px !important;
                color: #5e5f61ff; !important;
                opacity: 1 !important;
            }
            `}
      </style>
    </>
  );
}
