import type { Element } from "@/types/element"
import type { FlashcardQuestion, McqQuestion, QuizMode, QuizQuestion } from "@/types/quiz"

const DEFAULT_DECK_SIZE = 10
const CHALLENGE_DECK_SIZE = 48
const MCQ_OPTION_COUNT = 4
const MCQ_GENERATION_ATTEMPTS = 40

export interface RandomSource {
  next: () => number
}

export function createSeededRandom(seed: number): RandomSource {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return {
    next: () => {
      s = (s * 16807) % 2147483647
      return (s - 1) / 2147483646
    },
  }
}

function shuffle<T>(items: readonly T[], random: RandomSource): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random.next() * (i + 1))
    const a = copy[i]
    const b = copy[j]
    if (a === undefined || b === undefined) continue
    copy[i] = b
    copy[j] = a
  }
  return copy
}

/** Distractors prefer same category or adjacent period to the correct answer. */
export function pickDistractorElements(
  correct: Element,
  pool: readonly Element[],
  count: number,
  random: RandomSource,
): Element[] {
  const plausible = pool.filter((e) => {
    if (e.atomicNumber === correct.atomicNumber) return false
    const sameCategory = e.category === correct.category
    const adjacentPeriod = Math.abs(e.period - correct.period) <= 1
    return sameCategory || adjacentPeriod
  })

  const ordered = shuffle(plausible, random)
  const out: Element[] = []
  const seen = new Set<number>()
  for (const e of ordered) {
    if (out.length >= count) break
    if (!seen.has(e.atomicNumber)) {
      seen.add(e.atomicNumber)
      out.push(e)
    }
  }

  if (out.length < count) {
    const rest = shuffle(
      pool.filter((e) => e.atomicNumber !== correct.atomicNumber && !seen.has(e.atomicNumber)),
      random,
    )
    for (const e of rest) {
      if (out.length >= count) break
      seen.add(e.atomicNumber)
      out.push(e)
    }
  }

  return out.slice(0, count)
}

function buildMcq(
  prompt: string,
  correct: Element,
  distractors: Element[],
  explanation: string,
  random: RandomSource,
): McqQuestion | null {
  if (distractors.length < MCQ_OPTION_COUNT - 1) return null
  const options = shuffle([correct, ...distractors.slice(0, MCQ_OPTION_COUNT - 1)], random)
  const correctIndex = options.findIndex((e) => e.atomicNumber === correct.atomicNumber)
  if (correctIndex < 0) return null
  return {
    kind: "mcq",
    id: `mcq-${correct.atomicNumber}-${Math.floor(random.next() * 1e9)}`,
    prompt,
    options,
    correctIndex,
    explanation,
  }
}

function randomPeriod(elements: readonly Element[], random: RandomSource): number | null {
  const periods = new Set(elements.map((e) => e.period))
  const list = [...periods].filter((p) => p >= 2 && p <= 7)
  if (!list.length) return null
  const idx = Math.floor(random.next() * list.length)
  const picked = list[idx]
  if (picked === undefined) return null
  return picked
}

function mcqHighestElectronegativityInPeriod(
  elements: readonly Element[],
  random: RandomSource,
): McqQuestion | null {
  const period = randomPeriod(elements, random)
  if (period === null) return null
  const inPeriod = elements.filter((e) => e.period === period && e.electronegativity !== null)
  if (inPeriod.length < MCQ_OPTION_COUNT) return null
  const sorted = [...inPeriod].sort(
    (a, b) => (b.electronegativity ?? 0) - (a.electronegativity ?? 0),
  )
  const correct = sorted[0]
  if (!correct) return null
  const distractors = pickDistractorElements(correct, elements, MCQ_OPTION_COUNT - 1, random)
  const en = correct.electronegativity
  return buildMcq(
    `Which element has the highest electronegativity in period ${period}?`,
    correct,
    distractors,
    `${correct.name} has the strongest pull on shared electrons in period ${period}` +
      (en !== null ? ` (Pauling EN ≈ ${en}).` : "."),
    random,
  )
}

function mcqLowestElectronegativityInPeriod(
  elements: readonly Element[],
  random: RandomSource,
): McqQuestion | null {
  const period = randomPeriod(elements, random)
  if (period === null) return null
  const inPeriod = elements.filter((e) => e.period === period && e.electronegativity !== null)
  if (inPeriod.length < MCQ_OPTION_COUNT) return null
  const sorted = [...inPeriod].sort(
    (a, b) => (a.electronegativity ?? 0) - (b.electronegativity ?? 0),
  )
  const correct = sorted[0]
  if (!correct) return null
  const distractors = pickDistractorElements(correct, elements, MCQ_OPTION_COUNT - 1, random)
  const en = correct.electronegativity
  return buildMcq(
    `Which element has the lowest electronegativity in period ${period}?`,
    correct,
    distractors,
    `${correct.name} is the least electronegative among period ${period} elements with tabulated values` +
      (en !== null ? ` (Pauling EN ≈ ${en}).` : "."),
    random,
  )
}

