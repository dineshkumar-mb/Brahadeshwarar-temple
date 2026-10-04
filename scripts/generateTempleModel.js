import fs from 'fs';
import path from 'path';
import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

// Polyfill FileReader for Node.js
if (typeof FileReader === 'undefined') {
  global.FileReader = class FileReader {
    readAsArrayBuffer(blob) {
      blob.arrayBuffer().then((buf) => {
        this.result = buf;
        if (this.onloadend) this.onloadend();
      });
    }
  };
}

console.log('🏛️ Generating Authentic Brihadisvara Temple 3D Model with Entrance Gateway & Sculpted Nandi...');

const geometries = {
  stoneBase: [],
  sanctumWall: [],
  vimana: [],
  goldFinial: [],
  nandi: [],
  courtyard: [],
  lawn: [],
  details: [],
};

function addGeo(category, geo, matrix) {
  if (matrix) geo.applyMatrix4(matrix);
  geometries[category].push(geo);
}

function makeBox(w, h, d, x, y, z, category = 'stoneBase') {
  const geo = new THREE.BoxGeometry(w, h, d);
  const m = new THREE.Matrix4().makeTranslation(x, y, z);
  addGeo(category, geo, m);
}

function makeCylinder(rTop, rBottom, height, radialSegments, x, y, z, rx = 0, ry = 0, rz = 0, category = 'sanctumWall') {
  const geo = new THREE.CylinderGeometry(rTop, rBottom, height, radialSegments);
  const rot = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rx, ry, rz));
  const trans = new THREE.Matrix4().makeTranslation(x, y, z);
  const m = new THREE.Matrix4().multiply(trans).multiply(rot);
  addGeo(category, geo, m);
}

function makeSphere(radius, sx, sy, sz, x, y, z, rx = 0, ry = 0, rz = 0, category = 'nandi', wSegs = 32, hSegs = 24) {
  const geo = new THREE.SphereGeometry(radius, wSegs, hSegs);
  const scale = new THREE.Matrix4().makeScale(sx, sy, sz);
  const rot = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rx, ry, rz));
  const trans = new THREE.Matrix4().makeTranslation(x, y, z);
  const m = new THREE.Matrix4().multiply(trans).multiply(rot).multiply(scale);
  addGeo(category, geo, m);
}

function makeTorus(radius, tube, radSegs, tubeSegs, x, y, z, rx = 0, ry = 0, rz = 0, category = 'details') {
  const geo = new THREE.TorusGeometry(radius, tube, radSegs, tubeSegs);
  const rot = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rx, ry, rz));
  const trans = new THREE.Matrix4().makeTranslation(x, y, z);
  const m = new THREE.Matrix4().multiply(trans).multiply(rot);
  addGeo(category, geo, m);
}

// -------------------------------------------------------------
// 1. COURTYARD & CLOISTERED PRAKARA (Tiruch-churru-maligai)
// -------------------------------------------------------------
console.log('-> 1. Courtyard & Prakara Colonnade...');
const pW = 120; // total width
const pL = 200; // total length
const pZ = 30;  // center Z

// Main stone courtyard platform
makeBox(130, 0.6, 210, 0, -0.3, pZ, 'courtyard');

// Outer Prakara walls (North, South, West)
const wallThick = 2.4;
const wallHeight = 5.6;
makeBox(pW, wallHeight, wallThick, 0, wallHeight / 2, pZ - pL / 2, 'stoneBase'); // West wall
makeBox(wallThick, wallHeight, pL, -pW / 2, wallHeight / 2, pZ, 'stoneBase');    // North wall
makeBox(wallThick, wallHeight, pL, pW / 2, wallHeight / 2, pZ, 'stoneBase');     // South wall

// Cloister Walkway Columns & Roof along interior perimeter
const cloisterDepth = 5.2;
const cloisterHeight = 4.4;
for (let z = pZ - pL / 2 + 8; z <= pZ + pL / 2 - 8; z += 4.8) {
  makeCylinder(0.22, 0.25, cloisterHeight, 10, -pW / 2 + cloisterDepth, cloisterHeight / 2, z, 0, 0, 0, 'details');
  makeCylinder(0.22, 0.25, cloisterHeight, 10, pW / 2 - cloisterDepth, cloisterHeight / 2, z, 0, 0, 0, 'details');
}
for (let x = -pW / 2 + cloisterDepth; x <= pW / 2 - cloisterDepth; x += 4.8) {
  makeCylinder(0.22, 0.25, cloisterHeight, 10, x, cloisterHeight / 2, pZ - pL / 2 + cloisterDepth, 0, 0, 0, 'details');
}
// Cloister covered roof slabs
makeBox(cloisterDepth, 0.4, pL - 10, -pW / 2 + cloisterDepth / 2, cloisterHeight + 0.2, pZ, 'stoneBase');
makeBox(cloisterDepth, 0.4, pL - 10, pW / 2 - cloisterDepth / 2, cloisterHeight + 0.2, pZ, 'stoneBase');
makeBox(pW - 10, 0.4, cloisterDepth, 0, cloisterHeight + 0.2, pZ - pL / 2 + cloisterDepth / 2, 'stoneBase');

// -------------------------------------------------------------
// 2. MAIN TEMPLE PLINTH (Upapitha & Adhishthana)
// -------------------------------------------------------------
console.log('-> 2. Molded Adhishthana Plinths & Balustrades...');
const vimanaZ = -25;
const sanctumW = 30.2;
const plinthH = 4.4;

// Molded tiered basement
makeBox(sanctumW + 3.0, 0.8, sanctumW + 3.0, 0, 0.4, vimanaZ, 'stoneBase');
makeBox(sanctumW + 1.8, 1.2, sanctumW + 1.8, 0, 1.4, vimanaZ, 'stoneBase');
makeBox(sanctumW + 2.4, 0.8, sanctumW + 2.4, 0, 2.4, vimanaZ, 'details');
makeBox(sanctumW + 1.4, 0.6, sanctumW + 1.4, 0, 3.1, vimanaZ, 'stoneBase');
makeBox(sanctumW + 2.2, 0.8, sanctumW + 2.2, 0, 3.8, vimanaZ, 'stoneBase');

// Mandapa plinth extending East
const mandapaLength = 54;
const mandapaStartZ = vimanaZ + sanctumW / 2;
const mandapaCenterZ = mandapaStartZ + mandapaLength / 2;
const mandapaW = 24;

makeBox(mandapaW + 2.0, 0.8, mandapaLength + 1.0, 0, 0.4, mandapaCenterZ, 'stoneBase');
makeBox(mandapaW + 1.0, 1.2, mandapaLength, 0, 1.4, mandapaCenterZ, 'stoneBase');
makeBox(mandapaW + 1.6, 0.8, mandapaLength, 0, 2.4, mandapaCenterZ, 'details');
makeBox(mandapaW + 1.2, 1.4, mandapaLength, 0, 3.5, mandapaCenterZ, 'stoneBase');

// Lateral Flights of Steps with Yali Balustrades
function makeFlightOfSteps(w, d, h, x, z, angleY) {
  const steps = 14;
  const stepH = h / steps;
  const stepD = d / steps;
  for (let i = 0; i < steps; i++) {
    const sH = stepH;
    const sX = x + (i * stepD * Math.sin(angleY));
    const sZ = z + (i * stepD * Math.cos(angleY));
    const sY = i * stepH + stepH / 2;
    makeBox(w, sH, stepD, sX, sY, sZ, 'stoneBase');
  }
  // Yali Balustrades on flanks
  makeBox(0.55, h + 0.8, d + 1, x - w / 2 - 0.28, h / 2, z + d / 2, 'details');
  makeBox(0.55, h + 0.8, d + 1, x + w / 2 + 0.28, h / 2, z + d / 2, 'details');
}

