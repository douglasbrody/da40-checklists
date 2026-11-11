// N523LT — 2008 Diamond DA40 XLS (G1000 / GFC 700, PowerFlow exhaust).
// Everything aircraft-specific lives here. Every figure must come from the DA40 XLS AFM/POH or N523LT's own signed
// records, with the section/page in `src`. null = not provided yet: Preflight Planning lists what is missing and
// does not calculate (it never fills a gap from memory or from another airplane).
// Units: pounds, inches aft of datum, US gallons, knots, nautical miles.
const AIRCRAFT = {
  reg: 'N523LT',
  type: 'DA40 XLS',
  name: 'DA40',

  // Home base. FAA NASR via AirNav, data effective 29 Oct 2026: field elevation 8.5 ft surveyed (9 used, as the
  // Chart Supplement prints it); magnetic variation 13° W (1980 epoch). Both stay editable in the app.
  home: { icao: 'KBDR', elevFt: 9, magVarW: 13, src: 'FAA NASR (AirNav), effective 29 Oct 2026' },

  // N523LT's basic empty weight. Pilot (10 Nov 2026): use the ForeFlight profile figures, taken from the W&B record.
  // ForeFlight shows the arm rounded to the inch; replace with the exact moment if the report gives one.
  emptyWeight: { lb: 1819.28, arm: 99.0, date: null, src: 'ForeFlight profile, from the W&B record (pilot, 10 Nov 2026)' },

  // Loading stations, AFM 6.4.8 moment arms; extended baggage compartment (OÄM 40-163, pilot confirmed) limits AFM 2.7.
  stations: [
    { k: 'plan.pilot', label: 'Pilot', arm: 90.6, limit: null, src: 'AFM 6.4.8 front seats' },
    { k: 'plan.front', label: 'Front passenger', arm: 90.6, limit: null, src: 'AFM 6.4.8 front seats' },
    { k: 'plan.rear', label: 'Rear passengers', arm: 128.0, limit: null, src: 'AFM 6.4.8 rear seats' },
    { k: 'plan.bagf', label: 'Baggage, forward part', arm: 153.1, limit: 100, src: 'AFM 6.4.8 / 2.7 extended baggage, forward' },
    { k: 'plan.baga', label: 'Baggage, aft part', arm: 178.7, limit: 40, src: 'AFM 6.4.8 / 2.7 extended baggage, aft' }],
  // AFM 2.7: extended baggage compartment, max. total load forward + aft 100 lb.
  combinedLimits: [{ keys: ['plan.bagf', 'plan.baga'], limit: 100, label: 'Baggage forward + aft', src: 'AFM 2.7' }],

  // Fuel. Long-range tank (OÄM 40-071, pilot confirmed): 2 x 25.5 gal total less 2 x 0.5 unusable = 50.0 usable
  // (AFM 2.14.2). Arm 103.5 in (AFM 6.4.8). 6.01 lb/gal (AFM 6.4.10 note). Taxi allowance 1.5 gal (pilot).
  fuel: { usableGal: 50.0, lbPerGal: 6.01, arm: 103.5, taxiGal: 1.5, src: 'AFM 2.14.2, 6.4.8, 6.4.10; taxi allowance pilot' },

  // Weight limits, AFM 2.7: MTOW 2,646 with MÄM 40-227 (pilot: assume carried out); max zero fuel 2,535.
  // Max landing: 2,535 only with the modified MLG strut (MÄM 40-123/e or OÄM 40-283), else 2,407. The strut mod
  // is unconfirmed (pilot to check), so the conservative 2,407 is used until then.
  limits: { mtow: 2646, mlw: 2407, mzfw: 2535, src: 'AFM 2.7 (MÄM 40-227; original MLG strut assumed)' },

  // CG envelope, AFM 2.8.2 / 6.4.11: forward 94.5 in from 1,720 to 2,161 lb, linear to 97.6 in at 2,646 lb
  // (MÄM 40-227); rearward 100.4 in with the long-range tank (102.0 applies only to the standard tank).
  envelope: [[94.5, 1720], [94.5, 2161], [97.6, 2646], [100.4, 2646], [100.4, 1720]],
  envelopeSrc: 'AFM 2.8.2 (MÄM 40-227, long-range tank)',

  // Cruise fuel flow, AFM 5.3.2: the highest flow listed for each power (best power, 2,400 RPM), so the fuel
  // plan errs toward more burn. Best economy at 2,400 RPM would be 7.5 / 8.5 / 9.5 gph.
  fuelFlow: { 55: 8.7, 65: 9.8, 75: 11.0 },
  fuelFlowSrc: 'AFM 5.3.2, best power 2,400 RPM',
  defaultPower: 75,   // pilot, 10 Nov 2026

  // Maximum demonstrated crosswind, AFM 5.3.5.
  xwDemoKt: 20,
  xwSrc: 'AFM 5.3.5',

  // Time meters recorded at Cabin Check and shutdown (pilot: tach and Hobbs, record both).
  meters: [
    { f: 'hobbs', tag: 'H', label: 'Hobbs' },
    { f: 'tach', tag: 'T', label: 'Tach' }],

  // Performance (AFM Section 5). Each entry names a chart or table id in POH_CHARTS (charts.js), once traced and
  // checked against the AFM's printed example by tools/build_charts.js. null = not available yet.
  perf: { toRun: null, to50: null, climb: null, ldgRun: null, ldg50: null },
  // Chart ids in flight order for Previous / Next on the chart screens, with names for the titles and tiles.
  chartFlow: [],
  chartName: {},
  chartShort: {}
};

// What Preflight Planning still needs before it can calculate (each is an AFM or W&B record item).
function aircraftMissing() {
  const A = AIRCRAFT, m = [], num = v => typeof v === 'number' && isFinite(v);
  if (A.stations.some(s => !num(s.arm))) m.push('station arms (AFM 6)');
  if (!num(A.fuel.usableGal) || !num(A.fuel.lbPerGal) || !num(A.fuel.arm)) m.push('fuel capacity, weight and arm (AFM 2/6)');
  if (!num(A.fuel.taxiGal)) m.push('taxi fuel allowance');
  if (!num(A.limits.mtow)) m.push('maximum takeoff weight (AFM 2)');
  if (!Array.isArray(A.envelope) || A.envelope.length < 3) m.push('CG envelope (AFM 2/6)');
  if (!Object.keys(A.fuelFlow).length) m.push('cruise fuel flows (AFM 5)');
  return m;
}
