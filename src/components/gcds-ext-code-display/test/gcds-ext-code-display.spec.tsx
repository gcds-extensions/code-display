import { newSpecPage } from '@stencil/core/testing';
import { GcdsExtCodeDisplay } from '../gcds-ext-code-display';
import { SlotsTab } from '../../slots-tab/slots-tab';
import { testHTML } from '../../../utils/utils';

describe('gcds-ext-code-display', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [GcdsExtCodeDisplay],
      html: testHTML,
    });

    expect(page.root).toEqualHtml(`
      <gcds-ext-code-display lang="en">
        <mock:shadow-root>
          <code-frame framework="html" lang="en" source="<gcds-button button-role=&quot;danger&quot;>Danger</gcds-button>">
            <slot></slot>
          </code-frame>
          <gcds-sr-only tag="span">
            <span aria-atomic="true" aria-relevant="removals" id="change-status" role="status"></span>
          </gcds-sr-only>
        </mock:shadow-root>
        <gcds-button button-role="danger">
          Danger
        </gcds-button>
      </gcds-ext-code-display>  
    `);
  });

  it('renders: attr tab', async () => {
    const page = await newSpecPage({
      components: [GcdsExtCodeDisplay],
      html: testHTML,
    });

    expect(page.root).toEqualHtml(`
      <gcds-ext-code-display lang="en">
        <mock:shadow-root>
          <code-frame framework="html" lang="en" source="<gcds-button button-role=&quot;danger&quot;>Danger</gcds-button>">
            <slot></slot>
          </code-frame>
          <gcds-sr-only tag="span">
            <span aria-atomic="true" aria-relevant="removals" id="change-status" role="status"></span>
          </gcds-sr-only>
        </mock:shadow-root>
        <gcds-button button-role="danger">
          Danger
        </gcds-button>
      </gcds-ext-code-display>  
    `);

    page.root!.attrs = [{ "name": "button-id", "control": "text", "type": "string" }];

    await page.waitForChanges();

    expect(page.root?.shadowRoot?.querySelector('#tabs')).toEqualHtml(`
      <div id="tabs">
        <div role="tablist">
          <gcds-button button-role="secondary" id="attrs" role="presentation">
            Attributes
          </gcds-button>
        </div>
        <attribute-tab class="hidden"></attribute-tab>
      </div> 
    `);

    page.root!.slots = [{ "name": "default", "description": "Default slot" }];

    await page.waitForChanges();

    expect(page.root?.shadowRoot?.querySelector('#tabs')).toEqualHtml(`
      <div id="tabs">
        <div role="tablist">
          <gcds-button button-role="secondary" id="attrs" role="presentation">
            Attributes
          </gcds-button>
          <gcds-button button-role="secondary" id="slots" role="presentation">
            Slots
          </gcds-button>
        </div>
        <attribute-tab class="hidden"></attribute-tab>
        <slots-tab class="hidden"></slots-tab>
      </div> 
    `);

    page.root!.events = [{ "name": "gcdsClick", "description": "Fires when clicked", "detail": "string" }];

    await page.waitForChanges();

    expect(page.root?.shadowRoot?.querySelector('#tabs')).toEqualHtml(`
      <div id="tabs">
        <div role="tablist">
          <gcds-button button-role="secondary" id="attrs" role="presentation">
            Attributes
          </gcds-button>
          <gcds-button button-role="secondary" id="slots" role="presentation">
            Slots
          </gcds-button>
          <gcds-button button-role="secondary" id="events" role="presentation">
            Events
          </gcds-button>
        </div>
        <attribute-tab class="hidden"></attribute-tab>
        <slots-tab class="hidden"></slots-tab>
        <events-tab class="hidden"></events-tab>
      </div> 
    `);

    page.root!.accessibility = true;

    await page.waitForChanges();

    expect(page.root?.shadowRoot?.querySelector('#tabs')).toEqualHtml(`
      <div id="tabs">
        <div role="tablist">
          <gcds-button button-role="secondary" id="attrs" role="presentation">
            Attributes
          </gcds-button>
          <gcds-button button-role="secondary" id="slots" role="presentation">
            Slots
          </gcds-button>
          <gcds-button button-role="secondary" id="events" role="presentation">
            Events
          </gcds-button>
          <gcds-button button-role="secondary" id="a11y" role="presentation">
            Accessibility
          </gcds-button>
        </div>
        <attribute-tab class="hidden"></attribute-tab>
        <slots-tab class="hidden"></slots-tab>
        <events-tab class="hidden"></events-tab>
        <accessibility-tab class="hidden tabs--accessibility" lang="en"></accessibility-tab>
      </div> 
    `);
  });
});
