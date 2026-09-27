const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// 1. Create Adaptive Foreground SVG (432x432)
// Safe zone: inner circle r=144 centered at (216, 216).
// 3x3 Grid: dots at x in [130, 216, 302], y in [130, 216, 302]. Spacing = 86px.
const foregroundSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 432 432" width="432" height="432">
  <defs>
    <!-- Royal Blue Gradient for completed box -->
    <linearGradient id="fgBox1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3B82F6"/>
      <stop offset="100%" stop-color="#1D4ED8"/>
    </linearGradient>

    <!-- Sky Blue Tint for second box -->
    <linearGradient id="fgBox2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#BFDBFE"/>
      <stop offset="100%" stop-color="#93C5FD"/>
    </linearGradient>

    <filter id="fgShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#1E40AF" flood-opacity="0.25"/>
    </filter>
  </defs>

  <!-- BACKGROUND: Pure White Card inside safe area -->
  <rect x="76" y="76" width="280" height="280" rx="64" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="3" filter="url(#fgShadow)"/>

  <!-- BOX 1 (Top-Left): 130 to 216 (86x86 square) - Completed with Royal Blue -->
  <rect x="130" y="130" width="86" height="86" rx="14" fill="url(#fgBox1)"/>
  
  <!-- Subtle clean checkmark in completed box -->
  <path d="M 158 173 L 169 184 L 189 162" fill="none" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>

  <!-- BOX 2 (Bottom-Left): 130 to 216 (86x86 square) - Claimed with Light Sky Blue tint -->
  <rect x="130" y="216" width="86" height="86" rx="14" fill="url(#fgBox2)" fill-opacity="0.6"/>

  <!-- STRICTLY HORIZONTAL LINES (y1 == y2, ONLY between adjacent dots, NO DIAGONALS) -->
  <!-- Line 1: (130, 130) to (216, 130) -->
  <line x1="130" y1="130" x2="216" y2="130" stroke="#1D4ED8" stroke-width="12" stroke-linecap="round"/>
  <!-- Line 2: (216, 130) to (302, 130) -->
  <line x1="216" y1="130" x2="302" y2="130" stroke="#2563EB" stroke-width="12" stroke-linecap="round"/>
  <!-- Line 3: (130, 216) to (216, 216) -->
  <line x1="130" y1="216" x2="216" y2="216" stroke="#1D4ED8" stroke-width="12" stroke-linecap="round"/>
  <!-- Line 4: (216, 216) to (302, 216) -->
  <line x1="216" y1="216" x2="302" y2="216" stroke="#3B82F6" stroke-width="12" stroke-linecap="round"/>
  <!-- Line 5: (130, 302) to (216, 302) -->
  <line x1="130" y1="302" x2="216" y2="302" stroke="#2563EB" stroke-width="12" stroke-linecap="round"/>

  <!-- STRICTLY VERTICAL LINES (x1 == x2, ONLY between adjacent dots, NO DIAGONALS) -->
  <!-- Line 6: (130, 130) to (130, 216) -->
  <line x1="130" y1="130" x2="130" y2="216" stroke="#1D4ED8" stroke-width="12" stroke-linecap="round"/>
  <!-- Line 7: (130, 216) to (130, 302) -->
  <line x1="130" y1="216" x2="130" y2="302" stroke="#2563EB" stroke-width="12" stroke-linecap="round"/>
  <!-- Line 8: (216, 130) to (216, 216) -->
  <line x1="216" y1="130" x2="216" y2="216" stroke="#1D4ED8" stroke-width="12" stroke-linecap="round"/>
  <!-- Line 9: (216, 216) to (216, 302) -->
  <line x1="216" y1="216" x2="216" y2="302" stroke="#2563EB" stroke-width="12" stroke-linecap="round"/>
  <!-- Line 10: (302, 130) to (302, 216) -->
  <line x1="302" y1="130" x2="302" y2="216" stroke="#3B82F6" stroke-width="12" stroke-linecap="round"/>

  <!-- 3x3 GRID OF 9 DOTS (Circles at exact intersections, white border) -->
  <!-- Row 1: y = 130 -->
  <circle cx="130" cy="130" r="11" fill="#1E3A8A" stroke="#FFFFFF" stroke-width="3"/>
  <circle cx="216" cy="130" r="11" fill="#1E3A8A" stroke="#FFFFFF" stroke-width="3"/>
  <circle cx="302" cy="130" r="11" fill="#2563EB" stroke="#FFFFFF" stroke-width="3"/>

  <!-- Row 2: y = 216 -->
  <circle cx="130" cy="216" r="11" fill="#1E3A8A" stroke="#FFFFFF" stroke-width="3"/>
  <circle cx="216" cy="216" r="11" fill="#1E3A8A" stroke="#FFFFFF" stroke-width="3"/>
  <circle cx="302" cy="216" r="11" fill="#2563EB" stroke="#FFFFFF" stroke-width="3"/>

  <!-- Row 3: y = 302 -->
  <circle cx="130" cy="302" r="11" fill="#2563EB" stroke="#FFFFFF" stroke-width="3"/>
  <circle cx="216" cy="302" r="11" fill="#2563EB" stroke="#FFFFFF" stroke-width="3"/>
  <!-- Open dot (waiting for next line) -->
  <circle cx="302" cy="302" r="9" fill="#94A3B8" stroke="#FFFFFF" stroke-width="2.5"/>
