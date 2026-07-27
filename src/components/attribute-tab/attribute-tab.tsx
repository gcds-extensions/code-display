import { Component, Host, h, Element, Prop, Event, EventEmitter, State, Fragment } from '@stencil/core';

import { AttributesType, assignLanguage, closestElement } from '../../utils/utils';
import i18n from './i18n/i18n';

@Component({
  tag: 'attribute-tab',
  styleUrl: 'attribute-tab.css',
  shadow: false,
})
export class AttributeTab {
  @Element() el: HTMLElement;

  private valueChecker: number | undefined;
  private lastInputValue: { [key: string]: any } = {};

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
  @State() lastInputTimestamp: { [key: string]: number } = {};

  /* ---------------------------
   * Helpers
   * --------------------------- */

  private formatEventDetail(e) {
    const eventDetail = {
      name: e.target.name,
      value: e.target.value != 'gcdsSystemRemove' ? e.target.value : 'gcdsSystemRemove',
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

  private renderControl(attr: AttributesType, cellCount: number) {
    let control = '';

    let displayValue = this.displayElement.getAttribute(attr.name) != null ? this.displayElement.getAttribute(attr.name) : attr?.defaultValue;

    // Special case for lang attribute to inherit from closest parent with lang attribute
    if (attr.name === 'lang') {
      displayValue = closestElement('[lang]', this.displayElement).getAttribute('lang') || displayValue;
    }

    if (attr.type === 'boolean') {
      displayValue = displayValue === 'true' ? 'true' : 'false';
    }

    this.lastInputValue = { ...this.lastInputValue, [attr.name]: displayValue };

    if (attr.control === 'select') {
      const options = typeof attr.options === 'string' ? JSON.parse(attr.options) : attr.options;

      // TODO: add a null option to allow no selection of optional fields
      control = (
        <span slot={`cell-${cellCount}-value`}>
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
            {!attr.required && attr.defaultValue === 'null' && (<option value="gcdsSystemRemove">null</option>)}
            {typeof options === 'object' &&
              options.map((option: string) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
          </gcds-select>
        </span>
      );
    } else if (attr.control === 'text') {
      control = (
        <span slot={`cell-${cellCount}-value`}>
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
        </span>
      );
    }
    return control;
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

    let cellCount = 0;

    return (
      <Host role="tabpanel" tabindex="0">
        <gcds-table
          columns={[
            {
              "field": "attributes",
              "header": i18n[lang].attributes,
              "rowHeader": true,
              "slotted": true,
            },
            {
              "field": "type",
              "header": i18n[lang].type,
              "slotted": true,
            },
            {
              "field": "defaultvalue",
              "header": i18n[lang].defaultValue,
              "slotted": true,
            },
            {
              "field": "value",
              "header": i18n[lang].value,
              "slotted": true,
            }
          ]}
          data={this.attributeObject &&
            this.attributeObject.map(attr => ({
              attributes: attr.name,
              type: attr.type,
              defaultValue: attr.defaultValue,
            }))}
        >
          {this.attributeObject &&
            this.attributeObject.map(attr => {
              const slotIndex = cellCount++;
              return (
                <Fragment>
                  <span slot={`cell-${slotIndex}-attributes`}>
                    <span lang="en">{attr.name}</span>
                    {attr.required && (
                      <span
                        class="required"
                        aria-hidden="true"
                      >
                        {i18n[lang].required}
                      </span>
                    )}
                  </span>
                  <span slot={`cell-${slotIndex}-defaultvalue`}>
                    {attr?.defaultValue ? <span lang="en">{attr.defaultValue}</span> : <gcds-sr-only>{i18n[lang].noDefaultValue}</gcds-sr-only>}
                  </span>
                  {this.renderControl(attr, slotIndex)}
                </Fragment>
              );
            })}
        </gcds-table>
      </Host>
    );
  }
}
