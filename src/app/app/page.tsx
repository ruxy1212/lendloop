"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { CategoryFilter } from "@/components/category-filter";
import { ToolGrid } from "@/components/tool-grid";
import { RequestSheet, type BoardTool } from "@/components/request-sheet";
import { toast } from "sonner";
import { toastError } from "@/lib/utils";
import type { Id } from "@/convex/_generated/dataModel";

function BoardSkeletons({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex h-52 flex-col justify-between rounded-2xl border border-line/60 bg-card p-5 animate-pulse"
        >
          <div className="flex justify-between">
            <div className="h-4 w-20 rounded-full bg-line/60" />
            <div className="h-4 w-16 rounded-full bg-line/50" />
          </div>
          <div className="space-y-2">
            <div className="h-5 w-3/4 rounded-md bg-line/80" />
            <div className="h-3 w-full rounded-md bg-line/40" />
            <div className="h-3 w-2/3 rounded-md bg-line/40" />
          </div>
          <div className="flex items-center justify-between pt-2">
            <div className="h-4 w-24 rounded-md bg-line/50" />
            <div className="h-8 w-20 rounded-xl bg-line/60" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AppBoardPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [selectedTool, setSelectedTool] = useState<BoardTool | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<Id<"tools"> | null>(null);

  const tools = useQuery(api.tools.board);
  const me = useQuery(api.users.me);
  const removeTool = useMutation(api.tools.remove);

  const filteredTools = useMemo(() => {
    if (!tools) return [];
    return tools.filter((t) => {
      const matchCat = category === "all" || t.category === category;
      const matchSearch =
        search.trim() === "" ||
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase()) ||
        t.ownerName.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [tools, category, search]);

  const handleRequest = (tool: BoardTool) => {
    setSelectedTool(tool);
    setSheetOpen(true);
  };

  const handleAdminRemove = async (toolId: Id<"tools">) => {
    try {
      setDeletingId(toolId);
      await removeTool({ toolId });
      toast.success("Listing removed by admin.");
    } catch (e) {
      toastError(e);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <input
            type="text"
            placeholder="Search tools or lenders…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-2xl border border-line bg-card px-3.5 text-sm text-ink placeholder:text-mute focus:border-ink focus:outline-none"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-2.5 text-xs text-mute hover:text-ink"
            >
              Clear
            </button>
          )}
        </div>

        <CategoryFilter
          id="board-filter"
          value={category}
          onChange={setCategory}
        />
      </div>

      {/* Grid or Skeletons */}
      {tools === undefined ? (
        <BoardSkeletons count={6} />
      ) : filteredTools.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-line bg-card/40 py-16 text-center">
          <p className="text-base font-medium text-ink">No tools match your criteria</p>
          <p className="mt-1 text-sm text-mute">
            Try adjusting your search terms or selecting another category.
          </p>
        </div>
      ) : (
        <ToolGrid
          items={filteredTools}
          render={(t) => {
            const isOwner = me?._id === t.ownerId;
            const isOnLoan = t.status === "on_loan";

            return (
              <div className="flex h-full w-full flex-col justify-between rounded-2xl border border-line bg-card p-5 transition-shadow hover:shadow-xs">
                {/* Header row: category + availability */}
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-paper px-2.5 py-0.5 text-[11px] font-medium text-mute capitalize">
                      {t.category.replace("-", " ")}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                        isOnLoan ? "text-ember" : "text-moss"
                      }`}
                    >
                      <span
                        className={`size-1.5 rounded-full ${
                          isOnLoan ? "bg-ember" : "bg-moss"
                        }`}
                      />
                      {isOnLoan ? "On loan" : "Available"}
                    </span>
                  </div>

                  <h3 className="mt-3 font-medium text-ink text-lg leading-snug line-clamp-1">
                    {t.name}
                  </h3>

                  <div className="mt-1 flex items-center gap-2 text-xs text-mute">
                    <span className="capitalize">{t.condition}</span>
                    <span>·</span>
                    <span className="inline-flex items-center gap-1">
                      {t.ownerName}
                      {t.trusted && (
                        <span
                          title="Trusted Lender"
                          className="rounded-full bg-moss/15 px-1.5 py-0.2 text-[10px] font-semibold text-moss"
                        >
                          ✓ trusted
                        </span>
                      )}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-mute line-clamp-2 leading-relaxed">
                    {t.description}
                  </p>
                </div>

                {/* Footer action row */}
                <div className="mt-4 flex items-center justify-between border-t border-line/60 pt-3">
                  <div>
                    {me?.role === "admin" && (
                      <button
                        type="button"
                        disabled={deletingId === t._id}
                        onClick={() => handleAdminRemove(t._id)}
                        className="text-xs font-medium text-danger hover:underline disabled:opacity-50"
                      >
                        {deletingId === t._id ? "Removing…" : "Remove"}
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={isOwner || isOnLoan}
                    onClick={() => handleRequest(t)}
                    className="h-9 rounded-xl bg-ink px-4 text-xs font-medium text-paper transition active:scale-95 disabled:bg-line disabled:text-mute disabled:cursor-not-allowed"
                  >
                    {isOwner ? "Your listing" : isOnLoan ? "Unavailable" : "Request"}
                  </button>
                </div>
              </div>
            );
          }}
        />
      )}

      {/* Date-range Request Modal */}
      <RequestSheet
        tool={selectedTool}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  );
}
