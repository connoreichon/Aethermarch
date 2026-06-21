const STEP_THRESHOLD       = 1.15
const STEP_MIN_INTERVAL_MS = 320
const STEP_MAX_INTERVAL_MS = 1800  // exported via constants, checked outside
const SMOOTHING            = 0.82

export { STEP_THRESHOLD, STEP_MIN_INTERVAL_MS, STEP_MAX_INTERVAL_MS, SMOOTHING }

export function isMotionSupported() {
  return typeof window !== 'undefined' && 'DeviceMotionEvent' in window
}

export function needsMotionPermission() {
  return (
    typeof window !== 'undefined' &&
    typeof DeviceMotionEvent !== 'undefined' &&
    typeof DeviceMotionEvent.requestPermission === 'function'
  )
}

export async function requestMotionPermission() {
  try {
    const result = await DeviceMotionEvent.requestPermission()
    return result === 'granted'
  } catch {
    return false
  }
}

export function createPedometerState() {
  return {
    status:            'idle',  // idle | running | paused | denied | unsupported | insecure
    steps:             0,
    lastStepAt:        0,
    lastMagnitude:     0,
    smoothedMagnitude: 0,
    peakArmed:         true,
    sampleCount:       0,
    error:             null,
  }
}

export function processMotionSample(previousState, motionEvent) {
  const acc = motionEvent.accelerationIncludingGravity ?? motionEvent.acceleration
  if (!acc) return previousState

  const x = acc.x ?? 0
  const y = acc.y ?? 0
  const z = acc.z ?? 0
  const magnitude = Math.sqrt(x * x + y * y + z * z)
  if (!isFinite(magnitude) || magnitude === 0) return previousState

  const smoothed = SMOOTHING * previousState.smoothedMagnitude + (1 - SMOOTHING) * magnitude
  const delta    = magnitude - smoothed
  const now      = Date.now()
  const elapsed  = now - previousState.lastStepAt

  let steps      = previousState.steps
  let lastStepAt = previousState.lastStepAt
  let peakArmed  = previousState.peakArmed

  if (peakArmed && delta > STEP_THRESHOLD && elapsed > STEP_MIN_INTERVAL_MS) {
    steps      = previousState.steps + 1
    lastStepAt = now
    peakArmed  = false
  } else if (delta < STEP_THRESHOLD * 0.5) {
    peakArmed = true
  }

  return {
    ...previousState,
    lastMagnitude:     magnitude,
    smoothedMagnitude: smoothed,
    peakArmed,
    steps,
    lastStepAt,
    sampleCount: previousState.sampleCount + 1,
  }
}
