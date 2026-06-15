// ============================================================================
// PocketForge — Custom Formats Page
// ============================================================================

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '../components/PageHeader';
import {
  Plus,
  Sparkles,
  Trash2,
  Pencil,
  Layers,
  Shield,
  SlidersHorizontal,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import type { CustomFormat } from '../types';
import CustomFormatEditor from '../components/CustomFormatEditor';
import EmptyState from '../components/EmptyState';

// ---- Format card ------------------------------------------------------------

function FormatCard({
  format,
  onEdit,
  onDelete,
}: {
  format: CustomFormat;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -60 }}
      className="bg-bg-secondary border border-border-subtle rounded-2xl p-4"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-title font-semibold text-text-primary truncate">
            {format.name}
          </h3>
          {format.description && (
            <p className="text-body text-text-secondary mt-0.5 truncate">
              {format.description}
            </p>
          )}
          <div className="flex flex-wrap gap-2 mt-2.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-bg-tertiary text-caption text-text-secondary">
              <Layers size={12} />
              Gen {format.generation || 9}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-bg-tertiary text-caption text-text-secondary">
              <Shield size={12} />
              {format.rules.length} rules
            </span>
            {format.restrictedDex && format.restrictedDex.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-warning/10 text-caption text-warning">
                <SlidersHorizontal size={12} />
                {format.restrictedDex.length} Pok&eacute;mon
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 ml-3">
          <button
            onClick={onEdit}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-bg-tertiary active:bg-bg-elevated transition-colors"
          >
            <Pencil size={16} className="text-text-secondary" />
          </button>
          <button
            onClick={onDelete}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-bg-tertiary active:bg-danger/20 transition-colors"
          >
            <Trash2 size={16} className="text-danger" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ---- Delete confirmation bottom sheet ---------------------------------------

function DeleteSheet({
  formatName,
  onConfirm,
  onCancel,
}: {
  formatName: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col justify-end bg-black/50"
      onClick={onCancel}
    >
      <motion.div
        initial={{ y: 200 }}
        animate={{ y: 0 }}
        exit={{ y: 200 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="bg-bg-secondary rounded-t-3xl p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full bg-text-tertiary/30 mx-auto" />
        <h2 className="text-headline font-semibold text-text-primary text-center">
          Delete &ldquo;{formatName}&rdquo;?
        </h2>
        <p className="text-body text-text-secondary text-center">
          Teams using this format will keep it, but the format definition will be removed.
        </p>
        <div className="flex gap-3 pt-2">
          <button
            onClick={onCancel}
            className="flex-1 h-12 rounded-xl bg-bg-tertiary text-text-primary font-medium text-sm active:scale-95 transition-transform"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 h-12 rounded-xl bg-danger text-white font-medium text-sm active:scale-95 transition-transform"
          >
            Delete
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ---- Main page --------------------------------------------------------------

export default function CustomFormatsPage() {
  const customFormats = useStore((s) => s.customFormats);
  const addCustomFormat = useStore((s) => s.addCustomFormat);
  const updateCustomFormat = useStore((s) => s.updateCustomFormat);
  const deleteCustomFormat = useStore((s) => s.deleteCustomFormat);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingFormat, setEditingFormat] = useState<CustomFormat | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleCreate = useCallback(() => {
    setEditingFormat(null);
    setEditorOpen(true);
  }, []);

  const handleEdit = useCallback((format: CustomFormat) => {
    setEditingFormat(format);
    setEditorOpen(true);
  }, []);

  const handleSave = useCallback(
    (data: Omit<CustomFormat, 'id' | 'createdAt'>) => {
      if (editingFormat) {
        updateCustomFormat(editingFormat.id, data);
      } else {
        addCustomFormat(data);
      }
    },
    [editingFormat, updateCustomFormat, addCustomFormat]
  );

  const handleDelete = useCallback(() => {
    if (deleteId) deleteCustomFormat(deleteId);
    setDeleteId(null);
  }, [deleteId, deleteCustomFormat]);

  const deleteFormat = customFormats.find((f) => f.id === deleteId);

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Custom Formats" backTo="/settings" backLabel="Settings">
        <button
          type="button"
          onClick={handleCreate}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-accent-primary text-white text-sm font-medium active:scale-95 transition-transform shrink-0"
        >
          <Plus size={16} />
          New
        </button>
      </PageHeader>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {customFormats.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center">
            <EmptyState
              icon={Sparkles}
              title="No Custom Formats"
              description="Create your own battle format for any regulation or tournament. No code needed."
              action={{ label: 'Create Format', onClick: handleCreate }}
            />
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {customFormats.map((format) => (
                <FormatCard
                  key={format.id}
                  format={format}
                  onEdit={() => handleEdit(format)}
                  onDelete={() => setDeleteId(format.id)}
                />
              ))}
            </AnimatePresence>
            <div className="h-4" />
          </div>
        )}
      </div>

      {/* Editor */}
      <CustomFormatEditor
        isOpen={editorOpen}
        onClose={() => setEditorOpen(false)}
        editingFormat={editingFormat}
        onSave={handleSave}
      />

      {/* Delete confirmation */}
      <AnimatePresence>
        {deleteId && deleteFormat && (
          <DeleteSheet
            formatName={deleteFormat.name}
            onConfirm={handleDelete}
            onCancel={() => setDeleteId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
