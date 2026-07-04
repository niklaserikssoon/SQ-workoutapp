function monthsBetween(birthDate, onDate) {
  const start = new Date(birthDate);
  const end = new Date(onDate);
  let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  if (end.getDate() < start.getDate()) {
    months -= 1;
  }
  return Math.max(0, months);
}

export function formatAge(birthDate, onDate) {
  const months = monthsBetween(birthDate, onDate);

  if (months <= 0) {
    return 'Nyfödd';
  }
  if (months < 12) {
    return `${months} ${months === 1 ? 'månad' : 'månader'}`;
  }

  const years = Math.floor(months / 12);
  const remaining = months % 12;
  const yearLabel = `${years} ${years === 1 ? 'år' : 'år'}`;
  if (remaining === 0) {
    return yearLabel;
  }
  return `${yearLabel} ${remaining} ${remaining === 1 ? 'månad' : 'månader'}`;
}

export function ageInMonths(birthDate, onDate) {
  return monthsBetween(birthDate, onDate);
}
