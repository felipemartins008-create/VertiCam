const GRAVITY_G = 9.81;

function calculateJumpHeight(flightTimeSec) {
  if (flightTimeSec <= 0) return 0;
  const heightMeters = (GRAVITY_G * Math.pow(flightTimeSec, 2)) / 8;
  const heightCm = heightMeters * 100;
  return Math.round(heightCm * 10) / 10;
}

function calculateAttackReach(standingReachCm, jumpHeightCm) {
  return Math.round(standingReachCm + jumpHeightCm);
}

function runTests() {
  console.log('=== TESTY BIOMECHANIKI I FIZYKI SIATKAJUMP AI ===\n');

  const testCases = [
    { t: 0.60, expectedMin: 44.0, expectedMax: 44.3 },
    { t: 0.70, expectedMin: 60.0, expectedMax: 60.2 },
    { t: 0.71, expectedMin: 61.7, expectedMax: 62.0 },
    { t: 0.80, expectedMin: 78.4, expectedMax: 78.6 },
  ];

  let allPassed = true;

  testCases.forEach((tc) => {
    const h = calculateJumpHeight(tc.t);
    const passed = h >= tc.expectedMin && h <= tc.expectedMax;
    console.log(
      `Czas lotu t = ${tc.t.toFixed(2)}s -> Wyskok: ${h} cm [Oczekiwano: ${tc.expectedMin}-${tc.expectedMax} cm] -> ${passed ? '✅ PASSED' : '❌ FAILED'}`
    );
    if (!passed) allPassed = false;
  });

  // Test zasięgu w ataku
  const standingReach = 254; // np. 191 cm wzrostu
  const jumpHeight = 61.8;
  const attackReach = calculateAttackReach(standingReach, jumpHeight);
  console.log(`\nZasięg stojąc: ${standingReach} cm + Wyskok: ${jumpHeight} cm -> Zasięg w ataku: ${attackReach} cm`);

  if (attackReach === 316) {
    console.log('Test zasięgu w ataku: ✅ PASSED');
  } else {
    console.log('Test zasięgu w ataku: ❌ FAILED');
    allPassed = false;
  }

  console.log(`\nStatus końcowy: ${allPassed ? 'WSZYSTKIE TESTY ZALICZONE SUKCESEM 🎉' : 'BŁĘDY W TESTACH'}`);
  process.exit(allPassed ? 0 : 1);
}

runTests();
