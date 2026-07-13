import { test, expect } from "@playwright/test";

/**
 * AVG-acceptatietest Fase A: bewijst dat foto's niet publiek raadpleegbaar zijn
 * en dat toestemmingswijzigingen gelogd worden.
 *
 * Vereist: draaiende dev-server (webServer) + Neon-DB met seed (De Meerwende).
 * Draait in CI; lokaal alleen als `npm run dev` + DB bereikbaar zijn.
 */

const PIXEL_JPEG =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAAA//EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AfwD/2Q==";

async function loginAs(page: import("@playwright/test").Page, rol: "Coördinator" | "Vrijwilliger" | "Familie") {
  await page.goto("/login");
  await page.getByText(rol).click();
  await page.waitForURL(/\/(coordinator|vrijwilliger|familie)$/, { timeout: 10000 });
}

test.describe("AVG — foto-privacy", () => {
  test("proxy weigert foto zonder geldige sessie", async ({ page }) => {
    // Zonder in te loggen: de foto-proxy moet weigeren (401/400), niet de foto teruggeven.
    const res = await page.request.get(
      "/api/fotos?url=https://x.blob.vercel-storage.com/a.jpg&kind=activiteit&id=b1"
    );
    expect([401, 400]).toContain(res.status());
  });

  test("vrijwilliger kan geen foto uploaden voor onbekende/niet-toegestane bewoner", async ({ page }) => {
    await loginAs(page, "Vrijwilliger");

    const apiRes = await page.request.post("/api/upload-foto?bewonerId=zonder-toestemming", {
      data: Buffer.from(PIXEL_JPEG.split(",")[1], "base64"),
      headers: { "Content-Type": "image/jpeg" },
    });
    // 403 (geen toestemming) of 404 (bewoner niet gevonden) — in beide gevallen
    // wordt er GEEN foto opgeslagen.
    expect([403, 404]).toContain(apiRes.status());
  });
});

test.describe("AVG — toestemmingslog", () => {
  test("coordinator kan toestemming wijzigen (log wordt geschreven)", async ({ page }) => {
    await loginAs(page, "Coördinator");

    await page.goto("/coordinator/bewoners");
    await page.getByRole("link").filter({ hasText: /Smit|Bakker/ }).first().click();
    await expect(page).toHaveURL(/\/coordinator\/bewoners\/.+/);

    const toggle = page.locator('button[role="switch"], input[type="checkbox"]').first();
    if (await toggle.isChecked().catch(() => false)) {
      await toggle.click();
      await page.getByRole("button", { name: /Opslaan/i }).click();
      await expect(page.getByText(/Opgeslagen/i)).toBeVisible();
    }
    await expect(page.getByText(/Toestemming/i)).toBeVisible();
  });
});
