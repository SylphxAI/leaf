#!/usr/bin/env bun
import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const publicDir = join(import.meta.dir, '../docs/public');

// Icon configuration
const iconSizes = [
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'favicon.png', size: 32 },
];

async function generateIcons() {
  console.log('🎨 Generating PNG icons from SVG...\n');

  // Read the favicon SVG
  const faviconSvg = await readFile(join(publicDir, 'favicon.svg'), 'utf-8');

  // Create a centered icon with padding for better visibility
  const createIconSvg = (size: number) => {
    const padding = Math.floor(size * 0.15); // 15% padding
    const iconSize = size - (padding * 2);

    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${size}" height="${size}" fill="#ffffff" rx="${size * 0.15}"/>
        <g transform="translate(${padding}, ${padding})">
          <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
            <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
          </svg>
        </g>
      </svg>
    `.trim();
  };

  // Generate each icon size
  for (const { name, size } of iconSizes) {
    const iconSvg = createIconSvg(size);
    const outputPath = join(publicDir, name);

    await sharp(Buffer.from(iconSvg))
      .png({ quality: 100, compressionLevel: 9 })
      .toFile(outputPath);

    console.log(`✓ Generated ${name} (${size}x${size})`);
  }

  // Generate OG image PNG from SVG
  console.log('\n🖼️  Generating OG image PNG...\n');
  const ogSvg = await readFile(join(publicDir, 'og-image.svg'), 'utf-8');

  await sharp(Buffer.from(ogSvg))
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(join(publicDir, 'og-image.png'));

  console.log('✓ Generated og-image.png (1200x630)');

  console.log('\n✨ All icons generated successfully!\n');
}

generateIcons().catch(console.error);
