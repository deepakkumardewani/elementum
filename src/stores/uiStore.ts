import { defineStore } from "pinia"
import { ref } from "vue"
import type { TrendProperty } from "@/types/element"

export const useUiStore = defineStore("ui", () => {
  const activeTrendProperty = ref<TrendProperty>("atomicRadius")
  const sidebarOpen = ref(false)

  function setTrendProperty(prop: TrendProperty) {
    activeTrendProperty.value = prop
  }

  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value
  }

  return {
    activeTrendProperty,
    sidebarOpen,
    setTrendProperty,
    toggleSidebar,
  }
})
