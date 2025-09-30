"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import {
  convertImageToAscii,
  type ColoredChar,
} from "@/components/ascii-converter";

const HERO_IMAGE_SRC = "/coa-f.png";
const MAX_RESOLUTION = 0.3;
const MIN_RESOLUTION = 0.05;
const WIDTH_PADDING_RATIO = 1;
const CHARACTER_ASPECT_RATIO = 0.55;
const LINE_HEIGHT_MULTIPLIER = 1.18;
const MIN_FONT_SIZE = 3;
const MAX_FONT_SIZE = 40;
const FONT_ADJUSTMENT_THRESHOLD = 0.02;
const MAX_FONT_ADJUSTMENTS = 6;

type RenderStatus = "loading" | "ready" | "error";

export default function AsciiHero() {
  const [asciiArt, setAsciiArt] = useState("");
  const [status, setStatus] = useState<RenderStatus>("loading");
  const [coloredAscii, setColoredAscii] = useState<ColoredChar[][]>([]);
  const [fontSize, setFontSize] = useState<number | null>(null);
  const adjustmentCountRef = useRef(0);
  const preRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    let canceled = false;
    const canvas = document.createElement("canvas");
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.decoding = "async";

    const renderAscii = () => {
      if (canceled || !img.complete) return;

      try {
        const viewportWidth = window.innerWidth;
        const pixelColumns = Math.floor(viewportWidth * WIDTH_PADDING_RATIO);
        const desiredResolution = pixelColumns / img.width;
        const resolution = Math.min(
          MAX_RESOLUTION,
          Math.max(MIN_RESOLUTION, desiredResolution),
        );

        const { asciiArt: art, coloredAsciiArt } = convertImageToAscii(
          img,
          {
            resolution,
            inverted: false,
            grayscale: false,
            charSet: "detailed",
          },
          canvas,
        );

        if (!canceled) {
          const tidyArt = art.replace(/\n$/, "");
          setAsciiArt(tidyArt);
          setColoredAscii(coloredAsciiArt);
          setStatus("ready");
          const longestRow = coloredAsciiArt.reduce((max, row) => {
            return row.length > max ? row.length : max;
          }, 0);

          if (longestRow > 0) {
            const availableWidth = viewportWidth * WIDTH_PADDING_RATIO;
            const calculatedSize =
              (availableWidth / longestRow) /
              Math.max(CHARACTER_ASPECT_RATIO, 0.1);
            setFontSize(
              Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, calculatedSize)),
            );
            adjustmentCountRef.current = 0;
          }
        }
      } catch (err) {
        if (!canceled) {
          console.error("Failed to render ASCII hero", err);
          setStatus("error");
          setColoredAscii([]);
          setFontSize(null);
        }
      }
    };

    const handleResize = () => {
      renderAscii();
    };

    img.onload = () => {
      renderAscii();
      window.addEventListener("resize", handleResize);
    };

    img.onerror = () => {
      if (!canceled) {
        setStatus("error");
      }
    };

    img.src = HERO_IMAGE_SRC;

    return () => {
      canceled = true;
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useLayoutEffect(() => {
    if (status !== "ready" || !fontSize) return;

    const pre = preRef.current;
    if (!pre) return;

    const targetWidth = window.innerWidth * WIDTH_PADDING_RATIO;
    const measuredWidth = pre.scrollWidth;

    if (!measuredWidth || adjustmentCountRef.current >= MAX_FONT_ADJUSTMENTS) {
      return;
    }

    const scale = targetWidth / measuredWidth;

    if (Math.abs(1 - scale) > FONT_ADJUSTMENT_THRESHOLD) {
      adjustmentCountRef.current += 1;
      setFontSize((prev) => {
        if (!prev) return prev;
        const next = Math.min(
          MAX_FONT_SIZE,
          Math.max(MIN_FONT_SIZE, prev * scale),
        );
        return Math.abs(next - prev) < 0.1 ? prev : next;
      });
    } else {
      adjustmentCountRef.current = MAX_FONT_ADJUSTMENTS;
    }
  }, [fontSize, status, asciiArt]);

  const content = useMemo(() => {
    if (status !== "ready") return null;

    return coloredAscii.map((row, rowIndex) => (
      <span key={`row-${rowIndex}`}>
        {row.map((cell, cellIndex) => (
          <span
            key={`cell-${rowIndex}-${cellIndex}`}
            style={{ color: cell.color }}
          >
            {cell.char === " " ? "\u00A0" : cell.char}
          </span>
        ))}
        {rowIndex < coloredAscii.length - 1 ? "\n" : ""}
      </span>
    ));
  }, [coloredAscii, status]);

  return (
    <main className="flex min-h-screen w-full bg-black">
      <pre
        ref={preRef}
        className="block h-full w-full overflow-hidden whitespace-pre font-mono text-stone-100"
        style={
          fontSize
            ? {
                fontSize: `${fontSize}px`,
                lineHeight: `${fontSize * LINE_HEIGHT_MULTIPLIER}px`,
              }
            : undefined
        }
        aria-busy={status !== "ready"}
      >
        {content ?? asciiArt}
      </pre>
    </main>
  );
}
