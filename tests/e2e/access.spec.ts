import { expect, test } from "@playwright/test";

test("login and recovery pages are reachable", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  await page.goto("/forgot-password");
  await expect(page.locator("body")).toContainText(/reset|password/i);
});

test("anonymous users cannot open role dashboards", async ({ page }) => {
  for (const route of [
    "/admin",
    "/placement-hr/jobs",
    "/client/jobs",
    "/student/jobs",
  ]) {
    await page.goto(route);
    await expect(page).toHaveURL(/\/login(?:\?|$)/);
  }
});

test("protected mutation APIs fail closed without a session", async ({
  request,
}) => {
  const cases: Array<[string, "post"]> = [
    ["/api/applications", "post"],
    ["/api/submissions", "post"],
    ["/api/offers", "post"],
    ["/api/placements/confirm", "post"],
    ["/api/notifications/read-all", "post"],
  ];
  for (const [url, method] of cases) {
    const response = await request[method](url, { data: {} });
    expect([401, 403]).toContain(response.status());
  }
});
