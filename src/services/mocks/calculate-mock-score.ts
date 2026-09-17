export function calculateMockScore({
  communication,
  technical,
  domain,
}: {
  communication: number;
  technical: number;
  domain: number;
}) {
  const overall = communication * 0.3 + technical * 0.4 + domain * 0.3;

  return Number(overall.toFixed(2));
}
