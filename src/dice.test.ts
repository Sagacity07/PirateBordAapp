import {describe,expect,it} from 'vitest';
import {parsePhysicalRoll,rollFormula} from './dice';

describe('rollFormula',()=>{
  it.each([['d2',1],['D20',1],[' 2d6 + 3 ',5],['3d8-2',1]])('parses %s', (formula)=>expect(rollFormula(formula,()=>0)).not.toBeNull());
  it('rolls deterministic dice and adds a modifier',()=>expect(rollFormula('2d6+3',()=>0.5)).toEqual({total:11,detail:'4 + 4 + 3'}));
  it('formats negative modifiers',()=>expect(rollFormula('d8-2',()=>0)).toEqual({total:-1,detail:'1 - 2'}));
  it('clamps hostile random sources to valid die faces',()=>{expect(rollFormula('d6',()=>-5)?.total).toBe(1);expect(rollFormula('d6',()=>10)?.total).toBe(6);expect(rollFormula('d6',()=>Number.NaN)?.total).toBe(1)});
  it.each(['','d','0d6','101d6','d1','d0','2x6','1.5d6','dInfinity','d6+1.5'])('rejects invalid formula %s',(formula)=>expect(rollFormula(formula)).toBeNull());
  it('allows the documented maximum dice count',()=>expect(rollFormula('100d2',()=>0)?.total).toBe(100));
  it('rejects excessive side counts',()=>expect(rollFormula('d100001')).toBeNull());
});

describe('parsePhysicalRoll',()=>{
  it.each([['17',17],[' 0 ',0],['-2',-2]])('parses %s',(value,expected)=>expect(parsePhysicalRoll(value)).toBe(expected));
  it.each(['','2.5','d20','Infinity','12 points'])('rejects %s',(value)=>expect(parsePhysicalRoll(value)).toBeNull());
});
