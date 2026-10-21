// Teste Automatizado do Motor de Prescrição e Autorregulação Neuromuscular

const assert = require('assert');

// Simulação da lógica em JS puro para execução rápida em Node
function calculateEUR(cmjHeightCm, sjHeightCm) {
  if (sjHeightCm <= 0) return 1.0;
  return Math.round((cmjHeightCm / sjHeightCm) * 100) / 100;
}

function calculateLoad(oneRepMaxKg, percentage) {
  const raw = oneRepMaxKg * (percentage / 100);
  return Math.round(raw * 2) / 2;
}

function getBoxHeight(level, isYellowZone) {
  let base = level === 'Iniciante' ? 25 : level === 'Intermediário' ? 40 : 55;
  return isYellowZone ? Math.max(20, base - 15) : base;
}

function generatePrescription(baseline, dailyCMJ) {
  const rawScore = (dailyCMJ / baseline.baseline_cmj_height) * 100;
  const score = Math.round(rawScore * 10) / 10;

  let zone = 'GREEN';
  if (score >= 95) zone = 'GREEN';
  else if (score >= 85) zone = 'YELLOW';
  else zone = 'RED';

  let cutoff = 10;
  let exercises = [];

  if (zone === 'GREEN') {
    cutoff = 10;
    exercises = [
      { name: 'Loaded CMJ', sets: 4, reps: 3, load: calculateLoad(baseline.user_squat_1rm, 35) },
      { name: 'Loaded SJ', sets: 3, reps: 3, load: calculateLoad(baseline.user_squat_1rm, 35) },
      { name: 'Drop Jump', sets: 4, reps: 4, box: getBoxHeight(baseline.training_level, false) }
    ];
  } else if (zone === 'YELLOW') {
    cutoff = 8;
    if (baseline.eur_ratio < 1.10) {
      exercises = [
        { name: 'Loaded CMJ', sets: 3, reps: 3 },
        { name: 'Drop Jump', sets: 3, reps: 3, box: getBoxHeight(baseline.training_level, true) },
        { name: 'Loaded SJ', sets: 2, reps: 2 }
      ];
    } else {
      exercises = [
        { name: 'Loaded SJ', sets: 3, reps: 3 },
        { name: 'Loaded CMJ', sets: 3, reps: 3 },
        { name: 'Drop Jump', sets: 2, reps: 3, box: getBoxHeight(baseline.training_level, true) }
      ];
    }
  } else {
    cutoff = 0;
    exercises = [
      { name: 'Spanish Squat Isométrico', sets: 4 },
      { name: 'Calf Raise Isométrico', sets: 4 },
      { name: 'Mobilidade & Liberação Miofascial', sets: 3 }
    ];
  }

  return { score, zone, cutoff, exercises };
}

console.log('--- INICIANDO TESTES DO MOTOR DE AUTORREGULAÇÃO ---');

// 1. Teste EUR Ratio
const eur1 = calculateEUR(50, 48); // 1.04 -> déficit elástico (< 1.10)
const eur2 = calculateEUR(55, 42); // 1.31 -> déficit força concêntrica (> 1.20)
assert.strictEqual(eur1, 1.04);
assert.strictEqual(eur2, 1.31);
console.log('✅ Teste 1: Cálculo do EUR Ratio passou.');

const baselineAtleta = {
  user_weight: 80,
  user_height: 188,
  user_squat_1rm: 120, // 120kg 1RM agachamento
  training_level: 'Intermediário',
  baseline_cmj_height: 50.0,
  baseline_sj_height: 48.0,
  baseline_rsi: 2.2,
  eur_ratio: 1.04
};

// 2. Teste Zona Verde (CMJ diário = 49cm -> 98%)
const resGreen = generatePrescription(baselineAtleta, 49.0);
assert.strictEqual(resGreen.zone, 'GREEN');
assert.strictEqual(resGreen.score, 98.0);
assert.strictEqual(resGreen.cutoff, 10);
assert.strictEqual(resGreen.exercises.length, 3);
assert.strictEqual(resGreen.exercises[0].load, 42); // 35% de 120kg = 42kg
assert.strictEqual(resGreen.exercises[2].box, 40); // Intermediário = 40cm
console.log('✅ Teste 2: Prescrição da Zona Verde (>=95%) passou. Carga: 42kg, Cutoff: 10%.');

// 3. Teste Zona Amarela com EUR < 1.10 (CMJ diário = 45cm -> 90%)
const resYellowElastic = generatePrescription(baselineAtleta, 45.0);
assert.strictEqual(resYellowElastic.zone, 'YELLOW');
assert.strictEqual(resYellowElastic.score, 90.0);
assert.strictEqual(resYellowElastic.cutoff, 8);
assert.strictEqual(resYellowElastic.exercises[1].name, 'Drop Jump');
assert.strictEqual(resYellowElastic.exercises[1].box, 25); // 40cm - 15cm = 25cm
console.log('✅ Teste 3: Prescrição Zona Amarela com Déficit Elástico passou. Foco em Drop Jump, Caixa: 25cm, Cutoff: 8%.');

// 4. Teste Zona Amarela com EUR >= 1.10 (Déficit Força)
const baselineForca = { ...baselineAtleta, eur_ratio: 1.25 };
const resYellowStrength = generatePrescription(baselineForca, 45.0);
assert.strictEqual(resYellowStrength.zone, 'YELLOW');
assert.strictEqual(resYellowStrength.exercises[0].name, 'Loaded SJ'); // Foco concêntrico
console.log('✅ Teste 4: Prescrição Zona Amarela com Déficit Concêntrico passou. Foco em Loaded SJ.');

// 5. Teste Zona Vermelha (CMJ diário = 38cm -> 76%)
const resRed = generatePrescription(baselineAtleta, 38.0);
assert.strictEqual(resRed.zone, 'RED');
assert.strictEqual(resRed.score, 76.0);
assert.strictEqual(resRed.cutoff, 0);
assert.strictEqual(resRed.exercises[0].name, 'Spanish Squat Isométrico');
console.log('✅ Teste 5: Prescrição Zona Vermelha (<85%) passou. Pliometria abortada, isometrias de tendão ativadas.');

console.log('🎉 TODOS OS TESTES BIOMECÂNICOS PASSARAM COM 100% DE SUCESSO!');
