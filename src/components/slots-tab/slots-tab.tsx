import { Component, Host, h, Element, Prop, Event, EventEmitter, State } from '@stencil/core';
import DOMPurify from 'dompurify';

import { assignLanguage, SlotType, formatDataLabel } from '../../utils/utils';
import i18n from './i18n/i18n';

@Component({
  tag: 'slots-tab',
  styleUrl: 'slots-tab.css',
  shadow: false,
})
export class SlotsTab {
  @Element() el: HTMLElement;

  private valueChecker: number | null = null;
  private lastInputValue = {};

  /* ---------------------------
   * Props
   * --------------------------- */

  @Prop() slotObject: Array<SlotType>;
  @Prop() displayElement!: Element;
  @Prop() slotHistory: Object;

  /* ---------------------------
   * Events
   * --------------------------- */

  @Event() slotValueChange!: EventEmitter<Object>;
  @Event() statusUpdate!: EventEmitter<Object>;

  /* ---------------------------
   * State
   * --------------------------- */

  @State() lang: string = 'en';
  @State() slotErrors: { [k: string]: string } = {};
  @State() lastInputTimestamp = [];

  /* ---------------------------
   * Actions
   * --------------------------- */

  /*
   * Sanitize and emit slot change event
   */
  private emitSlotEvent(e) {
    const sanitizedValue = DOMPurify.sanitize(e.target.value, {
      CUSTOM_ELEMENT_HANDLING: {
        tagNameCheck: /^gcds-/,
        attributeNameCheck: /.*/,
        allowCustomizedBuiltInElements: false,
      },
      ADD_ATTR: ['slot'],
    });

    const textarea = e.target as HTMLGcdsTextareaElement;
    const name = textarea.name;

    // Prevent emitting invalid slot content for slots
    if (textarea.value.trim() !== '') {
      // Check if the slot content includes the correct slot attribute
      if (name !== 'default' && !textarea.value.includes(`slot="${name}"`)) {
        this.slotErrors = { ...this.slotErrors, [name]: i18n[this.lang].slotMissingAttribute.replaceAll('{name}', name) };
        return;
      }
      if (sanitizedValue !== textarea.value) {
        this.slotErrors = { ...this.slotErrors, [name]: i18n[this.lang].slotSanitized };

        return;
      }
    }

    // clear error for that slot
    this.slotErrors = { ...this.slotErrors, [name]: '' };

    const eventDetail = {
      name,
      value: sanitizedValue,
    };

    this.slotValueChange.emit(eventDetail);
  }

  private onFocusStartInterval = (e) => {
    const element = e.target.shadowRoot.querySelector(`[name="${e.target.name}"]`);
    const value = element.value;
    const name = element.name;
    // Start value checking on input
    this.valueChecker = window.setInterval(() => {
      if (Date.now() - 500 >= this.lastInputTimestamp[name]) {
        if (value !== this.lastInputValue[name] && this.slotErrors[name] === '') {
          this.statusUpdate.emit({ name: name, type: 'slot' });
          clearInterval(this.valueChecker);
        }
      }
    }, 1000);
  };

  private onBlurClearInterval = () => {
    if (this.valueChecker) {
      window.clearInterval(this.valueChecker);
    }
  };

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
        <table class="slots">
          <tr>
            <th>{i18n[lang].name}</th>
            <th>{i18n[lang].description}</th>
            <th>{i18n[lang].control}</th>
          </tr>

          {this.slotObject.map(slot => {
            this.lastInputValue = { ...this.lastInputValue, [slot.name]: this.slotHistory[slot.name] };
            const control = (
              <gcds-textarea
                label={slot.name}
                textareaId={slot.name}
                name={slot.name}
                hideLabel
                value={this.slotHistory[slot.name]}
                error-message={this.slotErrors[slot.name]}
                validate-on="other"
                onChange={e => this.emitSlotEvent(e)}
                onFocus={e => this.onFocusStartInterval(e)}
                onBlur={this.onBlurClearInterval}
                lang={this.lang}
              ></gcds-textarea>
            );
            return (
              <tr>
                <td data-label={formatDataLabel(i18n[lang].name, lang)}>{slot.name}</td>
                <td data-label={formatDataLabel(i18n[lang].description, lang)}>{slot.description}</td>
                <td>{control}</td>
              </tr>
            );
          })}
        </table>
      </Host>
    );
  }
}
