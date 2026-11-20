"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { CATEGORIES, CONDITIONS, type Category, type Condition } from "@/convex/constants";
import { Sheet } from "@/components/sheet";
import { toast } from "sonner";
import { toastError } from "@/lib/utils";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { motion, AnimatePresence } from "motion/react";
import { spring } from "@/lib/motion";

type ToolDoc = Doc<"tools">;

interface ToolFormData {
  name: string;
  category: Category;
  condition: Condition;
  description: string;
}

const emptyForm: ToolFormData = {
  name: "",
  category: "power-tools",
  condition: "good",
  description: "",
};

export default function MyListingsPage() {
  const tools = useQuery(api.tools.mine);
  const createTool = useMutation(api.tools.create);
  const updateTool = useMutation(api.tools.update);
  const removeTool = useMutation(api.tools.remove);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<ToolDoc | null>(null);
  const [form, setForm] = useState<ToolFormData>(emptyForm);
  const [busy, setBusy] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<Id<"tools"> | null>(null);

  const openCreate = () => {
    setEditingTool(null);
    setForm(emptyForm);
    setSheetOpen(true);
  };

  const openEdit = (tool: ToolDoc) => {
    setEditingTool(tool);
    setForm({
      name: tool.name,
      category: tool.category,
      condition: tool.condition,
      description: tool.description,
    });
    setSheetOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = form.name.trim();
    const description = form.description.trim();

    if (name.length < 2 || name.length > 60) {
      toast.error("Name must be 2–60 characters.");
      return;
    }
    if (description.length > 280) {
      toast.error("Description must be ≤ 280 characters.");
      return;
    }

    setBusy(true);
    try {
      if (editingTool) {
        await updateTool({
          toolId: editingTool._id,
          name,
          category: form.category,
          condition: form.condition,
          description,
        });
        toast.success("Listing updated.");
      } else {
        await createTool({
          name,
          category: form.category,
          condition: form.condition,
          description,
        });
        toast.success("Tool listed.");
      }
      setSheetOpen(false);
      setEditingTool(null);
      setForm(emptyForm);
    } catch (err) {
      toastError(err);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (toolId: Id<"tools">) => {
    if (confirmDeleteId !== toolId) {
      setConfirmDeleteId(toolId);
      setTimeout(() => {
        setConfirmDeleteId((current) => (current === toolId ? null : current));
      }, 3500);
      return;
    }

    try {
      await removeTool({ toolId });
      toast.success("Listing removed.");
      setConfirmDeleteId(null);
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Add Button */}
      <div className="flex items-center justify-between border-b border-line/60 pb-5">
        <div>
          <h1 className="font-display text-3xl text-ink">My listings</h1>
          <p className="mt-1 text-xs text-mute sm:text-sm">
            Tools you are sharing with neighbors
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex h-10 items-center justify-center rounded-2xl bg-ink px-4 text-xs sm:text-sm font-medium text-paper transition active:scale-95 hover:bg-ink/90"
        >
          + New listing
        </button>
      </div>

      {/* Tools List */}
      {tools === undefined ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-2xl border border-line bg-card p-5 animate-pulse"
            />
          ))}
        </div>
      ) : tools.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-line bg-card/40 py-16 text-center">
          <p className="text-base font-medium text-ink">You have no listings yet</p>
          <p className="mt-1 text-sm text-mute">
            Add tools you own to start lending to your community.
          </p>
          <button
            type="button"
            onClick={openCreate}
            className="mt-5 h-10 rounded-full bg-ink px-5 text-sm font-medium text-paper transition hover:bg-ink/90 active:scale-95"
          >
            List a tool
          </button>
        </div>
      ) : (
        <ul className="space-y-3">
          <AnimatePresence mode="popLayout">
            {tools.map((t) => (
              <motion.li
                key={t._id}
                layout
                transition={spring}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-card p-5 shadow-xs transition hover:shadow-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-paper px-2.5 py-0.5 text-[11px] font-medium text-mute capitalize">
                      {t.category.replace("-", " ")}
                    </span>
                    <span className="text-xs text-mute capitalize">
                      {t.condition}
                    </span>
                  </div>
                  <h3 className="font-medium text-ink text-base sm:text-lg">
                    {t.name}
                  </h3>
                  <p className="text-xs text-mute line-clamp-1 max-w-lg">
                    {t.description}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(t)}
                    className="h-9 rounded-xl border border-line px-3.5 text-xs font-medium text-ink transition hover:bg-paper active:scale-95"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(t._id)}
                    className={`h-9 rounded-xl px-3.5 text-xs font-medium transition active:scale-95 ${
                      confirmDeleteId === t._id
                        ? "bg-danger text-white shadow-xs"
                        : "border border-line text-mute hover:text-danger hover:border-danger/30"
                    }`}
                  >
                    {confirmDeleteId === t._id ? "Sure?" : "Delete"}
                  </button>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      {/* Create / Edit Tool Sheet */}
      <Sheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title={editingTool ? "Edit listing" : "New listing"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-mute mb-1">
              Tool Name
            </label>
            <input
              type="text"
              required
              minLength={2}
              maxLength={60}
              placeholder="e.g. Bosch Hammer Drill 18V"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="h-11 w-full rounded-xl border border-line bg-paper px-3.5 text-sm text-ink placeholder:text-mute focus:border-ink focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-mute mb-1">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value as Category })
                }
                className="h-11 w-full rounded-xl border border-line bg-paper px-3 text-sm text-ink capitalize focus:border-ink focus:outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.replace("-", " ")}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-mute mb-1">
                Condition
              </label>
              <select
                value={form.condition}
                onChange={(e) =>
                  setForm({ ...form, condition: e.target.value as Condition })
                }
                className="h-11 w-full rounded-xl border border-line bg-paper px-3 text-sm text-ink capitalize focus:border-ink focus:outline-none"
              >
                {CONDITIONS.map((cond) => (
                  <option key={cond} value={cond}>
                    {cond.replace("-", " ")}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-mute mb-1">
              Description (optional instructions, accessories)
            </label>
            <textarea
              rows={3}
              maxLength={280}
              placeholder="Includes 2 batteries and charger in sturdy case."
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="w-full rounded-xl border border-line bg-paper p-3 text-sm text-ink placeholder:text-mute focus:border-ink focus:outline-none resize-none"
            />
            <p className="mt-1 text-right text-[11px] text-mute">
              {form.description.length}/280
            </p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={busy}
              className="h-12 w-full rounded-2xl bg-ink font-medium text-paper transition active:scale-[0.98] disabled:opacity-40"
            >
              {busy
                ? "Saving…"
                : editingTool
                ? "Save changes"
                : "Publish listing"}
            </button>
          </div>
        </form>
      </Sheet>
    </div>
  );
}
