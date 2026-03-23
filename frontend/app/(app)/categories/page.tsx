"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { del, get, post, put } from "@/lib/api";
import type { Category } from "@/lib/types";
import { CategoryForm } from "@/components/categories/CategoryForm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

type Mode = { type: "create" } | { type: "rename"; category: Category } | null;

export default function CategoriesPage() {
  const qc = useQueryClient();
  const [mode, setMode] = useState<Mode>(null);
  const [confirmDelete, setConfirmDelete] = useState<Category | null>(null);

  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ["categories", "all"],
    queryFn: () => get<Category[]>("/categories?include_archived=true"),
  });

  const active = categories.filter((c) => !c.archived_at);
  const archived = categories.filter((c) => c.archived_at);

  async function handleCreate(name: string) {
    await post("/categories", { name });
    qc.invalidateQueries({ queryKey: ["categories"] });
    setMode(null);
  }

  async function handleRename(name: string) {
    if (mode?.type !== "rename") return;
    await put(`/categories/${mode.category.id}`, { name });
    qc.invalidateQueries({ queryKey: ["categories"] });
    setMode(null);
  }

  async function handleDelete(cat: Category) {
    const result = await del(`/categories/${cat.id}`) as any;
    qc.invalidateQueries({ queryKey: ["categories"] });
    setConfirmDelete(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categories</h1>
        <Button onClick={() => setMode({ type: "create" })}>New Category</Button>
      </div>

      {isLoading && <p className="text-slate-400">Loading…</p>}

      <section>
        <h2 className="mb-3 font-semibold">Active</h2>
        {active.length === 0 && <p className="text-sm text-slate-400">No active categories.</p>}
        <ul className="space-y-2">
          {active.map((c) => (
            <li key={c.id} className="flex items-center justify-between rounded-md border border-slate-200 px-4 py-2">
              <span>{c.name}</span>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setMode({ type: "rename", category: c })}>Rename</Button>
                <Button variant="ghost" size="sm" className="text-red-500" onClick={() => setConfirmDelete(c)}>Delete</Button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {archived.length > 0 && (
        <>
          <Separator />
          <section>
            <h2 className="mb-3 font-semibold text-slate-500">Archived</h2>
            <ul className="space-y-2">
              {archived.map((c) => (
                <li key={c.id} className="flex items-center justify-between rounded-md border border-slate-100 bg-slate-50 px-4 py-2 text-slate-500">
                  <span>{c.name}</span>
                  <Badge variant="secondary">Archived {c.archived_at ? new Date(c.archived_at).toLocaleDateString("pt-BR") : ""}</Badge>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      {/* Create / Rename dialog */}
      <Dialog open={mode !== null} onOpenChange={(open) => !open && setMode(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{mode?.type === "create" ? "New Category" : "Rename Category"}</DialogTitle>
          </DialogHeader>
          <CategoryForm
            initial={mode?.type === "rename" ? mode.category.name : ""}
            onSubmit={mode?.type === "create" ? handleCreate : handleRename}
            onCancel={() => setMode(null)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={confirmDelete !== null} onOpenChange={(open) => !open && setConfirmDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete &ldquo;{confirmDelete?.name}&rdquo;?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600">
            If this category has linked transactions it will be <strong>archived</strong> instead of deleted.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => confirmDelete && handleDelete(confirmDelete)}>Delete / Archive</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
