import { newSpecPage } from '@stencil/core/testing';
import { GcdsExtCodeDisplay } from '../gcds-ext-code-display';
import { SlotsTab } from '../../slots-tab/slots-tab';
import { testHTML } from '../../../utils/utils';

describe('gcds-ext-code-display', () => {
  /**
   * The component's whole reason for existing is that a preview update reaches a screen reader
   * (gcds-docs#739), and nothing exercised that path.
   *
   * Asserts both halves: that the message reaches the region, and that the region is not
   * configured to exclude it. `aria-relevant="removals"` shipped, which does exactly that.
   */
  it('announces a preview update, and does not exclude the announcement', async () => {
    const page = await newSpecPage({
      components: [GcdsExtCodeDisplay],
      html: testHTML,
    });
    const status = () => page.root.shadowRoot.querySelector('#change-status');

    // The regression guard. `role="status"` makes the region polite, and the default
    // `aria-relevant` is `additions text`. Setting the attribute *replaces* that default, so
    // `aria-relevant="removals"` excludes the message arriving and leaves only the clear five
    // seconds later, by which point the region is empty. Absent is correct; anything set has to
    // still include additions and text.
    const relevant = status().getAttribute('aria-relevant');
    if (relevant !== null) {
      expect(relevant).toContain('additions');
      expect(relevant).toContain('text');
    }

    page.rootInstance.statusUpdateListener({
      target: page.root,
      detail: { type: 'attribute', name: 'button-role' },
    });

    // updateStatus() waits 1500ms before writing. Real timers: enabling jest's fake ones times
    // out newSpecPage and waitForChanges. The write is a direct textContent assignment rather
    // than a render, so there is no change to await.
    await new Promise(resolve => setTimeout(resolve, 1700));

    expect(status().textContent).toBe('The attribute "button-role" has been updated in the component preview.');

    // Then it clears itself, so a later reader is not handed a stale message. Awaited rather than
    // left pending: the clear is scheduled inside updateStatus, and returning before it fires
    // leaks a timer into the next test and makes jest report a worker that would not exit.
    await new Promise(resolve => setTimeout(resolve, 5000));

    expect(status().textContent).toBe('');
  }, 15000);

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
            <span aria-atomic="true" id="change-status" role="status"></span>
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
            <span aria-atomic="true" id="change-status" role="status"></span>
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