makeFlightOfSteps(5.0, 7.5, plinthH, mandapaW / 2 + 3.75, mandapaCenterZ, Math.PI / 2);
makeFlightOfSteps(5.0, 7.5, plinthH, -mandapaW / 2 - 3.75, mandapaCenterZ, -Math.PI / 2);
makeFlightOfSteps(6.0, 8.0, plinthH, 0, mandapaStartZ + mandapaLength + 4.0, 0);

// -------------------------------------------------------------
// 3. GARBHAGRIHA TWO-STOREY SANCTUM WALLS
// -------------------------------------------------------------
// 3. GARBHAGRIHA TWO-STOREY SANCTUM WALLS & MAHA LINGAM
// (Faithfully modeled matching lingam.jpg)
// -------------------------------------------------------------
console.log('-> 3. Two-Storey Sanctum Walls & Colossal Peruvudaiyar Maha Lingam (matching lingam.jpg)...');
const sanctumWallH = 14.4;
const sY = plinthH;
const sWallThick = 4.2; // Massive Chola double-granite wall construction
const innerSanctumW = sanctumW - 2 * sWallThick; // 21.8m inner sanctum chamber

// Exterior Sanctum Walls with Open Eastern Gateway Portal to Ardhamandapa
// West Wall
makeBox(sanctumW, sanctumWallH, sWallThick, 0, sY + sanctumWallH / 2, vimanaZ - sanctumW / 2 + sWallThick / 2, 'sanctumWall');
// North Wall
makeBox(sWallThick, sanctumWallH, sanctumW, -sanctumW / 2 + sWallThick / 2, sY + sanctumWallH / 2, vimanaZ, 'sanctumWall');
// South Wall
makeBox(sWallThick, sanctumWallH, sanctumW, sanctumW / 2 - sWallThick / 2, sY + sanctumWallH / 2, vimanaZ, 'sanctumWall');

// East Wall (Flanking the grand entrance portal into the sanctum)
const sDoorW = 4.6;
const sDoorH = 6.2;
const sEastWingW = (sanctumW - sDoorW) / 2;
makeBox(sEastWingW, sanctumWallH, sWallThick, -sDoorW / 2 - sEastWingW / 2, sY + sanctumWallH / 2, vimanaZ + sanctumW / 2 - sWallThick / 2, 'sanctumWall');
makeBox(sEastWingW, sanctumWallH, sWallThick, sDoorW / 2 + sEastWingW / 2, sY + sanctumWallH / 2, vimanaZ + sanctumW / 2 - sWallThick / 2, 'sanctumWall');
// Lintel spanning above the inner sanctum portal
makeBox(sanctumW, sanctumWallH - sDoorH, sWallThick, 0, sY + sDoorH + (sanctumWallH - sDoorH) / 2, vimanaZ + sanctumW / 2 - sWallThick / 2, 'sanctumWall');

// Stringcourse Cornices on outer sanctum walls
makeBox(sanctumW + 1.6, 0.7, sanctumW + 1.6, 0, sY + 7.2, vimanaZ, 'details');
makeBox(sanctumW + 2.0, 0.9, sanctumW + 2.0, 0, sY + sanctumWallH, vimanaZ, 'details');

// --- THE COLOSSAL PERUVUDAIYAR MAHA LINGAM (matching lingam.jpg) ---
// A. Massive Circular Molded Granite Avudaiyar (Yoni-Pitha)
makeCylinder(3.4, 3.6, 0.5, 28, 0, sY + 0.25, vimanaZ, 0, 0, 0, 'stoneBase');
makeCylinder(3.1, 3.3, 0.4, 28, 0, sY + 0.65, vimanaZ, 0, 0, 0, 'details');
makeCylinder(3.3, 3.1, 0.35, 28, 0, sY + 1.0, vimanaZ, 0, 0, 0, 'stoneBase');
// North drainage spout (Gomukha)
makeBox(1.1, 0.45, 1.8, 0, sY + 0.95, vimanaZ + 3.4, 'details');

// B. Monolithic Cylindrical Polished Black Granite Lingam Shaft (13 ft / 3.7m)
// Silk Vastram drape around lower shaft (as in lingam.jpg)
makeCylinder(1.24, 1.27, 1.7, 24, 0, sY + 1.2 + 0.85, vimanaZ, 0, 0, 0, 'sanctumWall');
// Black granite cylindrical shaft
makeCylinder(1.15, 1.18, 3.7, 28, 0, sY + 1.2 + 1.85, vimanaZ, 0, 0, 0, 'nandi');
// Domed spherical top (Shirovarttana)
makeSphere(1.15, 1.0, 0.65, 1.0, 0, sY + 1.2 + 3.7, vimanaZ, 0, 0, 0, 'nandi', 28, 20);

// C. Sacred Tripundra (Holy Ash Vibhuti Bands) on the front of the Lingam (matching lingam.jpg)
for (let vb = 0; vb < 3; vb++) {
  makeBox(1.1, 0.08, 0.08, 0, sY + 1.2 + 2.5 + vb * 0.18, vimanaZ + 1.16, 'details');
}
// Sacred Bindu at center
makeSphere(0.12, 1.0, 1.0, 1.0, 0, sY + 1.2 + 2.68, vimanaZ + 1.19, 0, 0, 0, 'goldFinial', 12, 10);

// D. Sacred Floral Malas & Golden Crown Bands (as in lingam.jpg)
makeTorus(1.24, 0.09, 10, 24, 0, sY + 1.2 + 3.25, vimanaZ, Math.PI / 2, 0, 0, 'goldFinial');
makeTorus(1.28, 0.08, 10, 24, 0, sY + 1.2 + 2.2, vimanaZ, Math.PI / 2, 0, 0, 'details');

// E. Two Colossal Multi-Tiered Bronze Deepam Lamp Towers (Kuthu-Vilakku) flanking the Lingam
for (const s of [-1, 1]) {
  const lx = s * 2.8;
  const lz = vimanaZ + 1.8;
  // Lamp base
  makeCylinder(0.42, 0.52, 0.22, 12, lx, sY + 0.11, lz, 0, 0, 0, 'goldFinial');
  // Central brass standard
  makeCylinder(0.08, 0.1, 3.8, 8, lx, sY + 2.05, lz, 0, 0, 0, 'goldFinial');
  // 5 Tiered oil lamp bowls
  for (let t = 0; t < 5; t++) {
    makeCylinder(0.38 - t * 0.04, 0.12, 0.12, 12, lx, sY + 0.9 + t * 0.65, lz, 0, 0, 0, 'goldFinial');
  }
  // Apex bird finial (Annam)
  makeSphere(0.16, 0.8, 1.2, 0.8, lx, sY + 4.15, lz, 0, 0, 0, 'goldFinial', 10, 8);
}

const wallSides = [
  { dir: 'south', dx: 0, dz: -1 },
  { dir: 'north', dx: 0, dz: 1 },
  { dir: 'west', dx: -1, dz: 0 },
];

