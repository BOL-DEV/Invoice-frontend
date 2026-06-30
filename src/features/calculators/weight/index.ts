import { basicCalculator } from '../basic';

export const weightCalculator = {
  // Standard density of mild steel: 7.85 kg/m³ per mm of thickness
  STEEL_DENSITY: 7.85,

  /**
   * Calculates weight of standard flat steel sheet in kg.
   * length (meters) * width (meters) * thickness (mm) * density (7.85)
   */
  calculateSheetWeight: (length: number, width: number, thickness: number): number => {
    const raw = length * width * thickness * weightCalculator.STEEL_DENSITY;
    return basicCalculator.round(raw, 3);
  },

  /**
   * Calculates weight of steel iron rods based on standard diameter formula:
   * (diameter in mm)^2 / 162 * length in meters
   */
  calculateRodWeight: (diameterMm: number, lengthMeters: number): number => {
    const weightPerMeter = basicCalculator.divide(diameterMm * diameterMm, 162);
    const raw = weightPerMeter * lengthMeters;
    return basicCalculator.round(raw, 3);
  },

  /**
   * Sums total weight of a list of invoice items
   */
  sumInvoiceWeight: (items: Array<{ quantity: number; weight?: number | null }>): number => {
    const total = items.reduce((sum, item) => {
      const itemWeight = item.weight ? basicCalculator.multiply(Number(item.weight), Number(item.quantity)) : 0;
      return basicCalculator.add(sum, itemWeight);
    }, 0);
    return basicCalculator.round(total, 3);
  }
};
