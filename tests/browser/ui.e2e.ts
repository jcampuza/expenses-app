import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/tests/browser/index.html");
});

test("modal is named, traps focus, makes background inert and restores focus", async ({
  page,
}) => {
  const trigger = page.getByRole("button", {
    name: "Open dialog",
    exact: true,
  });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Test dialog" });
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAccessibleDescription("Test description");
  await expect(page.getByLabel("Draft")).toBeFocused();
  await page.locator("#background").evaluate((el: HTMLElement) => el.focus());
  await expect(page.getByLabel("Draft")).toBeFocused();
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press("Tab");
    expect(
      await dialog.evaluate(
        (el) =>
          el.contains(document.activeElement) ||
          document.activeElement === document.body,
      ),
    ).toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

test("alert has a name and description and restores focus on cancel", async ({
  page,
}) => {
  const trigger = page.getByRole("button", { name: "Open alert" });
  await trigger.click();
  const alert = page.getByRole("alertdialog", { name: "Confirm action" });
  await expect(alert).toBeVisible();
  await expect(alert).toHaveAccessibleDescription("This needs confirmation.");
  await expect(
    page.getByRole("button", { name: "Cancel action" }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Cancel action" }).click();
  await expect(alert).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

test("live expense snapshots preserve the open editor and unsaved draft", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.getByRole("button", { name: /Coffee/ }).click();
  const dialog = page.getByRole("dialog", { name: "Edit Expense" });
  await expect(dialog).toBeVisible();
  await page
    .getByRole("textbox", { name: "Name", exact: true })
    .fill("Unsaved draft");
  await page.evaluate(() => window.dispatchEvent(new Event("fixture:refresh")));
  await expect(dialog).toBeVisible();
  await expect(
    page.getByRole("textbox", { name: "Name", exact: true }),
  ).toHaveValue("Unsaved draft");
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(
    page.getByRole("button", { name: /Updated coffee/ }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
