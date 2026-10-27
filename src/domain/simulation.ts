/**
 * Deterministic Factory Line Simulator
 * Computes energy waste, CO2 emissions, and water losses based on
 * real downtime events and Team Assumptions from resource_assumptions.
 */

export interface ResourceAssumptions {
  idlePowerKw: number;        // e.g. 18.0 kW
  runningPowerKw: number;     // e.g. 45.0 kW
  gridKgCo2PerKwh: number;    // e.g. 0.40 kg CO2 / kWh
  waterLPerRestart: number;   // e.g. 25.0 L water rinsed per stop
  minThroughputPct: number;   // e.g. 95.0%
}

export const DEFAULT_ASSUMPTIONS: ResourceAssumptions = {
  idlePowerKw: 18.0,
  runningPowerKw: 45.0,
  gridKgCo2PerKwh: 0.40,
  waterLPerRestart: 25.0,
  minThroughputPct: 95.0,
};

export interface BaselineMetrics {
  totalUnits: number;
  totalPauseHours: number;
  totalOperationHours: number;
  totalStoppages: number;
  microStops: number;
  mediumStops: number;
  longStops: number;
  stoppages5L: number;
  stoppages3L: number;
  units5L: number;
  units3L: number;
  idleEnergyKwh: number;
  co2EmissionsKg: number;
  waterLossLiters: number;
  stopsPer1kUnits: number;
  energyKwhPer1kUnits: number;
}

export interface InterventionConfig {
  id: string;
  name: string;
  description: string;
  target: '5L_micro_stoppages' | 'idle_standby_shutdown' | 'speed_governor';
  reductionPct: number; // e.g. 35% reduction in target stoppages or idle energy
  workloadIncreasePct: number; // trade-off cost
  throughputImpactPct: number; // e.g. -0.5% or 0%
}

export interface SimulationResult {
  intervention: InterventionConfig;
  baseline: BaselineMetrics;
  modeled: BaselineMetrics;
  savings: {
    energyKwhSaved: number;
    energyPctSaved: number;
    co2KgAvoided: number;
    waterLitersSaved: number;
    stoppagesReduced: number;
    annualizedCostSavingsUsd: number; // modeled at $0.15/kWh
  };
  tradeOffs: {
    workloadIncreasePct: number;
    throughputChangePct: number;
    meetsThroughputFloor: boolean;
  };
  note: string;
}

export const AVAILABLE_INTERVENTIONS: InterventionConfig[] = [
  {
    id: 'opt_5l_feed_guide',
    name: '5L Line Infeed Guide Realignment & Sensor Calibration',
    description: 'Recalibrate photoelectric sensors and widen infeed guide rail for 5L containers to eliminate micro-chatter and false bottle jams.',
    target: '5L_micro_stoppages',
    reductionPct: 40,
    workloadIncreasePct: 5,
    throughputImpactPct: 0.2,
  },
  {
    id: 'opt_smart_idle_standby',
    name: 'Automated Idle Conveyor Standby Mode',
    description: 'Automatically drop infeed conveyors and heating elements to low-power standby when line pause exceeds 90 seconds.',
    target: 'idle_standby_shutdown',
    reductionPct: 25,
    workloadIncreasePct: 2,
    throughputImpactPct: 0.0,
  },
  {
    id: 'opt_speed_governor',
    name: 'Dynamic Speed Governor for Viscous Fill Cycles',
    description: 'Throttle filler velocity by 4% on high-volume runs to prevent splashing and subsequent emergency stop rinses.',
    target: 'speed_governor',
    reductionPct: 20,
    workloadIncreasePct: 1,
    throughputImpactPct: -1.5,
  },
];

// Baseline numbers derived from Sep-Nov 2022 dataset:
// ~104,200 production units, 3,020 downtime events (mostly 5L micro-stops), ~126 pause hours
export function getSepNovBaseline(assumptions: ResourceAssumptions = DEFAULT_ASSUMPTIONS): BaselineMetrics {
  const totalUnits = 104250;
  const units5L = 46800;
  const units3L = 57450;
  const totalPauseHours = 126.4;
  const totalOperationHours = 242.0;
  const stoppages5L = 1980;
  const stoppages3L = 1040;
  const totalStoppages = stoppages5L + stoppages3L; // 3,020 stops
  const microStops = 2650;
  const mediumStops = 290;
  const longStops = 80;

  const idleEnergyKwh = totalPauseHours * assumptions.idlePowerKw;
  const co2EmissionsKg = idleEnergyKwh * assumptions.gridKgCo2PerKwh;
  const waterLossLiters = totalStoppages * assumptions.waterLPerRestart;
  const stopsPer1kUnits = (totalStoppages / totalUnits) * 1000;
  const energyKwhPer1kUnits = (idleEnergyKwh / totalUnits) * 1000;

  return {
    totalUnits,
    totalPauseHours: Number(totalPauseHours.toFixed(1)),
    totalOperationHours: Number(totalOperationHours.toFixed(1)),
    totalStoppages,
    microStops,
    mediumStops,
    longStops,
    stoppages5L,
    stoppages3L,
    units5L,
    units3L,
    idleEnergyKwh: Number(idleEnergyKwh.toFixed(1)),
    co2EmissionsKg: Number(co2EmissionsKg.toFixed(1)),
    waterLossLiters: Math.round(waterLossLiters),
    stopsPer1kUnits: Number(stopsPer1kUnits.toFixed(2)),
    energyKwhPer1kUnits: Number(energyKwhPer1kUnits.toFixed(2)),
  };
}

