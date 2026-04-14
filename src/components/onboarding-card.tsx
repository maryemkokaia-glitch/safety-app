"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDemo } from "@/lib/demo-context";
import { cn } from "@/lib/utils/cn";
import { Plus, FolderOpen, ClipboardCheck, X, Check, Sparkles } from "lucide-react";

const STORAGE_KEY = "sarke_onboarding_dismissed";

/**
 * New-user onboarding card. Walks the inspector through:
 *  1. Add a project (or open demo one)
 *  2. Run first inspection
 *  3. Upload a document
 *
 * Auto-hides when all 3 are done or when dismissed.
 */
export function OnboardingCard() {
  const { data, user, t } = useDemo();
  const router = useRouter();
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      setDismissed(localStorage.getItem(STORAGE_KEY) === "1");
    }
  }, []);

  if (!mounted || dismissed) return null;

  const myProjects = data.projects.filter((p) => p.inspector_id === user.id && p.status === "active");
  const hasProject = myProjects.length > 0;
  const hasInspection = data.inspections.some(
    (i) => i.inspector_id === user.id && i.status === "completed"
  );
  const hasDocument = (data.documents || []).some((d) =>
    myProjects.some((p) => p.id === d.project_id)
  );

  const doneCount = [hasProject, hasInspection, hasDocument].filter(Boolean).length;
  if (doneCount === 3) return null; // Auto-hide when complete

  const steps = [
    {
      done: hasProject,
      icon: FolderOpen,
      title: "ობიექტის დამატება",
      subtitle: "დაიწყე პირველი ობიექტით",
      onClick: () => {
        if (!hasProject) {
          // Scroll to "add project" button
          const btn = document.querySelector<HTMLElement>("[data-onboarding=\"add-project\"]");
          btn?.scrollIntoView({ behavior: "smooth", block: "center" });
          btn?.click();
        }
      },
    },
    {
      done: hasInspection,
      icon: ClipboardCheck,
      title: "პირველი ინსპექცია",
      subtitle: "შეავსე ჩეკლისტი",
      onClick: () => {
        const project = myProjects[0];
        if (project) router.push(`/inspector/project/${project.id}`);
      },
      disabled: !hasProject,
    },
    {
      done: hasDocument,
      icon: Plus,
      title: "დოკუმენტის ატვირთვა",
      subtitle: "სერთიფიკატი, დაზღვევა და სხვ.",
      onClick: () => {
        const project = myProjects[0];
        if (project) router.push(`/inspector/project/${project.id}`);
      },
      disabled: !hasProject,
    },
  ];

  function dismiss() {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, "1");
    }
    setDismissed(true);
  }

  return (
    <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-5 mb-5 text-white relative overflow-hidden">
      <button
        onClick={dismiss}
        className="absolute top-3 right-3 p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="w-4 h-4 text-amber-300" />
        <p className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
          კეთილი იყოს თქვენი მობრძანება
        </p>
      </div>
      <h2 className="text-lg font-bold mb-0.5">3 ნაბიჯი დასაწყებად</h2>
      <p className="text-xs text-blue-200 mb-4">{doneCount} / 3 დასრულებული</p>

      {/* Progress bar */}
      <div className="h-1 bg-white/20 rounded-full mb-4 overflow-hidden">
        <div
          className="h-full bg-amber-300 rounded-full transition-all duration-500"
          style={{ width: `${(doneCount / 3) * 100}%` }}
        />
      </div>

      <div className="space-y-2">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <button
              key={idx}
              onClick={step.onClick}
              disabled={step.disabled}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all",
                step.done
                  ? "bg-white/10 opacity-70"
                  : step.disabled
                  ? "bg-white/5 opacity-40"
                  : "bg-white/15 hover:bg-white/25 active:bg-white/30"
              )}
            >
              <div
                className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                  step.done ? "bg-green-500" : "bg-white/20"
                )}
              >
                {step.done ? <Check className="w-4 h-4 text-white" /> : <Icon className="w-4 h-4 text-white" />}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "text-sm font-semibold",
                    step.done && "line-through opacity-70"
                  )}
                >
                  {idx + 1}. {step.title}
                </p>
                <p className="text-[11px] text-blue-200">{step.subtitle}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
