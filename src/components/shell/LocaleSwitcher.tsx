"use client";

import { CSSProperties } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Props = {
  /** inline = dùng trong header; floating = nổi góc phải (như ở login) */
  variant?: "inline" | "floating";
  /** px cho cả width/height của nút */
  size?: number;
  className?: string;
  style?: CSSProperties;
  /** override title nếu muốn */
  title?: string;
};

export default function LocaleSwitcher({
  variant = "inline",
  size = 36,
  className,
  style,
  title,
}: Props) {
  const t = useTranslations("LocaleSwitcher");
  const locale = useLocale(); // "vi" | "en"
  const nextLocale = locale === "vi" ? "en" : "vi";

  const router = useRouter();
  const pathname = usePathname() || "/";
  const search = useSearchParams();

  const switchLocale = () => {
    const parts = pathname.split("/");
    if (parts.length < 2 || parts[1] === "") parts.splice(1, 0, locale);
    parts[1] = nextLocale;

    const qs = search?.toString();
    const url = parts.join("/") + (qs ? `?${qs}` : "");
    router.replace(url, { scroll: false });
  };

  const btnStyle: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: size,
    height: size,
    borderRadius: 999,
    fontWeight: 700,
    letterSpacing: 0.4,
    color: "#0b0f1a",
    background: "#fff",
    border: "1px solid rgba(15,23,42,.08)",
    boxShadow:
      "0 10px 30px rgba(11,15,26,.25), 0 6px 18px rgba(90,164,231,.18)",
    position: variant === "floating" ? "fixed" : "relative",
    top: variant === "floating" ? 18 : undefined,
    right: variant === "floating" ? 18 : undefined,
    zIndex: variant === "floating" ? 50 : undefined,
    ...style,
  };

  const aria = t("aria", { code: nextLocale });
  const titleText = title ?? t("title", { code: nextLocale });

  return (
    <button
      type="button"
      className={`cm-locale-btn ${className ?? ""}`}
      aria-label={aria}
      title={titleText}
      onClick={switchLocale}
      style={btnStyle}
    >
      {locale.toUpperCase()}

      <style jsx>{`
        .cm-locale-btn:hover {
          box-shadow: 0 14px 40px rgba(11, 15, 26, 0.3),
            0 10px 28px rgba(90, 164, 231, 0.25);
        }
        .cm-locale-btn::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 999px;
          padding: 1px;
          background: linear-gradient(90deg, #5aa4e7, #e2433e);
          -webkit-mask: linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
        }
      `}</style>
    </button>
  );
}