</svg>
`;

// 2. Full Standard Icon SVG (512x512) - White squircle background
const fullIconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgWhite" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#F8FAFC"/>
    </linearGradient>

    <linearGradient id="fullBox1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3B82F6"/>
      <stop offset="100%" stop-color="#1D4ED8"/>
    </linearGradient>

    <linearGradient id="fullBox2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#BFDBFE"/>
      <stop offset="100%" stop-color="#93C5FD"/>
    </linearGradient>

    <filter id="iconShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="14" stdDeviation="18" flood-color="#0284C7" flood-opacity="0.15"/>
    </filter>

    <filter id="innerBoxShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#1E40AF" flood-opacity="0.3"/>
    </filter>
  </defs>

  <!-- Clean, Crisp White Squircle Card -->
  <rect x="24" y="24" width="464" height="464" rx="108" fill="url(#bgWhite)" stroke="#DBEAFE" stroke-width="4" filter="url(#iconShadow)"/>

  <!-- Center (256, 256), 3x3 Grid spacing = 108px -->
  <!-- Dots at x in [148, 256, 364], y in [148, 256, 364] -->

  <!-- COMPLETED BOX (Top-Left): 148 to 256 (108x108 px) -->
  <rect x="148" y="148" width="108" height="108" rx="16" fill="url(#fullBox1)" filter="url(#innerBoxShadow)"/>
  <path d="M 182 202 L 197 217 L 222 188" fill="none" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>

  <!-- SECOND BOX (Bottom-Left): 148 to 256 (108x108 px) -->
  <rect x="148" y="256" width="108" height="108" rx="16" fill="url(#fullBox2)" fill-opacity="0.65"/>

  <!-- STRICTLY HORIZONTAL LINES (NO DIAGONALS) -->
  <line x1="148" y1="148" x2="256" y2="148" stroke="#1D4ED8" stroke-width="15" stroke-linecap="round"/>
  <line x1="256" y1="148" x2="364" y2="148" stroke="#2563EB" stroke-width="15" stroke-linecap="round"/>
  <line x1="148" y1="256" x2="256" y2="256" stroke="#1D4ED8" stroke-width="15" stroke-linecap="round"/>
  <line x1="256" y1="256" x2="364" y2="256" stroke="#3B82F6" stroke-width="15" stroke-linecap="round"/>
  <line x1="148" y1="364" x2="256" y2="364" stroke="#2563EB" stroke-width="15" stroke-linecap="round"/>

  <!-- STRICTLY VERTICAL LINES (NO DIAGONALS) -->
  <line x1="148" y1="148" x2="148" y2="256" stroke="#1D4ED8" stroke-width="15" stroke-linecap="round"/>
  <line x1="148" y1="256" x2="148" y2="364" stroke="#2563EB" stroke-width="15" stroke-linecap="round"/>
  <line x1="256" y1="148" x2="256" y2="256" stroke="#1D4ED8" stroke-width="15" stroke-linecap="round"/>
  <line x1="256" y1="256" x2="256" y2="364" stroke="#2563EB" stroke-width="15" stroke-linecap="round"/>
  <line x1="364" y1="148" x2="364" y2="256" stroke="#3B82F6" stroke-width="15" stroke-linecap="round"/>

  <!-- 3x3 GRID OF 9 DOTS -->
  <circle cx="148" cy="148" r="14" fill="#1E3A8A" stroke="#FFFFFF" stroke-width="3.5"/>
  <circle cx="256" cy="148" r="14" fill="#1E3A8A" stroke="#FFFFFF" stroke-width="3.5"/>
  <circle cx="364" cy="148" r="14" fill="#2563EB" stroke="#FFFFFF" stroke-width="3.5"/>

  <circle cx="148" cy="256" r="14" fill="#1E3A8A" stroke="#FFFFFF" stroke-width="3.5"/>
  <circle cx="256" cy="256" r="14" fill="#1E3A8A" stroke="#FFFFFF" stroke-width="3.5"/>
  <circle cx="364" cy="256" r="14" fill="#2563EB" stroke="#FFFFFF" stroke-width="3.5"/>

  <circle cx="148" cy="364" r="14" fill="#2563EB" stroke="#FFFFFF" stroke-width="3.5"/>
  <circle cx="256" cy="364" r="14" fill="#2563EB" stroke="#FFFFFF" stroke-width="3.5"/>
  <circle cx="364" cy="364" r="11" fill="#94A3B8" stroke="#FFFFFF" stroke-width="3"/>
</svg>
`;

