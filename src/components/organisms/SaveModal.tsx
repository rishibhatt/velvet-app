"use client";

import { useEffect, useRef, useState } from "react";
import { VelvetImage } from "@/components/atoms/VelvetImage";
import {
  Check,
  FolderOpen,
  Edit3,
  Link2,
  Upload,
  StickyNote,
  Sparkles,
} from "lucide-react";
import { UI_LABELS } from "@/constants/ui-labels";
import { velvetToast } from "@/lib/toast";
import { Button } from "@/components/atoms/Button";
import { SegmentButton } from "@/components/atoms/SegmentButton";
import { ModalShell } from "@/components/organisms/ModalShell";
import { useDebounce } from "@/hooks/useDebounce";
import { useBoards } from "@/queries/board/queries";
import { useSaveItem } from "@/queries/item/mutations";
import {
  fetchUrlMetadata,
  suggestTags,
} from "@/services/metadata/metadata.service";
import { uploadImage } from "@/services/storage/storage.service";
import { useModalStore } from "@/store/modal.store";
import { getDomain } from "@/utils/url";
import { cn } from "@/lib/utils";

type SaveMode = "link" | "upload" | "note";

export function SaveModal() {
  const { saveModal, closeSaveModal } = useModalStore();
  const { data: boards = [], isError: boardsError } = useBoards();
  const [mode, setMode] = useState<SaveMode>("link");
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [boardId, setBoardId] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [source, setSource] = useState<string>("web");
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const tagsSectionRef = useRef<HTMLDivElement>(null);

  const debouncedUrl = useDebounce(url, 500);
  const saveItem = useSaveItem(boardId || boards[0]?.id || "");

  useEffect(() => {
    if (saveModal.boardId) setBoardId(saveModal.boardId);
    else if (boards[0]) setBoardId(boards[0].id);
  }, [saveModal.boardId, boards]);

  useEffect(() => {
    if (mode !== "link" || !debouncedUrl) return;
    fetchUrlMetadata(debouncedUrl)
      .then((meta) => {
        setTitle(meta.title);
        setImageUrl(meta.imageUrl);
        setSource(meta.source);
        suggestTags(meta.title).then(setTags);
      })
      .catch(() => {
        setTitle(debouncedUrl);
        setSource("web");
        velvetToast.info("Couldn't fetch preview", "You can still save with a custom title.");
      });
  }, [debouncedUrl, mode]);

  useEffect(() => {
    if (tags.length > 0 && tagsSectionRef.current) {
      tagsSectionRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [tags.length]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      velvetToast.error("Invalid file", "Please choose JPEG, PNG, WebP, or GIF.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      velvetToast.error("File too large", "Image must be under 10MB.");
      return;
    }

    setLocalPreview(URL.createObjectURL(file));
    if (!title) setTitle(file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "));
    setSource("upload");
    setUploading(true);
    try {
      const publicUrl = await uploadImage(file, "items");
      setImageUrl(publicUrl);
      velvetToast.success("Image uploaded!");
      suggestTags(title || file.name).then(setTags);
    } catch (err) {
      velvetToast.fromError(err, "upload");
      setLocalPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleSave = async () => {
    const targetBoardId = boardId || boards[0]?.id;
    if (!targetBoardId) {
      velvetToast.error("No collection", "Create a board first before saving items.");
      return;
    }
    if (!title.trim()) {
      velvetToast.error("Title required", "Please add a title for this save.");
      return;
    }
    if (mode === "link" && !url && !imageUrl) {
      velvetToast.error("Link required", "Paste a URL or switch to Upload.");
      return;
    }
    if (mode === "upload" && !imageUrl) {
      velvetToast.error("Image required", "Upload an image first.");
      return;
    }
    if (mode === "note" && !notes.trim()) {
      velvetToast.error("Note empty", "Write something in your note.");
      return;
    }

    try {
      await saveItem.mutateAsync({
        boardId: targetBoardId,
        type: mode === "note" ? "note" : mode === "upload" ? "image" : "url",
        sourceUrl: mode === "link" ? url || undefined : undefined,
        imageUrl: imageUrl ?? undefined,
        title: title.trim(),
        description: mode === "note" ? notes.trim() : undefined,
        notes: mode === "note" ? notes.trim() : notes,
        source: mode === "note" ? "web" : (source as never),
        tags: selectedTags,
      });
      setSaved(true);
      velvetToast.success("Saved!", "Added to your collection.");
      setTimeout(() => {
        closeSaveModal();
        resetForm();
      }, 1200);
    } catch {
      /* useSaveItem onError shows toast */
    }
  };

  const resetForm = () => {
    setSaved(false);
    setUrl("");
    setTitle("");
    setNotes("");
    setImageUrl(null);
    setLocalPreview(null);
    setSelectedTags([]);
    setTags([]);
    setMode("link");
  };

  const previewSrc = localPreview || imageUrl;
  const tagColors = [
    "bg-tertiary-fixed text-on-tertiary-fixed-variant",
    "bg-secondary-fixed text-on-secondary-fixed-variant",
    "bg-primary-fixed text-on-primary-fixed-variant",
  ];

  const saveFooter = (
    <Button
      onClick={handleSave}
      size="lg"
      icon={saved ? Check : undefined}
      loading={saveItem.isPending || uploading}
      disabled={boards.length === 0}
      className={cn("w-full", saved && "!bg-green-600 !text-white")}
    >
      {saved ? "Saved!" : UI_LABELS.saveToCollection}
    </Button>
  );

  return (
    <ModalShell
      open={saveModal.open}
      onClose={() => {
        closeSaveModal();
        resetForm();
      }}
      title="Save to collection"
      subtitle="Paste a link, upload an image, or write a note"
      className="max-w-[520px] sm:mx-auto"
      contentClassName="p-0"
      footer={saveFooter}
    >
      <div className="border-b border-outline-variant/15 bg-surface-container-low/40 p-4 sm:p-6">
        <SegmentButton
          options={[
            { value: "link", label: "Link" },
            { value: "upload", label: "Image" },
            { value: "note", label: "Note" },
          ]}
          value={mode}
          onChange={(v) => setMode(v as SaveMode)}
          className="mb-4"
        />

        {mode === "note" ? (
          <div className="rounded-xl border border-outline-variant/40 bg-bg-elevated p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary">
              <StickyNote className="h-4 w-4" />
              Text note
            </div>
            <textarea
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                if (!title) setTitle(e.target.value.slice(0, 60) || "Note");
              }}
              placeholder="Write your note — ideas, reminders, context..."
              rows={4}
              className="w-full resize-none text-sm focus:outline-none"
              aria-label="Note content"
            />
          </div>
        ) : mode === "link" ? (
          <div className="relative">
            <Link2 className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-primary" />
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://instagram.com/..."
              className="w-full rounded-xl border border-outline-variant/40 bg-bg-elevated py-3 pr-4 pl-11 text-sm focus:border-primary focus:outline-none"
              aria-label="URL to save"
            />
          </div>
        ) : (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary/40 bg-bg-elevated py-8 transition-colors hover:border-primary hover:bg-primary/5"
            >
              <Upload className="h-8 w-8 text-primary" />
              <span className="text-sm font-semibold text-primary">
                {uploading ? "Uploading..." : "Choose image from device"}
              </span>
              <span className="text-xs text-on-surface-variant">
                JPEG, PNG, WebP, GIF — max 10MB
              </span>
            </button>
          </div>
        )}

        <div className="mt-4 flex gap-4">
          <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl border border-outline-variant/20 bg-surface-container shadow-sm">
            {previewSrc ? (
              <VelvetImage src={previewSrc} alt="" fill className="object-cover" />
            ) : mode === "note" && notes ? (
              <div className="flex h-full items-center justify-center p-2 text-center text-[10px] text-on-surface-variant line-clamp-4">
                {notes}
              </div>
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-on-surface-variant">
                Preview
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <span className="mb-1 block text-xs font-bold tracking-widest text-primary uppercase">
              {mode === "upload" ? "Upload" : "New Save"}
            </span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter title..."
              className="w-full border-none bg-transparent p-0 font-display text-lg leading-tight text-on-surface focus:outline-none"
              aria-label="Item title"
            />
            {url && mode === "link" && (
              <p className="mt-1 truncate text-sm text-on-surface-variant">
                via {getDomain(url)}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-5 p-4 sm:space-y-6 sm:p-6 sm:pt-2">
        {boardsError && (
          <p className="rounded-xl bg-error/10 px-4 py-3 text-sm text-error">
            Could not load boards. Run migration 003 in Supabase SQL Editor (see /setup).
          </p>
        )}

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-on-surface">
            <FolderOpen className="h-4 w-4 text-primary" />
            Collection
          </label>
          <select
            value={boardId}
            onChange={(e) => setBoardId(e.target.value)}
            className="w-full rounded-xl border border-outline-variant/40 bg-bg-elevated px-4 py-3 font-medium text-on-surface focus:border-primary focus:outline-none"
            aria-label="Select board"
          >
            {boards.length === 0 && (
              <option value="">No boards — create one first</option>
            )}
            {boards.map((board) => (
              <option key={board.id} value={board.id}>
                {board.title}
              </option>
            ))}
          </select>
        </div>

        {mode !== "note" && (
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-on-surface">
              <Edit3 className="h-4 w-4 text-primary" />
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add a few words about why you saved this..."
              rows={3}
              className="w-full resize-none rounded-xl border border-outline-variant/40 bg-bg-elevated px-4 py-3 focus:border-primary focus:outline-none"
              aria-label="Notes"
            />
          </div>
        )}

        {tags.length > 0 && (
          <div ref={tagsSectionRef} className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-on-surface">
              <Sparkles className="h-4 w-4 text-primary" />
              AI Suggestions
            </label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, i) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-sm font-medium transition-all",
                    selectedTags.includes(tag)
                      ? tagColors[i % tagColors.length]
                      : "border border-outline-variant/40 bg-bg-elevated text-on-surface hover:border-primary",
                  )}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </ModalShell>
  );
}
