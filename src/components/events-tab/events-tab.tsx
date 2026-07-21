import { Component, Host, h, Element, Prop, State } from '@stencil/core';

import { EventType, assignLanguage } from '../../utils/utils';
import i18n from './i18n/i18n';

@Component({
  tag: 'events-tab',
  styleUrl: 'events-tab.css',
  shadow: false,
})
export class EventsTab {
  @Element() el: HTMLElement;

  /* ---------------------------
   * Props
   * --------------------------- */

  @Prop() eventObject: Array<EventType> | undefined;

  /* ---------------------------
   * State
   * --------------------------- */

  @State() lang: string = 'en';

  /* ---------------------------
   * Lifecycle
   * --------------------------- */

  async componentWillLoad() {
    // Define lang attribute
    this.lang = assignLanguage(this.el);
  }

  /* ---------------------------
   * Render
   * --------------------------- */

  render() {
    const { lang } = this;

    return (
      <Host role="tabpanel" tabindex="0">
        <gcds-table
          columns={[
            {
              "field": "name",
              "header": i18n[lang].name,
              "rowHeader": true
            },
            {
              "field": "description",
              "header": i18n[lang].description
            },
            {
              "field": "details",
              "header": i18n[lang].details,
            }
          ]}
          data={this.eventObject?.map(event => ({
            name: event.name,
            description: event.description,
            details: event.details,
          }))}
        >
        </gcds-table>
      </Host>
    );
  }
}
