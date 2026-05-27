import { Settings } from "lucide-react";

export default function SettingsPage() {
  return <ComingSoon icon={<Settings size={28} className="text-gray-400" />} title="Settings" description="Manage your profile, school details, and notification preferences." />;
}

function ComingSoon({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">{icon}</div>
      <p className="text-gray-700 font-extrabold text-xl tracking-tight">{title}</p>
      <p className="text-gray-400 text-sm mt-1 max-w-xs">{description}</p>
      <span className="mt-4 text-xs font-bold px-3 py-1.5 bg-orange-100 text-orange-600 rounded-full">Coming Soon</span>
    </div>
  );
}
