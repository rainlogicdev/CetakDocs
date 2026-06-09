export function generateDocumentNumber(
  format: string,
  sequenceNumber: number,
  date: Date = new Date(),
  orgCode = '',
  tplCode = ''
): string {
  const yearFull = date.getFullYear().toString();
  const yearShort = yearFull.slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  let result = format;

  // Replace date variables
  result = result.replace(/{YYYY}/g, yearFull);
  result = result.replace(/{YY}/g, yearShort);
  result = result.replace(/{MM}/g, month);
  result = result.replace(/{DD}/g, day);
  result = result.replace(/{ORG}/g, orgCode);
  result = result.replace(/{TPL}/g, tplCode);

  // Replace sequence number (e.g., {####} -> 0005)
  const sequenceRegex = /{(\#+)}/;
  const match = result.match(sequenceRegex);
  if (match) {
    const hashes = match[1];
    const padding = hashes.length;
    const paddedSequence = String(sequenceNumber).padStart(padding, '0');
    result = result.replace(sequenceRegex, paddedSequence);
  }

  return result;
}

export function parsePaddingFromFormat(format: string): number {
  const match = format.match(/{(\#+)}/);
  return match ? match[1].length : 4;
}