for (const side of wallSides) {
  const isX = Math.abs(side.dx) > 0;
  const bayOffsets = [-10.5, -5.2, 0, 5.2, 10.5];

  for (let storey = 0; storey < 2; storey++) {
    const storeyY = sY + storey * 7.2 + 1.2;

    for (const offset of bayOffsets) {
      const isCentralBhadra = offset === 0;
      const bayW = isCentralBhadra ? 5.4 : 3.6;
      const bayH = 4.8;
      const projD = isCentralBhadra ? 0.9 : 0.5;

      const posX = isX ? -side.dx * (sanctumW / 2 + projD / 2) : offset;
      const posZ = isX ? vimanaZ + offset : vimanaZ - side.dz * (sanctumW / 2 + projD / 2);

      makeBox(isX ? projD : bayW, bayH, isX ? bayW : projD, posX, storeyY + bayH / 2, posZ, 'details');

      const nicheW = isCentralBhadra ? 2.2 : 1.4;
      const nicheH = 3.2;
      const nicheD = 0.4;
      makeBox(isX ? nicheD : nicheW, nicheH, isX ? nicheW : nicheD, posX + (isX ? side.dx * 0.15 : 0), storeyY + 0.8 + nicheH / 2, posZ + (isX ? 0 : side.dz * 0.15), 'stoneBase');
      makeBox(isX ? 0.35 : 0.8, 2.2, isX ? 0.8 : 0.35, posX + (isX ? side.dx * 0.2 : 0), storeyY + 0.8 + 1.1, posZ + (isX ? 0 : side.dz * 0.2), 'vimana');

      for (const pSide of [-1, 1]) {
        const pilOffset = offset + pSide * (nicheW / 2 + 0.4);
        const pilX = isX ? posX : pilOffset;
        const pilZ = isX ? vimanaZ + pilOffset : posZ;
        makeBox(isX ? 0.35 : 0.4, bayH + 0.3, isX ? 0.4 : 0.35, pilX, storeyY + (bayH + 0.3) / 2, pilZ, 'details');
      }
    }
  }
}

// -------------------------------------------------------------
// 4. THE 13-STOREY SRI VIMANA PYRAMID
// -------------------------------------------------------------
console.log('-> 4. Soaring 13 Talas of Sri Vimana...');
const numTalas = 13;
const vimanaBaseY = sY + sanctumWallH; // y = 18.8m
let currentW = 29.4;
const topW = 7.4;
const totalPyramidH = 32.5;
const talaHeight = totalPyramidH / numTalas;
const wStep = (currentW - topW) / (numTalas - 1);

for (let i = 0; i < numTalas; i++) {
  const tW = currentW - i * wStep;
  const tH = talaHeight;
  const tY = vimanaBaseY + i * tH;

  makeBox(tW, tH, tW, 0, tY + tH / 2, vimanaZ, 'vimana');
  makeBox(tW + 0.9, 0.35, tW + 0.9, 0, tY + tH, vimanaZ, 'details');

  const kutaW = Math.max(1.2, tW * 0.14);
  const kutaH = Math.max(1.0, tH * 0.7);

  // 4 Corner Kutas
  for (const cx of [-1, 1]) {
    for (const cz of [-1, 1]) {
      const kX = cx * (tW / 2 - kutaW / 2);
      const kZ = vimanaZ + cz * (tW / 2 - kutaW / 2);

      makeBox(kutaW, kutaH, kutaW, kX, tY + tH + kutaH / 2, kZ, 'details');
      makeCylinder(0.1, kutaW * 0.7, kutaH * 0.6, 4, kX, tY + tH + kutaH + kutaH * 0.3, kZ, 0, Math.PI / 4, 0, 'vimana');
      makeCylinder(0.04, 0.09, 0.4, 8, kX, tY + tH + kutaH + kutaH * 0.6 + 0.2, kZ, 0, 0, 0, 'goldFinial');
    }
  }

  // Central Salas
  const salaLength = Math.max(2.0, tW * 0.32);
  const salaW = kutaW * 0.85;
  const salaH = kutaH * 1.05;

  for (const cz of [-1, 1]) {
    const sZ = vimanaZ + cz * (tW / 2 - salaW / 2);
    makeBox(salaLength, salaH, salaW, 0, tY + tH + salaH / 2, sZ, 'details');
    makeCylinder(salaW * 0.5, salaW * 0.55, salaLength, 12, 0, tY + tH + salaH + salaW * 0.3, sZ, 0, 0, Math.PI / 2, 'vimana');
    for (let k = -1; k <= 1; k++) {
      makeCylinder(0.04, 0.08, 0.35, 8, k * (salaLength * 0.3), tY + tH + salaH + salaW * 0.6 + 0.17, sZ, 0, 0, 0, 'goldFinial');
    }
  }

  for (const cx of [-1, 1]) {
    const sX = cx * (tW / 2 - salaW / 2);
    makeBox(salaW, salaH, salaLength, sX, tY + tH + salaH / 2, vimanaZ, 'details');
    makeCylinder(salaW * 0.5, salaW * 0.55, salaLength, 12, sX, tY + tH + salaH + salaW * 0.3, vimanaZ, Math.PI / 2, 0, 0, 'vimana');
    for (let k = -1; k <= 1; k++) {
      makeCylinder(0.04, 0.08, 0.35, 8, sX, tY + tH + salaH + salaW * 0.6 + 0.17, vimanaZ + k * (salaLength * 0.3), 0, 0, 0, 'goldFinial');
    }
  }
}

// -------------------------------------------------------------
// 5. GRIVA (NECK), 4 CORNER NANDI BULLS, SIKHARA DOME & KALASAM
// -------------------------------------------------------------
console.log('-> 5. Griva, 4 Corner Nandis, Sikhara & Kalasam...');
const grivaBaseY = vimanaBaseY + totalPyramidH;
const grivaH = 2.8;
const grivaRadius = 3.6;

makeCylinder(grivaRadius, grivaRadius + 0.3, grivaH, 8, 0, grivaBaseY + grivaH / 2, vimanaZ, 0, 0, 0, 'vimana');

