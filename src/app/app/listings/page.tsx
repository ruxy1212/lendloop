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
import { CardSkeleton } from "@/components/card-skeleton";
import { Button } from "@/components/button";

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
  const me = useQuery(api.users.me);
  const tools = useQuery(api.tools.mine, me ? {} : "skip");
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

        <Button
          variant="primary"
          size="sm"
          onClick={openCreate}
          className="sm:text-sm hover:text-purple-500"
        >
          + New listing
        </Button>
      </div>

      {/* Tools List */}
      {tools === undefined ? (
        <CardSkeleton
          isLoading
          count={3}
          cardHeight={112}
          className="space-y-3"
        >
          {null}
        </CardSkeleton>
      ) : tools.length === 0 ? (
        <div className="relative isolate flex flex-col items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-card/50 py-16 text-center backdrop-blur-md">
          <p className="text-base font-medium text-ink">You have no listings yet</p>
          <p className="mt-1 text-sm text-mute">
            Add tools you own to start lending to your community.
          </p>
          <Button
            variant="primary"
            onClick={openCreate}
            className="mt-5 hover:text-purple-500"
          >
            List a tool
          </Button>
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
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-card-border bg-card/60 p-5 shadow-xs backdrop-blur-md transition hover:border-card-border-hover hover:shadow-[0_18px_45px_rgba(5,194,255,0.08)]"
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
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => openEdit(t)}
                  >
                    Edit
                  </Button>

                  <Button
                    variant={confirmDeleteId === t._id ? "danger" : "secondary"}
                    size="sm"
                    onClick={() => handleDelete(t._id)}
                    className={
                      confirmDeleteId === t._id
                        ? ""
                        : "text-mute hover:border-danger/30 hover:text-danger"
                    }
                  >
                    {confirmDeleteId === t._id ? "Sure?" : "Delete"}
                  </Button>
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
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={busy}
              className="w-full hover:text-purple-500"
            >
              {busy
                ? "Saving…"
                : editingTool
                ? "Save changes"
                : "Publish listing"}
            </Button>
          </div>
        </form>
      </Sheet>
    </div>
  );
}
