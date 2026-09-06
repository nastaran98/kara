'use client'

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
import { useState, useTransition } from "react"
import { createPracticeAction } from "@/server/actions/practice.actions"
import { CreatePracticeInput } from "@/domain/types"

type PracticeType = 'ACT' | 'SIT' | 'NOTICE' | 'KEEP'

const TYPES: PracticeType[] = ['ACT', 'SIT', 'NOTICE', 'KEEP']

// KEEP has no title field — cue + behavior stand in for it, so it's intentionally empty.
const TITLE_LABEL: Record<PracticeType, string> = {
  ACT: 'What to do',
  SIT: 'The question',
  NOTICE: 'What to notice for',
  KEEP: '',
}

const TITLE_PLACEHOLDER: Record<PracticeType, string> = {
  ACT: 'e.g. Write three habits to break',
  SIT: 'e.g. What are you avoiding right now?',
  NOTICE: 'e.g. Each time you feel defensive',
  KEEP: '',
}

// null = no body field at all for this type (KEEP)
const BODY_LABEL: Record<PracticeType, string | null> = {
  ACT: 'Instruction',
  SIT: 'Context (optional)',
  NOTICE: 'Framing (optional)',
  KEEP: null,
}

const selectClass =
  "border-input h-9 w-full rounded-[10px] border bg-transparent px-3 text-sm"

// Each type's selected-state color. Unselected buttons stay neutral
// (surface + border) so the palette only appears once you commit to a type.
const TYPE_COLOR_CLASS: Record<PracticeType, string> = {
  ACT: 'bg-act text-act-fg border-act',
  SIT: 'bg-sit text-sit-fg border-sit',
  NOTICE: 'bg-notice text-notice-fg border-notice',
  KEEP: 'bg-keep text-keep-fg border-keep',
}

