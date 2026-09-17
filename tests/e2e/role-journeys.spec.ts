import { expect, test } from "@playwright/test";

const roles = [
  ["ADMIN", "/admin"],
  ["PLACEMENT_HR", "/placement-hr/jobs"],
  ["CLIENT_HR", "/client/jobs"],
  ["STUDENT", "/student/jobs"],
] as const;

for (const [role, dashboard] of roles) {
  const email = process.env[`E2E_${role}_EMAIL`];
  const password = process.env[`E2E_${role}_PASSWORD`];

  test(`configured ${role} account reaches its dashboard`, async ({ page }) => {
    test.skip(!email || !password, `E2E_${role}_EMAIL/PASSWORD are required`);
    await page.goto("/login");
    await page.getByLabel(/email/i).fill(email!);
    await page.getByLabel(/password/i).fill(password!);
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page).toHaveURL(new RegExp(dashboard.replaceAll("/", "\\/")));
  });
}