export function simulateIntervention(
  interventionId: string = 'opt_5l_feed_guide',
  assumptions: ResourceAssumptions = DEFAULT_ASSUMPTIONS,
): SimulationResult {
  const intervention: InterventionConfig =
    AVAILABLE_INTERVENTIONS.find(i => i.id === interventionId) ?? AVAILABLE_INTERVENTIONS[0]!;
  const baseline = getSepNovBaseline(assumptions);

  let modeledPauseHours = baseline.totalPauseHours;
  let modeledStoppages = baseline.totalStoppages;
  let modeledMicroStops = baseline.microStops;
  let modeledStoppages5L = baseline.stoppages5L;
  let modeledIdleEnergy = baseline.idleEnergyKwh;

  if (intervention.target === '5L_micro_stoppages') {
    const reducedStops5L = Math.round(baseline.stoppages5L * (intervention.reductionPct / 100));
    modeledStoppages5L -= reducedStops5L;
    modeledStoppages -= reducedStops5L;
    modeledMicroStops -= reducedStops5L;
    // Each micro stop saved yields ~1.8 mins (0.03h) of pause time saved
    const pauseHoursSaved = reducedStops5L * 0.03;
    modeledPauseHours = Math.max(20, modeledPauseHours - pauseHoursSaved);
    modeledIdleEnergy = modeledPauseHours * assumptions.idlePowerKw;
  } else if (intervention.target === 'idle_standby_shutdown') {
    // Standby cuts idle power draw by 25%
    modeledIdleEnergy = baseline.idleEnergyKwh * (1 - intervention.reductionPct / 100);
  } else if (intervention.target === 'speed_governor') {
    const reducedStops = Math.round(baseline.totalStoppages * (intervention.reductionPct / 100));
    modeledStoppages -= reducedStops;
    modeledMicroStops -= Math.round(reducedStops * 0.8);
    modeledPauseHours = Math.max(20, modeledPauseHours - (reducedStops * 0.025));
    modeledIdleEnergy = modeledPauseHours * assumptions.idlePowerKw;
  }

  const modeledCo2 = modeledIdleEnergy * assumptions.gridKgCo2PerKwh;
  const modeledWater = modeledStoppages * assumptions.waterLPerRestart;
  const modeledUnits = Math.round(baseline.totalUnits * (1 + (intervention.throughputImpactPct / 100)));

  const modeled: BaselineMetrics = {
    totalUnits: modeledUnits,
    totalPauseHours: Number(modeledPauseHours.toFixed(1)),
    totalOperationHours: baseline.totalOperationHours,
    totalStoppages: modeledStoppages,
    microStops: modeledMicroStops,
    mediumStops: baseline.mediumStops,
    longStops: baseline.longStops,
    stoppages5L: modeledStoppages5L,
    stoppages3L: baseline.stoppages3L,
    units5L: baseline.units5L,
    units3L: baseline.units3L,
    idleEnergyKwh: Number(modeledIdleEnergy.toFixed(1)),
    co2EmissionsKg: Number(modeledCo2.toFixed(1)),
    waterLossLiters: Math.round(modeledWater),
    stopsPer1kUnits: Number(((modeledStoppages / modeledUnits) * 1000).toFixed(2)),
    energyKwhPer1kUnits: Number(((modeledIdleEnergy / modeledUnits) * 1000).toFixed(2)),
  };

  const energyKwhSaved = Number((baseline.idleEnergyKwh - modeled.idleEnergyKwh).toFixed(1));
  const energyPctSaved = Number(((energyKwhSaved / baseline.idleEnergyKwh) * 100).toFixed(1));
  const co2KgAvoided = Number((baseline.co2EmissionsKg - modeled.co2EmissionsKg).toFixed(1));
  const waterLitersSaved = baseline.waterLossLiters - modeled.waterLossLiters;
  const stoppagesReduced = baseline.totalStoppages - modeled.totalStoppages;
  // Extrapolate quarterly to annualized cost savings ($0.15/kWh + $0.005/L treated water)
  const annualizedCostSavingsUsd = Math.round((energyKwhSaved * 0.15 + waterLitersSaved * 0.005) * 4);

  return {
    intervention,
    baseline,
    modeled,
    savings: {
      energyKwhSaved,
      energyPctSaved,
      co2KgAvoided,
      waterLitersSaved,
      stoppagesReduced,
      annualizedCostSavingsUsd,
    },
    tradeOffs: {
      workloadIncreasePct: intervention.workloadIncreasePct,
      throughputChangePct: intervention.throughputImpactPct,
      meetsThroughputFloor: (100 + intervention.throughputImpactPct) >= assumptions.minThroughputPct,
    },
    note: 'Modeled estimate derived from Zetaris production metrics and team resource assumptions. Illustrative engineering calculations.',
  };
}
