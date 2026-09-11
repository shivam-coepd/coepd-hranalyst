import {
  calculateMockScore,
} from "./calculate-mock-score";

export function buildMockScore({
  communicationScore,
  technicalScore,
  domainScore,
}: {
  communicationScore: number;
  technicalScore: number;
  domainScore: number;
}) {

  const overallScore =
    calculateMockScore({
      communication:
        communicationScore,

      technical:
        technicalScore,

      domain:
        domainScore,
    });

  return {
    communicationScore,
    technicalScore,
    domainScore,
    overallScore,
    scoringVersion:
      "mock-score-v1",
  };
}
