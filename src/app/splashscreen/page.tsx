"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const introText = "HỆ THỐNG QUẢN LÝ KÝ TÚC XÁ";
const introLetters = Array.from(introText);

const SplashScreenContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 5200;
    const intervalTime = 30;
    const increment = 100 / (duration / intervalTime);

    const interval = window.setInterval(() => {
      setProgress((current) => {
        const next = Math.min(current + increment, 100);

        if (next >= 100) {
          window.clearInterval(interval);
        }

        return next;
      });
    }, intervalTime);

    const nextUrl = searchParams.get("next") || "/vi/login";
    const timer = window.setTimeout(() => {
      router.replace(nextUrl);
    }, duration + 150);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timer);
    };
  }, [router, searchParams]);

  return (
    <main className="splash">
      <Image
        src="/images/bg_slashscreen2.png"
        alt="Splash background"
        fill
        priority
        quality={100}
        sizes="100vw"
        className="background"
      />

      {/* <div className="overlay" /> */}

      <section className="content">
        <div className="logoWrap" aria-hidden="true">
          <Image
            src="/images/logo.png"
            alt="Logo Dai hoc Can Tho"
            width={180}
            height={180}
            priority
            className="logo"
          />
        </div>

        <p className="schoolName">ĐẠI HỌC CẦN THƠ</p>

        <div className="brandRow" aria-label={introText}>
          {introLetters.map((letter, index) => (
            <span
              key={`${letter}-${index}`}
              className={letter === " " ? "letter space" : "letter"}
              style={
                {
                  "--delay": `${(introLetters.length - 1 - index) * 0.08}s`,
                  "--out-delay": `${(introLetters.length - 1 - index) * 0.04}s`,
                } as CSSProperties
              }
            >
              {letter}
            </span>
          ))}
        </div>
      </section>

      <style jsx>{`
        .splash {
          position: relative;
          width: 100vw;
          min-height: 100vh;
          height: 100dvh;
          overflow: hidden;
        }

        .background {
          z-index: 0;
          object-fit: cover;
          object-position: center;
          user-select: none;
        }

        .overlay {
          position: absolute;
          inset: 0;
          z-index: 1;
          // background: linear-gradient(
          //   90deg,
          //   rgba(3, 10, 26, 0.78) 0%,
          //   rgba(4, 16, 36, 0.42) 42%,
          //   rgba(2, 8, 20, 0.72) 100%
          // );
        }

        .content {
          position: relative;
          z-index: 2;
          display: grid;
          align-content: center;
          justify-items: center;
          gap: 30px;
          width: 100%;
          height: 100%;
          padding: 2rem;
          transform: translateY(-22%);
        }

        .logoWrap {
          display: flex;
          align-items: center;
          justify-content: center;
          width: clamp(7rem, 14vw, 11rem);
        }

        .logo {
          width: 100%;
          height: auto;
          object-fit: contain;
          filter: drop-shadow(0 10px 24px rgba(11, 74, 168, 0.18));
        }

        .schoolName {
          margin: 0;
          color: #0b4aa8;
          font-size: clamp(1.2rem, 3vw, 3rem);
          font-weight: 900;
          line-height: 1;
          letter-spacing: 0.015em;
          text-shadow: 0 14px 36px rgba(0, 0, 0, 0.34);
        }

        .brandRow {
          display: flex;
          flex-wrap: nowrap;
          align-items: center;
          justify-content: center;
          max-width: 94vw;
          gap: clamp(0.02rem, 0.18vw, 0.12rem);
          white-space: nowrap;
          transform: translateX(-125vw);
          animation: titleJourney 4.9s cubic-bezier(0.2, 0.78, 0.16, 1) forwards;
          will-change: transform;
        }

        .letter {
          display: inline-block;
          min-width: 0.5em;
          color: rgba(11, 74, 168, 0.9);
          font-size: clamp(1.2rem, 3vw, 3rem);
          font-weight: 700;
          line-height: 1;
          letter-spacing: 0.015em;
          text-shadow: 0 14px 36px rgba(0, 0, 0, 0.34);
          opacity: 0;
          transform: translateX(-1.8rem) scale(0.96);
          filter: blur(8px);
          animation:
            letterSettle 0.42s ease-out forwards,
            letterExit 0.42s ease-in forwards;
          animation-delay: var(--delay), calc(3.14s + var(--out-delay));
        }

        .space {
          min-width: 0.32em;
        }

        .progressFill {
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, #77c8ff 0%, #ffffff 100%);
          box-shadow: 0 0 20px rgba(119, 200, 255, 0.8);
          transition: width 0.12s linear;
        }

        @keyframes titleJourney {
          0% {
            opacity: 0.2;
            transform: translateX(-125vw);
          }

          28% {
            opacity: 1;
            transform: translateX(0);
          }

          42% {
            opacity: 1;
            transform: translateX(0);
          }

          68% {
            opacity: 1;
            transform: translateX(0);
          }

          80% {
            opacity: 1;
            transform: translateX(0);
          }

          92% {
            opacity: 1;
            transform: translateX(0);
          }

          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes letterSettle {
          0% {
            opacity: 0;
            transform: translateX(-1.8rem) scale(0.96);
            filter: blur(8px);
          }

          100% {
            opacity: 1;
            transform: translateX(0) scale(1);
            filter: blur(0);
          }
        }

        @keyframes letterExit {
          0% {
            opacity: 1;
            transform: translateX(0) scale(1);
            filter: blur(0);
          }

          100% {
            opacity: 0;
            transform: translateX(1.8rem) scale(0.96);
            filter: blur(8px);
          }
        }

        @keyframes fadeProgress {
          from {
            opacity: 0;
            transform: translateY(1rem);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 900px) {
          .schoolName {
            font-size: clamp(0.9rem, 2.8vw, 1.9rem);
          }

          .letter {
            font-size: clamp(0.9rem, 2.8vw, 1.9rem);
          }
        }

        @media (max-width: 640px) {
          .content {
            gap: 48px;
            padding: 1.2rem;
            transform: translateY(-14%);
          }

          .logoWrap {
            width: clamp(5.5rem, 22vw, 7rem);
          }

          .letter {
            font-size: clamp(0.72rem, 2.7vw, 1.15rem);
          }

          .schoolName {
            font-size: clamp(0.72rem, 2.7vw, 1.15rem);
          }

          .space {
            min-width: 0.18em;
          }
        }
      `}</style>
    </main>
  );
};

const SplashScreen = () => (
  <Suspense fallback={null}>
    <SplashScreenContent />
  </Suspense>
);

export default SplashScreen;
