import fs from 'node:fs';
import path from 'node:path';
import yaml from '../../packages/verify/node_modules/yaml/dist/index.js';

const root = process.cwd();
const batchDir = path.join(root, 'sandbox/m3-context/output/batch2');

// 1. Copy unit directories
for (const u of ['u9', 'u10', 'u11']) {
  const src = path.join(batchDir, 'units', u);
  const dst = path.join(root, 'content/units', u);
  fs.cpSync(src, dst, { recursive: true });
  console.log(`Copied ${src} -> ${dst}`);
}

// 2. Merge skills.yaml
const curSkillsPath = path.join(root, 'content/skills.yaml');
const batchSkillsPath = path.join(batchDir, 'skills.yaml');
const curSkills = yaml.parse(fs.readFileSync(curSkillsPath, 'utf8'));
const batchSkills = yaml.parse(fs.readFileSync(batchSkillsPath, 'utf8'));

// Append units
const existingUnitIds = new Set(curSkills.units.map(u => u.id));
for (const u of batchSkills.units) {
  if (!existingUnitIds.has(u.id)) {
    curSkills.units.push(u);
  }
}

// Append skills
const existingSkillIds = new Set(curSkills.skills.map(s => s.id));
for (const s of batchSkills.skills) {
  if (!existingSkillIds.has(s.id)) {
    curSkills.skills.push(s);
  }
}

fs.writeFileSync(curSkillsPath, yaml.stringify(curSkills));
console.log('Updated content/skills.yaml');

// 3. Merge chord-symbols.yaml
const curChordsPath = path.join(root, 'content/glossary/chord-symbols.yaml');
const batchChordsPath = path.join(batchDir, 'glossary/chord-symbols.yaml');
const curChords = yaml.parse(fs.readFileSync(curChordsPath, 'utf8'));
const batchChords = yaml.parse(fs.readFileSync(batchChordsPath, 'utf8'));

const existingSymbols = new Set(curChords.entries.map(e => e.symbol));
for (const entry of batchChords.entries) {
  if (!existingSymbols.has(entry.symbol)) {
    curChords.entries.push(entry);
    existingSymbols.add(entry.symbol);
  } else {
    // merge skills
    const existing = curChords.entries.find(e => e.symbol === entry.symbol);
    const skills = new Set([...existing.skills, ...entry.skills]);
    existing.skills = Array.from(skills);
  }
}

fs.writeFileSync(curChordsPath, yaml.stringify(curChords));
console.log('Updated content/glossary/chord-symbols.yaml');
