"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import {
  Settings,
  Sparkles,
} from "lucide-react";
import API_URL from "@/lib/api";

export function SidebarNav() {
  const pathname = usePathname();
  const { user } = useUser();
  const [assignmentsCount, setAssignmentsCount] = useState(0);
  const isCreate = pathname === "/dashboard/create";

  useEffect(() => {
    if (user) {
      fetch(`${API_URL}/api/assignments?clerkId=${user.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setAssignmentsCount(data.length);
          }
        })
        .catch(console.error);
    }
  }, [user]);

  const NAV_ITEMS = [
    { href: "/dashboard", iconSrc: "/icons/Home.svg", label: "Home" },
    { href: "/dashboard/groups", iconSrc: "/icons/group.svg", label: "My Groups" },
    { href: "/dashboard", iconSrc: "/icons/Assignment.svg", label: "Assignments", badge: assignmentsCount },
    { href: "/dashboard/toolkit", iconSrc: "/icons/Book.svg", label: "AI Teacher's Toolkit" },
    { href: "/dashboard/library", iconSrc: "/icons/library.svg", label: "My Library" },
  ];

  const isActive = (label: string, href: string) => {
    if (label === "Assignments") {
      return (
        pathname === "/dashboard" ||
        pathname.startsWith("/dashboard/assignment") ||
        pathname === "/dashboard/create"
      );
    }
    // Home is never active when Assignments would be active
    if (label === "Home") return false;
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <div className="flex flex-col flex-1">
      {/* Create Assignment button */}
      <div className="px-6 mb-8">
        <div className="rounded-full p-[1.5px] bg-gradient-to-b from-[#FF7950] to-[#C0350A] shadow-[0px_8px_16px_rgba(255,121,80,0.2)]">
          <Link
            href="/dashboard/create"
            className="w-full bg-[#272727] hover:bg-[#1a1a1a] text-white rounded-full py-3.5 px-4 flex items-center justify-center gap-2 transition-all shadow-[inset_0px_0px_10px_rgba(255,255,255,0.1)]"
          >
            <Sparkles size={16} className="text-white fill-white" />
            <span className="font-medium text-sm tracking-[-0.04em]">Create Assignment</span>
          </Link>
        </div>
      </div>

      {/* Navigation items */}
      <nav className="px-4 space-y-1 flex-1">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.label, item.href);
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                active
                  ? "bg-white shadow-sm border border-gray-100 text-[#303030] font-semibold"
                  : "text-[rgba(94,94,94,0.8)] hover:bg-gray-50 hover:text-[#303030]"
              }`}
            >
              <div className="flex items-center gap-3">
                <img src={item.iconSrc} alt="" className="w-5 h-5 opacity-90 group-hover:opacity-100" />
                <span className="text-sm tracking-[-0.04em]">{item.label}</span>
              </div>
              {item.badge && (
                <span className="bg-[#FF5623] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-[inset_0px_0px_32.3px_rgba(255,161,10,0.25)]">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Settings */}
      <Link
        href="/dashboard/settings"
        className="flex items-center gap-3 px-4 py-3 mx-4 text-[rgba(94,94,94,0.8)] hover:text-[#303030] cursor-pointer mb-4 transition-colors rounded-xl hover:bg-gray-50 tracking-[-0.04em]"
      >
        <Settings size={20} />
        <span className="font-medium text-sm">Settings</span>
      </Link>
    </div>
  );
}
