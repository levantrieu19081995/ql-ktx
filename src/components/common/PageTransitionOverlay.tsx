"use client";

import { Loader, Text } from "@mantine/core";

type PageTransitionOverlayProps = {
  mode: "enter" | "leave";
  message?: string;
  showLoader?: boolean;
};

export default function PageTransitionOverlay({
  mode,
  message,
  showLoader = false,
}: PageTransitionOverlayProps) {
  return (
    <>
      <div className={`page-transition-overlay page-transition-${mode}`}>
        <div className="page-transition-overlay__content">
          {showLoader ? <Loader color="#1f5ca9" size="sm" /> : null}
          {message ? (
            <Text c="#1f2937" size="sm" fw={600}>
              {message}
            </Text>
          ) : null}
        </div>
      </div>

      <style jsx>{`
        .page-transition-overlay {
          position: fixed;
          inset: 0;
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          background:
            linear-gradient(90deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1));
          backdrop-filter: blur(2px);
          pointer-events: none;
        }

        .page-transition-leave {
          animation: overlayFadeIn 440ms cubic-bezier(0.32, 0.02, 0.2, 0.98) forwards;
        }

        .page-transition-enter {
          animation: overlayFadeOut 440ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .page-transition-overlay__content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          transform: translateY(6px);
          animation: contentFloat 440ms ease-out forwards;
        }

        @keyframes overlayFadeIn {
          from {
            opacity: 0;
            transform: translateX(26px);
          }

          to {
            opacity: 0.34;
            transform: translateX(0);
          }
        }

        @keyframes overlayFadeOut {
          from {
            opacity: 0.28;
            transform: translateX(0);
          }

          to {
            opacity: 0;
            transform: translateX(-26px);
          }
        }

        @keyframes contentFloat {
          from {
            opacity: 0;
            transform: translateY(6px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
