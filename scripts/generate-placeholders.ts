/**
 * ডেমো পণ্যের জন্য কাপড়ের মতো SVG ছবি তৈরি করে।
 * দোকানের মালিক অ্যাডমিন প্যানেল থেকে নিজের তোলা ছবি আপলোড করলে
 * এগুলো আপনাআপনি বদলে যাবে।
 *
 * চালানোর নিয়ম:  npx tsx scripts/generate-placeholders.ts
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT_DIR = join(ROOT, 'public', 'seed')

const W = 900
const H = 1200

/** কাপড়ের রঙের সেট */
type Palette = { ground: string; weft: string; motif: string; border: string }

const PALETTES: Record<string, Palette> = {
  jamdani: { ground: '#f7efe2', weft: '#e6d5b8', motif: '#b67719', border: '#9e1f3a' },
  katan: { ground: '#8b1734', weft: '#a62442', motif: '#e2b238', border: '#e2b238' },
  tant: { ground: '#f4f1e8', weft: '#2f6f6b', motif: '#bf2c46', border: '#2f6f6b' },
  silk: { ground: '#3c2a52', weft: '#4d3768', motif: '#d9b6e0', border: '#e2b238' },
  cotton: { ground: '#eef3f2', weft: '#d6e2df', motif: '#3d7a70', border: '#3d7a70' },
  dhakai: { ground: '#fbf6ea', weft: '#eadfc6', motif: '#9e1f3a', border: '#b67719' },
  rose: { ground: '#fbe9ec', weft: '#f4d2d8', motif: '#bf2c46', border: '#9e1f3a' },
  teal: { ground: '#e7f1f0', weft: '#cfe3e1', motif: '#1f6b62', border: '#d29820' },
  night: { ground: '#1f2937', weft: '#2c3a4d', motif: '#e2b238', border: '#e2b238' },
  mustard: { ground: '#f6e7c1', weft: '#ecd7a2', motif: '#7b3f10', border: '#7b3f10' },
  emerald: { ground: '#e6f2e9', weft: '#cfe4d5', motif: '#18604a', border: '#d29820' },
  indigo: { ground: '#e8eaf6', weft: '#d3d8ef', motif: '#2b3a8f', border: '#2b3a8f' },
}

/** মোটিফ — কাপড়ের নকশা */
const MOTIFS: Record<string, (c: Palette) => string> = {
  // জামদানির হীরের নকশা
  diamond: (c: Palette) => `
    <pattern id="motif" width="90" height="90" patternUnits="userSpaceOnUse">
      <path d="M45 18 L66 45 L45 72 L24 45 Z" fill="none" stroke="${c.motif}" stroke-width="2.5" opacity="0.75"/>
      <path d="M45 32 L56 45 L45 58 L34 45 Z" fill="${c.motif}" opacity="0.5"/>
      <circle cx="45" cy="45" r="3" fill="${c.motif}" opacity="0.9"/>
    </pattern>`,

  // কাতানের জরি ডোরা
  zari: (c: Palette) => `
    <pattern id="motif" width="60" height="60" patternUnits="userSpaceOnUse">
      <rect x="0" y="0" width="60" height="4" fill="${c.motif}" opacity="0.55"/>
      <rect x="0" y="26" width="60" height="1.5" fill="${c.motif}" opacity="0.35"/>
      <circle cx="30" cy="42" r="4.5" fill="none" stroke="${c.motif}" stroke-width="1.8" opacity="0.7"/>
      <circle cx="0" cy="42" r="4.5" fill="none" stroke="${c.motif}" stroke-width="1.8" opacity="0.7"/>
      <circle cx="60" cy="42" r="4.5" fill="none" stroke="${c.motif}" stroke-width="1.8" opacity="0.7"/>
    </pattern>`,

  // তাঁতের চেক
  check: (c: Palette) => `
    <pattern id="motif" width="72" height="72" patternUnits="userSpaceOnUse">
      <rect width="72" height="72" fill="none"/>
      <rect x="0" y="0" width="72" height="10" fill="${c.motif}" opacity="0.3"/>
      <rect x="0" y="0" width="10" height="72" fill="${c.motif}" opacity="0.3"/>
      <rect x="34" y="0" width="3" height="72" fill="${c.border}" opacity="0.4"/>
      <rect x="0" y="34" width="72" height="3" fill="${c.border}" opacity="0.4"/>
    </pattern>`,

  // ফুলেল ব্লক প্রিন্ট
  floral: (c: Palette) => `
    <pattern id="motif" width="100" height="100" patternUnits="userSpaceOnUse">
      <g opacity="0.7">
        <g transform="translate(50 50)">
          ${[0, 60, 120, 180, 240, 300]
            .map(
              (a) =>
                `<ellipse cx="0" cy="-16" rx="7" ry="14" fill="${c.motif}" opacity="0.55" transform="rotate(${a})"/>`
            )
            .join('')}
          <circle r="5" fill="${c.border}" opacity="0.8"/>
        </g>
        <circle cx="0" cy="0" r="3" fill="${c.motif}" opacity="0.4"/>
        <circle cx="100" cy="100" r="3" fill="${c.motif}" opacity="0.4"/>
      </g>
    </pattern>`,

  // কলকা (পেইসলি)
  paisley: (c: Palette) => `
    <pattern id="motif" width="110" height="110" patternUnits="userSpaceOnUse">
      <path d="M55 20 C 80 25, 88 55, 68 74 C 55 86, 36 82, 32 66 C 29 52, 42 44, 52 50 C 60 55, 58 66, 50 68"
            fill="none" stroke="${c.motif}" stroke-width="2.6" opacity="0.7" stroke-linecap="round"/>
      <circle cx="55" cy="33" r="2.8" fill="${c.border}" opacity="0.7"/>
    </pattern>`,

  // সরু ডোরা
  stripe: (c: Palette) => `
    <pattern id="motif" width="48" height="48" patternUnits="userSpaceOnUse">
      <rect x="0" y="0" width="6" height="48" fill="${c.motif}" opacity="0.35"/>
      <rect x="14" y="0" width="2" height="48" fill="${c.border}" opacity="0.45"/>
      <rect x="24" y="0" width="2" height="48" fill="${c.border}" opacity="0.25"/>
    </pattern>`,
}

