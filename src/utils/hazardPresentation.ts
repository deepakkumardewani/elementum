import type { HazardLevel } from "@/types/element"

export function hazardDisplayLabel(level: HazardLevel): string {
  switch (level) {
    case "safe":
      return "Safe / Inert"
    case "flammable":
      return "Flammable"
    case "toxic":
      return "Toxic"
    case "radioactive":
      return "Radioactive"
    case "corrosive":
      return "Corrosive"
  }
}

export function hazardExplanation(level: HazardLevel): string {
  switch (level) {
    case "safe":
      return "Listed GHS data indicates low acute hazard under normal use; still follow lab safety rules."
    case "flammable":
      return "May ignite or intensify fire: keep away from heat, sparks, and open flames."
    case "toxic":
      return "Harmful if inhaled, swallowed, or on contact: use ventilation, gloves, and eye protection."
    case "radioactive":
      return "Ionizing radiation hazard: limit exposure time, increase distance, and use shielding as appropriate."
    case "corrosive":
      return "Can damage skin, eyes, or metals on contact; use corrosion-resistant storage and PPE."
  }
}
