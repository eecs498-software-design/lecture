import { DateTime } from 'luxon';

// There is so much complexity hidden away here, e.g.
// how many days per month, leap years, daylight savings time, etc.
const result = DateTime.now()   // Local system time
  .setZone('America/New_York')  // Map to a specific timezone
  .plus({ months: 7 })          // 2 months from now
  .setLocale('fr')              // Print using a French locale
  .toLocaleString(DateTime.DATETIME_FULL);

console.log(result); // e.g., "26 août 2026 à 07:10 UTC−4"



