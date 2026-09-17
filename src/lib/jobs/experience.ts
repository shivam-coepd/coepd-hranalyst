function monthsToDisplay(months: number) {
  const years = Math.floor(months / 12);

  const remaining = months % 12;

  if (years && remaining) {
    return `${years}y ${remaining}m`;
  }

  if (years) {
    return `${years}y`;
  }

  return `${remaining}m`;
}

export function formatExperience(min: number, max?: number | null) {
  if (max === null || max === undefined) {
    return `${monthsToDisplay(min)}+`;
  }

  return `${monthsToDisplay(min)}–${monthsToDisplay(max)}`;
}
