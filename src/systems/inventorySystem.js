export function addResources(inventory, gained) {
  const next = { ...inventory }
  for (const [id, qty] of Object.entries(gained)) {
    next[id] = (next[id] ?? 0) + qty
  }
  return next
}

export function emptyInventory() {
  return {}
}
