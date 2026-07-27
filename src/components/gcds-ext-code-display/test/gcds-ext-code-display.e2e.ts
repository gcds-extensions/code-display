import { expect, type Locator } from '@playwright/test';
import { test as base } from '@stencil/playwright';
import { mixinFixtures as mixinCoverage } from '@bgotink/playwright-coverage';
import { devices } from '@playwright/test';
import CodeFrameI18n from '../../code-frame/i18n/i18n.js';

/* ---------------------------
 * Setup
 * --------------------------- */

const componentName = 'gcds-ext-code-display';

const gcdsTestBase = base.extend({
  page: async ({ page }, use, testInfo) => {
    await page.goto(`/components/gcds-ext-code-display/test/gcds-ext-code-display.e2e.html`, {
      waitUntil: 'domcontentloaded',
    });

    await page.waitForFunction(component => {
      const host = document.querySelector(component);
      return host && host.shadowRoot;
    }, componentName);

    await use(page);
  },
});

export const test = mixinCoverage(gcdsTestBase);

export const testMobile = mixinCoverage(
  gcdsTestBase.extend({
    contextOptions: {
      ...devices['LG Optimus L70'],
    },
  }),
);

export const testTablet = mixinCoverage(
  gcdsTestBase.extend({
    contextOptions: {
      ...devices['Galaxy Tab S9'],
    },
  }),
);

