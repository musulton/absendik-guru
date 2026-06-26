/**
 * Generate app icon & splash PNGs from assets/brand/catatan-guru-mark.svg
 * Run: node scripts/generate-brand-assets.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const assetsDir = path.join(root, "assets");
const svgPath = path.join(assetsDir, "brand", "catatan-guru-mark.svg");

const BRAND_BG = "#047857";

function renderPng(size) {
  const svg = fs.readFileSync(svgPath);
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: size },
  });
  return resvg.render().asPng();
}

async function writeSplash(width, height, logoSize, outPath) {
  const logo = renderPng(logoSize);
  await sharp({
    create: {
      width,
      height,
      channels: 3,
      background: BRAND_BG,
    },
  })
    .composite([
      {
        input: logo,
        left: Math.round((width - logoSize) / 2),
        top: Math.round((height - logoSize) / 2),
      },
    ])
    .png()
    .toFile(outPath);
}

async function main() {
  if (!fs.existsSync(svgPath)) {
    throw new Error(`Missing ${svgPath}`);
  }

  const icon = renderPng(1024);
  fs.writeFileSync(path.join(assetsDir, "icon.png"), icon);
  fs.writeFileSync(path.join(assetsDir, "adaptive-icon.png"), icon);
  fs.writeFileSync(path.join(assetsDir, "splash-icon.png"), renderPng(512));

  await writeSplash(1284, 2778, 240, path.join(assetsDir, "splash.png"));

  console.log("Generated:", [
    "assets/icon.png",
    "assets/adaptive-icon.png",
    "assets/splash-icon.png",
    "assets/splash.png",
  ].join(", "));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
