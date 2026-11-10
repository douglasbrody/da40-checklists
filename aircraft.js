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

  // N523LT's current signed weight & balance record.
  emptyWeight: { lb: null, arm: null, date: null, src: null },

  // Loading stations (AFM Section 6). Station list to be confirmed against the AFM loading sheet; add or remove
  // rows to match it. limit = maximum load at that station (lb), if the AFM gives one.
  stations: [
    { k: 'plan.pilot', label: 'Pilot', arm: null, limit: null, src: null },
    { k: 'plan.front', label: 'Front passenger', arm: null, limit: null, src: null },
    { k: 'plan.rear', label: 'Rear passengers', arm: null, limit: null, src: null },
    { k: 'plan.bag', label: 'Baggage', arm: null, limit: null, src: null }],
  // Limits that apply to more than one station together, e.g. { keys: ['plan.bag', 'plan.bagx'], limit: 0, label: '...', src: '' }
  combinedLimits: [],

  // Fuel (AFM Sections 2 and 6). taxiGal: the allowance used between ramp and takeoff weight (pilot's choice or AFM).
  fuel: { usableGal: null, lbPerGal: null, arm: null, taxiGal: null, src: null },

  // Weight limits (AFM Section 2). mlw / mzfw stay null if the AFM has no such limit (the check is then skipped).
  limits: { mtow: null, mlw: null, mzfw: null, src: null },

  // CG envelope (AFM Section 2/6): the polygon corners as [cg in, weight lb], in order around the envelope.
  envelope: null,
  envelopeSrc: null,

  // Cruise fuel flow by power setting (AFM Section 5 cruise tables), e.g. { 55: x, 65: y, 75: z } in gph.
  // The keys become the Cruise power buttons on Preflight Planning.
  fuelFlow: {},
  fuelFlowSrc: null,
  defaultPower: null,

  // Maximum demonstrated crosswind, knots (AFM Section 2/4). Crosswinds above it show as a caution.
  xwDemoKt: null,
  xwSrc: null,

  // Time meters recorded at Inside Cockpit and shutdown. TO CONFIRM: which meters N523LT has.
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
