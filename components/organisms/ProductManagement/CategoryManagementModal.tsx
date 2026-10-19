import React from "react";
import { X, Plus, Tag, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { CategoryManagementModalProps } from "./types";

export function CategoryManagementModal({
  isOpen,
  onClose,
  categories,
  newCategoryName,
  setNewCategoryName,
  editingCategory,
  setEditingCategory,
  isPending,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
}: CategoryManagementModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-[460px] bg-white rounded-3xl shadow-elevated border border-zinc-200 overflow-hidden z-10 flex flex-col max-h-[85vh]">
        <div className="p-5 border-b border-zinc-100 flex items-center justify-between shrink-0">
          <h3 className="font-heading font-bold text-lg text-zinc-950">
            Kelola Kategori Menu
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto">
          {/* Add category input */}
          <form onSubmit={onAddCategory} className="flex gap-2">
            <input
              type="text"
              placeholder="Nama kategori baru..."
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="flex-1 h-10 px-3.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs sm:text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[var(--leaf)]/40"
            />
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isPending || !newCategoryName.trim()}
              className="gap-1.5 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah</span>
            </Button>
          </form>

          {/* Categories list */}
          <div className="space-y-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 block">
              Daftar Kategori ({categories.length})
            </span>

            <div className="divide-y divide-zinc-100 border border-zinc-200 rounded-2xl overflow-hidden">
              {categories.map((cat) => {
                const isEditing = editingCategory?.id === cat.id;

                return (
                  <div
                    key={cat.id}
                    className="p-3 flex items-center justify-between gap-2 hover:bg-zinc-50 transition-colors"
                  >
                    {isEditing ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          value={editingCategory.name}
                          onChange={(e) =>
                            setEditingCategory({
                              ...editingCategory,
                              name: e.target.value,
                            })
                          }
                          className="h-8 px-2.5 rounded-lg border border-[var(--leaf)] text-xs text-zinc-900 flex-1 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateCategory(cat.id, editingCategory.name)
                          }
                          className="px-2 py-1 rounded bg-[var(--leaf)] text-white text-xs font-semibold cursor-pointer"
                        >
                          Simpan
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingCategory(null)}
                          className="px-2 py-1 rounded text-zinc-500 hover:bg-zinc-200 text-xs cursor-pointer"
                        >
                          Batal
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 min-w-0">
                          <Tag className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          <span className="text-xs sm:text-sm font-semibold text-zinc-900 truncate">
                            {cat.name}
                          </span>
                          <span className="text-[10px] text-zinc-400 font-mono">
                            ({cat.product_count ?? 0} item)
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              setEditingCategory({ id: cat.id, name: cat.name })
                            }
                            className="p-1 rounded text-zinc-400 hover:text-zinc-900 hover:bg-zinc-200/60 cursor-pointer"
                            title="Edit nama"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteCategory(cat.id, cat.name)}
                            className="p-1 rounded text-zinc-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                            title="Hapus kategori"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
