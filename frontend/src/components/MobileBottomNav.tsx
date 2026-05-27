"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { label: "Home", href: "/dashboard", icon: "/icons/Home.svg" },
  { label: "Assignments", href: "/dashboard", icon: "/icons/Assignment.svg" },
  { label: "Library", href: "/dashboard/library", icon: "/icons/library.svg" },
  { label: "AI Toolkit", href: "/dashboard/toolkit", icon: "/icons/Book.svg" },
] as const;

function isTabActive(label: string, pathname: string): boolean {
  if (label === "Assignments") {
    return (
      pathname === "/dashboard" ||
      pathname.startsWith("/dashboard/create") ||
      pathname.startsWith("/dashboard/assignment")
    );
  }
  if (label === "Home") return false;
  if (label === "Library") return pathname.startsWith("/dashboard/library");
  if (label === "AI Toolkit") return pathname.startsWith("/dashboard/toolkit");
  return false;
}

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 print:hidden">
      {/* Separator */}
      <div className="flex justify-center pt-1">
        <div className="w-32 border-t border-[rgba(48,48,48,0.5)]" />
      </div>

      <div className="px-2.5 pb-3 pt-3">
        <div
          className="flex items-center justify-between px-6 py-2 rounded-3xl"
          style={{
            background: "#181818",
            boxShadow:
              "0px 32px 48px rgba(0,0,0,0.2), 0px 16px 48px rgba(0,0,0,0.12)",
          }}
        >
          {TABS.map((tab) => {
            const active = isTabActive(tab.label, pathname);
            return (
              <Link
                key={tab.label}
                href={tab.href}
                className={`flex items-center justify-center transition-all ${
                  active ? "flex-row gap-2.5 px-3 py-3" : "flex-col gap-1 py-3 w-[52px]"
                }`}
              >
                <img
                  src={tab.icon}
                  alt=""
                  className="w-5 h-5 flex-shrink-0"
                  style={{
                    filter: "brightness(0) invert(1)",
                    opacity: active ? 1 : 0.25,
                  }}
                />
                <span
                  className="font-semibold tracking-[-0.04em] leading-[140%] whitespace-nowrap"
                  style={{
                    fontSize: "12px",
                    color: active ? "#FFFFFF" : "rgba(255,255,255,0.25)",
                  }}
                >
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
