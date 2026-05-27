"use client";

import { Bell, Menu } from "lucide-react";
import { UserButton } from "@clerk/nextjs";

export function MobileHeader() {
  return (
    <div className="md:hidden fixed top-0 left-0 right-0 z-40 px-2.5 pt-[18px] pb-[7px] print:hidden">
      {/* White card header */}
      <div
        className="bg-white rounded-2xl flex items-center justify-between px-3 pr-4"
        style={{ height: "56px" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2">
          <img
            src="/logo.png"
            alt="VedaAI"
            className="w-7 h-7 object-contain flex-shrink-0"
          />
          <span
            className="font-bold text-[#303030]"
            style={{
              fontSize: "20px",
              letterSpacing: "-0.06em",
              lineHeight: "140%",
            }}
          >
            VedaAI
          </span>
        </div>

        {/* Right icons */}
        <div className="flex items-center gap-3">
          {/* Bell */}
          <div className="relative w-9 h-9 bg-[#F6F6F6] rounded-full flex items-center justify-center flex-shrink-0">
            <Bell size={18} className="text-[#303030]" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
          </div>

          {/* User avatar via Clerk */}
          <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
            <UserButton
              appearance={{ elements: { userButtonAvatarBox: "w-8 h-8" } }}
            />
          </div>

          {/* Hamburger */}
          <Menu size={24} className="text-[#303030] flex-shrink-0" />
        </div>
      </div>
    </div>
  );
}