// Sculpted Chola Monolithic Nandi Builder for the 4 summit corner bulls
function createSculptedCornerNandi(x, y, z, rotY, scale = 0.95) {
  function addNandiPart(geo, lx, ly, lz, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1, category = 'nandi') {
    const scaleMatrix = new THREE.Matrix4().makeScale(sx, sy, sz);
    const rotMatrix = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rx, ry, rz));
    const transMatrix = new THREE.Matrix4().makeTranslation(lx, ly, lz);
    const localMatrix = new THREE.Matrix4().multiply(transMatrix).multiply(rotMatrix).multiply(scaleMatrix);

    const worldMatrix = new THREE.Matrix4()
      .multiply(new THREE.Matrix4().makeTranslation(x, y, z))
      .multiply(new THREE.Matrix4().makeRotationY(rotY))
      .multiply(new THREE.Matrix4().makeScale(scale, scale, scale))
      .multiply(localMatrix);

    geo.applyMatrix4(worldMatrix);
    geometries[category].push(geo);
  }

  function nandiBox(w, h, d, lx, ly, lz, rx = 0, ry = 0, rz = 0, category = 'nandi') {
    const geo = new THREE.BoxGeometry(w, h, d);
    addNandiPart(geo, lx, ly, lz, rx, ry, rz, 1, 1, 1, category);
  }

  function nandiSphere(r, sx, sy, sz, lx, ly, lz, rx = 0, ry = 0, rz = 0, category = 'nandi', wSegs = 24, hSegs = 18) {
    const geo = new THREE.SphereGeometry(r, wSegs, hSegs);
    addNandiPart(geo, lx, ly, lz, rx, ry, rz, sx, sy, sz, category);
  }

  function nandiCylinder(rTop, rBottom, height, radSegs, lx, ly, lz, rx = 0, ry = 0, rz = 0, category = 'nandi') {
    const geo = new THREE.CylinderGeometry(rTop, rBottom, height, radSegs);
    addNandiPart(geo, lx, ly, lz, rx, ry, rz, 1, 1, 1, category);
  }

  function nandiTorus(radius, tube, radSegs, tubeSegs, lx, ly, lz, rx = 0, ry = 0, rz = 0, category = 'details') {
    const geo = new THREE.TorusGeometry(radius, tube, radSegs, tubeSegs);
    addNandiPart(geo, lx, ly, lz, rx, ry, rz, 1, 1, 1, category);
  }

  // 1. Molded Rectangular Stone Pedestal (Upapitha / Pitha)
  nandiBox(1.55, 0.15, 2.6, 0, 0.08, 0, 0, 0, 0, 'stoneBase');
  nandiBox(1.42, 0.14, 2.4, 0, 0.22, 0, 0, 0, 0, 'details');
  nandiBox(1.5, 0.14, 2.5, 0, 0.35, 0, 0, 0, 0, 'stoneBase');

  // 2. Muscular Recumbent Torso & Ribcage
  nandiSphere(0.52, 1.35, 1.05, 1.5, 0, 0.78, 0.08, 0, 0, 0, 'nandi', 28, 20); // center torso
  nandiSphere(0.50, 1.25, 1.15, 1.2, 0, 0.82, -0.42, 0, 0, 0, 'nandi', 28, 20); // muscular chest & shoulders
  nandiSphere(0.52, 1.35, 1.15, 1.3, 0, 0.82, 0.62, 0, 0, 0, 'nandi', 28, 20); // rounded hindquarters

  // 3. Sacred Dorsal Zebu Hump (Kakud)
  nandiSphere(0.32, 0.9, 1.4, 0.9, 0, 1.45, -0.25, -Math.PI / 10, 0, 0, 'nandi', 24, 18);

  // 4. Throat & Dewlap Folds (Kambugriva)
  nandiSphere(0.26, 0.5, 1.1, 0.9, 0, 0.72, -0.8, -Math.PI / 6, 0, 0, 'nandi', 20, 16);
  nandiSphere(0.2, 0.45, 0.9, 0.8, 0, 0.5, -0.68, -Math.PI / 6, 0, 0, 'nandi', 20, 16);

  // 5. Neck, Cranium & Tapered Snout
  nandiSphere(0.38, 1.05, 1.1, 1.2, 0, 1.08, -0.6, -Math.PI / 5, 0, 0, 'nandi', 24, 18); // neck
  nandiSphere(0.34, 0.95, 0.95, 1.1, 0, 1.32, -0.9, -Math.PI / 5, 0, 0, 'nandi', 24, 18); // cranium
  nandiSphere(0.26, 1.0, 0.78, 1.18, 0, 1.14, -1.2, -Math.PI / 8, 0, 0, 'nandi', 24, 18); // muzzle & snout
  nandiBox(0.32, 0.15, 0.32, 0, 1.05, -1.2, 0, 0, 0, 'nandi'); // jaw

  // 6. Eyes
  for (const s of [-1, 1]) {
    nandiSphere(0.065, 1.2, 0.9, 1.2, s * 0.26, 1.34, -0.98, 0, 0, s * 0.2, 'details', 14, 10);
  }

  // 7. Backward-Curving Horns
  for (const s of [-1, 1]) {
    // Horn base
    nandiCylinder(0.085, 0.11, 0.32, 12, s * 0.22, 1.52, -0.85, -Math.PI / 4, 0, s * (Math.PI / 4), 'nandi');
    // Horn mid-curve
    nandiCylinder(0.05, 0.085, 0.42, 12, s * 0.32, 1.68, -0.68, -Math.PI / 3, 0, s * (Math.PI / 3), 'nandi');
    // Horn tapered tip
    nandiCylinder(0.015, 0.05, 0.26, 10, s * 0.38, 1.78, -0.48, -Math.PI / 2.3, 0, s * (Math.PI / 2.3), 'nandi');

    // 8. Lateral Pointed Bovine Ears
    nandiSphere(0.12, 1.45, 0.45, 0.75, s * 0.4, 1.36, -0.85, 0, 0, s * (Math.PI / 6), 'nandi', 18, 14);
  }

  // 9. Folded Recumbent Legs & Planted Hooves
  // Front right leg bent forward with hoof planted
  nandiSphere(0.24, 0.9, 0.75, 1.35, -0.32, 0.48, -0.45, Math.PI / 5, 0, -Math.PI / 10, 'nandi', 20, 16);
  nandiBox(0.24, 0.16, 0.26, -0.32, 0.44, -0.82, 0, 0, 0, 'nandi');
  // Front left leg folded under chest
  nandiSphere(0.24, 0.9, 0.75, 1.2, 0.32, 0.46, -0.38, Math.PI / 6, 0, Math.PI / 10, 'nandi', 20, 16);
  // Rear thighs folded along flanks
  nandiSphere(0.34, 1.15, 0.95, 1.35, -0.42, 0.54, 0.45, 0, 0, -Math.PI / 8, 'nandi', 22, 16);
  nandiSphere(0.34, 1.15, 0.95, 1.35, 0.42, 0.54, 0.45, 0, 0, Math.PI / 8, 'nandi', 22, 16);

  // 10. Curled Tail & Tuft
  nandiCylinder(0.045, 0.055, 0.9, 8, 0.34, 0.62, 0.7, Math.PI / 3, 0, Math.PI / 6, 'nandi');
  nandiSphere(0.1, 1.0, 1.4, 1.0, 0.48, 0.8, 0.44, 0, 0, 0, 'nandi', 16, 12);

  // 11. Sculpted Bell Necklace & Saddle Blanket
  nandiTorus(0.38, 0.038, 8, 20, 0, 1.12, -0.62, -Math.PI / 5, 0, 0, 'details');
  for (let k = -3; k <= 3; k++) {
    nandiCylinder(0.018, 0.045, 0.09, 6, k * 0.08, 1.0, -0.7, 0, 0, 0, 'details');
  }
  nandiBox(0.96, 0.06, 0.85, 0, 1.25, 0.08, 0, 0, 0, 'details');
  nandiBox(1.0, 0.09, 0.07, 0, 1.23, -0.35, 0, 0, 0, 'details');
  nandiBox(1.0, 0.09, 0.07, 0, 1.23, 0.5, 0, 0, 0, 'details');
}

// 4 Corner Nandi bulls positioned on Griva corner platforms
const nandiDist = 4.2;
const cornerNandis = [
  { x: -nandiDist, z: vimanaZ - nandiDist, rotY: -Math.PI / 4 },
  { x: nandiDist, z: vimanaZ - nandiDist, rotY: Math.PI / 4 },
  { x: -nandiDist, z: vimanaZ + nandiDist, rotY: -3 * Math.PI / 4 },
  { x: nandiDist, z: vimanaZ + nandiDist, rotY: 3 * Math.PI / 4 },
];

