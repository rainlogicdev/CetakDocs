const MONTHS_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const DAYS_ID = [
  'Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'
];

export function formatDateIndonesian(dateInput: string | Date | number, includeDay = false): string {
  let date: Date;
  if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    date = new Date(dateInput + 'T00:00:00');
  } else {
    date = new Date(dateInput);
  }
  if (isNaN(date.getTime())) {
    return String(dateInput);
  }

  const dayName = DAYS_ID[date.getDay()];
  const day = String(date.getDate()).padStart(2, '0');
  const monthName = MONTHS_ID[date.getMonth()];
  const year = date.getFullYear();

  const formattedDate = `${day} ${monthName} ${year}`;
  return includeDay ? `${dayName}, ${formattedDate}` : formattedDate;
}

export function formatDateTimeIndonesian(dateInput: string | Date | number): string {
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) {
    return String(dateInput);
  }

  const dateStr = formatDateIndonesian(date);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${dateStr} ${hours}:${minutes}`;
}
