export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

export function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function formatDate(date) {
  return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).format(date)
}