const MOTIF_NAMES = Object.keys(MOTIFS)
const PALETTE_NAMES = Object.keys(PALETTES)

type Spec = { palette: string; motif: string; seed?: number }

function svg({ palette, motif, seed = 0 }: Spec) {
  const c = PALETTES[palette] ?? PALETTES.jamdani
  const motifDef = (MOTIFS[motif] ?? MOTIFS.diamond)(c)
  const shift = (seed % 5) * 7

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="কাপড়ের নকশা">
  <defs>
    <linearGradient id="ground" x1="0" y1="0" x2="0.4" y2="1">
      <stop offset="0%" stop-color="${c.ground}"/>
      <stop offset="55%" stop-color="${c.weft}"/>
      <stop offset="100%" stop-color="${c.ground}"/>
    </linearGradient>

    <!-- সুতোর বুনন -->
    <pattern id="weave" width="6" height="6" patternUnits="userSpaceOnUse">
      <rect width="6" height="6" fill="none"/>
      <rect x="0" y="0" width="6" height="1" fill="#000" opacity="0.045"/>
      <rect x="0" y="0" width="1" height="6" fill="#fff" opacity="0.06"/>
    </pattern>

    ${motifDef}

    <!-- কাপড়ের ভাঁজের আলো-ছায়া -->
    <linearGradient id="fold" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#000" stop-opacity="0.16"/>
      <stop offset="18%" stop-color="#fff" stop-opacity="0.10"/>
      <stop offset="38%" stop-color="#000" stop-opacity="0.10"/>
      <stop offset="60%" stop-color="#fff" stop-opacity="0.12"/>
      <stop offset="82%" stop-color="#000" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.18"/>
    </linearGradient>

    <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fff" stop-opacity="0.18"/>
      <stop offset="45%" stop-color="#fff" stop-opacity="0"/>
      <stop offset="100%" stop-color="#fff" stop-opacity="0.10"/>
    </linearGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#ground)"/>
  <g transform="translate(${shift} ${shift})">
    <rect x="-${shift}" y="-${shift}" width="${W + shift * 2}" height="${H + shift * 2}" fill="url(#motif)"/>
  </g>
  <rect width="${W}" height="${H}" fill="url(#weave)"/>

  <!-- আঁচলের চওড়া পাড় -->
  <rect x="0" y="${H - 260}" width="${W}" height="260" fill="${c.border}" opacity="0.92"/>
  <rect x="0" y="${H - 260}" width="${W}" height="260" fill="url(#motif)" opacity="0.5"/>
  <rect x="0" y="${H - 272}" width="${W}" height="12" fill="${c.motif}" opacity="0.85"/>
  <rect x="0" y="${H - 300}" width="${W}" height="5" fill="${c.motif}" opacity="0.55"/>

  <!-- পাশের সরু পাড় -->
  <rect x="0" y="0" width="34" height="${H}" fill="${c.border}" opacity="0.85"/>
  <rect x="38" y="0" width="6" height="${H}" fill="${c.motif}" opacity="0.6"/>
  <rect x="${W - 34}" y="0" width="34" height="${H}" fill="${c.border}" opacity="0.85"/>
  <rect x="${W - 44}" y="0" width="6" height="${H}" fill="${c.motif}" opacity="0.6"/>

  <rect width="${W}" height="${H}" fill="url(#fold)"/>
  <rect width="${W}" height="${H}" fill="url(#sheen)"/>
</svg>
`
}

/** ব্যানারের জন্য চওড়া ছবি */
function bannerSvg({ palette, motif }: Spec) {
  const c = PALETTES[palette] ?? PALETTES.katan
  const motifDef = (MOTIFS[motif] ?? MOTIFS.paisley)(c)
  const w = 1600
  const h = 900
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="ব্যানার">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${c.ground}"/>
      <stop offset="100%" stop-color="${c.weft}"/>
    </linearGradient>
    ${motifDef}
    <radialGradient id="vig" cx="0.35" cy="0.4" r="0.85">
      <stop offset="0%" stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.35"/>
    </radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  <rect width="${w}" height="${h}" fill="url(#motif)" opacity="0.85"/>
  <rect x="0" y="${h - 90}" width="${w}" height="90" fill="${c.border}" opacity="0.9"/>
  <rect x="0" y="${h - 98}" width="${w}" height="8" fill="${c.motif}" opacity="0.8"/>
  <rect width="${w}" height="${h}" fill="url(#vig)"/>
</svg>
`
}