// 3. Round Icon SVG (512x512) - White circle background
const roundIconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgRound" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#F8FAFC"/>
    </linearGradient>

    <linearGradient id="rndBox1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3B82F6"/>
      <stop offset="100%" stop-color="#1D4ED8"/>
    </linearGradient>

    <linearGradient id="rndBox2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#BFDBFE"/>
      <stop offset="100%" stop-color="#93C5FD"/>
    </linearGradient>

    <filter id="rndShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#0284C7" flood-opacity="0.16"/>
    </filter>

    <filter id="rndInnerBoxShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#1E40AF" flood-opacity="0.3"/>
    </filter>
  </defs>

  <!-- Clean, Crisp White Circular Badge -->
  <circle cx="256" cy="256" r="236" fill="url(#bgRound)" stroke="#DBEAFE" stroke-width="4" filter="url(#rndShadow)"/>

  <!-- COMPLETED BOX (Top-Left): 150 to 256 (106x106 px) -->
  <rect x="150" y="150" width="106" height="106" rx="16" fill="url(#rndBox1)" filter="url(#rndInnerBoxShadow)"/>
  <path d="M 183 203 L 198 218 L 223 189" fill="none" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>

  <!-- SECOND BOX (Bottom-Left) -->
  <rect x="150" y="256" width="106" height="106" rx="16" fill="url(#rndBox2)" fill-opacity="0.65"/>

  <!-- STRICTLY HORIZONTAL LINES (NO DIAGONALS) -->
  <line x1="150" y1="150" x2="256" y2="150" stroke="#1D4ED8" stroke-width="15" stroke-linecap="round"/>
  <line x1="256" y1="150" x2="362" y2="150" stroke="#2563EB" stroke-width="15" stroke-linecap="round"/>
  <line x1="150" y1="256" x2="256" y2="256" stroke="#1D4ED8" stroke-width="15" stroke-linecap="round"/>
  <line x1="256" y1="256" x2="362" y2="256" stroke="#3B82F6" stroke-width="15" stroke-linecap="round"/>
  <line x1="150" y1="362" x2="256" y2="362" stroke="#2563EB" stroke-width="15" stroke-linecap="round"/>

  <!-- STRICTLY VERTICAL LINES (NO DIAGONALS) -->
  <line x1="150" y1="150" x2="150" y2="256" stroke="#1D4ED8" stroke-width="15" stroke-linecap="round"/>
  <line x1="150" y1="256" x2="150" y2="362" stroke="#2563EB" stroke-width="15" stroke-linecap="round"/>
  <line x1="256" y1="150" x2="256" y2="256" stroke="#1D4ED8" stroke-width="15" stroke-linecap="round"/>
  <line x1="256" y1="256" x2="256" y2="362" stroke="#2563EB" stroke-width="15" stroke-linecap="round"/>
  <line x1="362" y1="150" x2="362" y2="256" stroke="#3B82F6" stroke-width="15" stroke-linecap="round"/>

  <!-- 3x3 GRID OF 9 DOTS -->
  <circle cx="150" cy="150" r="14" fill="#1E3A8A" stroke="#FFFFFF" stroke-width="3.5"/>
  <circle cx="256" cy="150" r="14" fill="#1E3A8A" stroke="#FFFFFF" stroke-width="3.5"/>
  <circle cx="362" cy="150" r="14" fill="#2563EB" stroke="#FFFFFF" stroke-width="3.5"/>

  <circle cx="150" cy="256" r="14" fill="#1E3A8A" stroke="#FFFFFF" stroke-width="3.5"/>
  <circle cx="256" cy="256" r="14" fill="#1E3A8A" stroke="#FFFFFF" stroke-width="3.5"/>
  <circle cx="362" cy="256" r="14" fill="#2563EB" stroke="#FFFFFF" stroke-width="3.5"/>

  <circle cx="150" cy="362" r="14" fill="#2563EB" stroke="#FFFFFF" stroke-width="3.5"/>
  <circle cx="256" cy="362" r="14" fill="#2563EB" stroke="#FFFFFF" stroke-width="3.5"/>
  <circle cx="362" cy="362" r="11" fill="#94A3B8" stroke="#FFFFFF" stroke-width="3"/>