for (const n of cornerNandis) {
  // Sturdy corner ledge stone support
  makeBox(2.2, 0.35, 2.2, n.x, grivaBaseY - 0.18, n.z, 'stoneBase');
  createSculptedCornerNandi(n.x, grivaBaseY, n.z, n.rotY, 0.95);
}

// Monolithic Octagonal Sikhara Dome
const sikharaBaseY = grivaBaseY + grivaH;
const sikharaH = 4.8;
const sikharaR = 4.2;

makeCylinder(sikharaR + 0.4, sikharaR + 0.1, 0.8, 8, 0, sikharaBaseY + 0.4, vimanaZ, 0, Math.PI / 8, 0, 'details');

const domeSegments = 8;
for (let s = 0; s < domeSegments; s++) {
  const t1 = s / domeSegments;
  const t2 = (s + 1) / domeSegments;
  const r1 = sikharaR * Math.cos(t1 * Math.PI * 0.42);
  const r2 = sikharaR * Math.cos(t2 * Math.PI * 0.42);
  const y1 = sikharaBaseY + 0.8 + t1 * (sikharaH - 0.8);
  const y2 = sikharaBaseY + 0.8 + t2 * (sikharaH - 0.8);
  const segH = y2 - y1;

  makeCylinder(r2, r1, segH, 8, 0, y1 + segH / 2, vimanaZ, 0, Math.PI / 8, 0, 'vimana');
}

// Golden Kalasam Finial
const crestY = sikharaBaseY + sikharaH;
makeCylinder(1.6, 2.2, 0.6, 16, 0, crestY + 0.3, vimanaZ, 0, 0, 0, 'details');
makeCylinder(0.8, 1.4, 0.8, 16, 0, crestY + 1.0, vimanaZ, 0, 0, 0, 'goldFinial');
makeCylinder(1.2, 0.9, 1.2, 16, 0, crestY + 2.0, vimanaZ, 0, 0, 0, 'goldFinial');
makeCylinder(0.5, 1.0, 0.6, 16, 0, crestY + 2.9, vimanaZ, 0, 0, 0, 'goldFinial');
makeCylinder(0.06, 0.4, 1.6, 12, 0, crestY + 4.0, vimanaZ, 0, 0, 0, 'goldFinial');

// -------------------------------------------------------------
// 6. AXIAL MANDAPA COMPLEX (Ardha, Maha, Mukha)
// -------------------------------------------------------------
console.log('-> 6. Axial Mandapa Halls & Interior Columns...');
const ardhaW = 16.0;
const ardhaL = 12.0;
const ardhaH = 10.8;
const ardhaZ = vimanaZ + sanctumW / 2 + ardhaL / 2;
makeBox(ardhaW, ardhaH, ardhaL, 0, plinthH + ardhaH / 2, ardhaZ, 'sanctumWall');
makeBox(ardhaW + 1.2, 0.8, ardhaL + 1.2, 0, plinthH + ardhaH, ardhaZ, 'details');

const mahaW = 24.0;
const mahaL = 26.0;
const mahaH = 9.8;
const mahaZ = ardhaZ + ardhaL / 2 + mahaL / 2;
makeBox(mahaW, 0.8, mahaL, 0, plinthH + mahaH, mahaZ, 'sanctumWall');
makeBox(mahaW + 1.4, 1.2, mahaL + 1.4, 0, plinthH + mahaH + 0.6, mahaZ, 'details');

// Hypostyle Columns
const pRows = 5;
const pCols = 5;
const colH = mahaH - 0.8;
for (let r = 0; r < pRows; r++) {
  for (let c = 0; c < pCols; c++) {
    const colX = -mahaW / 2 + 3.0 + c * ((mahaW - 6.0) / (pCols - 1));
    const colZ = mahaZ - mahaL / 2 + 3.0 + r * ((mahaL - 6.0) / (pRows - 1));
    makeCylinder(0.32, 0.36, colH - 1.0, 10, colX, plinthH + (colH - 1.0) / 2 + 0.4, colZ, 0, 0, 0, 'details');
    makeBox(1.0, 0.4, 1.0, colX, plinthH + 0.2, colZ, 'stoneBase');
    makeBox(1.2, 0.5, 0.6, colX, plinthH + colH - 0.35, colZ, 'details');
    makeBox(0.6, 0.5, 1.2, colX, plinthH + colH - 0.35, colZ, 'details');
  }
}

const mukhaW = 18.0;
const mukhaL = 16.0;
const mukhaH = 8.6;
const mukhaZ = mahaZ + mahaL / 2 + mukhaL / 2;
makeBox(mukhaW, 0.8, mukhaL, 0, plinthH + mukhaH, mukhaZ, 'sanctumWall');
makeBox(mukhaW + 1.2, 1.0, mukhaL + 1.2, 0, plinthH + mukhaH + 0.5, mukhaZ, 'details');

// -------------------------------------------------------------
// 7. DETACHED NANDI MANDAPAM & ANATOMICALLY SCULPTED NANDI BULL
// (Faithfully modeled on nandhi-sideview.jpg and nandhi-backsideview.jpg)
// -------------------------------------------------------------
console.log('-> 7. Detached Nandi Mandapam & High-Fidelity Monolithic Nandi Bull...');
const nandiMandapaZ = 66.0;
const nandiPlinthW = 13.0;
const nandiPlinthL = 16.0;
const nandiPlinthH = 2.0;

// Molded Stone Plinth for Nandi Pavilion
makeBox(nandiPlinthW, nandiPlinthH, nandiPlinthL, 0, nandiPlinthH / 2, nandiMandapaZ, 'stoneBase');
makeBox(nandiPlinthW + 0.8, 0.4, nandiPlinthL + 0.8, 0, nandiPlinthH, nandiMandapaZ, 'details');
makeFlightOfSteps(4.5, 3.8, nandiPlinthH, 0, nandiMandapaZ + nandiPlinthL / 2 + 1.9, 0);

// Nandi Pavilion Pillars (Arranged at corners and rear to give a completely unobstructed, museum-grade view of the colossal bull)
const nandiPavilionH = 7.0;
const nPillars = [
  // 4 Corner Pillars
  { x: -nandiPlinthW / 2 + 1.4, z: nandiMandapaZ - nandiPlinthL / 2 + 1.5 },
  { x: nandiPlinthW / 2 - 1.4, z: nandiMandapaZ - nandiPlinthL / 2 + 1.5 },
  { x: -nandiPlinthW / 2 + 1.4, z: nandiMandapaZ + nandiPlinthL / 2 - 1.5 },
  { x: nandiPlinthW / 2 - 1.4, z: nandiMandapaZ + nandiPlinthL / 2 - 1.5 },
  // Rear Wall Pillars (framing the Nayak mural fresco wall)
  { x: -2.4, z: nandiMandapaZ + nandiPlinthL / 2 - 1.5 },
  { x: 2.4, z: nandiMandapaZ + nandiPlinthL / 2 - 1.5 },
];

for (const p of nPillars) {
  makeCylinder(0.26, 0.30, nandiPavilionH - 0.8, 10, p.x, nandiPlinthH + (nandiPavilionH - 0.8) / 2, p.z, 0, 0, 0, 'details');
  makeBox(0.9, 0.35, 0.9, p.x, nandiPlinthH + 0.18, p.z, 'stoneBase');
  makeBox(1.1, 0.45, 0.7, p.x, nandiPlinthH + nandiPavilionH - 0.4, p.z, 'details');
  makeBox(0.7, 0.45, 1.1, p.x, nandiPlinthH + nandiPavilionH - 0.4, p.z, 'details');
}

