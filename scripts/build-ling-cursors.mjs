import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';

// Code-native UI icons: silver hair, white fox ears, water-blue tips and blue eyes.
const face = `<g stroke="#536984" stroke-width=".9" stroke-linejoin="round">
 <path d="M16 24Q12 29 13 37L19 35L22 39L25 36L29 39L31 35L38 37Q40 29 35 22Z" fill="#dcefff"/>
 <path d="M17 22L15 10L23 16M29 16L36 9L35 24" fill="#f7f8ff"/>
 <path d="M17 17L17 13L21 17M31 17L34 12L34 19" fill="#edc9e0" stroke="none"/>
 <ellipse cx="26" cy="26" rx="10" ry="10.5" fill="#fff0e9"/>
 <path d="M16 26Q13 13 26 14Q39 13 37 28L33 24L31 19L29 25L25 19L23 25L21 21L19 28Z" fill="#f6f6ff"/>
 <path d="M17 26L16 34L20 33M35 26L36 34L32 33" fill="#eef7ff"/>
 <path d="M21 28Q23 27 24 28M28 28Q30 27 32 28" fill="none" stroke="#354d6b" stroke-width="1.2"/>
 <ellipse cx="23" cy="29.5" rx="1.4" ry="2" fill="#74c9ee" stroke="none"/><ellipse cx="30" cy="29.5" rx="1.4" ry="2" fill="#74c9ee" stroke="none"/>
 <circle cx="23.4" cy="28.7" r=".6" fill="white" stroke="none"/><circle cx="30.4" cy="28.7" r=".6" fill="white" stroke="none"/>
 <path d="M25 33Q27 34.5 29 33" fill="none" stroke="#bb7f8a" stroke-width=".75"/>
 <path d="M18 35L20 38M34 35L32 38" stroke="#92d7f1" stroke-width="1.8"/>
</g>`;
const markers = {
 default: '<path d="M2 2L3 19L7 14L11 21L14 19L10 12L17 12Z" fill="#e8f5ff" stroke="#304968" stroke-width="1.4" stroke-linejoin="round"/><path d="M4 5L5 13L8 10L12 10Z" fill="#a0d5ef"/>',
 pointer: '<path d="M7 15V4Q7 1 10 3V10Q12 8 14 11Q16 9 18 13V20Q18 26 13 27H10Q7 27 5 23L2 17Q1 14 4 14L7 17Z" fill="#eef8ff" stroke="#304968" stroke-width="1.3" stroke-linejoin="round"/><path d="M10 19V23M13 18V23M16 17V22" stroke="#95c9e9" stroke-width="1"/>',
 text: '<path d="M3 3H11M7 3V22M3 22H11" fill="none" stroke="#304968" stroke-width="4" stroke-linecap="round"/><path d="M3 3H11M7 3V22M3 22H11" fill="none" stroke="#c9edff" stroke-width="1.5" stroke-linecap="round"/>',
};
const hotspots = { default:[2,2], pointer:[8,3], text:[7,12] };
await mkdir('public/cursors', {recursive:true});
for (const [name, marker] of Object.entries(markers)) {
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">${face}${marker}</svg>`;
 await writeFile(`public/cursors/ling-${name}.svg`,svg);
 await sharp(Buffer.from(svg)).png().toFile(`public/cursors/ling-${name}.png`);
 // CUR embeds the PNG payload and stores the actual interaction hotspot.
 const png=await sharp(Buffer.from(svg)).png().toBuffer();
 const header=Buffer.alloc(22);header.writeUInt16LE(2,2);header.writeUInt16LE(1,4);header[6]=40;header[7]=40;
 header.writeUInt16LE(hotspots[name][0],10);header.writeUInt16LE(hotspots[name][1],12);header.writeUInt32LE(png.length,14);header.writeUInt32LE(22,18);
 await writeFile(`public/cursors/ling-${name}.cur`,Buffer.concat([header,png]));
 console.log(name,hotspots[name],png.length);
}
