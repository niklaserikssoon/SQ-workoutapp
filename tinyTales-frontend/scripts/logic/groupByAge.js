import { ageInMonths } from './age.js';

/**
 * Groups entries into age-based buckets ("8 månader", "7 månader", ...),
 * newest first. The bucket matching the child's current age is flagged
 * isCurrent so the UI can prefix it with "Idag".
 */
export function groupByAge(memories, birthDate, referenceDate = new Date().toISOString().slice(0, 10)) {
  const sorted = [...memories].sort((a, b) => new Date(b.memoryDate) - new Date(a.memoryDate));
  const currentAgeMonths = ageInMonths(birthDate, referenceDate);

  const order = [];
  const buckets = new Map();

  for (const memory of sorted) {
    const months = ageInMonths(birthDate, memory.memoryDate);
    if (!buckets.has(months)) {
      buckets.set(months, []);
      order.push(months);
    }
    buckets.get(months).push(memory);
  }

  return order.map((months) => ({
    months,
    isCurrent: months === currentAgeMonths,
    ageLabel: formatAgeForMonths(months),
    entries: buckets.get(months),
  }));
}

function formatAgeForMonths(months) {
  if (months <= 0) return 'Nyfödd';
  if (months < 12) return `${months} ${months === 1 ? 'månad' : 'månader'}`;
  const years = Math.floor(months / 12);
  const remaining = months % 12;
  const yearLabel = `${years} år`;
  return remaining === 0 ? yearLabel : `${yearLabel} ${remaining} ${remaining === 1 ? 'månad' : 'månader'}`;
}
