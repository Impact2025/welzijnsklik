import { test, expect } from "@playwright/test";

test.describe("Welzijnsklik - login flow", () => {
  test("login pagina wordt geladen", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText("Welzijnsklik")).toBeVisible();
    await expect(page.getByText("Demo accounts")).toBeVisible();
  });

  test("dev-login als coordinator werkt", async ({ page }) => {
    await page.goto("/login");
    await page.getByText("Coördinator").click();
    // Na dev-login wordt geredirect naar /
    await expect(page).toHaveURL("/coordinator", { timeout: 10000 });
    await expect(page.getByText("Goeiedag")).toBeVisible();
  });

  test("geen-toegang voor verkeerde rol", async ({ page }) => {
    // Log in als coordinator (die werkt)
    await page.goto("/login");
    await page.getByText("Coördinator").click();
    await expect(page).toHaveURL("/coordinator", { timeout: 10000 });

    // Probeer naar /vrijwilliger te gaan
    await page.goto("/vrijwilliger");
    await expect(page).toHaveURL("/geen-toegang");
  });

  test("familie-tijdlijn toont juiste data", async ({ page }) => {
    await page.goto("/login");
    await page.getByText("Familie").click();
    await expect(page).toHaveURL("/familie", { timeout: 10000 });
    // Maria is gekoppeld aan Annie Smits
    await expect(page.getByText("Annie Smits")).toBeVisible();
  });
});

test.describe("Account pagina", () => {
  test("toont gebruikersgegevens", async ({ page }) => {
    await page.goto("/login");
    await page.getByText("Coördinator").click();
    await expect(page).toHaveURL("/coordinator", { timeout: 10000 });

    await page.goto("/account");
    await expect(page.getByText("Petra van den Berg")).toBeVisible();
    await expect(page.getByText("Coördinator")).toBeVisible();
    await expect(page.getByText("De Meerwende")).toBeVisible();
    await expect(page.getByText("Mijn gegevens downloaden (AVG)")).toBeVisible();
  });
});