</svg>
`;

async function generateAll() {
  const densities = [
    { dir: 'mipmap-mdpi', iconSize: 48, fgSize: 108 },
    { dir: 'mipmap-hdpi', iconSize: 72, fgSize: 162 },
    { dir: 'mipmap-xhdpi', iconSize: 96, fgSize: 216 },
    { dir: 'mipmap-xxhdpi', iconSize: 144, fgSize: 324 },
    { dir: 'mipmap-xxxhdpi', iconSize: 192, fgSize: 432 },
  ];

  const targetDirs = [
    path.join(__dirname, 'android-res'),
    path.join(__dirname, 'android/app/src/main/res')
  ];

  for (const baseDir of targetDirs) {
    // 1. Ensure values/ic_launcher_background.xml is white
    const valuesDir = path.join(baseDir, 'values');
    if (!fs.existsSync(valuesDir)) fs.mkdirSync(valuesDir, { recursive: true });
    fs.writeFileSync(path.join(valuesDir, 'ic_launcher_background.xml'), `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#FFFFFF</color>
</resources>
`);

    // 2. Ensure mipmap-anydpi-v26 exists
    const anydpiDir = path.join(baseDir, 'mipmap-anydpi-v26');
    if (!fs.existsSync(anydpiDir)) fs.mkdirSync(anydpiDir, { recursive: true });
    fs.writeFileSync(path.join(anydpiDir, 'ic_launcher.xml'), `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
`);
    fs.writeFileSync(path.join(anydpiDir, 'ic_launcher_round.xml'), `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
`);

    // 3. Generate PNGs for each density
    for (const d of densities) {
      const densityDir = path.join(baseDir, d.dir);
      if (!fs.existsSync(densityDir)) fs.mkdirSync(densityDir, { recursive: true });

      // Standard icon
      await sharp(Buffer.from(fullIconSvg))
        .resize(d.iconSize, d.iconSize)
        .png()
        .toFile(path.join(densityDir, 'ic_launcher.png'));

      // Round icon
      await sharp(Buffer.from(roundIconSvg))
        .resize(d.iconSize, d.iconSize)
        .png()
        .toFile(path.join(densityDir, 'ic_launcher_round.png'));

      // Foreground adaptive icon
      await sharp(Buffer.from(foregroundSvg))
        .resize(d.fgSize, d.fgSize)
        .png()
        .toFile(path.join(densityDir, 'ic_launcher_foreground.png'));

      console.log(`Generated icons in ${baseDir}/${d.dir}`);
    }
  }

  // Also update public/icon.png and public/favicon.png for web/PWA
  const publicDir = path.join(__dirname, 'public');
  if (fs.existsSync(publicDir)) {
    await sharp(Buffer.from(fullIconSvg))
      .resize(512, 512)
      .png()
      .toFile(path.join(publicDir, 'icon.png'));

    await sharp(Buffer.from(roundIconSvg))
      .resize(64, 64)
      .png()
      .toFile(path.join(publicDir, 'favicon.png'));

    console.log('Updated public/icon.png and public/favicon.png');
  }

  console.log('All icons generated successfully!');
}

generateAll().catch(err => {
  console.error(err);
  process.exit(1);
});
