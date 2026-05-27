import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { Bell, FileText } from "lucide-react";
import { ReactNode } from "react";
import { SidebarNav } from "@/components/SidebarNav";
import { BackButton } from "@/components/BackButton";
import { MobileHeader } from "@/components/MobileHeader";
import { MobileBottomNav } from "@/components/MobileBottomNav";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await currentUser();
  const displayName = user?.firstName
    ? `${user.firstName}${user.lastName ? " " + user.lastName : ""}`
    : user?.emailAddresses[0]?.emailAddress?.split("@")[0] ?? "User";

  return (
    <div className="flex h-screen bg-[#CECECE] md:bg-[#f4f4f5] overflow-hidden">

      {/* ── Desktop Sidebar ─── hidden on mobile */}
      <aside className="hidden md:flex w-[280px] bg-white m-4 rounded-[2rem] shadow-sm border border-gray-100 flex-col overflow-hidden flex-shrink-0 print:hidden">
        {/* Logo */}
        <div className="flex items-center gap-3 px-8 py-8">
          <img src="/logo.png" alt="VedaAI Logo" className="w-8 h-8 object-contain flex-shrink-0" />
          <span className="text-[28px] font-bold tracking-[-0.04em] text-[#303030]">VedaAI</span>
        </div>

        {/* Nav */}
        <SidebarNav />

        {/* User profile card */}
        <div className="px-6 pb-6">
          <div className="bg-[#F0F0F0] hover:bg-gray-200 transition-colors cursor-pointer p-3 rounded-2xl flex items-center gap-4">
            <div className="w-[48px] h-[48px] rounded-full flex-shrink-0 overflow-hidden bg-gray-200">
              {user?.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-orange-100 text-orange-500 font-bold text-lg">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[16px] font-bold text-[#303030] truncate tracking-[-0.04em]">
                {displayName}
              </p>
              <p className="text-[14px] text-[#5E5E5E] truncate tracking-[-0.04em]">
                {user?.emailAddresses[0]?.emailAddress ?? ""}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Mobile Fixed Header ─── hidden on desktop */}
      <MobileHeader />

      {/* ── Main Content ─── */}
      <main className="flex-1 flex flex-col overflow-hidden md:py-4 md:pr-4 min-w-0 print:p-0 print:m-0 print:overflow-visible">

        {/* Desktop Topbar ─── hidden on mobile */}
        <header className="hidden md:flex items-center justify-between mb-6 bg-white/75 backdrop-blur-sm rounded-2xl px-6 h-14 mx-0 border border-white/60 print:hidden">
          <div className="flex items-center gap-3 text-[#A9A9A9]">
            <BackButton />
            <div className="flex items-center gap-2">
              <FileText size={18} />
              <span className="font-semibold text-[16px] tracking-[-0.04em]">Assignment</span>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <button className="p-2 text-[#A9A9A9] hover:text-[#303030] relative transition-colors">
              <Bell size={20} />
              <span className="absolute top-2.5 right-2 w-2 h-2 bg-red-500 rounded-full border border-white" />
            </button>
            <div className="bg-white pl-2 pr-4 py-1.5 rounded-full shadow-sm flex items-center gap-3 border border-gray-100 hover:shadow-md transition-shadow">
              <UserButton appearance={{ elements: { userButtonAvatarBox: "w-8 h-8" } }} />
              <span className="text-[16px] font-semibold text-[#303030] hidden sm:block tracking-[-0.04em]">
                {displayName}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto relative print:overflow-visible print:p-0
                        md:px-6 md:py-4
                        px-2.5 pt-[96px] pb-24
                        [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {children}
        </div>
      </main>

      {/* ── Mobile Bottom Nav ─── hidden on desktop */}
      <MobileBottomNav />
    </div>
  );
}
