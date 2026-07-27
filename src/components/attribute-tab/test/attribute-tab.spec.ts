import { newSpecPage } from '@stencil/core/testing';
import { GcdsExtCodeDisplay } from '../../gcds-ext-code-display/gcds-ext-code-display';
import { AttributeTab } from '../attribute-tab';
import { testHTML } from '../../../utils/utils';

describe('attribute-tab', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [GcdsExtCodeDisplay, AttributeTab],
      html: testHTML,
    });

    page.root!.attrs = [
      { name: 'button-id', control: 'text', type: 'string' },
      {
        name: 'button-role',
        control: 'select',
        type: '"danger" | "primary" | "secondary" | "start"',
        defaultValue: 'primary',
        options: ['danger', 'primary', 'secondary', 'start'],
      },
    ];

    await page.waitForChanges();

    expect(page.root?.shadowRoot?.querySelector('attribute-tab')).toEqualHtml(`
      <attribute-tab class="hidden" role="tabpanel" tabindex="0">
        <gcds-table>
          <span slot="cell-0-attributes">
            <span lang="en">
              button-id
            </span>
          </span>
          <span slot="cell-0-defaultvalue">
            <gcds-sr-only>
              No default value
            </gcds-sr-only>
          </span>
          <span slot="cell-0-value">
            <gcds-input hide-label="" inputid="button-id" label="button-id" name="button-id" type="text"></gcds-input>
          </span>
          <span slot="cell-1-attributes">
            <span lang="en">
              button-role
            </span>
          </span>
          <span slot="cell-1-defaultvalue">
            <span lang="en">
              primary
            </span>
          </span>
          <span slot="cell-1-value">
            <gcds-select hide-label="" label="button-role" name="button-role" selectid="button-role" value="danger">
              <option value="danger">
                danger
              </option>
              <option value="primary">
                primary
              </option>
              <option value="secondary">
                secondary
              </option>
              <option value="start">
                start
              </option>
            </gcds-select>
          </span>
        </gcds-table>
      </attribute-tab>
    `);
  });
});
