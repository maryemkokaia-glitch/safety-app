"use client";

import { useDemo } from "@/lib/demo-context";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone } from "lucide-react";

export default function UsersPage() {
  const { data } = useDemo();
  const roleLabels: Record<string, string> = { admin: "ადმინისტრატორი", inspector: "ინსპექტორი", client: "კლიენტი" };
  const roleVariants: Record<string, "info" | "success" | "default"> = { admin: "info", inspector: "success", client: "default" };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">მომხმარებლები</h1>
      <Card>
        <div className="divide-y divide-gray-100">
          {data.users.map((u) => (
            <div key={u.id} className="px-4 py-3 sm:px-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{u.full_name}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="flex items-center gap-1 text-xs text-gray-500"><Mail className="w-3 h-3" /> {u.email}</span>
                  {u.phone && <span className="flex items-center gap-1 text-xs text-gray-500"><Phone className="w-3 h-3" /> {u.phone}</span>}
                </div>
              </div>
              <Badge variant={roleVariants[u.role]}>{roleLabels[u.role]}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
