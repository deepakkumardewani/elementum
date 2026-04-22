import { defineComponent, h } from "vue"

/**
 * Lightweight stub for `vue3-apexcharts` during Vitest runs (see vite.config alias).
 * Avoids pulling ApexCharts' SSR bundle into component tests.
 */
export default defineComponent({
  name: "VueApexCharts",
  props: {
    type: String,
    height: [String, Number],
    width: [String, Number],
    series: { type: Object, required: true },
    options: { type: Object, required: true },
  },
  setup() {
    return () => h("div", { class: "apex-stub" })
  },
})