function mcqSymbolToName(elements: readonly Element[], random: RandomSource): McqQuestion | null {
  const pool = elements.filter((e) => e.symbol.length <= 3)
  if (pool.length < MCQ_OPTION_COUNT) return null
  const pick = pool[Math.floor(random.next() * pool.length)]
  if (!pick) return null
  const correct = pick
  const distractors = pickDistractorElements(correct, elements, MCQ_OPTION_COUNT - 1, random)
  return buildMcq(
    `Which element has the symbol ${correct.symbol}?`,
    correct,
    distractors,
    `${correct.symbol} is ${correct.name}.`,
    random,
  )
}

function mcqAtomicNumber(elements: readonly Element[], random: RandomSource): McqQuestion | null {
  if (elements.length < MCQ_OPTION_COUNT) return null
  const pick = elements[Math.floor(random.next() * elements.length)]
  if (!pick) return null
  const correct = pick
  const distractors = pickDistractorElements(correct, elements, MCQ_OPTION_COUNT - 1, random)
  return buildMcq(
    `Which element has atomic number ${correct.atomicNumber}?`,
    correct,
    distractors,
    `Atomic number ${correct.atomicNumber} identifies ${correct.name} (${correct.symbol}).`,
    random,
  )
}

function mcqCategoryMember(elements: readonly Element[], random: RandomSource): McqQuestion | null {
  const categories = [
    "halogen",
    "noble gas",
    "alkali metal",
    "alkaline earth metal",
    "transition metal",
  ] as const
  const catPick = categories[Math.floor(random.next() * categories.length)]
  if (catPick === undefined) return null
  const cat = catPick
  const inCat = elements.filter((e) => e.category === cat)
  if (inCat.length < 1) return null
  const memberPick = inCat[Math.floor(random.next() * inCat.length)]
  if (!memberPick) return null
  const correct = memberPick
  const wrongPool = elements.filter((e) => e.category !== cat)
  const distractors = pickDistractorElements(correct, wrongPool, MCQ_OPTION_COUNT - 1, random)
  if (distractors.length < MCQ_OPTION_COUNT - 1) return null
  return buildMcq(
    `Which element is a ${cat}?`,
    correct,
    distractors,
    `${correct.name} is classified as a ${cat}.`,
    random,
  )
}

const MCQ_BUILDERS: readonly ((
  elements: readonly Element[],
  random: RandomSource,
) => McqQuestion | null)[] = [
  mcqHighestElectronegativityInPeriod,
  mcqLowestElectronegativityInPeriod,
  mcqSymbolToName,
  mcqAtomicNumber,
  mcqCategoryMember,
]

export function generateSingleMcqQuestion(
  elements: readonly Element[],
  random: RandomSource,
): McqQuestion | null {
  const builders = shuffle([...MCQ_BUILDERS], random)
  for (const builder of builders) {
    const q = builder(elements, random)
    if (q) return q
  }
  return null
}

export function generateMcqDeck(
  elements: readonly Element[],
  size: number,
  random: RandomSource,
): McqQuestion[] {
  const out: McqQuestion[] = []
  const seenIds = new Set<string>()
  let guard = 0
  while (out.length < size && guard < size * MCQ_GENERATION_ATTEMPTS) {
    guard++
    const q = generateSingleMcqQuestion(elements, random)
    if (!q) continue
    if (seenIds.has(q.id)) continue
    seenIds.add(q.id)
    out.push(q)
  }
  return out
}

export function generateFlashcardDeck(
  elements: readonly Element[],
  size: number,
  random: RandomSource,
): FlashcardQuestion[] {
  const shuffled = shuffle(elements, random)
  const slice = shuffled.slice(0, Math.min(size, shuffled.length))
  return slice.map((element, i) => ({
    kind: "flashcard",
    id: `flash-${element.atomicNumber}-${i}`,
    element,
  }))
}

export function generateQuizDeck(
  elements: readonly Element[],
  mode: QuizMode,
  random: RandomSource,
  deckSize: number = DEFAULT_DECK_SIZE,
): QuizQuestion[] {
  if (!elements.length) return []
  if (mode === "flashcard") {
    return generateFlashcardDeck(elements, deckSize, random)
  }
  const mcqSize = mode === "challenge" ? CHALLENGE_DECK_SIZE : deckSize
  return generateMcqDeck(elements, mcqSize, random)
}

export function assertMcqHasUniqueOptions(q: McqQuestion): boolean {
  const symbols = q.options.map((e) => e.symbol)
  return new Set(symbols).size === symbols.length
}
