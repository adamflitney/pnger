import puppeteer, { Browser, Page } from 'puppeteer-core';
import { readFile, writeFile } from 'fs/promises';
import { ConversionOptions, ConversionResult, SVGDimensions } from './types';
import {
  findChrome,
  parseSVGDimensions,
  calculateDimensions,
  validateInputFile,
  validateOptions,
  generateOutputPath,
  normalizeBackgroundColor,
} from './utils';

export class SVGConverter {
  private browser?: Browser;

  /**
   * Convert SVG to PNG
   */
  async convert(options: ConversionOptions): Promise<ConversionResult> {
    try {
      // Validate input
      validateInputFile(options.inputPath);
      validateOptions(options);

      // Generate output path if not provided
      const outputPath = generateOutputPath(options.inputPath, options.outputPath);

      // Parse SVG dimensions
      let intrinsicDimensions: SVGDimensions;
      try {
        intrinsicDimensions = await parseSVGDimensions(options.inputPath);
      } catch (error) {
        // If we can't parse dimensions, try to get them from the browser
        intrinsicDimensions = await this.getDimensionsFromBrowser(options.inputPath);
      }

      // Calculate final dimensions
      const finalDimensions = calculateDimensions(intrinsicDimensions, {
        width: options.width,
        height: options.height,
        scale: options.scale,
      });

      // Normalize background color
      const backgroundColor = normalizeBackgroundColor(options.background);

      // Convert
      await this.convertWithPuppeteer(
        options.inputPath,
        outputPath,
        finalDimensions,
        backgroundColor,
        options.quality
      );

      return {
        success: true,
        outputPath,
        dimensions: finalDimensions,
      };
    } catch (error) {
      return {
        success: false,
        outputPath: options.outputPath || '',
        dimensions: { width: 0, height: 0 },
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Get SVG dimensions by rendering in browser (fallback for SVGs without explicit dimensions)
   */
  private async getDimensionsFromBrowser(svgPath: string): Promise<SVGDimensions> {
    const browser = await this.getBrowser();
    const page = await browser.newPage();

    try {
      const svgContent = await readFile(svgPath, 'utf-8');
      
      // Create a simple HTML page with the SVG
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { margin: 0; padding: 0; }
              svg { display: block; }
            </style>
          </head>
          <body>${svgContent}</body>
        </html>
      `;

      await page.setContent(html);

      // Get bounding box of the SVG element
      const dimensions = await page.evaluate(() => {
        const svg = document.querySelector('svg');
        if (!svg) {
          throw new Error('No SVG element found');
        }
        
        const bbox = svg.getBBox();
        return {
          width: bbox.width || svg.clientWidth || 300,
          height: bbox.height || svg.clientHeight || 300,
        };
      });

      return dimensions;
    } finally {
      await page.close();
    }
  }

  /**
   * Perform the actual conversion using Puppeteer
   */
  private async convertWithPuppeteer(
    svgPath: string,
    outputPath: string,
    dimensions: SVGDimensions,
    backgroundColor: string,
    quality?: number
  ): Promise<void> {
    const browser = await this.getBrowser();
    const page = await browser.newPage();

    try {
      // Set viewport to match final dimensions
      await page.setViewport({
        width: dimensions.width,
        height: dimensions.height,
        deviceScaleFactor: 1,
      });

      // Read SVG content
      const svgContent = await readFile(svgPath, 'utf-8');

      // Create HTML with SVG and background
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              html, body {
                width: ${dimensions.width}px;
                height: ${dimensions.height}px;
                overflow: hidden;
              }
              body {
                display: flex;
                align-items: center;
                justify-content: center;
                background: ${backgroundColor};
              }
              svg {
                max-width: 100%;
                max-height: 100%;
                display: block;
              }
            </style>
          </head>
          <body>${svgContent}</body>
        </html>
      `;

      await page.setContent(html, { waitUntil: 'networkidle0' });

      // Take screenshot
      const screenshot = await page.screenshot({
        type: 'png',
        omitBackground: backgroundColor === 'transparent',
        clip: {
          x: 0,
          y: 0,
          width: dimensions.width,
          height: dimensions.height,
        },
      });

      // Write to file
      await writeFile(outputPath, screenshot);
    } finally {
      await page.close();
    }
  }

  /**
   * Get or create browser instance
   */
  private async getBrowser(): Promise<Browser> {
    if (!this.browser || !this.browser.connected) {
      const chromeConfig = await findChrome();
      
      this.browser = await puppeteer.launch({
        executablePath: chromeConfig.executablePath,
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
        ],
      });
    }

    return this.browser;
  }

  /**
   * Clean up browser instance
   */
  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = undefined;
    }
  }
}

/**
 * Convenience function for one-off conversions
 */
export async function convertSVGtoPNG(options: ConversionOptions): Promise<ConversionResult> {
  const converter = new SVGConverter();
  try {
    return await converter.convert(options);
  } finally {
    await converter.cleanup();
  }
}
