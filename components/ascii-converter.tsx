"use client";

export type ColoredChar = {
  char: string;
  color: string;
};

export const ASCII_CHARSETS = {
  standard: " .:-=+*#%@",
  detailed: " .,:;i1tfLCG08@",
  blocks: " ░▒▓█",
  minimal: " .:█",
} as const;

export type CharSetKey = keyof typeof ASCII_CHARSETS;

export type AsciiConversionOptions = {
  resolution: number;
  inverted: boolean;
  grayscale: boolean;
  charSet: CharSetKey;
};

const MIN_COLOR_BRIGHTNESS = 40;

export const adjustColorBrightness = (
  r: number,
  g: number,
  b: number,
  factor: number,
): string => {
  const clamp = (value: number) =>
    Math.max(Math.min(Math.round(value), 255), MIN_COLOR_BRIGHTNESS);
  return `rgb(${clamp(r * factor)}, ${clamp(g * factor)}, ${clamp(
    b * factor,
  )})`;
};

export const convertImageToAscii = (
  img: HTMLImageElement,
  options: AsciiConversionOptions,
  canvas?: HTMLCanvasElement | null,
) => {
  if (!img) {
    throw new Error("Image element is required");
  }

  if (img.width === 0 || img.height === 0) {
    throw new Error("Invalid image dimensions");
  }

  const targetCanvas = canvas ?? document.createElement("canvas");
  const ctx = targetCanvas.getContext("2d");

  if (!ctx) {
    throw new Error("Could not get canvas context");
  }

  const { resolution, inverted, grayscale, charSet } = options;
  const chars = ASCII_CHARSETS[charSet];

  if (!chars) {
    throw new Error(`Unsupported character set: ${charSet}`);
  }

  const scaledWidth = Math.max(1, Math.floor(img.width * resolution));
  const scaledHeight = Math.max(1, Math.floor(img.height * resolution));

  targetCanvas.width = img.width;
  targetCanvas.height = img.height;

  ctx.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
  ctx.drawImage(img, 0, 0, img.width, img.height);

  let imageData: ImageData;
  try {
    imageData = ctx.getImageData(0, 0, img.width, img.height);
  } catch {
    throw new Error("Failed to get image data. This might be a CORS issue.");
  }

  const data = imageData.data;

  const fontAspect = 0.5;
  const widthStep = Math.max(1, Math.ceil(img.width / scaledWidth));
  const heightStep = Math.max(
    1,
    Math.ceil(img.height / scaledHeight / fontAspect),
  );

  let asciiArt = "";
  const coloredAsciiArt: ColoredChar[][] = [];

  for (let y = 0; y < img.height; y += heightStep) {
    const coloredRow: ColoredChar[] = [];

    for (let x = 0; x < img.width; x += widthStep) {
      const pos = (y * img.width + x) * 4;
      const r = data[pos];
      const g = data[pos + 1];
      const b = data[pos + 2];

      let brightness: number;
      if (grayscale) {
        brightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
      } else {
        brightness = Math.sqrt(
          0.299 * (r / 255) * (r / 255) +
            0.587 * (g / 255) * (g / 255) +
            0.114 * (b / 255) * (b / 255),
        );
      }

      if (inverted) brightness = 1 - brightness;

      const charIndex = Math.min(
        chars.length - 1,
        Math.max(0, Math.floor(brightness * (chars.length - 1))),
      );
      const char = chars[charIndex];

      asciiArt += char;

      const brightnessFactor = grayscale
        ? 1
        : (charIndex / (chars.length - 1)) * 1.5 + 0.5;
      const color = grayscale
        ? "white"
        : adjustColorBrightness(r, g, b, brightnessFactor);

      coloredRow.push({ char, color });
    }

    asciiArt += "\n";
    coloredAsciiArt.push(coloredRow);
  }

  return {
    asciiArt,
    coloredAsciiArt,
  };
};
