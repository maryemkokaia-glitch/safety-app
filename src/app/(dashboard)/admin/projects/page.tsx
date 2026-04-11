"use client";

import { useState } from "react";
import { useDemo, generateId } from "@/lib/demo-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Plus, MapPin } from "lucide-react";
import { DEMO_COMPANY_ID } from "@/lib/store";
import type { ProjectStatus } from "@/lib/database.types";
import type { TranslationKey } from "@/lib/i18n";
import Link from "next/link";

export default function ProjectsPage() {
  const { data, updateData, t } = useDemo();
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    updateData((d) => ({ ...d, projects: [...d.projects, { id: generateId(), company_id: DEMO_COMPANY_ID, name, address: address || null, status: "active", client_id: null, inspector_id: null, created_at: new Date().toISOString() }] }));
    setName(""); setAddress(""); setShowModal(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t("nav.projects")}</h1>
        <Button onClick={() => setShowModal(true)}><Plus className="w-4 h-4 mr-2" /> {t("project.new")}</Button>
      </div>
      {data.projects.length === 0 ? (
        <Card><div className="px-6 py-12 text-center"><p className="text-gray-500 mb-4">{t("project.no_projects")}</p><Button onClick={() => setShowModal(true)}><Plus className="w-4 h-4 mr-2" /> {t("project.create_first")}</Button></div></Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.projects.map((project) => (
            <Link key={project.id} href={`/admin/projects/${project.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <div className="p-4 sm:p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{project.name}</h3>
                    <Badge variant={project.status === "active" ? "success" : project.status === "paused" ? "warning" : "default"}>{t((`status.${project.status}`) as TranslationKey)}</Badge>
                  </div>
                  {project.address && <div className="flex items-center gap-1 text-sm text-gray-500"><MapPin className="w-3.5 h-3.5" />{project.address}</div>}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={t("project.new")}>
        <form onSubmit={handleCreate} className="space-y-4">
          <Input id="name" label={t("project.name")} value={name} onChange={(e) => setName(e.target.value)} required />
          <Input id="address" label={t("project.address")} value={address} onChange={(e) => setAddress(e.target.value)} />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)} className="flex-1">{t("cancel")}</Button>
            <Button type="submit" className="flex-1">{t("create")}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
