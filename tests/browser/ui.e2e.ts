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
  // Safari does not focus buttons on pointer activation. Start with keyboard
  // focus so this checks restoration consistently across browser engines.
  await trigger.focus();
  await trigger.press("Enter");
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
  await trigger.focus();
  await trigger.press("Enter");
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

for (const user of ["me", "other"] as const) {
  for (const payer of ["You", "Them"] as const) {
    for (const splitEqually of [true, false]) {
      test(`${user} creates an expense paid by ${payer}, split=${splitEqually}`, async ({
        page,
      }) => {
        await page.goto(`/tests/browser/index.html?user=${user}`);
        await page
          .getByRole("button", { name: "Add Expense", exact: true })
          .click();
        const dialog = page.getByRole("dialog", { name: "Add Expense" });
        await dialog.getByLabel("Total Cost").fill("100");
        await dialog.getByLabel("Name", { exact: true }).fill("Dinner");
        await dialog.getByLabel("Who Paid?").selectOption({ label: payer });
        await dialog
          .getByLabel("Split Type")
          .selectOption(String(splitEqually));
        await dialog
          .getByRole("button", { name: "Add expense", exact: true })
          .click();
        await expect(dialog).not.toBeVisible();
        const result = JSON.parse(
          await page.locator("#last-mutation").innerText(),
        );
        expect(result).toMatchObject({
          name: "expenses:addExpense",
          args: {
            paidBy: payer === "You" ? user : user === "me" ? "other" : "me",
            splitEqually,
            totalCost: 100,
          },
        });
      });
    }
  }
}

test("editing can change the payer to the other person for the full amount", async ({
  page,
}) => {
  await page.getByRole("button", { name: /Coffee/ }).click();
  const dialog = page.getByRole("dialog", { name: "Edit Expense" });
  await dialog.getByLabel("Who Paid?").selectOption({ label: "Them" });
  await dialog.getByLabel("Split Type").selectOption("false");
  await dialog.getByRole("button", { name: "Save", exact: true }).click();
  await expect(dialog).not.toBeVisible();
  expect(
    JSON.parse(await page.locator("#last-mutation").innerText()),
  ).toMatchObject({
    name: "expenses:updateExpense",
    args: { paidBy: "other", splitEqually: false },
  });
});

for (const invalidPayer of ["undefined", "null", "unrelated-user"]) {
  test(`does not submit the invalid payer value ${invalidPayer}`, async ({
    page,
  }) => {
    await page.getByRole("button", { name: /Coffee/ }).click();
    const dialog = page.getByRole("dialog", { name: "Edit Expense" });
    const payer = dialog.getByLabel("Who Paid?");
    await payer.evaluate((element: HTMLSelectElement, value) => {
      element.add(new Option("Unavailable participant", value));
    }, invalidPayer);
    await payer.selectOption(invalidPayer);
    const alert = page.waitForEvent("dialog").then(async (dialog) => {
      expect(dialog.message()).toContain("selected payer is unavailable");
      await dialog.accept();
    });
    await dialog.getByRole("button", { name: "Save", exact: true }).click();
    await alert;
    await expect(dialog).toBeVisible();
    await expect(page.locator("#last-mutation")).toHaveText("null");

    // A failed validation leaves the draft editable and recoverable.
    await payer.selectOption({ label: "Them" });
    await dialog.getByRole("button", { name: "Save", exact: true }).click();
    await expect(dialog).not.toBeVisible();
    expect(
      JSON.parse(await page.locator("#last-mutation").innerText()),
    ).toMatchObject({
      args: { paidBy: "other" },
    });
  });
}

