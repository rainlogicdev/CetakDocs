export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function terbilang(amount: number): string {
  const bil = [
    '',
    'satu',
    'dua',
    'tiga',
    'empat',
    'lima',
    'enam',
    'tujuh',
    'delapan',
    'sembilan',
    'sepuluh',
    'sebelas',
  ];
  let temp = '';

  const cleanAmount = Math.floor(amount);

  if (cleanAmount < 12) {
    temp = ' ' + bil[cleanAmount];
  } else if (cleanAmount < 20) {
    temp = terbilang(cleanAmount - 10) + ' belas';
  } else if (cleanAmount < 100) {
    temp = terbilang(Math.floor(cleanAmount / 10)) + ' puluh' + terbilang(cleanAmount % 10);
  } else if (cleanAmount < 200) {
    temp = ' seratus' + terbilang(cleanAmount - 100);
  } else if (cleanAmount < 1000) {
    temp = terbilang(Math.floor(cleanAmount / 100)) + ' ratus' + terbilang(cleanAmount % 100);
  } else if (cleanAmount < 2000) {
    temp = ' seribu' + terbilang(cleanAmount - 1000);
  } else if (cleanAmount < 1000000) {
    temp = terbilang(Math.floor(cleanAmount / 1000)) + ' ribu' + terbilang(cleanAmount % 1000);
  } else if (cleanAmount < 1000000000) {
    temp = terbilang(Math.floor(cleanAmount / 1000000)) + ' juta' + terbilang(cleanAmount % 1000000);
  } else if (cleanAmount < 1000000000000) {
    temp = terbilang(Math.floor(cleanAmount / 1000000000)) + ' milyar' + terbilang(cleanAmount % 1000000000);
  } else if (cleanAmount < 1000000000000000) {
    temp = terbilang(Math.floor(cleanAmount / 1000000000000)) + ' triliun' + terbilang(cleanAmount % 1000000000000);
  }

  return temp;
}

export function terbilangRupiah(amount: number): string {
  if (amount === 0) return 'Nol Rupiah';
  const spelling = terbilang(amount).trim();
  // Capitalize first letter
  const formattedSpelling = spelling.charAt(0).toUpperCase() + spelling.slice(1);
  return `${formattedSpelling} Rupiah`.replace(/\s+/g, ' ').trim();
}
