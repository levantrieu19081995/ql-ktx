"use client";

import React from "react";
import { Stepper, Card } from "@mantine/core";
import { IconUser, IconFilePlus, IconCheck } from "@tabler/icons-react";
import { showNoti } from "@/components/common/showNoti";
import { validateAndGoStep } from "@/utils/acceptanceFlow";

interface AcceptanceStepperProps {
  active: number;
  handleNext: (index: number) => void;
  isStepDisabled: (index: number) => boolean;
  isThuPhiDaThanhToan: () => boolean;
  result: any;

  //  chỉ truyền component
  stepComponents: React.ComponentType<any>[];

  // props chung cho step
  stepProps: Record<string, any>;
}

const DEFAULT_STEPS_META = [
  {
    label: "Bước 1",
    description: "Tiếp nhận thông tin hồ sơ",
    icon: <IconUser size={18} />,
  },
  {
    label: "Bước 2",
    description: "Thu phí",
    icon: <IconFilePlus size={18} />,
  },
  {
    label: "Bước 3",
    description: "Hoàn tất",
    icon: <IconCheck size={18} />,
  },
];

export default function AcceptanceStepper({
  active,
  handleNext,
  isStepDisabled,
  isThuPhiDaThanhToan,
  result,
  stepComponents,
  stepProps,
}: AcceptanceStepperProps) {
  //   const handleStepClick = (index: number) => {
  //     if (index === stepComponents.length - 1) {
  //       const list = result?.listHoSoPhiDichVu || [];

  //       if (!list.length) {
  //         showNoti("warning", "Vui lòng chọn dịch vụ thu phí!");
  //         return;
  //       }

  //       const isAllNo = list.every((item: any) => item.trangThaiNo === true);
  //       if (!isAllNo && !isThuPhiDaThanhToan()) {
  //         showNoti("warning", "Vẫn còn phí chưa thanh toán!");
  //         return;
  //       }
  //     }
  //     handleNext(index);
  //   };

  const handleStepClick = (index: number) => {
    const ok = validateAndGoStep({
      fromStep: active,
      toStep: index,
      result,
      isThuPhiDaThanhToan,
      showNoti,
    });

    if (!ok) return;
    handleNext(index);
  };

  const stepStyles = (idx: number) => ({
    stepIcon: {
      backgroundColor:
        active === idx ? "#2563eb" : active > idx ? "#f3f4f6" : "white",
      border: `2px solid ${
        active === idx ? "#2563eb" : active > idx ? "#93c5fd" : "#d1d5db"
      }`,
      color: active === idx ? "white" : active > idx ? "#2563eb" : "#f3f4f6",
      transition: "all 0.3s ease",
    },
    stepCompletedIcon: { color: "#2563eb" },
  });

  return (
    <Card withBorder radius="lg" p="lg">
      <Stepper
        active={active}
        onStepClick={handleStepClick}
        styles={{ separator: { backgroundColor: "#d1d5db" } }}
      >
        {stepComponents.map((StepComp, idx) => {
          const meta = DEFAULT_STEPS_META[idx];
          return (
            <Stepper.Step
              key={idx}
              allowStepSelect={!isStepDisabled(idx)}
              icon={meta.icon}
              label={
                <span
                  style={{
                    color: active === idx ? "#2563eb" : "#374151",
                    fontWeight: active === idx ? "bold" : 400,
                    fontSize: active === idx ? 17 : 14,
                  }}
                >
                  {meta.label}
                </span>
              }
              description={
                <span
                  style={{
                    color: active === idx ? "#3b82f6" : "#6b7280",
                  }}
                >
                  {meta.description}
                </span>
              }
              styles={stepStyles(idx)}
            >
              <StepComp
                {...stepProps}
                onNext={() => handleNext(idx + 1)}
                onBack={() => handleNext(idx - 1)}
                isStepDisabled={isStepDisabled(idx)}
              />
            </Stepper.Step>
          );
        })}
      </Stepper>
    </Card>
  );
}
