"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  initial?: string;
  onSubmit: (name: string) => Promise<void>;
  onCancel: () => void;
}

export function CategoryForm({ initial = "", onSubmit, onCancel }: Props) {
  const [name, setName] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await onSubmit(name);
    } catch (err: any) {
      setError(err.body?.detail ?? "Failed to save");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="cat-name">Category name</Label>
        <Input id="cat-name" value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={loading || !name.trim()}>Save</Button>
      </div>
    </form>
  );
}
