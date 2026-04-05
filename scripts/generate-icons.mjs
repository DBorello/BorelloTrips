import sharp from 'sharp'
import { writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = resolve(__dirname, '../public')

// The brand mark SVG — 4-pointed sparkle on dark background, no border-radius
// (iOS/browser applies rounding themselves; we add rounding only for favicon)
function iconSvg(size, { rounded = false, padding = 0.18 } = {}) {
  const cx = size / 2
  const cy = size / 2
  const pad = size * padding
  const outer = size / 2 - pad        // outer star tip radius
  const inner = outer * 0.18          // inner waist radius (how thin the points are)

  // 4-pointed sparkle using cubic bezier — elegant tapered points
  const t  = cy - outer  // top
  const r  = cx + outer  // right
  const b  = cy + outer  // bottom
  const l  = cx - outer  // left
  const ci = inner       // control point inset

  const star = `
    M ${cx} ${t}
    C ${cx + ci} ${cy - ci}, ${cx + ci} ${cy - ci}, ${r} ${cy}
    C ${cx + ci} ${cy + ci}, ${cx + ci} ${cy + ci}, ${cx} ${b}
    C ${cx - ci} ${cy + ci}, ${cx - ci} ${cy + ci}, ${l} ${cy}
    C ${cx - ci} ${cy - ci}, ${cx - ci} ${cy - ci}, ${cx} ${t}
    Z
  `.trim()

  const rx = rounded ? Math.round(size * 0.225) : 0

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <defs>
    <radialGradient id="bg" cx="38%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#111120"/>
      <stop offset="100%" stop-color="#08080e"/>
    </radialGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    <filter id="blur" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="${size * 0.04}"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="${size}" height="${size}" rx="${rx}" fill="url(#bg)"/>

  <!-- Soft glow behind star -->
  <ellipse cx="${cx}" cy="${cy}" rx="${outer * 1.1}" ry="${outer * 1.1}"
    fill="url(#glow)"/>

  <!-- Star glow (blurred, slightly larger) -->
  <path d="${star}" fill="white" opacity="0.18" filter="url(#blur)"
    transform="scale(1.15) translate(${-cx * 0.15} ${-cy * 0.15})"/>

  <!-- Main star -->
  <path d="${star}" fill="white" opacity="0.95"/>

  <!-- Centre dot -->
  <circle cx="${cx}" cy="${cy}" r="${size * 0.022}" fill="white" opacity="0.7"/>
</svg>`
}

// ── favicon.svg (32px, rounded for browser chrome) ──────────────────────────
writeFileSync(`${publicDir}/favicon.svg`, iconSvg(32, { rounded: true }))
console.log('✓ favicon.svg')

// ── apple-touch-icon 180×180 ─────────────────────────────────────────────────
await sharp(Buffer.from(iconSvg(512, { padding: 0.16 })))
  .resize(180, 180)
  .png()
  .toFile(`${publicDir}/apple-touch-icon.png`)
console.log('✓ apple-touch-icon.png')

// ── pwa-192x192.png ───────────────────────────────────────────────────────────
await sharp(Buffer.from(iconSvg(512, { padding: 0.16 })))
  .resize(192, 192)
  .png()
  .toFile(`${publicDir}/pwa-192x192.png`)
console.log('✓ pwa-192x192.png')

// ── pwa-512x512.png (maskable — with safe-zone padding) ──────────────────────
await sharp(Buffer.from(iconSvg(512, { padding: 0.18 })))
  .resize(512, 512)
  .png()
  .toFile(`${publicDir}/pwa-512x512.png`)
console.log('✓ pwa-512x512.png')

console.log('\nAll icons generated.')
