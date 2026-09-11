function escapeCsv(
  value:
    unknown
) {

  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  const text =
    String(value);

  if (
    /[",\n\r]/.test(
      text
    )
  ) {
    return `"${text.replace(
      /"/g,
      '""'
    )}"`;
  }

  return text;
}

export function
buildCsv(
  rows:
    Record<
      string,
      unknown
    >[]
) {

  if (
    rows.length === 0
  ) {
    return "";
  }

  const headers =
    Object.keys(
      rows[0]
    );

  const lines =
    [
      headers
        .map(
          escapeCsv
        )
        .join(","),

      ...rows.map(
        row =>
          headers
            .map(
              header =>
                escapeCsv(
                  row[
                    header
                  ]
                )
            )
            .join(",")
      ),
    ];

  return lines.join(
    "\r\n"
  );
}