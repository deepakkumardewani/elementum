import { defineStore } from "pinia"
import { ref } from "vue"
import type { TableColorMode, TrendProperty } from "@/types/element"

/** Reads the saved theme from localStorage, defaulting to dark */
function getStoredTheme(): boolean {
  try {
    const saved = localStorage.getItem("elementum-theme")
    return saved !== null ? saved === "dark" : true
  } catch {
    return true
  }
}

/** Writes the <html data-theme> attribute so CSS tokens respond immediately */
function applyTheme(dark: boolean) {
  document.documentElement.setAttribute("data-theme", dark ? "dark" : "light")
  try {
    localStorage.setItem("elementum-theme", dark ? "dark" : "light")
  } catch {
    /* ignore */
  }
}

export const useUiStore = defineStore("ui", () => {
  const activeTrendProperty = ref<TrendProperty>("atomicRadius")
  /** Periodic table tile fill: category colors vs property gradient */
  const colorMode = ref<TableColorMode>("category")
  const sidebarOpen = ref(false)

  // Theme — true = dark (default), false = light
  const isDark = ref<boolean>(getStoredTheme())
  // Apply immediately on store init (avoids flash)
  applyTheme(isDark.value)

  function setTrendProperty(prop: TrendProperty) {
    activeTrendProperty.value = prop
  }

  function setColorMode(mode: TableColorMode) {
    colorMode.value = mode
  }

  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value
  }

  function toggleTheme() {
    isDark.value = !isDark.value
    applyTheme(isDark.value)
  }

  return {
    activeTrendProperty,
    colorMode,
    sidebarOpen,
    isDark,
    setTrendProperty,
    setColorMode,
    toggleSidebar,
    toggleTheme,
  }
})
