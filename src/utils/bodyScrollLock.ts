let locks = 0

/** Increment lock count and hide document scroll when the first lock is taken. */
export function lockBodyScroll(): void {
  if (typeof document === "undefined") return
  locks += 1
  if (locks === 1) {
    document.documentElement.style.overflow = "hidden"
    document.body.style.overflow = "hidden"
  }
}

/** Decrement; restore scroll when the last lock is released. Skips if nothing was locked. */
export function unlockBodyScroll(): void {
  if (typeof document === "undefined") return
  if (locks <= 0) return
  locks -= 1
  if (locks === 0) {
    document.documentElement.style.overflow = ""
    document.body.style.overflow = ""
  }
}
