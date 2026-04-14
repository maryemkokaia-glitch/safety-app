"use client";

import { cn } from "@/lib/utils/cn";
import { Shield, FolderOpen, ClipboardCheck, Award, Phone, Mail, Share2 } from "lucide-react";
import { useState } from "react";
import type { User, ChecklistCategory } from "@/lib/database.types";

const categoryLabels: Record<string, { ka: string; en: string; icon: string }> = {
  scaffold_fixed: { ka: "ფასადის ხარაჩო", en: "Facade Scaffold", icon: "🏗️" },
  scaffold_mobile: { ka: "მოძრავი ხარაჩო", en: "Mobile Scaffold", icon: "🚧" },
  scaffold_suspended: { ka: "ჩამოკიდებული ხარაჩო", en: "Suspended Scaffold", icon: "⛓️" },
  harness_ppe: { ka: "დამცავი ქამრები", en: "Harness / PPE", icon: "🦺" },
  equipment: { ka: "აღჭურვილობა", en: "Equipment", icon: "⚙️" },
  ppe_general: { ka: "PPE", en: "PPE", icon: "👷" },
  physical_factors: { ka: "ფიზიკური ფაქტორები", en: "Physical Factors", icon: "🌡️" },
};

interface Props {
  user: User;
  stats: {
    activeProjectsCount: number;
    completedInspectionsCount: number;
    averageScore: number | null;
    specialties: string[];
  };
}

export function ExpertProfile({ user, stats }: Props) {
  const [copied, setCopied] = useState(false);
  const initials = user.full_name
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  async function share() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const nav = typeof navigator !== "undefined" ? (navigator as any) : null;
    try {
      if (nav && "share" in nav) {
        await nav.share({ title: user.full_name, url });
      } else if (nav?.clipboard) {
        await nav.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      /* user cancelled */
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-5 py-3 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-gray-900">Sarke</span>
          </a>
          <button
            onClick={share}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            {copied ? "✓" : "გაზიარება"}
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 pt-8 pb-16">
        {/* Hero card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-5">
          <div className="flex items-start gap-4 mb-5">
            <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-gray-900 leading-tight">{user.full_name}</h1>
              <p className="text-sm text-gray-500 mt-1">შრომის უსაფრთხოების სპეციალისტი</p>
              <p className="text-sm text-gray-500">Safety Compliance Specialist</p>
            </div>
          </div>

          {/* Contact */}
          <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
            {user.phone && (
              <a
                href={`tel:${user.phone}`}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-50 text-sm text-gray-700 font-medium hover:bg-gray-100 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                {user.phone}
              </a>
            )}
            <a
              href={`mailto:${user.email}`}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-50 text-sm text-gray-700 font-medium hover:bg-gray-100 transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              {user.email}
            </a>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-2">
              <FolderOpen className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-xl font-bold text-gray-900">{stats.activeProjectsCount}</p>
            <p className="text-[10px] text-gray-400 font-medium">აქტიური პროექტი</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
            <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-2">
              <ClipboardCheck className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-xl font-bold text-gray-900">{stats.completedInspectionsCount}</p>
            <p className="text-[10px] text-gray-400 font-medium">ინსპექცია</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
            <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Award className="w-4 h-4 text-amber-600" />
            </div>
            <p
              className={cn(
                "text-xl font-bold",
                stats.averageScore == null
                  ? "text-gray-300"
                  : stats.averageScore >= 80
                  ? "text-green-700"
                  : stats.averageScore >= 50
                  ? "text-amber-700"
                  : "text-red-700"
              )}
            >
              {stats.averageScore ?? "—"}
              {stats.averageScore != null && "%"}
            </p>
            <p className="text-[10px] text-gray-400 font-medium">საშუალო ქულა</p>
          </div>
        </div>

        {/* Specialties */}
        {stats.specialties.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-5">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
              სპეციალიზაცია
            </h2>
            <div className="flex flex-wrap gap-2">
              {stats.specialties.map((cat) => {
                const meta = categoryLabels[cat as ChecklistCategory];
                if (!meta) return null;
                return (
                  <div
                    key={cat}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-50 text-xs font-semibold text-gray-700"
                  >
                    <span>{meta.icon}</span>
                    <span>{meta.ka}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-center text-white">
          <Shield className="w-8 h-8 mx-auto mb-2 opacity-70" />
          <p className="text-sm font-semibold mb-1">გჭირდებათ შრომის უსაფრთხოების სპეციალისტი?</p>
          <p className="text-xs opacity-80 mb-4">
            Sarke აკავშირებს კომპანიებს და სერტიფიცირებულ ექსპერტებს
          </p>
          <a
            href="/register"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-white text-blue-700 rounded-xl text-sm font-bold hover:bg-blue-50 transition-colors"
          >
            დარეგისტრირდი
          </a>
        </div>

        {/* Footer */}
        <p className="text-[11px] text-gray-400 text-center mt-8">
          Powered by <a href="/" className="font-semibold text-blue-600">Sarke</a> — sarke.ge
        </p>
      </main>
    </div>
  );
}
