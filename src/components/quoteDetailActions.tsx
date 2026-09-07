"use client"

import { useState } from "react"
import { Check, Copy, Share2 } from "lucide-react"

import { Button } from "@/components/ui/button"

type Props = {
  text: string
  author?: string | null
  ready: boolean
}

function formatForSharing(text: string, author?: string | null) {
  return author ? `“${text}”\n— ${author}` : `“${text}”`
}

// Renders the quote onto a canvas and either hands it to the OS share
// sheet (mobile) or downloads it as a PNG (desktop) — a Ready quote's one
// small reward for having actually been learned.
async function shareAsImage(text: string, author?: string | null) {
  const width = 1080
  const height = 1080
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  ctx.fillStyle = "#f7f3ee"
  ctx.fillRect(0, 0, width, height)

  ctx.fillStyle = "#322e2a"
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"

  const maxWidth = width - 200
  const fontSize = text.length > 160 ? 40 : 52
  ctx.font = `500 ${fontSize}px Georgia, serif`

  const words = text.split(" ")
  const lines: string[] = []
  let line = ""
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line)
      line = word
    } else {
      line = test
    }
  }
  if (line) lines.push(line)

  const totalHeight = lines.length * (fontSize * 1.35)
  const startY = height / 2 - totalHeight / 2 - (author ? 40 : 0)

  lines.forEach((l, index) => {
    ctx.fillText(l, width / 2, startY + index * (fontSize * 1.35))
  })

  if (author) {
    ctx.font = `400 ${Math.round(fontSize * 0.5)}px Georgia, serif`
    ctx.fillStyle = "#8a8078"
    ctx.fillText(
      `— ${author}`,
      width / 2,
      startY + lines.length * (fontSize * 1.35) + 50,
    )
  }

  const blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/png"),
  )
  if (!blob) return

  const file = new File([blob], "quote.png", { type: "image/png" })

  if (
    typeof navigator !== "undefined" &&
    "share" in navigator &&
    "canShare" in navigator &&
    (navigator as Navigator & { canShare: (data: { files: File[] }) => boolean }).canShare({
      files: [file],
    })
  ) {
    await (navigator as unknown as { share: (data: { files: File[] }) => Promise<void> }).share({
      files: [file],
    })
    return
  }

  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = "quote.png"
  link.click()
  URL.revokeObjectURL(url)
}

export function QuoteDetailActions({ text, author, ready }: Props) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formatForSharing(text, author))
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard access denied — nothing destructive to fall back to.
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" className="rounded-[10px]" onClick={handleCopy}>
        {copied ? (
          <Check className="size-4" strokeWidth={1.8} />
        ) : (
          <Copy className="size-4" strokeWidth={1.6} />
        )}
        {copied ? "Copied" : "Copy"}
      </Button>

      {ready && (
        <Button
          variant="outline"
          className="rounded-[10px]"
          onClick={() => shareAsImage(text, author)}
        >
          <Share2 className="size-4" strokeWidth={1.6} />
          Share as image
        </Button>
      )}
    </div>
  )
}
