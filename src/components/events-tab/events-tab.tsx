import { Component, Host, h, Element, Prop, State } from '@stencil/core';

import { EventType, assignLanguage, formatDataLabel } from '../../utils/utils';
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

  @Prop() eventObject: Array<EventType>;

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
        <table class="events">
          <tr>
            <th>{i18n[lang].name}</th>
            <th>{i18n[lang].description}</th>
            <th>{i18n[lang].details}</th>
          </tr>

          {this.eventObject.map(event => {
            return (
              <tr class={event.name}>
                <td data-label={formatDataLabel(i18n[lang].name, lang)}>{event.name}</td>
                <td data-label={formatDataLabel(i18n[lang].description, lang)}>{event.description}</td>
                <td data-label={formatDataLabel(i18n[lang].details, lang)}>{event.details}</td>
              </tr>
            );
          })}
        </table>
      </Host>
    );
  }
}
