import sharp from "sharp";

export interface BookMockupOptions {
  dentPosition?: number; // fraction from left edge where dent sits, default: 0.05
  dentWidth?: number; // pixels, default: 12
  spineRadius?: number; // corner radius for spine-side corners, default: 12
  pageEdgeWidth?: number; // pixels, default: 15
  shadowBlur?: number; // default: 20
  shadowOffsetX?: number; // default: 8
  shadowOffsetY?: number; // default: 12
  padding?: number; // canvas padding around book, default: 60
}

/**
 * Takes a flat cover image and returns a PNG buffer of a 3D-looking book.
 * The cover image spans the full face — a transparent dent/groove overlay
 * creates the classic spine crease effect. Page edges on the right and a
 * drop shadow complete the look.
 */
export async function generateBookMockup(
  coverImageBuffer: Buffer,
  options?: BookMockupOptions
): Promise<Buffer> {
  const {
    dentPosition = 0.05,
    dentWidth = 12,
    spineRadius = 12,
    pageEdgeWidth = 15,
    shadowBlur = 20,
    shadowOffsetX = 8,
    shadowOffsetY = 12,
    padding = 60,
  } = options ?? {};

  // Get cover dimensions
  const meta = await sharp(coverImageBuffer).metadata();
  if (!meta.width || !meta.height) {
    throw new Error("Could not read cover image dimensions — the image may be corrupt or in an unsupported format");
  }
  const coverW = meta.width;
  const coverH = meta.height;

  // --- Spine dent overlay (transparent gradient over the cover image) ---
  const dentX = Math.round(coverW * dentPosition);
  const dentOverlaySvg = Buffer.from(`
    <svg width="${coverW}" height="${coverH}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="dentGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="rgba(0,0,0,0.40)"/>
          <stop offset="30%" stop-color="rgba(0,0,0,0.12)"/>
          <stop offset="50%" stop-color="rgba(255,255,255,0.18)"/>
          <stop offset="70%" stop-color="rgba(0,0,0,0.08)"/>
          <stop offset="100%" stop-color="rgba(0,0,0,0.35)"/>
        </linearGradient>
      </defs>
      <!-- the dent groove -->
      <rect x="${dentX}" y="0" width="${dentWidth}" height="${coverH}" fill="url(#dentGrad)"/>
      <!-- darken the narrow spine area left of the dent slightly -->
      <rect x="0" y="0" width="${dentX}" height="${coverH}" fill="rgba(0,0,0,0.15)"/>
    </svg>
  `);

  // --- Build page edges SVG (off-white with horizontal lines) ---
  const lineCount = Math.floor(coverH / 3);
  const pageLines = Array.from(
    { length: lineCount },
    (_, i) =>
      `<line x1="0" y1="${i * 3}" x2="${pageEdgeWidth}" y2="${i * 3}" stroke="#d0ccc8" stroke-width="0.5"/>`
  ).join("");

  const pageEdgeSvg = Buffer.from(`
    <svg width="${pageEdgeWidth}" height="${coverH}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${pageEdgeWidth}" height="${coverH}" fill="#f5f0e8"/>
      ${pageLines}
      <!-- shadow on left edge (where pages meet cover) -->
      <rect x="0" y="0" width="2" height="${coverH}" fill="rgba(0,0,0,0.08)"/>
    </svg>
  `);

  // --- Assemble book body: cover (full width) with dent overlay + page edges ---
  const bodyW = coverW + pageEdgeWidth;
  const bodyH = coverH;
  const r = spineRadius;

  // Rounded-corner mask: round only the left (spine) corners
  const cornerMask = Buffer.from(`
    <svg width="${bodyW}" height="${bodyH}" xmlns="http://www.w3.org/2000/svg">
      <path d="
        M ${r},0
        H ${bodyW}
        V ${bodyH}
        H ${r}
        Q 0,${bodyH} 0,${bodyH - r}
        V ${r}
        Q 0,0 ${r},0
        Z
      " fill="white"/>
    </svg>
  `);

  const bookBody = await sharp({
    create: {
      width: bodyW,
      height: bodyH,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      { input: coverImageBuffer, left: 0, top: 0 },
      { input: await sharp(dentOverlaySvg).png().toBuffer(), left: 0, top: 0 },
      {
        input: await sharp(pageEdgeSvg).png().toBuffer(),
        left: coverW,
        top: 0,
      },
      // Apply rounded-corner mask to clip spine-side corners
      {
        input: await sharp(cornerMask).png().toBuffer(),
        blend: "dest-in",
      },
    ])
    .png()
    .toBuffer();

  // --- Create shadow layer ---
  const shadowLayer = await sharp(bookBody)
    .ensureAlpha()
    .composite([
      {
        input: {
          create: {
            width: bodyW,
            height: bodyH,
            channels: 4,
            background: { r: 0, g: 0, b: 0, alpha: 180 },
          },
        },
        blend: "in", // keeps shadow only where book is
      },
    ])
    .blur(shadowBlur)
    .png()
    .toBuffer();

  // --- Final canvas with padding ---
  const canvasW = bodyW + padding * 2 + Math.abs(shadowOffsetX);
  const canvasH = bodyH + padding * 2 + Math.abs(shadowOffsetY);

  const result = await sharp({
    create: {
      width: canvasW,
      height: canvasH,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      {
        input: shadowLayer,
        left: padding + shadowOffsetX,
        top: padding + shadowOffsetY,
      },
      { input: bookBody, left: padding, top: padding },
    ])
    .png()
    .toBuffer();

  return result;
}
