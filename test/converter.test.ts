import { convertSVGtoPNG } from '../src/converter';
import { existsSync } from 'fs';
import { unlink } from 'fs/promises';
import { join } from 'path';

describe('converter integration tests', () => {
  const fixturesDir = join(__dirname, 'fixtures');
  const outputsToClean: string[] = [];

  afterEach(async () => {
    // Clean up generated files
    for (const output of outputsToClean) {
      if (existsSync(output)) {
        await unlink(output);
      }
    }
    outputsToClean.length = 0;
  });

  test('converts simple SVG with explicit dimensions', async () => {
    const inputPath = join(fixturesDir, 'simple.svg');
    const outputPath = join(fixturesDir, 'simple.png');
    outputsToClean.push(outputPath);

    const result = await convertSVGtoPNG({
      inputPath,
      outputPath,
    });

    expect(result.success).toBe(true);
    expect(result.dimensions).toEqual({ width: 100, height: 100 });
    expect(existsSync(outputPath)).toBe(true);
  }, 30000);

  test('converts SVG with filters', async () => {
    const inputPath = join(fixturesDir, 'with-filters.svg');
    const outputPath = join(fixturesDir, 'with-filters.png');
    outputsToClean.push(outputPath);

    const result = await convertSVGtoPNG({
      inputPath,
      outputPath,
    });

    expect(result.success).toBe(true);
    expect(result.dimensions).toEqual({ width: 200, height: 200 });
    expect(existsSync(outputPath)).toBe(true);
  }, 30000);

  test('converts SVG with masks and clip paths', async () => {
    const inputPath = join(fixturesDir, 'with-masks.svg');
    const outputPath = join(fixturesDir, 'with-masks.png');
    outputsToClean.push(outputPath);

    const result = await convertSVGtoPNG({
      inputPath,
      outputPath,
    });

    expect(result.success).toBe(true);
    expect(existsSync(outputPath)).toBe(true);
  }, 30000);

  test('converts SVG with custom width', async () => {
    const inputPath = join(fixturesDir, 'simple.svg');
    const outputPath = join(fixturesDir, 'simple-200w.png');
    outputsToClean.push(outputPath);

    const result = await convertSVGtoPNG({
      inputPath,
      outputPath,
      width: 200,
    });

    expect(result.success).toBe(true);
    expect(result.dimensions).toEqual({ width: 200, height: 200 });
    expect(existsSync(outputPath)).toBe(true);
  }, 30000);

  test('converts SVG with scale factor', async () => {
    const inputPath = join(fixturesDir, 'simple.svg');
    const outputPath = join(fixturesDir, 'simple-2x.png');
    outputsToClean.push(outputPath);

    const result = await convertSVGtoPNG({
      inputPath,
      outputPath,
      scale: 2,
    });

    expect(result.success).toBe(true);
    expect(result.dimensions).toEqual({ width: 200, height: 200 });
    expect(existsSync(outputPath)).toBe(true);
  }, 30000);

  test('converts SVG with custom background color', async () => {
    const inputPath = join(fixturesDir, 'simple.svg');
    const outputPath = join(fixturesDir, 'simple-bg.png');
    outputsToClean.push(outputPath);

    const result = await convertSVGtoPNG({
      inputPath,
      outputPath,
      background: '#ff0000',
    });

    expect(result.success).toBe(true);
    expect(existsSync(outputPath)).toBe(true);
  }, 30000);

  test('auto-generates output path when not provided', async () => {
    const inputPath = join(fixturesDir, 'simple.svg');
    const expectedOutput = join(fixturesDir, 'simple.png');
    outputsToClean.push(expectedOutput);

    const result = await convertSVGtoPNG({
      inputPath,
    });

    expect(result.success).toBe(true);
    expect(result.outputPath).toBe(expectedOutput);
    expect(existsSync(expectedOutput)).toBe(true);
  }, 30000);

  test('handles non-existent input file', async () => {
    const result = await convertSVGtoPNG({
      inputPath: 'non-existent.svg',
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('not found');
  });

  test('handles invalid dimensions', async () => {
    const inputPath = join(fixturesDir, 'simple.svg');
    
    const result = await convertSVGtoPNG({
      inputPath,
      width: -100,
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid width');
  });
});
