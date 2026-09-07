"use client"

import { useState, useTransition } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { SlidersHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

const SOURCE_OPTIONS = [
  { value: "book", label: "Book" },
  { value: "fiction", label: "Fiction" },
  { value: "film", label: "Film" },
  { value: "podcast", label: "Podcast" },
  { value: "talk", label: "Talk" },
  { value: "person", label: "Person" },
] as const

const ORIGIN_OPTIONS = [
  { value: "mine", label: "Mine" },
  { value: "collection", label: "From a collection" },
] as const

type Props = {
  availableThemeTags: string[]
}

function chipClass(active: boolean) {
  return `
    rounded-full
    border
    px-3
    py-1.5
    text-xs
    font-medium
    transition
    ${
      active
        ? "border-accent bg-accent/10 text-accent"
        : "border-border bg-surface text-fg-muted hover:text-fg"
    }
  `
}

// Two facets, per the Browse & Filters design: theme (multi-select) and
// source (single-select + mine/collection). No Type or Depth here — those
// are practice-only concepts.
function FilterControls({
  availableThemeTags,
  onNavigate,
}: Props & { onNavigate?: () => void }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const activeThemes = new Set(
    (searchParams.get("theme") ?? "").split(",").filter(Boolean),
  )
  const activeSource = searchParams.get("source") ?? ""
  const activeOrigin = searchParams.get("origin") ?? ""
  const readyOnly = searchParams.get("ready") === "1"

  function pushParams(next: URLSearchParams) {
    startTransition(() => {
      router.push(`${pathname}?${next.toString()}`)
    })
    onNavigate?.()
  }

  function toggleTheme(tag: string) {
    const next = new Set(activeThemes)
    if (next.has(tag)) next.delete(tag)
    else next.add(tag)

    const params = new URLSearchParams(searchParams.toString())
    if (next.size > 0) params.set("theme", [...next].join(","))
    else params.delete("theme")
    pushParams(params)
  }

  function setSingle(key: "source" | "origin", value: string) {
    const params = new URLSearchParams(searchParams.toString())
    const current = params.get(key)
    if (current === value) params.delete(key)
    else params.set(key, value)
    pushParams(params)
  }

  function toggleReady() {
    const params = new URLSearchParams(searchParams.toString())
    if (readyOnly) params.delete("ready")
    else params.set("ready", "1")
    pushParams(params)
  }

  function clearAll() {
    pushParams(new URLSearchParams())
  }

  const hasFilters =
    activeThemes.size > 0 || activeSource || activeOrigin || readyOnly

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.08em] text-fg-muted">
          Theme
        </p>
        {availableThemeTags.length === 0 ? (
          <p className="text-xs text-fg-muted">No tags yet.</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {availableThemeTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTheme(tag)}
                className={chipClass(activeThemes.has(tag))}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.08em] text-fg-muted">
          Source
        </p>
        <div className="flex flex-wrap gap-1.5">
          {SOURCE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setSingle("source", option.value)}
              className={chipClass(activeSource === option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.08em] text-fg-muted">
          Whose
        </p>
        <div className="flex flex-wrap gap-1.5">
          {ORIGIN_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setSingle("origin", option.value)}
              className={chipClass(activeOrigin === option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <button
          type="button"
          onClick={toggleReady}
          className={chipClass(readyOnly)}
        >
          Ready only
        </button>
      </div>

      {hasFilters && (
        <button
          type="button"
          onClick={clearAll}
          className="text-xs text-fg-muted underline underline-offset-2 hover:text-fg"
        >
          Clear filters
        </button>
      )}
    </div>
  )
}

export function QuoteFilterBar({ availableThemeTags }: Props) {
  const [sheetOpen, setSheetOpen] = useState(false)

  return (
    <>
      {/* Desktop — inline */}
      <div className="hidden shrink-0 md:block md:w-[220px]">
        <FilterControls availableThemeTags={availableThemeTags} />
      </div>

      {/* Mobile — collapses into a sheet */}
      <div className="md:hidden">
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger
            render={
              <Button variant="outline" className="rounded-[10px]">
                <SlidersHorizontal className="size-4" strokeWidth={1.6} />
                Filters
              </Button>
            }
          />
          <SheetContent side="bottom" className="rounded-t-xl px-4 pb-6">
            <SheetHeader className="px-0">
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <FilterControls
              availableThemeTags={availableThemeTags}
              onNavigate={() => setSheetOpen(false)}
            />
            <SheetClose
              render={
                <Button variant="outline" className="mt-2 w-full rounded-[10px]">
                  Done
                </Button>
              }
            />
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
