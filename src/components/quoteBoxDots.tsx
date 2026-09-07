// A quiet way to show progress through the Leitner boxes — a few dots,
// not a number. Per KARA-44: shown quietly, not loudly.
export function QuoteBoxDots({ box }: { box: number }) {
  return (
    <div className="flex items-center gap-1" title={`Box ${box} of 5`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <span
          key={index}
          className={`size-1.5 rounded-full ${
            index < box ? "bg-accent" : "bg-border"
          }`}
        />
      ))}
    </div>
  )
}