// Pavilion Roof with decorative cornice & vaulted ceiling beam moldings
makeBox(nandiPlinthW + 1.6, 0.6, nandiPlinthL + 1.6, 0, nandiPlinthH + nandiPavilionH, nandiMandapaZ, 'sanctumWall');
makeBox(nandiPlinthW + 2.0, 0.3, nandiPlinthL + 2.0, 0, nandiPlinthH + nandiPavilionH + 0.4, nandiMandapaZ, 'details');
makeCylinder(0.4, nandiPlinthW * 0.65, 1.4, 4, 0, nandiPlinthH + nandiPavilionH + 1.1, nandiMandapaZ, 0, Math.PI / 4, 0, 'details');

// --- THE COLOSSAL MONOLITHIC NANDI BULL ---
// Molded multi-tiered white/granite pedestal
const nY = nandiPlinthH;
makeBox(4.8, 0.4, 7.6, 0, nY + 0.2, nandiMandapaZ, 'stoneBase');
makeBox(4.4, 0.3, 7.2, 0, nY + 0.55, nandiMandapaZ, 'details');
makeBox(4.6, 0.2, 7.4, 0, nY + 0.75, nandiMandapaZ, 'stoneBase');

// 1. Muscular Torso & Ribcage (High-resolution smooth organic ellipsoids)
// Center torso
makeSphere(1.6, 1.25, 1.15, 1.55, 0, nY + 2.3, nandiMandapaZ + 0.2, 0, 0, 0, 'nandi', 36, 28);
// Powerful front chest & muscular shoulders
makeSphere(1.5, 1.2, 1.25, 1.25, 0, nY + 2.4, nandiMandapaZ - 1.0, 0, 0, 0, 'nandi', 36, 28);
// Broad rounded hindquarters (matching nandhi-backsideview.jpg)
makeSphere(1.65, 1.35, 1.25, 1.35, 0, nY + 2.4, nandiMandapaZ + 1.6, 0, 0, 0, 'nandi', 36, 28);

// 2. The Sacred Shiva Bull Hump (Kakud)
// Rounded organic hump rising proudly directly above the shoulders
makeSphere(0.85, 0.95, 1.35, 0.9, 0, nY + 3.8, nandiMandapaZ - 0.6, -Math.PI / 12, 0, 0, 'nandi', 32, 24);

// 3. Throat Dewlap (Kambugriva)
// Distinctive sagging loose skin folds beneath chin & chest
makeSphere(0.7, 0.55, 1.15, 1.0, 0, nY + 2.0, nandiMandapaZ - 2.0, -Math.PI / 6, 0, 0, 'nandi', 28, 20);
makeSphere(0.6, 0.5, 0.95, 0.85, 0, nY + 1.45, nandiMandapaZ - 1.7, -Math.PI / 6, 0, 0, 'nandi', 28, 20);

// 4. Head, Snout, Mouth & Expressive Features (turned slightly right towards -Z)
const headY = nY + 3.4;
const headZ = nandiMandapaZ - 2.3;
const headRotY = 0.12; // famously turned slightly right

// Muscular neck angled up
makeSphere(1.05, 1.05, 1.1, 1.2, 0, headY - 0.45, headZ + 0.75, -Math.PI / 6, headRotY, 0, 'nandi', 32, 24);
// Cranium & skull
makeSphere(0.92, 0.95, 0.95, 1.1, 0, headY + 0.15, headZ, -Math.PI / 5, headRotY, 0, 'nandi', 32, 24);
// Muzzle & snout (with flared nostrils and parted cleft lips showing carved teeth)
makeSphere(0.7, 1.0, 0.75, 1.15, 0.08, headY - 0.35, headZ - 0.75, -Math.PI / 8, headRotY, 0, 'nandi', 32, 24);
makeBox(0.95, 0.35, 0.75, 0.08, headY - 0.55, headZ - 0.75, 'nandi');

// Almond Eyes with carved eyelids
for (const s of [-1, 1]) {
  makeSphere(0.18, 1.2, 0.9, 1.2, s * 0.72 + 0.05, headY + 0.25, headZ - 0.2, 0, headRotY, s * 0.2, 'details', 16, 12);
}

// Curving Horns (Gracefully arching backward over the neck)
for (const s of [-1, 1]) {
  const hornX = s * 0.78 + (s > 0 ? 0.05 : -0.05);
  // Horn base
  makeCylinder(0.24, 0.28, 0.65, 12, hornX, headY + 0.65, headZ + 0.1, -Math.PI / 4, headRotY, s * (Math.PI / 4), 'nandi');
  // Curved horn tip
  makeCylinder(0.12, 0.22, 0.95, 12, s * 1.0, headY + 1.05, headZ + 0.38, -Math.PI / 3, headRotY, s * (Math.PI / 3), 'nandi');
  makeCylinder(0.04, 0.12, 0.55, 10, s * 1.22, headY + 1.35, headZ + 0.7, -Math.PI / 2.5, headRotY, s * (Math.PI / 2.5), 'nandi');

  // Pointed Bovine Ears (extending sideways beneath the horns)
  makeSphere(0.3, 1.35, 0.45, 0.75, s * 1.1, headY + 0.3, headZ + 0.1, 0, headRotY, s * (Math.PI / 6), 'nandi', 20, 16);
}

// 5. Folded Recumbent Legs & Hooves
// Front right leg bent forward (knee extending forward with carved hoof planted on plinth)
makeSphere(0.6, 0.9, 0.75, 1.65, -1.0, nY + 1.2, nandiMandapaZ - 1.15, Math.PI / 5, 0, -Math.PI / 10, 'nandi', 28, 20);
makeBox(0.65, 0.4, 0.75, -1.0, nY + 0.95, nandiMandapaZ - 2.1, 'nandi'); // front right hoof
// Front left leg folded under brisket
makeSphere(0.6, 0.9, 0.75, 1.45, 0.95, nY + 1.1, nandiMandapaZ - 0.85, Math.PI / 6, 0, Math.PI / 10, 'nandi', 28, 20);

// Rear thighs & hocks folded along flanks (massive curved muscular mounds)
makeSphere(0.9, 1.15, 0.95, 1.55, -1.25, nY + 1.35, nandiMandapaZ + 1.2, 0, 0, -Math.PI / 8, 'nandi', 28, 20);
makeSphere(0.9, 1.15, 0.95, 1.55, 1.25, nY + 1.35, nandiMandapaZ + 1.2, 0, 0, Math.PI / 8, 'nandi', 28, 20);

// Tail curled gracefully across right hindquarter (as seen in nandhi-backsideview.jpg)
makeCylinder(0.14, 0.16, 2.7, 10, 0.95, nY + 1.45, nandiMandapaZ + 2.0, Math.PI / 3, 0, Math.PI / 6, 'nandi');
// Carved tail tuft
makeSphere(0.28, 1.0, 1.4, 1.0, 1.4, nY + 2.1, nandiMandapaZ + 1.25, 0, 0, 0, 'nandi', 20, 16);

