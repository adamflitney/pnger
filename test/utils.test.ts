import { calculateDimensions, validateOptions, generateOutputPath, normalizeBackgroundColor } from '../src/utils';

describe('utils', () => {
  describe('calculateDimensions', () => {
    const intrinsic = { width: 100, height: 100 };

    test('uses intrinsic dimensions with no options', () => {
      const result = calculateDimensions(intrinsic, {});
      expect(result).toEqual({ width: 100, height: 100 });
    });

    test('scales dimensions with scale option', () => {
      const result = calculateDimensions(intrinsic, { scale: 2 });
      expect(result).toEqual({ width: 200, height: 200 });
    });

    test('calculates height from width maintaining aspect ratio', () => {
      const result = calculateDimensions({ width: 200, height: 100 }, { width: 400 });
      expect(result).toEqual({ width: 400, height: 200 });
    });

    test('calculates width from height maintaining aspect ratio', () => {
      const result = calculateDimensions({ width: 200, height: 100 }, { height: 200 });
      expect(result).toEqual({ width: 400, height: 200 });
    });

    test('fits within both dimensions preserving aspect ratio (wider SVG)', () => {
      const result = calculateDimensions({ width: 200, height: 100 }, { width: 400, height: 400 });
      expect(result).toEqual({ width: 400, height: 200 });
    });

    test('fits within both dimensions preserving aspect ratio (taller SVG)', () => {
      const result = calculateDimensions({ width: 100, height: 200 }, { width: 400, height: 400 });
      expect(result).toEqual({ width: 200, height: 400 });
    });

    test('applies scale to custom dimensions', () => {
      const result = calculateDimensions(intrinsic, { width: 200, scale: 2 });
      expect(result).toEqual({ width: 400, height: 400 });
    });
  });

  describe('validateOptions', () => {
    test('accepts valid options', () => {
      expect(() => validateOptions({ width: 100, height: 200, scale: 2, quality: 80 })).not.toThrow();
    });

    test('rejects negative width', () => {
      expect(() => validateOptions({ width: -100 })).toThrow('Invalid width');
    });

    test('rejects negative height', () => {
      expect(() => validateOptions({ height: -100 })).toThrow('Invalid height');
    });

    test('rejects negative scale', () => {
      expect(() => validateOptions({ scale: -1 })).toThrow('Invalid scale');
    });

    test('rejects quality out of range', () => {
      expect(() => validateOptions({ quality: 101 })).toThrow('Invalid quality');
      expect(() => validateOptions({ quality: -1 })).toThrow('Invalid quality');
    });
  });

  describe('generateOutputPath', () => {
    test('returns provided output path', () => {
      const result = generateOutputPath('/path/to/input.svg', '/path/to/output.png');
      expect(result).toBe('/path/to/output.png');
    });

    test('generates output path from input path', () => {
      const result = generateOutputPath('/path/to/input.svg');
      expect(result).toBe('/path/to/input.png');
    });

    test('handles uppercase SVG extension', () => {
      const result = generateOutputPath('/path/to/input.SVG');
      expect(result).toBe('/path/to/input.png');
    });
  });

  describe('normalizeBackgroundColor', () => {
    test('returns transparent for undefined', () => {
      expect(normalizeBackgroundColor()).toBe('transparent');
    });

    test('returns transparent for explicit transparent', () => {
      expect(normalizeBackgroundColor('transparent')).toBe('transparent');
    });

    test('accepts hex colors', () => {
      expect(normalizeBackgroundColor('#ffffff')).toBe('#ffffff');
      expect(normalizeBackgroundColor('#fff')).toBe('#fff');
    });

    test('accepts rgb colors', () => {
      expect(normalizeBackgroundColor('rgb(255,255,255)')).toBe('rgb(255,255,255)');
    });

    test('accepts rgba colors', () => {
      expect(normalizeBackgroundColor('rgba(255,255,255,0.5)')).toBe('rgba(255,255,255,0.5)');
    });

    test('accepts named colors', () => {
      expect(normalizeBackgroundColor('white')).toBe('white');
      expect(normalizeBackgroundColor('red')).toBe('red');
    });

    test('rejects invalid colors', () => {
      expect(() => normalizeBackgroundColor('not-a-color!')).toThrow('Invalid background color');
    });
  });
});
