export interface PerfCaseResult {
  name:
    string;

  connections:
    number;

  duration:
    number;

  totalRequests:
    number;

  requestsPerSecond:
    number;

  latencyAverage:
    number;

  latencyP50:
    number;

  latencyP95:
    number;

  latencyP99:
    number;

  latencyMax:
    number;

  errors:
    number;

  timeouts:
    number;

  non2xx:
    number;

  errorRatePercent:
    number;

  passed:
    boolean;

  failures:
    string[];
}

export function
normalizeAutocannonResult({
  name,
  result,
  p95LimitMs,
  p99LimitMs,
  maxErrorRatePercent,
}: {
  name:
    string;

  result:
    any;

  p95LimitMs:
    number;

  p99LimitMs:
    number;

  maxErrorRatePercent:
    number;
}): PerfCaseResult {

  const totalRequests =
    Number(
      result.requests
        ?.total ??
      0
    );

  const errors =
    Number(
      result.errors ??
      0
    );

  const timeouts =
    Number(
      result.timeouts ??
      0
    );

  const non2xx =
    Number(
      result.non2xx ??
      0
    );

  const badRequests =
    errors
    +
    timeouts
    +
    non2xx;

  const errorRatePercent =
    totalRequests
      ? Number(
          (
            badRequests
            /
            totalRequests
            *
            100
          )
            .toFixed(
              3
            )
        )
      : 100;

  const latencyP95 =
    Number(
      result.latency
        ?.p95 ??
      result.latency
        ?.p97_5 ??
      0
    );

  const latencyP99 =
    Number(
      result.latency
        ?.p99 ??
      0
    );

  const failures:
    string[] =
    [];

  if (
    latencyP95 >
    p95LimitMs
  ) {
    failures.push(
      `P95 ${latencyP95}ms exceeds ${p95LimitMs}ms`
    );
  }

  if (
    latencyP99 >
    p99LimitMs
  ) {
    failures.push(
      `P99 ${latencyP99}ms exceeds ${p99LimitMs}ms`
    );
  }

  if (
    errorRatePercent >
    maxErrorRatePercent
  ) {
    failures.push(
      `Error rate ${errorRatePercent}% exceeds ${maxErrorRatePercent}%`
    );
  }

  return {
    name,

    connections:
      Number(
        result.connections ??
        0
      ),

    duration:
      Number(
        result.duration ??
        0
      ),

    totalRequests,

    requestsPerSecond:
      Number(
        result.requests
          ?.average ??
        0
      ),

    latencyAverage:
      Number(
        result.latency
          ?.average ??
        0
      ),

    latencyP50:
      Number(
        result.latency
          ?.p50 ??
        0
      ),

    latencyP95,

    latencyP99,

    latencyMax:
      Number(
        result.latency
          ?.max ??
        0
      ),

    errors,

    timeouts,

    non2xx,

    errorRatePercent,

    passed:
      failures.length ===
      0,

    failures,
  };
}