test("a live refresh preserves the other payer and full amount selection", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Add Expense", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Add Expense" });
  await dialog.getByLabel("Total Cost").fill("100");
  await dialog.getByLabel("Name", { exact: true }).fill("Dinner");
  await dialog.getByLabel("Who Paid?").selectOption({ label: "Them" });
  await dialog.getByLabel("Split Type").selectOption("false");
  await page.evaluate(() => window.dispatchEvent(new Event("fixture:refresh")));
  await expect(dialog.getByLabel("Who Paid?")).toHaveValue("them");
  await expect(dialog.getByLabel("Split Type")).toHaveValue("false");
  await dialog
    .getByRole("button", { name: "Add expense", exact: true })
    .click();
  await expect(dialog).not.toBeVisible();
  expect(
    JSON.parse(await page.locator("#last-mutation").innerText()),
  ).toMatchObject({
    args: { paidBy: "other", splitEqually: false, totalCost: 100 },
  });
});

test("router handles links, decoded params, history and programmatic navigation", async ({
  page,
}) => {
  await page.getByRole("link", { name: "Open route", exact: true }).click();
  await expect(page).toHaveURL(/\/tests\/browser\/detail\/person%20two$/);
  await expect(
    page.getByText("Route ID: person two", { exact: true }),
  ).toBeVisible();
  await page.goBack();
  await expect(
    page.getByRole("button", { name: "Navigate to route" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Navigate to route" }).click();
  await expect(
    page.getByText("Route ID: three", { exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Back to fixture" }).click();
  await expect(
    page.getByRole("button", { name: "Open dialog", exact: true }),
  ).toBeVisible();
});

for (const edit of [false, true]) {
  test(`${edit ? "edit" : "add"} blocks the missing payer ID from the legacy production response`, async ({
    page,
  }) => {
    await page.goto("/tests/browser/index.html?legacyUser=1");
    await page
      .getByRole("button", {
        name: edit ? /Coffee/ : "Add Expense",
        exact: !edit,
      })
      .click();
    const dialog = page.getByRole("dialog", {
      name: edit ? "Edit Expense" : "Add Expense",
    });
    await dialog.getByLabel("Total Cost").fill("100");
    await dialog.getByLabel("Name", { exact: true }).fill("Dinner");
    await dialog.getByLabel("Who Paid?").selectOption({ label: "Them" });
    await dialog.getByLabel("Split Type").selectOption("false");
    const alert = page.waitForEvent("dialog").then(async (message) => {
      expect(message.message()).toContain("selected payer is unavailable");
      await message.accept();
    });
    await dialog
      .getByRole("button", { name: edit ? "Save" : "Add expense", exact: true })
      .click();
    await alert;
    await expect(dialog).toBeVisible();
    await expect(page.locator("#last-mutation")).toHaveText("null");
  });

  test(`${edit ? "edit" : "add"} keeps the other payer when currencies load late`, async ({
    page,
  }) => {
    await page.goto("/tests/browser/index.html?pendingCurrencies=1");
    await page
      .getByRole("button", {
        name: edit ? /Coffee/ : "Add Expense",
        exact: !edit,
      })
      .click();
    const dialog = page.getByRole("dialog", {
      name: edit ? "Edit Expense" : "Add Expense",
    });
    await expect(dialog).toBeVisible();
    await page.evaluate(() =>
      window.dispatchEvent(new Event("fixture:resolve-currencies")),
    );
    await dialog.getByLabel("Total Cost").fill("100");
    await dialog.getByLabel("Name", { exact: true }).fill("Dinner");
    await dialog.getByLabel("Who Paid?").selectOption({ label: "Them" });
    await dialog.getByLabel("Split Type").selectOption("false");
    await page.evaluate(() =>
      window.dispatchEvent(new Event("fixture:refresh")),
    );
    await dialog
      .getByRole("button", { name: edit ? "Save" : "Add expense", exact: true })
      .click();
    await expect(dialog).not.toBeVisible();
    expect(
      JSON.parse(await page.locator("#last-mutation").innerText()),
    ).toMatchObject({
      args: { paidBy: "other", splitEqually: false, totalCost: 100 },
    });
  });
}
