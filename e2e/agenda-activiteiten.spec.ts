import { test, expect } from "@playwright/test";

test.describe("Vrijwilliger agenda toont meerdere activiteiten", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Vrijwilliger" }).click();
    await page.waitForURL(/\/vrijwilliger/);
  });

  test("agenda toont minimaal 6 geplande activiteiten", async ({ page }) => {
    await page.goto("/vrijwilliger/agenda");
    const kaartTitels = await page.$$eval(
      ".bg-white.rounded-2xl.shadow-sm.border.border-neutral-100.p-4 p.font-semibold.text-gray-900",
      (els) => els.map((e) => (e as HTMLElement).textContent?.trim())
    );
    // 8 geplande activiteiten in de seed (Bingo dubbel opgenomen)
    expect(kaartTitels.length).toBeGreaterThanOrEqual(6);
    expect(kaartTitels).toContain("Bingo");
  });
});
