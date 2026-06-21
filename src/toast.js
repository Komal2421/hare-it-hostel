// Tiny event-based toast bus so any module can fire a toast without prop drilling.
const listeners = new Set();

export function subscribeToast(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function toast(message, type = "success") {
  const t = { id: `${Date.now()}-${Math.random()}`, message, type };
  for (const fn of listeners) fn(t);
}
