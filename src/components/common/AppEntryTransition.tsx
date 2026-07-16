"use client";

import { useEffect, useState, type ReactNode } from "react";

import {
  PAGE_TRANSITION_DURATION_MS,
  PAGE_TRANSITION_LOGIN_TO_APP,
  PAGE_TRANSITION_STORAGE_KEY,
} from "@/constants/pageTransition";
import PageTransitionOverlay from "@/components/common/PageTransitionOverlay";

export default function AppEntryTransition({
  children,
}: {
  children: ReactNode;
}) {
  const [visible, setVisible] = useState(false);
  const [isEntering, setIsEntering] = useState(false);

  useEffect(() => {
    const transitionType = sessionStorage.getItem(PAGE_TRANSITION_STORAGE_KEY);
    if (transitionType !== PAGE_TRANSITION_LOGIN_TO_APP) return;

    sessionStorage.removeItem(PAGE_TRANSITION_STORAGE_KEY);
    setVisible(true);
    setIsEntering(true);

    const timer = window.setTimeout(() => {
      setVisible(false);
      setIsEntering(false);
    }, PAGE_TRANSITION_DURATION_MS);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <>
      {visible ? <PageTransitionOverlay mode="enter" /> : null}

      <div className={`app-entry-transition${isEntering ? " is-entering" : ""}`}>
        {children}
      </div>

      <style jsx>{`
        .app-entry-transition {
          min-height: 100dvh;
        }

        .app-entry-transition.is-entering {
          animation: appEntryReveal 440ms cubic-bezier(0.16, 1, 0.3, 1) 40ms forwards;
          transform-origin: center top;
          will-change: transform, opacity, filter;
        }

        @keyframes appEntryReveal {
          from {
            opacity: 0.14;
            transform: translateX(104px) scale(0.988);
            filter: blur(3px) saturate(0.92);
          }

          to {
            opacity: 1;
            transform: translateX(0) scale(1);
            filter: blur(0) saturate(1);
          }
        }
      `}</style>
    </>
  );
}
