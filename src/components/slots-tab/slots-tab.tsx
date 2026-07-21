import { Component, Host, h, Element, Prop, Event, EventEmitter, State } from '@stencil/core';
import DOMPurify from 'dompurify';

import { assignLanguage, SlotType } from '../../utils/utils';
import i18n from './i18n/i18n';

@Component({
  tag: 'slots-tab',
  styleUrl: 'slots-tab.css',
  shadow: false,
})
export class SlotsTab {
  @Element() el: HTMLElement;

  private table: HTMLGcdsTableElement | undefined;
  private valueChecker: number | undefined;
  private lastInputValue: { [key: string]: string } = {};

  /* ---------------------------
   * Props
   * --------------------------- */

  @Prop() slotObject: Array<SlotType> | undefined;
  @Prop() displayElement!: Element;
  @Prop() slotHistory: Object | undefined;

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
    this.lastInputValue = { ...this.lastInputValue, [e.target.name]: e.target.value };

    // DOMPurify remopved both name and id attributes
    // This preserves them by adding data-save- for sanitization
    const html = e.target.value.replace(/\b(name|id)=(["'])(.*?)\2/g, (_, attr, quote, value) =>
      `data-save-${attr}=${quote}${value}${quote}`
    );

    let sanitizedValue = DOMPurify.sanitize(html, {
      CUSTOM_ELEMENT_HANDLING: {
        tagNameCheck: /^gcds-/,
        attributeNameCheck: () => true,
      },
      ADD_ATTR: ['slot'],
    });

    // convert data-save- attributes back to original names
    sanitizedValue = sanitizedValue.replace(/\bdata-save-(name|id)=(["'])(.*?)\2/g, (_, attr, quote, value) =>
      `${attr}=${quote}${value}${quote}`
    );

    const textarea = e.target as HTMLGcdsTextareaElement;
    const name = textarea.name;

    // Prevent emitting invalid slot content for slots
    if (textarea.value?.trim() !== '') {
      // Check if the slot content includes the correct slot attribute
      if (name !== 'default' && !textarea.value?.includes(`slot="${name}"`)) {
        this.slotErrors = { ...this.slotErrors, [name]: i18n[this.lang].slotMissingAttribute.replaceAll('{name}', name) };
        this.keepValues();
        return;
      }
      if (sanitizedValue !== textarea.value) {
        this.slotErrors = { ...this.slotErrors, [name]: i18n[this.lang].slotSanitized };
        this.keepValues();
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

  private keepValues() {
    this.table?.querySelectorAll('gcds-textarea').forEach((textarea: HTMLGcdsTextareaElement) => {
      textarea.value = this.lastInputValue[textarea.name];
    });
  }

  /* ---------------------------
   * Lifecycle
   * --------------------------- */

  async componentWillLoad() {
    // Define lang attribute
    this.lang = assignLanguage(this.el);
    this.lastInputValue = { ...(this.slotHistory as Record<string, string> | undefined) };
  }

  async componentDidUpdate() {
    this.keepValues();
  }

  /* ---------------------------
   * Render
   * --------------------------- */

  render() {
    const { lang } = this;

    let cellCount = 0;

    return (
      <Host role="tabpanel" tabindex="0">
        <gcds-table
          ref={(el: HTMLGcdsTableElement) => (this.table = el as HTMLGcdsTableElement)}
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
              "field": "value",
              "header": i18n[lang].value,
              "slotted": true,
            }
          ]}
          data={this.slotObject?.map(slot => ({
            name: slot.name,
            description: slot.description,
          }))}
        >
          {this.slotObject?.map(slot => {
            const control = (
              <span slot={`cell-${cellCount}-value`} class="slot-textarea">
                <gcds-textarea
                  label={slot.name}
                  textareaId={slot.name}
                  name={slot.name}
                  hideLabel
                  value={this.lastInputValue[slot.name]}
                  error-message={this.slotErrors[slot.name]}
                  validate-on="other"
                  onChange={(e: any) => this.emitSlotEvent(e)}
                  onFocus={(e: any) => this.onFocusStartInterval(e)}
                  onBlur={this.onBlurClearInterval}
                  lang={this.lang}
                ></gcds-textarea>
              </span>
            );
            cellCount++;
            return control;
          })}
        </gcds-table>
      </Host >
    );
  }
}
