 
// Thay số liệu/URL đúng với Quản lý ký túc xá của bạn
import type { StaticImport } from "next/dist/shared/lib/get-img-props";
import logoPng from "@/assets/images/CTU_logo.png";
type Company = {
  name: string;
  logoSrc: string | StaticImport;
  email: string;
  phones: any;
  address: string;
  fax: string;
  privacyUrl: string;
  business:  any;
  socials:  any; 
};
export const COMPANY:Company = {
  name: "Quản lý Ký túc xá Đại học Cần Thơ",

  logoSrc: logoPng, 
  email: "info@ctgroupvietnam.com",
  phones: ["(+84) 911 807 668", "(+84) 911 807 667"],
  fax: "(+84 28) 6297 1999",
  address:
    "Léman Building, 20 Truong Dinh St., District 3 (former), Ho Chi Minh City",
  privacyUrl: "/privacy-policy",

  business: {
    highTechUrl: "#",
    sustainableUrl: "#",
  },

  socials: {
    facebook: "#",
    google: "#",
    instagram: "#",
    linkedin: "#",
    pinterest: "#",
    tiktok: "#",
    x: "#",
    zalo: "#",
  },
};