export function AddLearningButton({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<PracticeType>('ACT')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(formData: FormData) {
    setError(null)

    const payload = buildPayload(selectedType, formData)
    const validationError = validateClientSide(selectedType, payload)
    if (validationError) {
      setError(validationError)
      return
    }

    startTransition(async () => {
      const result = await createPracticeAction(userId, payload)
      console.log(result)
      // if (!result) {
      //   setError(result.error)
      //   return
      // }
      setOpen(false)
      setSelectedType('ACT')
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger render={<Button variant="outline">Add New Learning</Button>} />
        <DialogContent className="sm:max-w-sm rounded-md">
      <form action={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add a learning</DialogTitle>
            <DialogDescription>
              Something you want to do, think about, notice, or keep.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup>
            <Field>
              <div className="grid grid-cols-4 gap-2">
                {TYPES.map((type) => (
                  <Button
                    key={type}
                    type="button"
                    variant="outline"
                    onClick={() => setSelectedType(type)}
                    className={`rounded-[10px] border ${
                      selectedType === type
                        ? TYPE_COLOR_CLASS[type]
                        : 'bg-surface text-fg-muted border-border'
                    }`}
                  >
                    {type[0] + type.slice(1).toLowerCase()}
                  </Button>
                ))}
              </div>
            </Field>

            {selectedType !== 'KEEP' && (
              <Field>
                <Label htmlFor="title">
                  {TITLE_LABEL[selectedType]} <span className="text-accent">*</span>
                </Label>
                <Input id="title" name="title" placeholder={TITLE_PLACEHOLDER[selectedType]} />
              </Field>
            )}

            {BODY_LABEL[selectedType] !== null && (
              <Field>
                <Label htmlFor="body">{BODY_LABEL[selectedType]}</Label>
                <Input id="body" name="body" placeholder="A line or two of context" />
              </Field>
            )}

            {selectedType === 'ACT' && (
              <>
                <Field>
                  <Label htmlFor="minutes">
                    Minutes <span className="text-accent">*</span>
                  </Label>
                  <Input id="minutes" name="minutes" type="number" min={1} max={20} placeholder="10" />
                </Field>
                <Field>
                  <Label htmlFor="requiresOther" className="flex items-center gap-2 font-normal">
                    <input id="requiresOther" name="requiresOther" type="checkbox" className="h-4 w-4" />
                    Needs another person
                  </Label>
                </Field>
              </>
            )}

            {selectedType === 'SIT' && (
              <>
                <Field>
                  <Label htmlFor="suggestedMinutes">
                    Suggested duration <span className="text-accent">*</span>
                  </Label>
                  <select id="suggestedMinutes" name="suggestedMinutes" className={selectClass} defaultValue="">
                    <option value="" disabled>Choose one</option>
                    <option value="5">5 min</option>
                    <option value="10">10 min</option>
                    <option value="15">15 min</option>
                    <option value="20">20 min</option>
                  </select>
                </Field>
                <Field>
                  <Label htmlFor="revisitAfterDays">Bring it back</Label>
                  <select id="revisitAfterDays" name="revisitAfterDays" className={selectClass} defaultValue="">
                    <option value="">Never</option>
                    <option value="30">After 30 days</option>
                    <option value="60">After 60 days</option>
                    <option value="90">After 90 days</option>
                  </select>
                </Field>
              </>
            )}

            {selectedType === 'NOTICE' && (
              <Field>
                <Label htmlFor="tallyLabel">Tally label</Label>
                <Input id="tallyLabel" name="tallyLabel" placeholder="e.g. defensive" />
              </Field>
            )}

            {selectedType === 'KEEP' && (
              <>
                <Field>
                  <Label htmlFor="cue">
                    Cue <span className="text-accent">*</span>
                  </Label>
                  <Input id="cue" name="cue" placeholder="e.g. After coffee" />
                </Field>
                <Field>
                  <Label htmlFor="behavior">
                    Behaviour <span className="text-accent">*</span>
                  </Label>
                  <Input id="behavior" name="behavior" placeholder="e.g. Two minutes of stretching" />
                </Field>
                <div className="grid grid-cols-2 gap-2">
                  <Field>
                    <Label htmlFor="polarity">
                      Polarity <span className="text-accent">*</span>
                    </Label>
                    <select id="polarity" name="polarity" className={selectClass} defaultValue="do">
                      <option value="do">Do</option>
                      <option value="avoid">Avoid</option>
                    </select>
                  </Field>
                  <Field>
                    <Label htmlFor="targetDays">
                      Days <span className="text-accent">*</span>
                    </Label>
                    <select id="targetDays" name="targetDays" className={selectClass} defaultValue="">
                      <option value="" disabled>Choose</option>
                      <option value="7">7</option>
                      <option value="14">14</option>
                      <option value="21">21</option>
                      <option value="30">30</option>
                    </select>
                  </Field>
                </div>
              </>
            )}

            <div className="border-t pt-3 mt-1">
              <p className="text-sm text-muted-foreground mb-2">Where did this come from?</p>
              <Field>
                <select id="sourceType" name="sourceType" className={`${selectClass} mb-2`} defaultValue="">
                  <option value="">Source type</option>
                  <option value="book">Book</option>
                  <option value="podcast">Podcast</option>
                  <option value="video">Video</option>
                  <option value="course">Course</option>
                  <option value="conversation">Conversation</option>
                  <option value="original">My own</option>
                </select>
                <div className="grid grid-cols-2 gap-2">
                  <Input name="sourceTitle" placeholder="Title" />
                  <Input name="sourceAuthor" placeholder="Author" />
                </div>
              </Field>
            </div>

            <Field>
              <Label htmlFor="themeTags">Theme tags</Label>
              <Input id="themeTags" name="themeTags" placeholder="work, anxiety, relationships" />
            </Field>

            {error && <p className="text-sm text-accent">{error}</p>}
          </FieldGroup>

          <DialogFooter>
            <DialogClose render={<Button className="rounded-[10px]" variant="outline" type="button">Cancel</Button>} />
            <Button className="rounded-[10px]" type="submit" disabled={isPending}>
              {isPending ? 'Saving…' : 'Save to my pool'}
            </Button>
          </DialogFooter>
      </form>
      </DialogContent>
    </Dialog>
  )
}

// ---- payload assembly --------------------------------------------------
// Client-side validation here is a UX nicety only — the server action
// must re-validate independently. Never trust a Server Action's input
// just because it came from your own form; it's a public network endpoint.

function buildPayload(type: PracticeType, formData: FormData): CreatePracticeInput {
  const themeTags = ((formData.get('themeTags') as string) ?? '')
    .split(',').map(s => s.trim()).filter(Boolean)

  const base = {
    type,
    themeTags,
    sourceType: (formData.get('sourceType') as string) || undefined,
    sourceTitle: (formData.get('sourceTitle') as string) || undefined,
    sourceAuthor: (formData.get('sourceAuthor') as string) || undefined,
  }

  switch (type) {
    case 'ACT':
      return {
        ...base,
        title: formData.get('title') as string,
        body: formData.get('body') as string,
        minutes: Number(formData.get('minutes')),
        requiresOther: formData.get('requiresOther') === 'on',
      }
    case 'SIT':
      return {
        ...base,
        title: formData.get('title') as string,
        body: (formData.get('body') as string) || undefined,
        suggestedMinutes: Number(formData.get('suggestedMinutes')),
        revisitAfterDays: formData.get('revisitAfterDays')
          ? Number(formData.get('revisitAfterDays'))
          : null,
      }
    case 'NOTICE':
      return {
        ...base,
        noticeFor: formData.get('title') as string,
        body: (formData.get('body') as string) || undefined,
        tallyLabel: (formData.get('tallyLabel') as string) || undefined,
      }
    case 'KEEP':
      return {
        ...base,
        cue: formData.get('cue') as string,
        behavior: formData.get('behavior') as string,
        polarity: formData.get('polarity') as 'do' | 'avoid',
        targetDays: Number(formData.get('targetDays')),
      }
  }
}

function validateClientSide(type: PracticeType, payload: CreatePracticeInput): string | null {
  if (type !== 'KEEP' && !('title' in payload ? payload.title : (payload as any).noticeFor)?.trim?.())
    return type === 'NOTICE' ? 'Enter what to notice for.' : 'Enter a title.'
  if (type === 'ACT' && !(payload as any).minutes) return 'Enter a time estimate.'
  if (type === 'SIT' && !(payload as any).suggestedMinutes) return 'Choose a duration.'
  if (type === 'KEEP') {
    const p = payload as any
    if (!p.cue?.trim()) return 'Enter a cue.'
    if (!p.behavior?.trim()) return 'Enter a behaviour.'
    if (!p.targetDays) return 'Choose a day count.'
  }
  return null
}