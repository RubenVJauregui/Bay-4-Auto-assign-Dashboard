export const assigneeNames = [
  'JORGE FRANCO',
  'LUIS CHIGUIL',
  'FATIMA PONCE',
  'LUIS PAREDES',
  'MAGALI MEJIA',
  'CLAUDIA CASTILLO',
  'ALEJANDRA LOPEZ',
  'ROSA ROMERO',
  'FATIMA VALENCIA',
  'DORIS DIAZ',
  'ASTRYD AGUILAR',
  'ANDREA VELAZQUES',
  'JOSE LUIS NIEVES',
  'CARMEN JIMENEZ',
  'MATEO MORENO',
  'GONZALO RANGEL',
  'CAREN CUBIDES',
  'CANDY MENDEZ',
  'FELIX NIETO',
  'ROSA JIMENEZ CARDONA',
  'ANABEL GONZALEZ',
  'RUFINO MUNGUIA',
];

export const locationOptions = ['-', 'SPOT740', 'SPOT126', 'SPOT124', 'DOCK57', '540', '541', '542'];

export const inYardRowsSeed = [
  { trailer: 'TRL-7408', rn: 'TRL-7408 | RN-187260', checkIn: '06/22/2026, 09:02 AM', timeInYard: '0 Days 0 Hours 23 Minutes', customer: 'GURUNANDA, LLC', location: 'SPOT740', assignee: 'JORGE FRANCO' },
  { trailer: 'TRL-1264', rn: 'TRL-1264 | RN-5008285', checkIn: '06/20/2026, 07:34 AM', timeInYard: '2 Days 1 Hours 52 Minutes', customer: 'GURUNANDA, LLC', location: 'SPOT126', assignee: 'LUIS CHIGUIL' },
  { trailer: 'TRL-1249', rn: 'TRL-1249 | RN-5008133', checkIn: '06/19/2026, 01:04 PM', timeInYard: '2 Days 10 Hours 21 Minutes', customer: 'GURUNANDA, LLC', location: 'SPOT124', assignee: 'FATIMA PONCE' },
  { trailer: 'TRL-5702', rn: 'TRL-5702 | RN-5008131', checkIn: '06/19/2026, 12:45 AM', timeInYard: '3 Days 8 Hours 41 Minutes', customer: 'GURUNANDA, LLC', location: 'DOCK57', assignee: 'LUIS PAREDES' },
];

const orderShipToNames = [
  'Amazon ONT8',
  'Amazon LGB8',
  'Walmart Apple Valley',
  'Target Rialto',
  'Costco Mira Loma',
  "Sam's Club Fontana",
  'CVS Patterson',
  'Walgreens Moreno Valley',
  'Kroger Riverside',
  'Gurunanda DTC',
];

export const orderRowsSeed = Array.from({ length: 62 }, (_, index) => {
  const dayOffset = Math.floor(index / 16);
  const hour = 7 + (index % 10);
  const minute = (index % 4) * 15;

  return {
    id: `DN-${3220881 - index}`,
    customer: 'GURUNANDA, LLC',
    status: 'Planned',
    baseQty: 96 + ((index * 48) % 672),
    orderType: index % 9 === 0 ? 'Rush' : 'Regular',
    reference: `PO-${785441 - index}`,
    retailerName: 'Gurunanda',
    shipToName: orderShipToNames[index % orderShipToNames.length],
    scheduleDate: `2026-06-${String(22 + dayOffset).padStart(2, '0')}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00-07:00`,
    createdTime: `2026-06-${String(18 - (index % 5)).padStart(2, '0')}T${String(8 + (index % 11)).padStart(2, '0')}:${String((index * 7) % 60).padStart(2, '0')}:00-07:00`,
  };
});

export const shippingRowsSeed = [
  { id: 'DN-3220881', customer: 'GURUNANDA, LLC', dnStatus: 'PICKED', loadStatus: 'NEW', dock: '540', et: 'ET-1111938', assignee: 'ANDREA VELAZQUES' },
  { id: 'DN-3217807', customer: 'GURUNANDA, LLC', dnStatus: 'PICKED', loadStatus: 'NEW', dock: '541', et: 'ET-1111930', assignee: 'JOSE LUIS NIEVES' },
];