/** ক্যাটাগরির বর্গাকার ছবি */
function squareSvg({ palette, motif }: Spec) {
  const c = PALETTES[palette] ?? PALETTES.tant
  const motifDef = (MOTIFS[motif] ?? MOTIFS.check)(c)
  const s = 600
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${s} ${s}" width="${s}" height="${s}" role="img" aria-label="ক্যাটাগরি">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0.6" y2="1">
      <stop offset="0%" stop-color="${c.ground}"/>
      <stop offset="100%" stop-color="${c.weft}"/>
    </linearGradient>
    ${motifDef}
  </defs>
  <rect width="${s}" height="${s}" fill="url(#g)"/>
  <rect width="${s}" height="${s}" fill="url(#motif)"/>
  <rect x="0" y="${s - 56}" width="${s}" height="56" fill="${c.border}" opacity="0.9"/>
  <rect x="0" y="0" width="${s}" height="18" fill="${c.border}" opacity="0.7"/>
</svg>
`
}

export async function generatePlaceholders() {
  await mkdir(OUT_DIR, { recursive: true })
  const written: string[] = []

  // পণ্যের ছবি — প্রতিটি প্যালেট × প্রতিটি মোটিফ
  for (const palette of PALETTE_NAMES) {
    for (let i = 0; i < MOTIF_NAMES.length; i++) {
      const motif = MOTIF_NAMES[i]
      const name = `fabric-${palette}-${motif}.svg`
      await writeFile(join(OUT_DIR, name), svg({ palette, motif, seed: i }), 'utf8')
      written.push(`/seed/${name}`)
    }
  }

  // ব্যানার
  const banners = [
    { palette: 'katan', motif: 'paisley', name: 'banner-1.svg' },
    { palette: 'jamdani', motif: 'diamond', name: 'banner-2.svg' },
    { palette: 'silk', motif: 'floral', name: 'banner-3.svg' },
  ]
  for (const b of banners) {
    await writeFile(join(OUT_DIR, b.name), bannerSvg(b), 'utf8')
  }

  // ক্যাটাগরি
  const squares = [
    { palette: 'dhakai', motif: 'diamond', name: 'cat-jamdani.svg' },
    { palette: 'katan', motif: 'zari', name: 'cat-katan.svg' },
    { palette: 'tant', motif: 'check', name: 'cat-tant.svg' },
    { palette: 'silk', motif: 'paisley', name: 'cat-silk.svg' },
    { palette: 'rose', motif: 'floral', name: 'cat-threepiece.svg' },
    { palette: 'cotton', motif: 'stripe', name: 'cat-cotton.svg' },
    { palette: 'emerald', motif: 'floral', name: 'cat-kurti.svg' },
    { palette: 'indigo', motif: 'diamond', name: 'cat-orna.svg' },
  ]
  for (const s of squares) {
    await writeFile(join(OUT_DIR, s.name), squareSvg(s), 'utf8')
  }

  return { products: written, count: written.length + banners.length + squares.length }
}

// সরাসরি চালালে
if (process.argv[1] && /generate-placeholders\.(ts|mjs|js)$/.test(process.argv[1])) {
  generatePlaceholders().then((res) => {
    console.log(`✔ ${res.count} টি ছবি তৈরি হয়েছে → public/seed/`)
  })
}
