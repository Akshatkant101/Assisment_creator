import { Users } from "lucide-react";

export default function GroupsPage() {
  return <ComingSoon icon={<Users size={28} className="text-gray-400" />} title="My Groups" description="Organise your students into groups and assign work in bulk." />;
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