test.describe('gcds-ext-code-display', () => {
  /* ---------------------------
   * gcds-ext-code-display
   * --------------------------- */

  test('renders', async ({ page }) => {
    const element = page.locator(componentName);

    // Wait for element to attach and become visible, allowing up to 10s
    await element.waitFor({ state: 'attached' });
    await element.waitFor({ state: 'visible' });
    await element.waitFor({ timeout: 10000 });

    await expect(element).toHaveClass('mt-300 mb-700 hydrated');
  });

  test('gcds-ext-code-display markup', async ({ page }) => {
    const element = page.locator(componentName);

    // Wait for element to attach and become visible, allowing up to 10s
    await element.waitFor({ state: 'attached' });
    await element.waitFor({ state: 'visible' });
    await element.waitFor({ timeout: 10000 });

    await expect(await element.evaluate(el => el.outerHTML)).toBe(`<gcds-ext-code-display id="input-display" class="mt-300 mb-700 hydrated" accessibility="">
      <gcds-input input-id="form-name" label="Name" name="name" hint="Please enter your full name." class="hydrated"></gcds-input>
    </gcds-ext-code-display>`);
  });

  test('gcds-ext-code-display tab change', async ({ page }) => {
    const element = page.locator(componentName);

    // Wait for element to attach and become visible, allowing up to 10s
    await element.waitFor({ state: 'attached' });
    await element.waitFor({ state: 'visible' });
    await element.waitFor({ timeout: 10000 });

    const tabButtons = await element.locator('#tabs gcds-button[role=presentation]');

    expect(await tabButtons.count()).toBe(3);
    expect(await tabButtons.first().textContent()).toBe('Attributes');
    expect(await tabButtons.first()).toHaveClass('selected hydrated');
    expect(await tabButtons.nth(1).textContent()).toBe('Events');
    expect(await tabButtons.nth(2).textContent()).toBe('Accessibility');

    // click Events tab
    await tabButtons.nth(1).locator('button').click();

    await page.waitForChanges();

    expect(await tabButtons.nth(1)).toHaveClass('hydrated selected');
    expect(await element.locator('events-tab')).toBeVisible();

    // click accessibility tab
    await tabButtons.nth(2).locator('button').click();

    await page.waitForChanges();

    expect(await tabButtons.nth(2)).toHaveClass('hydrated selected');
    expect(await element.locator('accessibility-tab')).toBeVisible();
  });

  test('gcds-ext-code-display attribute change', async ({ page }) => {
    const element = page.locator(componentName);

    // Wait for element to attach and become visible, allowing up to 10s
    await element.waitFor({ state: 'attached' });
    await element.waitFor({ state: 'visible' });
    await element.waitFor({ timeout: 10000 });

    await expect(await element.evaluate(el => el.outerHTML)).toBe(`<gcds-ext-code-display id="input-display" class="mt-300 mb-700 hydrated" accessibility="">
      <gcds-input input-id="form-name" label="Name" name="name" hint="Please enter your full name." class="hydrated"></gcds-input>
    </gcds-ext-code-display>`);

    await expect(await element.locator('input[name=input-id]').evaluate(el => el.value)).toBe('form-name');
    await element.locator('input[name=input-id]').fill('tested');

    await page.waitForChanges();

    await expect(await element.evaluate(el => el.outerHTML)).toBe(
      `<gcds-ext-code-display id="input-display" class="mt-300 mb-700 hydrated" accessibility=""><gcds-input input-id="tested" label="Name" name="name" hint="Please enter your full name." class="hydrated"></gcds-input></gcds-ext-code-display>`,
    );

    await expect(await element.locator('select[name=required]').evaluate(el => el.value)).toBe('false');
    await element.locator('select[name=required]').selectOption('true');

    await page.waitForChanges();

    await expect(await element.evaluate(el => el.outerHTML)).toBe(
      `<gcds-ext-code-display id="input-display" class="mt-300 mb-700 hydrated" accessibility=""><gcds-input input-id="tested" label="Name" name="name" hint="Please enter your full name." required="true" class="hydrated"></gcds-input></gcds-ext-code-display>`,
    );
  });

  test('gcds-ext-code-display accessibility test', async ({ page }) => {
    const element = page.locator(componentName);

    // Wait for element to attach and become visible, allowing up to 10s
    await element.waitFor({ state: 'attached' });
    await element.waitFor({ state: 'visible' });
    await element.waitFor({ timeout: 10000 });

    const tabButtons = await element.locator('#tabs gcds-button[role=presentation]');

    // click accessibility tab
    await tabButtons.nth(2).locator('button').click();

    await page.waitForChanges();

    expect(await tabButtons.nth(2)).toHaveClass('hydrated selected');
    expect(await element.locator('accessibility-tab')).toBeVisible();

    await expect(await element.locator('#tabs gcds-button').last().textContent()).toBe('Run accessibility test');
    await element.locator('#tabs gcds-button button').last().click();

    await page.waitForChanges();
    await page.waitForTimeout(4000);

    await expect(await element.locator('p[aria-live=polite]').textContent()).toBe('No issues found. Please reference table below to see passed tests.');
    await expect(await element.locator('accessibility-tab gcds-table').evaluate(el => el.data.length)).toBe(11);
  });

  /* ---------------------------
   * Code frame
   * --------------------------- */

  test('code-frame renders', async ({ page }) => {
    const element = page.locator('code-frame');

    // Wait for element to attach and become visible, allowing up to 10s
    await element.waitFor({ state: 'attached' });
    await element.waitFor({ state: 'visible' });
    await element.waitFor({ timeout: 10000 });

    await expect(element).toHaveClass('hydrated');
  });

  test('code-frame markup', async ({ page }) => {
    const element = page.locator('code-frame');

    // Wait for element to attach and become visible, allowing up to 10s
    await element.waitFor({ state: 'attached' });
    await element.waitFor({ state: 'visible' });
    await element.waitFor({ timeout: 10000 });

    // LightDOM
    await expect(await element.evaluate(el => el.outerHTML)).toBe(`<code-frame lang="en" class="hydrated"><slot></slot></code-frame>`);
    // actions bar
    await expect(await element.locator('.code-actions-bar').evaluate(el => el.outerHTML)).toBe(
      `<div class="code-actions-bar"><gcds-select hide-label="" select-id="code-format" label="Select environment" name="select" class="hydrated"><option value="html" selected="true">HTML</option><option value="react">React</option><option value="vue">Vue</option><option value="angular">Angular</option></gcds-select><gcds-button button-role="secondary" class="hydrated">Hide code</gcds-button></div>`,
    );
  });

  test('code-frame hide code action', async ({ page }) => {
    const element = page.locator('code-frame .code-preview');

    // Wait for element to attach and become visible, allowing up to 10s
    await element.waitFor({ state: 'attached' });
    await element.waitFor({ state: 'visible' });
    await element.waitFor({ timeout: 10000 });

    await expect(element).toHaveClass('code-preview');

    const showHideButton = page.locator('.code-actions-bar gcds-button');

    await expect(await showHideButton.innerText()).toBe(CodeFrameI18n.en.hideLabel);
    await showHideButton.locator('button').click();

    await page.waitForChanges();

    await expect(element).toHaveClass('code-preview hidden');
    await expect(await showHideButton.innerText()).toBe(CodeFrameI18n.en.showLabel);
  });

  test('code-frame change framework', async ({ page }) => {
    const element = page.locator('code-frame .code-preview');

    // Wait for element to attach and become visible, allowing up to 10s
    await element.waitFor({ state: 'attached' });
    await element.waitFor({ state: 'visible' });
    await element.waitFor({ timeout: 10000 });

    const htmlFormat = await element.evaluate(el => el.innerHTML);
    const frameworkSelect = page.locator('.code-actions-bar gcds-select');

    await frameworkSelect.locator('select').selectOption({ label: 'React' });

    await page.waitForChanges();

    await expect(await frameworkSelect.evaluate(el => el.value)).toBe('react');
    await expect(await element.evaluate(el => el.innerHTML)).not.toBe(htmlFormat);
  });
});
