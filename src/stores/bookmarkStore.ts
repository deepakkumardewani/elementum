import { useLocalStorage } from "@vueuse/core"
import { defineStore } from "pinia"
import { computed } from "vue"

const STORAGE_KEY = "elementum-bookmarks"

export const useBookmarkStore = defineStore("bookmark", () => {
  const bookmarkedIds = useLocalStorage<number[]>(STORAGE_KEY, [])

  const bookmarkCount = computed(() => bookmarkedIds.value.length)

  function toggleBookmark(atomicNumber: number): void {
    const next = new Set(bookmarkedIds.value)
    if (next.has(atomicNumber)) next.delete(atomicNumber)
    else next.add(atomicNumber)
    bookmarkedIds.value = [...next].sort((a, b) => a - b)
  }

  function isBookmarked(atomicNumber: number): boolean {
    return bookmarkedIds.value.includes(atomicNumber)
  }

  return {
    bookmarkedIds,
    bookmarkCount,
    toggleBookmark,
    isBookmarked,
  }
})
