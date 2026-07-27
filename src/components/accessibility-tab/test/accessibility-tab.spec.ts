import { newSpecPage } from '@stencil/core/testing';
import { GcdsExtCodeDisplay } from '../../gcds-ext-code-display/gcds-ext-code-display';
import { AccessibilityTab } from '../accessibility-tab';
import { testHTML } from '../../../utils/utils';
import i18n from '../i18n/i18n';

describe('accessibility-tab', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [GcdsExtCodeDisplay, AccessibilityTab],
      html: testHTML,
    });

    page.root!.accessibility = true;

    await page.waitForChanges();

    expect(page.root?.shadowRoot?.querySelector('accessibility-tab')).toEqualHtml(`
      <accessibility-tab class="hidden tabs--accessibility" lang="en" role="tabpanel" tabindex="0">
        <gcds-button button-role="secondary">
          <span>
            ${i18n.en.runTest}
          </span>
        </gcds-button>
        <p aria-live="polite"></p>
        <div id="test-container"></div>
      </accessibility-tab>
    `);
  });
  it('renders - French', async () => {
    const page = await newSpecPage({
      components: [GcdsExtCodeDisplay, AccessibilityTab],
      html: testHTML.replace('"en"', '"fr"'),
    });

    page.root!.accessibility = true;

    await page.waitForChanges();

    expect(page.root?.shadowRoot?.querySelector('accessibility-tab')).toEqualHtml(`
      <accessibility-tab class="hidden tabs--accessibility" lang="fr" role="tabpanel" tabindex="0">
        <gcds-button button-role="secondary">
          <span>
            ${i18n.fr.runTest}
          </span>
        </gcds-button>
        <p aria-live="polite"></p>
        <div id="test-container"></div>
      </accessibility-tab>
    `);
  });
});
