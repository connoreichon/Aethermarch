export const STEP_SOURCE_TYPES = {
  PROTOTYPE:      'prototype_simulator',
  WEB_PEDOMETER:  'web_pedometer',
  DEVICE:         'device_steps',
  HEALTH_CONNECT: 'health_connect',
  APPLE_HEALTH:   'apple_health',
}

export const RECENT_STEPS_MAX = 2000

export function createInitialStepSource() {
  return {
    type:                   STEP_SOURCE_TYPES.PROTOTYPE,
    recentSteps:            0,
    lifetimePrototypeSteps: 0,
    lifetimePedometerSteps: 0,
    lastUpdatedAt:          null,
    lastConsumedAt:         null,
  }
}

export function sanitizeStepSource(raw) {
  if (!raw || typeof raw !== 'object') return createInitialStepSource()
  return {
    type:                   raw.type ?? STEP_SOURCE_TYPES.PROTOTYPE,
    recentSteps:            Math.max(0, Math.min(RECENT_STEPS_MAX, Number(raw.recentSteps)  || 0)),
    lifetimePrototypeSteps: Math.max(0, Number(raw.lifetimePrototypeSteps) || 0),
    lifetimePedometerSteps: Math.max(0, Number(raw.lifetimePedometerSteps) || 0),
    lastUpdatedAt:          raw.lastUpdatedAt  ?? null,
    lastConsumedAt:         raw.lastConsumedAt ?? null,
  }
}

export function addPrototypeSteps(stepSource, amount) {
  const n = Math.max(0, Math.floor(Number(amount) || 0))
  return {
    ...stepSource,
    type:                   STEP_SOURCE_TYPES.PROTOTYPE,
    recentSteps:            Math.min(RECENT_STEPS_MAX, stepSource.recentSteps + n),
    lifetimePrototypeSteps: stepSource.lifetimePrototypeSteps + n,
    lastUpdatedAt:          new Date().toISOString(),
  }
}

export function addPedometerSteps(stepSource, amount) {
  const n = Math.max(0, Math.floor(Number(amount) || 0))
  return {
    ...stepSource,
    type:                   STEP_SOURCE_TYPES.WEB_PEDOMETER,
    recentSteps:            Math.min(RECENT_STEPS_MAX, stepSource.recentSteps + n),
    lifetimePedometerSteps: stepSource.lifetimePedometerSteps + n,
    lastUpdatedAt:          new Date().toISOString(),
  }
}

export function consumeRecentSteps(stepSource, amount) {
  const n = Math.max(0, Math.min(stepSource.recentSteps, Math.floor(Number(amount) || 0)))
  return {
    ...stepSource,
    recentSteps:   Math.max(0, stepSource.recentSteps - n),
    lastConsumedAt: new Date().toISOString(),
  }
}

export function getAvailableEchoSteps(stepSource) {
  return Math.max(0, Math.min(RECENT_STEPS_MAX, stepSource?.recentSteps ?? 0))
}