// 6. Elaborate Carved Bell Necklaces (Ghanta-Mala) around neck & chest
for (let b = 0; b < 3; b++) {
  const bY = headY - 0.45 - b * 0.4;
  const bZ = headZ + 0.45 + b * 0.35;
  const bR = 1.15 + b * 0.14;
  makeTorus(bR, 0.09, 10, 24, 0, bY, bZ, -Math.PI / 6, headRotY, 0, 'details');
  // Hanging carved bells along the necklace
  for (let k = -4; k <= 4; k++) {
    const angle = (k / 4) * (Math.PI * 0.45);
    const bellX = Math.sin(angle) * bR;
    const bellZ = bZ + Math.cos(angle) * 0.22;
    makeCylinder(0.06, 0.13, 0.24, 8, bellX, bY - 0.2, bellZ, 0, 0, 0, 'details');
  }
}

// Rear Hip Bell Garland (visible in nandhi-backsideview.jpg)
makeTorus(1.7, 0.08, 10, 24, 0, nY + 2.0, nandiMandapaZ + 1.8, Math.PI / 4, 0, 0, 'details');

// 7. Decorative Carved Saddle Blanket (Paristoma) on back
makeBox(2.9, 0.16, 2.5, 0, nY + 3.35, nandiMandapaZ + 0.3, 'details');
makeBox(3.05, 0.22, 0.22, 0, nY + 3.3, nandiMandapaZ - 0.85, 'details'); // front border
makeBox(3.05, 0.22, 0.22, 0, nY + 3.3, nandiMandapaZ + 1.45, 'details'); // rear border

// -------------------------------------------------------------
// 8. MONUMENTAL ENTRANCE GOPURAM (Keralantakan Gopuram)
// (Accurately modeled matching entrance.jpg)
// -------------------------------------------------------------
console.log('-> 8. Eastern Entrance Rajagopuram (matching entrance.jpg)...');
const gopZ = 128.0;
const gopW = 26.0;
const gopD = 7.6; // realistic gatehouse depth allowing clear sight through
const gopBaseH = 8.6;

// A. Paved Approach Pathway & Manicured Lawn Verges (as in entrance.jpg)
// Paved granite pathway leading directly to the open portal
makeBox(5.2, 0.16, 56, 0, 0.08, 156, 'courtyard');
// Lawn planes on left & right
makeBox(34, 0.1, 56, -20, 0.05, 156, 'lawn');
makeBox(34, 0.1, 56, 20, 0.05, 156, 'lawn');
// Curb stones along pathway edges (reddish-granite curbs as in entrance.jpg)
makeBox(0.35, 0.26, 56, -2.8, 0.13, 156, 'details');
makeBox(0.35, 0.26, 56, 2.8, 0.13, 156, 'details');

// Low manicured decorative shrubs along the lawn borders (matching entrance.jpg)
for (let bz = 138; bz <= 178; bz += 8) {
  makeSphere(0.9, 1.2, 0.8, 1.1, -6.5, 0.75, bz, 0, 0, 0, 'lawn', 12, 10);
  makeSphere(0.9, 1.2, 0.8, 1.1, 6.5, 0.75, bz, 0, 0, 0, 'lawn', 12, 10);
}

// B. Lower 2-Storey Granite Base with OPEN Arched Walkthrough Portal
const portalW = 4.8; // central open gateway width
const portalH = 6.6; // open gateway height
const pylonW = (gopW - portalW) / 2; // ~10.6m wide pylon wings on left & right

// Left Granite Pylon Wing (South)
makeBox(pylonW, gopBaseH, gopD, -portalW / 2 - pylonW / 2, gopBaseH / 2, gopZ, 'sanctumWall');
// Right Granite Pylon Wing (North)
makeBox(pylonW, gopBaseH, gopD, portalW / 2 + pylonW / 2, gopBaseH / 2, gopZ, 'sanctumWall');

// High molded stone base (Adhishthana) running along both pylons
makeBox(pylonW + 0.6, 1.4, gopD + 0.6, -portalW / 2 - pylonW / 2, 0.7, gopZ, 'stoneBase');
makeBox(pylonW + 0.6, 1.4, gopD + 0.6, portalW / 2 + pylonW / 2, 0.7, gopZ, 'stoneBase');
// Molded cornice band above lower storey
makeBox(pylonW + 0.8, 0.6, gopD + 0.8, -portalW / 2 - pylonW / 2, 4.4, gopZ, 'details');
makeBox(pylonW + 0.8, 0.6, gopD + 0.8, portalW / 2 + pylonW / 2, 4.4, gopZ, 'details');

// Arch Lintel Beam spanning above the central portal
makeBox(gopW, 1.8, gopD + 0.6, 0, gopBaseH - 0.9, gopZ, 'details');
// Arched decorative corbel moldings framing the top of the portal
makeBox(portalW + 0.4, 0.5, gopD + 0.6, 0, portalH - 0.25, gopZ, 'details');

// C. Colossal Sculpted Dvārapāla Monoliths flanking the portal (as in entrance.jpg)
for (const side of [-1, 1]) {
  const dvX = side * (portalW / 2 + 2.2);
  const dvZ = gopZ + gopD / 2 + 0.1; // outer East entrance facade

  // Deep recessed sculptural niche framed with pilasters
  makeBox(2.8, 5.6, 0.7, dvX, 4.1, dvZ, 'stoneBase');
  // Decorative pilasters framing the niche
  makeBox(0.4, 5.8, 0.45, dvX - 1.5, 4.1, dvZ + 0.25, 'details');
  makeBox(0.4, 5.8, 0.45, dvX + 1.5, 4.1, dvZ + 0.25, 'details');
  makeBox(3.4, 0.6, 0.5, dvX, 7.1, dvZ + 0.25, 'details'); // Makara-torana arch head

  // 4.8m tall Colossal Dvārapāla Guardian Figure
  // Guardian torso & hips in dynamic tribhanga pose
  makeSphere(0.7, 0.9, 1.3, 0.7, dvX, 4.2, dvZ + 0.35, 0, 0, side * 0.12, 'vimana', 24, 18);
  // Muscular chest & shoulders
  makeSphere(0.65, 1.1, 0.85, 0.65, dvX, 5.1, dvZ + 0.4, 0, 0, 0, 'vimana', 24, 18);
  // Sculpted head with fierce facial expression & tusks
  makeSphere(0.42, 0.9, 1.0, 0.8, dvX, 6.0, dvZ + 0.45, 0, 0, 0, 'vimana', 20, 16);
  // Ornate Kirita-Makuta (conical guardian crown)
  makeCylinder(0.12, 0.35, 1.1, 8, dvX, 6.8, dvZ + 0.45, 0, 0, 0, 'details');

  // Dynamic legs (one leg bent outward in warrior stance)
  makeCylinder(0.24, 0.28, 2.1, 8, dvX + side * 0.45, 1.9, dvZ + 0.35, 0, 0, side * (Math.PI / 8), 'vimana');
  makeCylinder(0.24, 0.28, 2.1, 8, dvX - side * 0.45, 1.9, dvZ + 0.35, 0, 0, -side * (Math.PI / 8), 'vimana');

  // Colossal Leaning Mace (Gada) resting against guardian
  const maceX = dvX - side * 0.9;
  makeCylinder(0.12, 0.16, 4.0, 8, maceX, 3.0, dvZ + 0.55, 0, 0, side * 0.14, 'details');
  makeSphere(0.38, 1.0, 1.2, 1.0, maceX, 5.0, dvZ + 0.55, 0, 0, 0, 'details', 16, 12); // mace head
}

