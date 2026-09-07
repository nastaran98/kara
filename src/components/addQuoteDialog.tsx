"use client"

import { useState, useTransition } from "react"
import { useLocale } from "next-intl"
import { ClipboardPaste, Pencil, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  addQuoteAction,
  addQuotesBulkAction,
} from "@/server/actions/quote.actions"
import { splitPastedQuotes, type AddQuoteInput } from "@/lib/quoteSchema"

type SourceType =
  | "book"
  | "fiction"
  | "film"
  | "podcast"
  | "talk"
  | "person"
  | "unknown"

const SOURCE_TYPE_OPTIONS: { value: SourceType; label: string }[] = [
  { value: "unknown", label: "Not sure yet" },
  { value: "book", label: "Book" },
  { value: "fiction", label: "Fiction" },
  { value: "film", label: "Film" },
  { value: "podcast", label: "Podcast" },
  { value: "talk", label: "Talk" },
  { value: "person", label: "Person" },
]

const selectClass =
  "border-input h-9 w-full rounded-[10px] border bg-transparent px-3 text-sm"

type Mode = "single" | "paste"
type PasteStep = "paste" | "confirm"

type DraftQuote = AddQuoteInput & { key: string }

function emptyDraft(text: string): DraftQuote {
  return {
    key: crypto.randomUUID(),
    text,
    author: undefined,
    sourceTitle: undefined,
    sourceType: "unknown",
    themeTags: [],
  }
}

function parseThemeTags(raw: string): string[] {
  return raw
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
}

