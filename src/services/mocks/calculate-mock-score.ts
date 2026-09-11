export function calculateMockScore({
  communication,
  technical,
  domain,
}: {
  communication: number;
  technical: number;
  domain: number;
}) {

  const overall =
    communication * 0.30 +
    technical * 0.40 +
    domain * 0.30;

  return Number(
    overall.toFixed(2)
  );
}