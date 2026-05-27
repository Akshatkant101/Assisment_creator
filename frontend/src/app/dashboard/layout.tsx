import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { Bell, ArrowLeft, FileText } from "lucide-react";
import { ReactNode } from "react";
import { SidebarNav } from "@/components/SidebarNav";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await currentUser();
  const displayName = user?.firstName
    ? `${user.firstName}${user.lastName ? " " + user.lastName : ""}`
    : user?.emailAddresses[0]?.emailAddress?.split("@")[0] ?? "User";

  return (
    <div className="flex h-screen bg-[#f4f4f5] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[280px] bg-white m-4 rounded-[2rem] shadow-[0px_32px_48px_rgba(0,0,0,0.2),0px_16px_48px_rgba(0,0,0,0.12)] flex flex-col overflow-hidden flex-shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-3 px-8 py-8">
          <div className="w-10 h-10 bg-gradient-to-b from-[#E56820] to-[#D45E3E] rounded-[15px] flex items-center justify-center text-white font-bold text-xl shadow-[0px_12.9px_25.7px_rgba(0,0,0,0.1),0px_8.6px_17.1px_rgba(0,0,0,0.15),0px_4.3px_8.6px_rgba(0,0,0,0.2)]">
            V
          </div>
          <span className="text-[28px] font-bold tracking-[-0.06em] text-[#303030] leading-5">VedaAI</span>
        </div>

        {/* Nav (client component for active state) */}
        <SidebarNav />

        {/* School profile card */}
        <div className="px-6 pb-6">
          <div className="bg-[#F0F0F0] hover:bg-gray-200 transition-colors cursor-pointer p-3 rounded-2xl flex items-center gap-4">
            <div className="w-[59px] h-[56px] bg-orange-200 rounded-full flex-shrink-0 overflow-hidden">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=school"
                alt="School avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <p className="text-[16px] font-bold text-[#303030] truncate tracking-[-0.04em]">
                Delhi Public School
              </p>
              <p className="text-[14px] text-[#5E5E5E] truncate tracking-[-0.04em]">
                Bokaro Steel City
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden py-4 pr-4 min-w-0">
        {/* Topbar */}
        <header className="flex items-center justify-between mb-6 bg-white/75 backdrop-blur-sm rounded-2xl px-6 h-14 mx-0 border border-white/60">
          <div className="flex items-center gap-3 text-[#A9A9A9]">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft size={20} />
            </button>
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
        <div className="flex-1 overflow-y-auto px-6 py-4 relative">
          {children}
        </div>
      </main>
    </div>
  );
}
