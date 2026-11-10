/* Reikniformúlur. Hrein föll án hliðarverkana – prófuð í tests/test.js.
   Einingar: l í m, A í mm², ρ í Ω·mm²/m, R í Ω, I í A, U í V, t í °C, α í 1/°C. */
(function (G) {
  const RF = (G.RF = G.RF || {});
  const PI = Math.PI;
  const k = (two) => (two ? 2 : 1); // tvíleiðari: straumleiðin er fram OG til baka

  RF.phys = {
    areaFromDiameter: (d) => (PI * d * d) / 4,
    areaFromRadius: (r) => PI * r * r,
    diameterFromArea: (A) => Math.sqrt((4 * A) / PI),
    resistance: (rho, l, A, two) => (rho * l * k(two)) / A,
    length: (R, A, rho, two) => (R * A) / (rho * k(two)),
    area: (rho, l, R, two) => (rho * l * k(two)) / R,
    rho: (R, A, l, two) => (R * A) / (l * k(two)),
    conductivity: (rho) => 1 / rho, // eðlisleiðni í S·m/mm² (= m/(Ω·mm²))
    rAtTemp: (R1, alpha, t1, t2) => R1 * (1 + alpha * (t2 - t1)),
    deltaT: (R1, R2, alpha) => (R2 - R1) / (R1 * alpha),
    tempFrom: (R1, R2, alpha, t1) => t1 + (R2 - R1) / (R1 * alpha),
    drop: (I, R) => I * R,
    dropPct: (dU, U1) => (dU / U1) * 100,
    loadVoltage: (U1, dU) => U1 - dU,
    sourceVoltage: (U2, dU) => U2 + dU,
    rFromDrop: (dU, I) => dU / I,
    ohmI: (U, R) => U / R,
  };

  /* Staðlaðar stærðir á þverflatarmáli kapla (mm²) */
  RF.stdAreas = [0.75, 1, 1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120];
  RF.nextStdArea = (A) => RF.stdAreas.find((x) => x >= A - 1e-9) || null;

  /* Efnistafla. src: 'kennari' = gildi úr kennslugögnum/forsendum kennara,
     'almennt' = almennt viðmiðunargildi (ekki staðfest í upprunagögnum). */
  RF.materials = {
    silfur: { name: 'Silfur', short: 'silfur', rho: 0.0167, alpha: 0.0038, src: 'kennari', srcA: 'almennt', use: 'Snertur, rofar, sérhæfð rafeindatækni (of dýrt í lagnir)' },
    kopar: { name: 'Kopar (eir)', short: 'kopar', rho: 0.0178, alpha: 0.0039, src: 'kennari', srcA: 'kennari', use: 'Raflagnir, kaplar, spólur, teinar – algengasti leiðarinn' },
    gull: { name: 'Gull', short: 'gull', rho: 0.0244, alpha: 0.0034, src: 'almennt', srcA: 'almennt', use: 'Húðun á tengjum og snertum (ryðgar ekki)' },
    al: { name: 'Ál', short: 'ál', rho: 0.0278, alpha: 0.004, src: 'kennari', srcA: 'almennt', use: 'Loftlínur og stórir jarðstrengir (léttur og ódýr)' },
    volfram: { name: 'Volfram (wolfram)', short: 'volfram', rho: 0.055, alpha: 0.0045, src: 'almennt', srcA: 'almennt', use: 'Glóþræðir í glóperum, rafsuðuoddar' },
    nikkel: { name: 'Nikkel', short: 'nikkel', rho: 0.07, alpha: 0.0055, src: 'almennt', srcA: 'kennari', use: 'Húðun, rafhlöður, hitanemar' },
    platina: { name: 'Platína', short: 'platína', rho: 0.098, alpha: 0.0039, src: 'kennari', srcA: 'almennt', use: 'Nákvæmir hitanemar (Pt100), snertur' },
    jarn: { name: 'Járn', short: 'járn', rho: 0.1, alpha: 0.005, src: 'kennari', srcA: 'almennt', use: 'Stál í burðarvirkjum, kjarnar í spennum' },
    manganin: { name: 'Manganín', short: 'manganín', rho: 0.43, alpha: 0.00001, src: 'kennari', srcA: 'almennt', use: 'Nákvæmar mótstöður (viðnám breytist nær ekkert með hita)' },
    konstantan: { name: 'Konstantan', short: 'konstantan', rho: 0.49, alpha: 0.00001, src: 'almennt', srcA: 'almennt', use: 'Mótstöður og hitaþreifarar' },
    kromnikkel: { name: 'Krómnikkel', short: 'krómnikkel', rho: 1.1, alpha: 0.0002, src: 'almennt', srcA: 'almennt', use: 'Hitaþræðir í ofnum, brauðristum og hellum' },
  };
  for (const key in RF.materials) RF.materials[key].key = key;
  RF.mat = (key) => RF.materials[key];
  /* Efni sem passar best við reiknað eðlisviðnám (hlutfallslegur munur) */
  RF.closestMaterials = (rho) =>
    Object.values(RF.materials)
      .map((m) => ({ m, diff: Math.abs(m.rho - rho) / m.rho }))
      .sort((a, b) => a.diff - b.diff);
})(typeof globalThis !== 'undefined' ? globalThis : window);
