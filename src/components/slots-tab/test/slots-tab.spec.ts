import { newSpecPage } from '@stencil/core/testing';
import { GcdsExtCodeDisplay } from '../../gcds-ext-code-display/gcds-ext-code-display';
import { SlotsTab } from '../slots-tab';
import { testHTML } from '../../../utils/utils';

describe('slots-tab', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [GcdsExtCodeDisplay, SlotsTab],
      html: testHTML,
    });

    page.root!.slots = [{ name: 'default', description: 'Default slot' }];

    await page.waitForChanges();

    expect(page.root?.shadowRoot?.querySelector('slots-tab')).toEqualHtml(`
      <slots-tab class="hidden" role="tabpanel" tabindex="0">
        <gcds-table>
          <span class="slot-textarea" slot="cell-0-value">
            <gcds-textarea hidelabel="" label="default" lang="en" name="default" textareaid="default" validate-on="other" value="Danger"></gcds-textarea>
          </span>
        </gcds-table>
      </slots-tab>
    `);
  });
});
