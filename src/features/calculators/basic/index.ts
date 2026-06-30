export const basicCalculator = {
  add: (a: number, b: number): number => {
    return parseFloat((a + b).toFixed(12));
  },
  subtract: (a: number, b: number): number => {
    return parseFloat((a - b).toFixed(12));
  },
  multiply: (a: number, b: number): number => {
    return parseFloat((a * b).toFixed(12));
  },
  divide: (a: number, b: number): number => {
    if (b === 0) return 0;
    return parseFloat((a / b).toFixed(12));
  },
  round: (val: number, decimals = 2): number => {
    const factor = Math.pow(10, decimals);
    return Math.round((val + Number.EPSILON) * factor) / factor;
  }
};
