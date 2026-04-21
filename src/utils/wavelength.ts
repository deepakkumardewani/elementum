/** Visible spectrum (nm) for `wavelengthToRgb`. */
export const VISIBLE_MIN = 380;
export const VISIBLE_MAX = 780;

const GAMMA = 0.8;
const INTENSITY_MAX = 255;

/**
 * Approximate sRGB hex for a visible wavelength using Bruton's spectrum → RGB
 * algorithm (piecewise linear spectrum locus + gamma), with edge intensity
 * falloff 380–420 nm and 700–780 nm.
 */
export function wavelengthToRgb(wavelength: number): string {
  if (wavelength < VISIBLE_MIN || wavelength > VISIBLE_MAX) {
    return "transparent";
  }

  const factor = edgeIntensityFactor(wavelength);
  const [r0, g0, b0] = spectrumRgbLinear(wavelength);
  const r = gammaChannel(r0, factor);
  const g = gammaChannel(g0, factor);
  const b = gammaChannel(b0, factor);
  return rgbToHex(r, g, b);
}

function edgeIntensityFactor(wavelength: number): number {
  if (wavelength >= VISIBLE_MIN && wavelength < 420) {
    return 0.3 + (0.7 * (wavelength - VISIBLE_MIN)) / (420 - VISIBLE_MIN);
  }
  if (wavelength >= 420 && wavelength <= 700) {
    return 1;
  }
  return 0.3 + (0.7 * (VISIBLE_MAX - wavelength)) / (VISIBLE_MAX - 700);
}

/** Linear RGB components in [0, 1] before gamma and intensity scaling. */
function spectrumRgbLinear(wavelength: number): [number, number, number] {
  if (wavelength >= 380 && wavelength < 440) {
    return [-(wavelength - 440) / (440 - 380), 0, 1];
  }
  if (wavelength >= 440 && wavelength < 490) {
    return [0, (wavelength - 440) / (490 - 440), 1];
  }
  if (wavelength >= 490 && wavelength < 510) {
    return [0, 1, -(wavelength - 510) / (510 - 490)];
  }
  if (wavelength >= 510 && wavelength < 580) {
    return [(wavelength - 510) / (580 - 510), 1, 0];
  }
  if (wavelength >= 580 && wavelength < 645) {
    return [1, -(wavelength - 645) / (645 - 580), 0];
  }
  if (wavelength >= 645 && wavelength <= VISIBLE_MAX) {
    return [1, 0, 0];
  }
  return [0, 0, 0];
}

function gammaChannel(linear: number, factor: number): number {
  if (linear <= 0) return 0;
  return Math.round(INTENSITY_MAX * (linear * factor) ** GAMMA);
}

function rgbToHex(r: number, g: number, b: number): string {
  const byte = (n: number) =>
    Math.max(0, Math.min(255, n)).toString(16).padStart(2, "0");
  return `#${byte(r)}${byte(g)}${byte(b)}`;
}
