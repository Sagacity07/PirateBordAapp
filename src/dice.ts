export interface DiceRoll {
  total: number;
  detail: string;
}

export function rollFormula(formula: string, random: () => number = Math.random): DiceRoll | null {
  const clean = formula.replace(/\s/g, '').toLowerCase();
  const match = clean.match(/^(\d*)d(\d+)([+-]\d+)?$/);
  if (!match) return null;

  const count = Number(match[1] || 1);
  const sides = Number(match[2]);
  const modifier = Number(match[3] || 0);
  if (!Number.isSafeInteger(count) || count < 1 || count > 100) return null;
  if (!Number.isSafeInteger(sides) || sides < 2 || sides > 100_000) return null;
  if (!Number.isSafeInteger(modifier)) return null;

  const values = Array.from({ length: count }, () => {
    const sample = random();
    const bounded = Number.isFinite(sample) ? Math.min(Math.max(sample, 0), 0.9999999999999999) : 0;
    return Math.floor(bounded * sides) + 1;
  });
  return {
    total: values.reduce((sum, value) => sum + value, 0) + modifier,
    detail: `${values.join(' + ')}${modifier ? ` ${modifier > 0 ? '+' : '-'} ${Math.abs(modifier)}` : ''}`,
  };
}

export function parsePhysicalRoll(value:string):number|null{
  if(!/^-?\d+$/.test(value.trim()))return null;
  const total=Number(value);
  return Number.isSafeInteger(total)?total:null;
}
