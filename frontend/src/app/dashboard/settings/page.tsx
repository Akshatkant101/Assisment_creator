"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";

export default function SettingsPage() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [school, setSchool] = useState("");
  const [subject, setSubject] = useState("");
  const [classLevel, setClassLevel] = useState("");

  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user) {
      fetch(`http://127.0.0.1:5000/api/users/me?clerkId=${user.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && !data.error) {
            setSchool(data.school || "");
            setSubject(data.subject || "");
            setClassLevel(data.classLevel || "");
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("http://127.0.0.1:5000/api/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clerkId: user.id,
          school,
          subject,
          classLevel,
        }),
      });
      if (res.ok) {
        setMessage("Settings saved successfully!");
      } else {
        setMessage("Failed to save settings.");
      }
    } catch {
      setMessage("An error occurred.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="animate-spin text-gray-400" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-[24px] p-8 shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-[#303030] tracking-[-0.04em] mb-2">Profile Settings</h1>
        <p className="text-sm text-gray-500 mb-8">
          Manage your school and teaching preferences. These will be pre-filled when you create new assignments.
        </p>

        <div className="space-y-6">
          <div className="flex flex-col gap-2">
            <label className="text-[16px] font-bold text-[#303030] tracking-[-0.04em] leading-[140%]">
              School Name
            </label>
            <input
              type="text"
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              placeholder="e.g. Delhi Public School"
              className="w-full px-4 py-[11px] rounded-full border-[1.25px] border-[#DADADA] bg-transparent text-[16px] font-medium text-[#303030] outline-none tracking-[-0.04em] focus:border-[#303030] transition-colors"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[16px] font-bold text-[#303030] tracking-[-0.04em] leading-[140%]">
              Default Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Mathematics"
              className="w-full px-4 py-[11px] rounded-full border-[1.25px] border-[#DADADA] bg-transparent text-[16px] font-medium text-[#303030] outline-none tracking-[-0.04em] focus:border-[#303030] transition-colors"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[16px] font-bold text-[#303030] tracking-[-0.04em] leading-[140%]">
              Default Class / Grade
            </label>
            <input
              type="text"
              value={classLevel}
              onChange={(e) => setClassLevel(e.target.value)}
              placeholder="e.g. 10th Grade"
              className="w-full px-4 py-[11px] rounded-full border-[1.25px] border-[#DADADA] bg-transparent text-[16px] font-medium text-[#303030] outline-none tracking-[-0.04em] focus:border-[#303030] transition-colors"
            />
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <p className={`text-sm font-medium ${message.includes("success") ? "text-green-500" : "text-red-500"}`}>
            {message}
          </p>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center justify-center gap-2 bg-[#181818] hover:bg-black transition-all px-8 py-3 rounded-full text-[16px] font-semibold text-white tracking-[-0.04em] disabled:opacity-80 shadow-md hover:shadow-lg cursor-pointer min-w-[140px]"
          >
            {saving ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