export function AddQuoteButton({ userId }: { userId: string }) {
  const locale = useLocale()
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<Mode>("single")
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Paste-mode state
  const [pasteStep, setPasteStep] = useState<PasteStep>("paste")
  const [rawPaste, setRawPaste] = useState("")
  const [drafts, setDrafts] = useState<DraftQuote[]>([])

  function reset() {
    setError(null)
    setMode("single")
    setPasteStep("paste")
    setRawPaste("")
    setDrafts([])
  }

  function handleSingleSubmit(formData: FormData) {
    setError(null)

    const text = ((formData.get("text") as string) || "").trim()
    if (!text) {
      setError("Enter the quote.")
      return
    }

    const payload: AddQuoteInput = {
      text,
      author: ((formData.get("author") as string) || "").trim() || undefined,
      sourceTitle:
        ((formData.get("sourceTitle") as string) || "").trim() || undefined,
      sourceType: (formData.get("sourceType") as SourceType) || "unknown",
      themeTags: parseThemeTags((formData.get("themeTags") as string) || ""),
    }

    startTransition(async () => {
      const result = await addQuoteAction(locale, userId, payload)
      if (!result.ok) {
        setError(result.error)
        return
      }
      setOpen(false)
      reset()
    })
  }

  function handleSplit() {
    const blocks = splitPastedQuotes(rawPaste)
    if (blocks.length === 0) {
      setError("Paste at least one quote.")
      return
    }
    setError(null)
    setDrafts(blocks.map(emptyDraft))
    setPasteStep("confirm")
  }

  function updateDraft(key: string, patch: Partial<DraftQuote>) {
    setDrafts((rows) =>
      rows.map((row) => (row.key === key ? { ...row, ...patch } : row)),
    )
  }

  function removeDraft(key: string) {
    setDrafts((rows) => rows.filter((row) => row.key !== key))
  }

  // Merges a row back into the one above it — the fix for a paste that
  // split one quote across a stray blank line.
  function mergeWithPrevious(key: string) {
    setDrafts((rows) => {
      const index = rows.findIndex((row) => row.key === key)
      if (index <= 0) return rows

      const merged: DraftQuote = {
        ...rows[index - 1],
        text: `${rows[index - 1].text}\n\n${rows[index].text}`,
      }

      return [
        ...rows.slice(0, index - 1),
        merged,
        ...rows.slice(index + 1),
      ]
    })
  }

  function handleConfirmImport() {
    setError(null)

    const quotes = drafts
      .map((draft) => ({ ...draft, text: draft.text.trim() }))
      .filter((draft) => draft.text.length > 0)

    if (quotes.length === 0) {
      setError("Nothing to import.")
      return
    }

    startTransition(async () => {
      const result = await addQuotesBulkAction(locale, userId, { quotes })
      if (!result.ok) {
        setError(result.error)
        return
      }
      setOpen(false)
      reset()
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) reset()
      }}
    >
      <DialogTrigger render={<Button>Add a quote</Button>} />
      <DialogContent className="sm:max-w-md rounded-md">
        <DialogHeader>
          <DialogTitle>Add a quote</DialogTitle>
          <DialogDescription>
            Just the words are enough — everything else is optional.
          </DialogDescription>
        </DialogHeader>

        {mode === "single" || pasteStep === "paste" ? (
          <div className="mb-1 grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setMode("single")}
              className={`rounded-[10px] border ${
                mode === "single"
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border bg-surface text-fg-muted"
              }`}
            >
              <Pencil className="size-4" strokeWidth={1.6} />
              One quote
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setMode("paste")}
              className={`rounded-[10px] border ${
                mode === "paste"
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border bg-surface text-fg-muted"
              }`}
            >
              <ClipboardPaste className="size-4" strokeWidth={1.6} />
              Paste multiple
            </Button>
          </div>
        ) : null}

        {mode === "single" && (
          <form action={handleSingleSubmit}>
            <FieldGroup>
              <Field>
                <Label htmlFor="text">
                  Quote <span className="text-accent">*</span>
                </Label>
                <textarea
                  id="text"
                  name="text"
                  rows={4}
                  required
                  placeholder="The words worth keeping…"
                  className="border-input w-full resize-none rounded-[10px] border bg-transparent px-3 py-2 text-sm"
                />
              </Field>

              <div className="grid grid-cols-2 gap-2">
                <Field>
                  <Label htmlFor="author">Author</Label>
                  <Input id="author" name="author" placeholder="Optional" />
                </Field>
                <Field>
                  <Label htmlFor="sourceTitle">Source</Label>
                  <Input
                    id="sourceTitle"
                    name="sourceTitle"
                    placeholder="Book, film…"
                  />
                </Field>
              </div>

              <Field>
                <Label htmlFor="sourceType">Kind of source</Label>
                <select
                  id="sourceType"
                  name="sourceType"
                  className={selectClass}
                  defaultValue="unknown"
                >
                  {SOURCE_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field>
                <Label htmlFor="themeTags">Theme tags</Label>
                <Input
                  id="themeTags"
                  name="themeTags"
                  placeholder="courage, work, love"
                />
              </Field>

              {error && <p className="text-sm text-accent">{error}</p>}
            </FieldGroup>

            <DialogFooter className="mt-2">
              <DialogClose
                render={
                  <Button
                    className="rounded-[10px]"
                    variant="outline"
                    type="button"
                  >
                    Cancel
                  </Button>
                }
              />
              <Button
                className="rounded-[10px]"
                type="submit"
                disabled={isPending}
              >
                {isPending ? "Saving…" : "Save quote"}
              </Button>
            </DialogFooter>
          </form>
        )}

        {mode === "paste" && pasteStep === "paste" && (
          <div>
            <FieldGroup>
              <Field>
                <Label htmlFor="rawPaste">Paste quotes</Label>
                <textarea
                  id="rawPaste"
                  rows={8}
                  value={rawPaste}
                  onChange={(event) => setRawPaste(event.target.value)}
                  placeholder={
                    "One quote per block, separated by a blank line:\n\nQuote one.\n\nQuote two."
                  }
                  className="border-input w-full resize-none rounded-[10px] border bg-transparent px-3 py-2 text-sm"
                />
              </Field>
              {error && <p className="text-sm text-accent">{error}</p>}
            </FieldGroup>

            <DialogFooter className="mt-2">
              <DialogClose
                render={
                  <Button
                    className="rounded-[10px]"
                    variant="outline"
                    type="button"
                  >
                    Cancel
                  </Button>
                }
              />
              <Button
                className="rounded-[10px]"
                type="button"
                onClick={handleSplit}
              >
                Split into quotes
              </Button>
            </DialogFooter>
          </div>
        )}

        {mode === "paste" && pasteStep === "confirm" && (
          <div>
            <p className="mb-3 text-xs text-fg-muted">
              {drafts.length} quote{drafts.length === 1 ? "" : "s"} found.
              Fix a bad split, or edit any row before saving.
            </p>

            <div className="max-h-[45vh] space-y-3 overflow-y-auto pe-1">
              {drafts.map((draft, index) => (
                <div
                  key={draft.key}
                  className="rounded-[10px] border border-border bg-bg p-3"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-medium text-fg-muted">
                      Quote {index + 1}
                    </span>
                    <div className="flex items-center gap-2">
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => mergeWithPrevious(draft.key)}
                          className="text-xs text-accent hover:underline"
                        >
                          Merge with above
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeDraft(draft.key)}
                        aria-label="Remove"
                        className="text-fg-muted hover:text-fg"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  </div>

                  <textarea
                    rows={2}
                    value={draft.text}
                    onChange={(event) =>
                      updateDraft(draft.key, { text: event.target.value })
                    }
                    className="border-input mb-2 w-full resize-none rounded-lg border bg-transparent px-2.5 py-1.5 text-sm"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={draft.author ?? ""}
                      onChange={(event) =>
                        updateDraft(draft.key, {
                          author: event.target.value || undefined,
                        })
                      }
                      placeholder="Author"
                      className="h-8 text-xs"
                    />
                    <Input
                      value={draft.sourceTitle ?? ""}
                      onChange={(event) =>
                        updateDraft(draft.key, {
                          sourceTitle: event.target.value || undefined,
                        })
                      }
                      placeholder="Source"
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>

            {error && <p className="mt-2 text-sm text-accent">{error}</p>}

            <DialogFooter className="mt-3">
              <Button
                className="rounded-[10px]"
                variant="outline"
                type="button"
                onClick={() => setPasteStep("paste")}
              >
                Back
              </Button>
              <Button
                className="rounded-[10px]"
                type="button"
                onClick={handleConfirmImport}
                disabled={isPending || drafts.length === 0}
              >
                {isPending
                  ? "Saving…"
                  : `Save ${drafts.length} quote${drafts.length === 1 ? "" : "s"}`}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
