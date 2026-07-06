import { Component, Host, h, Element, Prop, Event, EventEmitter, State } from '@stencil/core';

import { AttributesType, assignLanguage, closestElement, formatDataLabel } from '../../utils/utils';
import i18n from './i18n/i18n';

@Component({
  tag: 'attribute-tab',
  styleUrl: 'attribute-tab.css',
  shadow: false,
})
export class AttributeTab {
  @Element() el: HTMLElement;

  private valueChecker: number | null = null;
  private lastInputValue = {};

  /* ---------------------------
   * Props
   * --------------------------- */

  @Prop() attributeObject: Array<AttributesType>;
  @Prop() displayElement!: Element;

  /* ---------------------------
   * Events
   * --------------------------- */

  @Event() attributeChange!: EventEmitter<Object>;
  @Event() statusUpdate!: EventEmitter<Object>;

  /* ---------------------------
   * State
   * --------------------------- */

  @State() lang: string = 'en';
  @State() lastInputTimestamp = [];

  /* ---------------------------
   * Helpers
   * --------------------------- */

  private formatEventDetail(e) {
    const eventDetail = {
      name: e.target.name,
      value: e.target.value,
    };

    // Store timestamp and value of element for comparison in interval
    this.lastInputTimestamp[e.target.name] = Date.now();
    this.lastInputValue[e.target.name] = e.target.value;

    this.attributeChange.emit(eventDetail);
  }

  private onFocusStartInterval = (e) => {
    const element = e.target.shadowRoot.querySelector(`[name="${e.target.name}"]`);
    const value = element.value;
    const name = element.name;
    // Start value checking on input
    this.valueChecker = window.setInterval(() => {
      if (

        Date.now() - 500 >= this.lastInputTimestamp[name]
      ) {
        if (value !== this.lastInputValue[name]) {
          this.statusUpdate.emit({ name: name, type: 'attribute' });
          clearInterval(this.valueChecker);
        }
      }
    }, 1000);

  }

  private onBlurClearInterval = () => {
    if (this.valueChecker) {
      window.clearInterval(this.valueChecker);
    }
  }

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
        <table class="attributes">
          <tr>
            <th>{i18n[lang].attributes}</th>
            <th>{i18n[lang].type}</th>
            <th>{i18n[lang].defaultValue}</th>
            <th>{i18n[lang].value}</th>
          </tr>
          {this.attributeObject &&
            this.attributeObject.map(attr => {
              let control = '';

              let displayValue = this.displayElement.getAttribute(attr.name) != null ? this.displayElement.getAttribute(attr.name) : attr?.defaultValue;

              // Special case for lang attribute to inherit from closest parent with lang attribute
              if (attr.name === 'lang') {
                displayValue = closestElement('[lang]', this.displayElement).getAttribute('lang') || displayValue;
              }

              this.lastInputValue = { ...this.lastInputValue, [attr.name]: displayValue };

              if (attr.control === 'select') {
                const options = typeof attr.options === 'string' ? JSON.parse(attr.options) : attr.options;

                control = (
                  <gcds-select
                    label={attr.name}
                    selectId={attr.name}
                    name={attr.name}
                    value={displayValue}
                    hide-label
                    onInput={e => this.formatEventDetail(e)}
                    onFocus={e => this.onFocusStartInterval(e)}
                    onBlur={this.onBlurClearInterval}
                  >
                    {typeof options === 'object' &&
                      options.map(option => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                  </gcds-select>
                );
              } else if (attr.control === 'text') {
                control = (
                  <gcds-input
                    name={attr.name}
                    label={attr.name}
                    inputId={attr.name}
                    hide-label
                    type="text"
                    value={displayValue}
                    onInput={e => this.formatEventDetail(e)}
                    onFocus={e => this.onFocusStartInterval(e)}
                    onBlur={this.onBlurClearInterval}
                  ></gcds-input>
                );
              }

              return (
                <tr>
                  <td data-label={formatDataLabel(i18n[lang].attributes, lang)}>
                    <span lang="en">{attr.name}</span>
                    {attr.required && (
                      <span
                        class="required"
                        aria-hidden="true"
                      >
                        {i18n[lang].required}
                      </span>
                    )}</td>
                  <td data-label={formatDataLabel(i18n[lang].type, lang)}>{attr?.type ? <span lang="en">{attr.type}</span> : <gcds-sr-only tag="span">{i18n[lang].noType}</gcds-sr-only>}</td>
                  <td data-label={formatDataLabel(i18n[lang].defaultValue, lang)}>{attr?.defaultValue ? <span lang="en">{attr.defaultValue}</span> : <gcds-sr-only>{i18n[lang].noDefaultValue}</gcds-sr-only>}</td>
                  <td>{control}</td>
                </tr>
              );
            })}
        </table>
      </Host>
    );
  }
}
