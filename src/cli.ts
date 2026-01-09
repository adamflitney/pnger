#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { convertSVGtoPNG } from './converter';
import { ConversionOptions } from './types';

const program = new Command();

program
  .name('pnger')
  .description('High-accuracy SVG to PNG converter')
  .version('1.0.0')
  .argument('<input>', 'Input SVG file path')
  .argument('[output]', 'Output PNG file path (optional, auto-generated if not provided)')
  .option('-w, --width <number>', 'Output width in pixels', parseFloat)
  .option('-h, --height <number>', 'Output height in pixels', parseFloat)
  .option('-s, --scale <number>', 'Scale factor (e.g., 2 for 2x)', parseFloat)
  .option('-b, --background <color>', 'Background color (default: transparent)', 'transparent')
  .option('-q, --quality <number>', 'PNG quality 0-100 (default: 100)', parseFloat)
  .action(async (input: string, output: string | undefined, options) => {
    try {
      console.log(chalk.blue('Converting SVG to PNG...'));
      
      const conversionOptions: ConversionOptions = {
        inputPath: input,
        outputPath: output,
        width: options.width,
        height: options.height,
        scale: options.scale,
        background: options.background,
        quality: options.quality,
      };

      const result = await convertSVGtoPNG(conversionOptions);

      if (result.success) {
        console.log(chalk.green('✓ Conversion successful!'));
        console.log(chalk.gray(`  Input:  ${input}`));
        console.log(chalk.gray(`  Output: ${result.outputPath}`));
        console.log(chalk.gray(`  Size:   ${result.dimensions.width}x${result.dimensions.height}px`));
      } else {
        console.error(chalk.red('✗ Conversion failed:'));
        console.error(chalk.red(`  ${result.error}`));
        process.exit(1);
      }
    } catch (error) {
      console.error(chalk.red('✗ Unexpected error:'));
      console.error(chalk.red(`  ${error instanceof Error ? error.message : String(error)}`));
      process.exit(1);
    }
  });

// Parse arguments
program.parse();
