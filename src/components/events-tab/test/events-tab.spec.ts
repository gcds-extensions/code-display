import { newSpecPage } from '@stencil/core/testing';
import { GcdsExtCodeDisplay } from '../../gcds-ext-code-display/gcds-ext-code-display';
import { EventsTab } from '../events-tab';
import { testHTML } from '../../../utils/utils';

describe('events-tab', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [GcdsExtCodeDisplay, EventsTab],
      html: testHTML,
    });

    page.root!.events = [{ name: 'gcdsClick', description: 'Happens on click', detail: 'string' }];

    await page.waitForChanges();

    expect(page.root?.shadowRoot?.querySelector('events-tab')).toEqualHtml(`
      <events-tab class="hidden" role="tabpanel" tabindex="0">
        <gcds-table>
        </gcds-table>
      </events-tab>
    `);
  });
});
