import {
  escapeHtml,
} from "./html";

export function
emailLayout({
  title,
  body,
  actionLabel,
  actionUrl,
}: {
  title:
    string;
  body:
    string;
  actionLabel?:
    string;
  actionUrl?:
    string;
}) {

  const button =
    actionLabel &&
    actionUrl
      ? `
        <p style="margin:28px 0">
          <a
            href="${escapeHtml(actionUrl)}"
            style="
              display:inline-block;
              background:#111827;
              color:#ffffff;
              text-decoration:none;
              padding:12px 20px;
              border-radius:8px;
              font-weight:600;
            "
          >
            ${escapeHtml(actionLabel)}
          </a>
        </p>
      `
      : "";

  return `
<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width">
</head>

<body style="
  margin:0;
  padding:0;
  background:#f3f4f6;
  font-family:Arial,Helvetica,sans-serif;
">

<div style="
  max-width:640px;
  margin:0 auto;
  padding:30px 18px;
">

  <div style="
    background:#ffffff;
    border-radius:14px;
    padding:28px;
    border:1px solid #e5e7eb;
  ">

    <div style="
      font-size:13px;
      font-weight:700;
      color:#6b7280;
      margin-bottom:12px;
    ">
      HRANALYST PLACEMENT WING
    </div>

    <h1 style="
      font-size:24px;
      margin:0 0 20px;
      color:#111827;
    ">
      ${escapeHtml(title)}
    </h1>

    <div style="
      color:#374151;
      font-size:15px;
      line-height:1.65;
    ">
      ${body}
    </div>

    ${button}

  </div>

  <p style="
    color:#9ca3af;
    font-size:12px;
    text-align:center;
    margin-top:18px;
  ">
    HRAnalyst Placement Wing
  </p>

</div>

</body>
</html>
`;
}