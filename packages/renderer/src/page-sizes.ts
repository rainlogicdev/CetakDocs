import { PageSize, PageOrientation, PageSettings } from '@cetakdocs/core';

export function getPageSizeCss(settings: PageSettings): string {
  const { size, orientation, margin } = settings;
  
  let sizeVal = 'A4';
  if (size === 'A5') sizeVal = 'A5';
  else if (size === 'thermal-80mm') sizeVal = '80mm auto';
  else if (size === 'thermal-58mm') sizeVal = '58mm auto';

  const orientationVal = size.startsWith('thermal') ? '' : ` ${orientation}`;

  return `
    @page {
      size: ${sizeVal}${orientationVal};
      margin: ${margin};
    }
  `;
}
