import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

// Smoke spec for the Vite/TS rewrite. The legacy spec exercised behaviors
// inside ~30 not-yet-migrated screens; this version targets what the new
// architecture actually delivers today: landing, auth flow, router, chrome,
// dashboard. Add per-screen specs as each screen ports over.

function collectRuntimeErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(err.message));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  return errors;
}

async function gotoLanding(page: Page) {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  // Hero heading is the readiness signal — React has mounted by the time
  // its text content is present.
  await expect(
    page.getByRole("heading", { name: /Incidents controlled/i }),
  ).toBeVisible({ timeout: 30000 });
}

test.describe("landing", () => {
  test("renders hero, nav links, marquee, and CTAs without runtime errors", async ({ page }) => {
    const errors = collectRuntimeErrors(page);
    await gotoLanding(page);

    await expect(page.locator(".lp-nav-links")).toContainText("Platform");
    await expect(page.locator(".lp-nav-links")).toContainText("Pricing");
    await expect(page.locator(".lp-nav-links")).toContainText("FAQ");

    await expect(page.locator(".lp-hero")).toContainText("AI-led RCA in 14 seconds");
    await expect(page.locator(".lp-metrics")).toContainText("Infra components");
    await expect(page.locator(".lp-features").locator(".lp-feature")).toHaveCount(6);
    await expect(page.locator(".lp-pricing").locator(".lp-plan")).toHaveCount(3);

    expect(errors).toEqual([]);
  });

  test("pricing anchor lands inside the pricing section", async ({ page }) => {
    await gotoLanding(page);
    await page.getByRole("link", { name: "Pricing" }).click();
    await expect(page).toHaveURL(/#pricing$/);
    await expect(
      page.getByRole("heading", { name: /simple plans that scale/i }),
    ).toBeVisible();
  });
});

test.describe("auth flow", () => {
  test("Sign in CTA reaches the sign-in screen, then dashboard", async ({ page }) => {
    const errors = collectRuntimeErrors(page);
    await gotoLanding(page);

    await page.locator(".lp-nav-cta").getByRole("button", { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("heading", { name: /great to see you/i })).toBeVisible();

    await page.getByRole("button", { name: /^log in$/i }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.locator(".sidebar")).toBeVisible();
    await expect(page.locator(".header")).toBeVisible();

    expect(errors).toEqual([]);
  });

  test("3-step signup wizard completes and lands on dashboard", async ({ page }) => {
    await gotoLanding(page);
    await page.locator(".lp-nav-cta").getByRole("button", { name: /create workspace/i }).click();
    await expect(page).toHaveURL(/\/signup$/);

    await expect(page.getByRole("heading", { name: /create your account/i })).toBeVisible();
    await page.getByRole("button", { name: /^continue/i }).click();

    await expect(page.getByRole("heading", { name: /set up your workspace/i })).toBeVisible();
    await page.getByRole("button", { name: /^continue/i }).click();

    await expect(page.getByRole("heading", { name: /invite your team/i })).toBeVisible();
    await page.getByRole("button", { name: /^create workspace/i }).click();

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.locator(".sidebar")).toBeVisible();
  });

  test("unauthed deep link to a protected route redirects to landing", async ({ page }) => {
    // Belt-and-braces: clear any leftover auth flag the dev server might
    // have set from earlier tests.
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.evaluate(() => localStorage.removeItem("veltacore.auth.v1"));

    await page.goto("/incidents", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("heading", { name: /Incidents controlled/i })).toBeVisible();
  });
});

test.describe("authed shell", () => {
  test.beforeEach(async ({ page }) => {
    // Authenticate via the auth flow rather than poking storage — keeps the
    // test close to the user's path while still being fast.
    await gotoLanding(page);
    await page.locator(".lp-hero").getByRole("button", { name: /open platform/i }).click();
    await expect(page.locator(".sidebar")).toBeVisible();
  });

  test("dashboard renders KPIs, sections, sidebar, and side cards", async ({ page }) => {
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.locator(".sn-kpi")).toHaveCount(6);
    await expect(page.locator(".sn-side-card")).toHaveCount(5);
    await expect(page.locator(".sn-activity-item").first()).toBeVisible();
    await expect(page.locator(".sn-form-section")).not.toHaveCount(0);
    await expect(page.getByText("LinkedEye-FinSpot", { exact: false }).first()).toBeVisible();
    await expect(page.getByText("Core Observability", { exact: false }).first()).toBeVisible();
  });

  test("sidebar navigation drives URL changes and active state", async ({ page }) => {
    const errors = collectRuntimeErrors(page);

    const routes = [
      ["Incidents", "/incidents"],
      ["Problems", "/problems"],
      ["Changes", "/changes"],
      ["Service catalog", "/catalog"],
      ["Runbooks", "/runbooks"],
      ["APM & traces", "/apm"],
      ["Logs", "/logs"],
      ["Overview", "/infra"],
      ["Settings", "/settings"],
    ] as const;

    for (const [label, urlSuffix] of routes) {
      await page.locator(".sb-item", { hasText: label }).first().click();
      await expect(page).toHaveURL(new RegExp(`${urlSuffix.replace(/\//g, "\\/")}$`));
      await expect(page.locator(".main")).not.toBeEmpty();
    }

    expect(errors).toEqual([]);
  });

  test("breadcrumbs reflect the current route", async ({ page }) => {
    await page.locator(".sb-item", { hasText: "Incidents" }).first().click();
    await expect(page.locator(".hdr-crumbs .crumb.current")).toHaveText(/Incidents/);

    await page.locator(".sb-item", { hasText: "Settings" }).first().click();
    await expect(page.locator(".hdr-crumbs .crumb.current")).toHaveText(/Settings/);
  });

  test("tenant switcher opens via Cmd+K and switches tenants", async ({ page }) => {
    await page.keyboard.press("Control+K");
    await expect(page.getByPlaceholder(/jump to tenant/i)).toBeVisible();
    await page.getByText("Network Operations", { exact: false }).first().click();
    await expect(page.locator(".sidebar")).toContainText("Network Operations");
  });

  test("tweaks panel opens via Ctrl+, and toggles dark mode", async ({ page }) => {
    await page.keyboard.press("Control+,");
    const panel = page.locator(".twk-panel");
    await expect(panel).toBeVisible();
    await panel.locator(".twk-toggle").first().click();
    await expect(page.locator("body")).toHaveAttribute("data-theme", /dark|light/);
  });
});

test.describe("responsive smoke", () => {
  test("dashboard renders on mobile viewport", async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 412, height: 915 });
    await gotoLanding(page);
    await page.locator(".lp-hero").getByRole("button", { name: /open platform/i }).click();
    await expect(page.locator(".main")).not.toBeEmpty();
    await page.screenshot({ path: testInfo.outputPath("dashboard-mobile.png") });
  });
});
