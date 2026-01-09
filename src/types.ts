export interface ConversionOptions {
  /** Input SVG file path */
  inputPath: string;
  /** Output PNG file path (optional, auto-generated if not provided) */
  outputPath?: string;
  /** Custom width in pixels */
  width?: number;
  /** Custom height in pixels */
  height?: number;
  /** Scale factor (multiplies final dimensions) */
  scale?: number;
  /** Background color (CSS color string or 'transparent') */
  background?: string;
  /** PNG quality (0-100) */
  quality?: number;
}

export interface SVGDimensions {
  width: number;
  height: number;
}

export interface ChromeConfig {
  executablePath: string;
}

export interface ConversionResult {
  success: boolean;
  outputPath: string;
  dimensions: {
    width: number;
    height: number;
  };
  error?: string;
}
