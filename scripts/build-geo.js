#!/usr/bin/env node
// Converts world-atlas TopoJSON → simplified GeoJSON and writes to src/data/world-110m.json
// Run once: node scripts/build-geo.js
const path = require('path');
const fs = require('fs');
const topojson = require('topojson-client');
const world = require('world-atlas/countries-110m.json');

const geojson = topojson.feature(world, world.objects.countries);

const out = path.join(__dirname, '..', 'src', 'data', 'world-110m.json');
fs.writeFileSync(out, JSON.stringify(geojson));
console.log(`✓ ${geojson.features.length} features → ${(fs.statSync(out).size / 1024).toFixed(0)} KB → ${out}`);
