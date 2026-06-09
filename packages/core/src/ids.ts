export function generateId(prefix: string): string {
  let uuid = '';
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    uuid = crypto.randomUUID();
  } else {
    // Fallback generator
    uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
  const cleanUuid = uuid.replace(/-/g, '');
  return `${prefix}_${cleanUuid}`;
}