// Side pilastered bays on the Gopuram base wings
for (const side of [-1, 1]) {
  const bayX = side * (gopW / 2 - 2.6);
  makeBox(3.2, 4.8, 0.5, bayX, 4.1, gopZ + gopD / 2 + 0.05, 'details');
  makeBox(1.2, 2.8, 0.25, bayX, 4.1, gopZ + gopD / 2 + 0.2, 'vimana');
}

// D. 3-Tier Sculptured Gopuram Superstructure (matching entrance.jpg)
const gopTiers = 3;
const gopTiersH = 12.6;
const tierH = gopTiersH / gopTiers; // 4.2m per tier

for (let t = 0; t < gopTiers; t++) {
  const tw = gopW * (1.0 - t * 0.14);
  const td = gopD * (1.0 - t * 0.14);
  const ty = gopBaseH + t * tierH;

  // Tier body with open center allowing light through the windows
  const wingW = (tw - 4.2) / 2;
  makeBox(wingW, tierH, td, -tw / 2 + wingW / 2, ty + tierH / 2, gopZ, 'sanctumWall');
  makeBox(wingW, tierH, td, tw / 2 - wingW / 2, ty + tierH / 2, gopZ, 'sanctumWall');
  // Lintel above tier window
  makeBox(4.4, tierH * 0.35, td, 0, ty + tierH * 0.82, gopZ, 'sanctumWall');

  // Projecting Kapota cornice with Kudus
  makeBox(tw + 1.0, 0.5, td + 1.0, 0, ty + tierH, gopZ, 'details');

  // Miniature shrines along the tier parapet
  for (const cx of [-1, 1]) {
    const kX = cx * (tw / 2 - 1.2);
    makeBox(1.6, tierH * 0.65, 1.6, kX, ty + tierH * 0.45, gopZ + td / 2, 'details');
    makeBox(1.6, tierH * 0.65, 1.6, kX, ty + tierH * 0.45, gopZ - td / 2, 'details');
  }
}

// E. Crown: Barrel-Vaulted Sala-Shikhara Wagon Roof (matching entrance.jpg)
const gopRoofY = gopBaseH + gopTiersH;
const roofW = gopW * 0.55;
const roofD = gopD * 0.65;
makeCylinder(roofD * 0.5, roofD * 0.55, roofW, 16, 0, gopRoofY + roofD * 0.42, gopZ, 0, 0, Math.PI / 2, 'vimana');

// Arched Horseshoe Gables on North & South ends of the Sala roof
makeCylinder(roofD * 0.52, roofD * 0.55, 0.6, 16, -roofW / 2 - 0.2, gopRoofY + roofD * 0.42, gopZ, 0, 0, Math.PI / 2, 'details');
makeCylinder(roofD * 0.52, roofD * 0.55, 0.6, 16, roofW / 2 + 0.2, gopRoofY + roofD * 0.42, gopZ, 0, 0, Math.PI / 2, 'details');

// F. Row of 5 Gleaming Golden Kalasam Finials (matching entrance.jpg)
const numKalasams = 5;
for (let k = 0; k < numKalasams; k++) {
  const kX = -roofW / 2 + 1.2 + k * ((roofW - 2.4) / (numKalasams - 1));
  const kY = gopRoofY + roofD * 0.85;

  makeCylinder(0.24, 0.35, 0.35, 10, kX, kY + 0.18, gopZ, 0, 0, 0, 'goldFinial');
  makeCylinder(0.32, 0.22, 0.45, 10, kX, kY + 0.55, gopZ, 0, 0, 0, 'goldFinial');
  makeCylinder(0.04, 0.16, 0.65, 8, kX, kY + 1.0, gopZ, 0, 0, 0, 'goldFinial');
}

// Flanking Eastern Courtyard Wall extending from Gopuram to North & South
const eastWallLength = (pW - gopW) / 2;
makeBox(eastWallLength, wallHeight, wallThick, -gopW / 2 - eastWallLength / 2, wallHeight / 2, gopZ, 'stoneBase');
makeBox(eastWallLength, wallHeight, wallThick, gopW / 2 + eastWallLength / 2, wallHeight / 2, gopZ, 'stoneBase');

// -------------------------------------------------------------
// MERGE GEOMETRIES & EXPORT TO GLB
// -------------------------------------------------------------
console.log('-> Merging geometries per architectural material...');

const materials = {
  stoneBase: new THREE.MeshStandardMaterial({
    name: 'Granite_Plinth_Base',
    color: 0x9b6b41,
    roughness: 0.86,
    metalness: 0.02,
  }),
  sanctumWall: new THREE.MeshStandardMaterial({
    name: 'Granite_Sanctum_Wall',
    color: 0xb78351,
    roughness: 0.82,
    metalness: 0.03,
  }),
  vimana: new THREE.MeshStandardMaterial({
    name: 'Granite_Sri_Vimana',
    color: 0xba8550,
    roughness: 0.80,
    metalness: 0.03,
  }),
  details: new THREE.MeshStandardMaterial({
    name: 'Granite_Carvings_Moldings',
    color: 0xaa7846,
    roughness: 0.84,
    metalness: 0.03,
  }),
  goldFinial: new THREE.MeshStandardMaterial({
    name: 'Gold_Kalasam_Finial',
    color: 0xdfa338,
    roughness: 0.22,
    metalness: 0.85,
  }),
  nandi: new THREE.MeshStandardMaterial({
    name: 'Nandi_Monolithic_Granite',
    color: 0x24221f,
    roughness: 0.28,
    metalness: 0.12,
  }),
  courtyard: new THREE.MeshStandardMaterial({
    name: 'Courtyard_Paving_Stone',
    color: 0x765f4c,
    roughness: 0.90,
    metalness: 0.01,
  }),
  lawn: new THREE.MeshStandardMaterial({
    name: 'Entrance_Green_Lawn',
    color: 0x586938,
    roughness: 0.92,
    metalness: 0.0,
  }),
};

const scene = new THREE.Scene();
scene.name = 'Brihadisvara_Temple_Thanjavur';

for (const [key, geoList] of Object.entries(geometries)) {
  if (geoList.length === 0) continue;
  console.log(`   Merging ${geoList.length} geometries for ${key}...`);

  const normalizedGeos = geoList.map((g) => {
    return g.toNonIndexed();
  });

  const rawMerged = BufferGeometryUtils.mergeGeometries(normalizedGeos, false);
  // Weld co-located vertices to ensure continuous Gouraud/PBR smooth shading across all curves
  const merged = BufferGeometryUtils.mergeVertices(rawMerged, 0.005);
  merged.computeVertexNormals();

  const mesh = new THREE.Mesh(merged, materials[key]);
  mesh.name = `Brihadisvara_${key}`;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
}

console.log('-> Exporting to GLTF Binary (.glb)...');
const outputPath = path.resolve('public/models/brihadisvara-temple.glb');

fs.mkdirSync(path.dirname(outputPath), { recursive: true });

const exporter = new GLTFExporter();
exporter.parse(
  scene,
  (glb) => {
    fs.writeFileSync(outputPath, Buffer.from(glb));
    const stats = fs.statSync(outputPath);
    console.log(`✅ SUCCESS! Exported authentic Brihadisvara Temple GLB to:`);
    console.log(`   ${outputPath}`);
    console.log(`   File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB (${stats.size} bytes)`);
    process.exit(0);
  },
  (err) => {
    console.error('❌ GLTFExporter error:', err);
    process.exit(1);
  },
  { binary: true }
);
