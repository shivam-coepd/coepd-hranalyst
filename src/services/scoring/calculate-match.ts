import { CvExtraction } from "../cv/cv-extraction.schema";

interface Coverage {
  matched: number;
  total: number;
}

function ratio({
  matched,
  total,
}: Coverage) {

  if (total === 0) {
    return 0;
  }

  return matched / total;
}

export function calculateMatchScore({
  mustHave,
  goodToHave,
  tools,
}: {
  mustHave: Coverage;
  goodToHave: Coverage;
  tools: Coverage;
}) {

  const mustCoverage =
    ratio(mustHave);

  const goodCoverage =
    ratio(goodToHave);

  const toolCoverage =
    ratio(tools);

  const mustScore =
    mustCoverage * 70;

  const goodScore =
    goodCoverage * 20;

  const toolScore =
    toolCoverage * 10;

  const matchScore =
    mustScore +
    goodScore +
    toolScore;

  return {

    matchScore:
      Number(
        matchScore.toFixed(2)
      ),

    mustHaveScore:
      Number(
        mustScore.toFixed(2)
      ),

    goodToHaveScore:
      Number(
        goodScore.toFixed(2)
      ),

    toolsScore:
      Number(
        toolScore.toFixed(2)
      ),

    mustHaveCoverage:
      Number(
        (
          mustCoverage * 100
        ).toFixed(2)
      ),

    goodToHaveCoverage:
      Number(
        (
          goodCoverage * 100
        ).toFixed(2)
      ),

    toolsCoverage:
      Number(
        (
          toolCoverage * 100
        ).toFixed(2)
      ),
  };
}

function calculateWeightedCoverage(
  categories: Array<{
    matched: number;
    total: number;
    weight: number;
  }>
) {

  const active =
    categories.filter(
      item =>
        item.total > 0
    );

  const activeWeight =
    active.reduce(
      (
        total,
        item
      ) =>
        total +
        item.weight,
      0
    );

  if (
    activeWeight === 0
  ) {
    return 0;
  }

  const weighted =
    active.reduce(
      (
        total,
        item
      ) => {

        const coverage =
          item.matched /
          item.total;

        return (
          total +
          coverage *
          (
            item.weight /
            activeWeight
          )
        );
      },
      0
    );

  return Number(
    (
      weighted * 100
    ).toFixed(2)
  );
}

export function scoreContact(
  cv: CvExtraction
) {

  let score = 0;

  if (cv.full_name)
    score += 4;

  if (cv.email)
    score += 5;

  if (cv.phone)
    score += 5;

  if (cv.location)
    score += 3;

  if (cv.linkedin_url)
    score += 3;

  return score;
}