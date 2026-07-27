import { Component, Host, h, Prop, Watch, Element, State, Listen } from '@stencil/core';

import { assignLanguage, removeUnwantedAttributes, AttributesType, SlotType, EventType } from '../../utils/utils';
import i18n from './i18n/i18n';

@Component({
  tag: 'gcds-ext-code-display',
  styleUrls: ['gcds-ext-code-display.css'],
  shadow: true,
})
export class GcdsExtCodeDisplay {
  @Element() el: HTMLElement;

  private displayElement?: Element;
  private slotHistory: Record<string, string> = {};
  private attributeObject: any[] | undefined;
  private slotObject: any[] | undefined;
  private eventObject: EventType[] | undefined;

  private template: HTMLTemplateElement | undefined;

  /* ---------------------------
   * Props + validation
   * --------------------------- */

  /*
   * Array to format attributes table
   */
  @Prop() attrs?: string | Array<AttributesType>;
  @Watch('attrs')
  validateAttrs() {
    let tempAttrs: any[] | undefined = [];
    if (typeof this.attrs == 'object') {
      tempAttrs = this.attrs.sort((a, b) => {
        if (!!a.required !== !!b.required) {
          return a.required ? -1 : 1;
        }

        return a.name.localeCompare(b.name);
      });
      this.attributeObject = tempAttrs;
    } else if (typeof this.attrs == 'string') {
      this.attributeObject = JSON.parse(this.attrs).sort((a, b) => {
        if (!!a.required !== !!b.required) {
          return a.required ? -1 : 1;
        }

        return a.name.localeCompare(b.name);
      });
      this.attributeObject = tempAttrs;
    }
  }

  /*
   * Array to format slots table
   */
  @Prop() slots?: string | Array<SlotType>;
  @Watch('slots')
  validateSlots() {
    if (typeof this.slots == 'object') {
      this.slotObject = this.slots;
    } else if (typeof this.slots == 'string') {
      this.slotObject = JSON.parse(this.slots);
    }

    this.slotObject?.forEach(slot => {
      if (slot.name === 'default') {
        this.slotHistory[slot.name] = this.displayElement?.innerHTML ?? '';
      } else {
        const el = this.displayElement?.querySelector(`[slot="${slot.name}"]`) as HTMLElement;

        this.slotHistory[slot.name] = el ? removeUnwantedAttributes(el.outerHTML) : '';
      }
    });
  }

  /*
   * Array to events attributes table
   */
  @Prop() events?: string | Array<EventType>;
  @Watch('events')
  validateEvents() {
    if (typeof this.events == 'object') {
      this.eventObject = this.events;
    } else if (typeof this.events == 'string') {
      this.eventObject = JSON.parse(this.events);
    }
  }

  /*
   * Enable accessibility tests using axe-core
   */
  @Prop() accessibility?: boolean = false;
  @Watch('accessibility')
  validateAccessibility() {
    this.display = this.display;
  }

  /*
   * Display landmark elements in iframe
   */
  @Prop() landmarkDisplay?: boolean = false;

  /*
   * Starting framework for code preview generation
   */
  @Prop() framework?: 'html' | 'react' | 'vue' | 'angular' = 'html';

  /* ---------------------------
   * State
   * --------------------------- */

  @State() display: 'attrs' | 'slots' | 'events' | 'a11y' | null = null;
  @State() lang = 'en';
  @State() codeSource = '';

  /* ---------------------------
   * Listeners
   * --------------------------- */

  @Listen('attributeChange', { target: 'document' })
  attributeChangeListener(e) {
    if (e.target === this.el) {
      this.template?.children[0].setAttribute(e.detail.name, e.detail.value);
      this.updateLiveElement();
      this.updateCodePreview();
      this.updateStatus('attribute', e.detail.name);
    }
  }

  @Listen('statusUpdate', { target: 'document' })
  statusUpdateListener(e) {
    if (e.target === this.el) {
      this.updateStatus(e.detail.type, e.detail.name);
    }
  }

  @Listen('slotValueChange', { target: 'document' })
  slotValueChangeListener(e) {
    if (e.target === this.el) {
      this.slotHistory[e.detail.name] = e.detail.value;
      this.renderSlotContent();
      this.updateCodePreview();
      this.updateStatus('slot', e.detail.name);
    }
  }

  @Listen('keydown', { target: 'document' })
  async keyDownListener(e) {
    const activeElement = this.el.shadowRoot?.activeElement;

    if (this.el.contains(document.activeElement) && activeElement?.getAttribute('role') === 'presentation' && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
      e.preventDefault();
      const buttons = Array.from(this.el.shadowRoot?.querySelectorAll('div[role="tablist"] gcds-button') ?? []);
      const currentIndex = buttons.findIndex(button => activeElement === button);
      let newIndex;

      if (e.key === 'ArrowRight') {
        newIndex = (currentIndex + 1) % buttons.length;
      } else if (e.key === 'ArrowLeft') {
        newIndex = (currentIndex - 1 + buttons.length) % buttons.length;
      }

      buttons[newIndex]?.shadowRoot?.querySelector('button')?.focus();
    }
  }

  /* ---------------------------
   * Lifecycle
   * --------------------------- */

  async componentWillLoad() {
    // Define lang attribute
    this.lang = assignLanguage(this.el);
    this.displayElement = this.el.children[0];
    this.template = document.createElement('template');
    this.template.appendChild(this.displayElement.cloneNode(true));

    this.validateAttrs();
    this.validateSlots();
    this.validateEvents();

    this.updateCodePreview();

    // Set current tab display
    if (this.attributeObject || this.slotObject || this.eventObject || this.accessibility) {
      if (this.attrs) {
        this.setDisplay('attrs');
      } else if (this.slots) {
        this.setDisplay('slots');
      } else if (this.events) {
        this.setDisplay('events');
      } else if (this.accessibility) {
        this.setDisplay('a11y');
      }
    }
  }

  async componentDidLoad() {
    this.setDisplay(this.display);

    if (this.attributeObject || this.slotObject || this.eventObject || this.accessibility) {
      this.el.shadowRoot?.querySelectorAll('div[role="tablist"] gcds-button').forEach(button => {
        button.shadowRoot?.querySelector('button')?.setAttribute('role', 'tab');

        if (button.id === this.display) {
          button.shadowRoot?.querySelector('button')?.setAttribute('aria-selected', 'true');
        } else {
          button.shadowRoot?.querySelector('button')?.setAttribute('aria-selected', 'false');
        }
      });
    }
  }

  /* ---------------------------
   * Helpers
   * --------------------------- */

  // Add slot content to the component display
  private renderSlotContent() {
    const templateChild = this.template?.children[0];

    if (templateChild) {
      templateChild.replaceChildren();

      Object.values(this.slotHistory).forEach(content => {
        templateChild.insertAdjacentHTML('beforeend', content);
      });
    }

    this.updateLiveElement();
  }

  // Update the code preview
  private updateCodePreview() {
    this.codeSource = removeUnwantedAttributes(this.el.innerHTML);
  }

  // Updates the live element by inserting new one from template
  private updateLiveElement() {
    this.el.replaceChildren();

    const templateChild = this.template?.children[0];

    if (templateChild) {
      this.el.appendChild(templateChild.cloneNode(true));
    }
  }

  private setDisplay(tab: typeof this.display) {
    this.display = tab;

    const shadowRoot = this.el.shadowRoot;

    if (!shadowRoot) {
      return;
    }

    shadowRoot.querySelectorAll('div[role="tablist"] gcds-button').forEach(button => {
      const buttonElement = button.shadowRoot?.querySelector('button');

      if (button.id === tab) {
        buttonElement?.setAttribute('aria-selected', 'true');
      } else {
        buttonElement?.setAttribute('aria-selected', 'false');
      }
    });
  }

  private updateStatus(type: 'attribute' | 'slot' | 'framework', name: string) {
    setTimeout(() => {
      const statusEl = this.el?.shadowRoot?.getElementById('change-status');
      if (statusEl) {
        if (type === 'attribute') {
          statusEl.textContent = i18n[this.lang].attributeUpdateStatus.replaceAll('{name}', name);
        } else if (type === 'framework') {
          statusEl.textContent = i18n[this.lang].frameworkUpdateStatus.replaceAll('{name}', name);
        } else {
          statusEl.textContent = i18n[this.lang].slotUpdateStatus.replaceAll('{name}', name);
        }
      }
      setTimeout(() => {
        if (statusEl) {
          statusEl.textContent = '';
        }
      }, 5000);
    }, 1500);
  }

  /* ---------------------------
   * Render
   * --------------------------- */

  render() {
    const { lang } = this;

    return (
      <Host>
        {/* Component + code preview */}
        <code-frame source={this.codeSource} landmarkDisplay={this.landmarkDisplay} accessibility={this.accessibility} framework={this.framework} lang={this.lang}>
          <slot></slot>
        </code-frame>

        {/* Tabs */}
        {this.attributeObject || this.slotObject || this.eventObject || this.accessibility ? (
          <div id="tabs">
            <div role="tablist">
              {this.attributeObject && (
                <gcds-button
                  id="attrs"
                  button-role="secondary"
                  role="presentation"
                  onClick={() => this.setDisplay('attrs')}
                  class={this.display == 'attrs' && 'selected'}
                >
                  {i18n[lang].tabsAttributes}
                </gcds-button>
              )}
              {this.slotObject && (
                <gcds-button id="slots" button-role="secondary" role="presentation" class={this.display == 'slots' && 'selected'} onClick={() => this.setDisplay('slots')}>
                  {i18n[lang].tabsSlots}
                </gcds-button>
              )}
              {this.eventObject && (
                <gcds-button id="events" button-role="secondary" role="presentation" class={this.display == 'events' && 'selected'} onClick={() => this.setDisplay('events')}>
                  {i18n[lang].tabsEvents}
                </gcds-button>
              )}
              {this.accessibility && (
                <gcds-button id="a11y" button-role="secondary" role="presentation" class={this.display == 'a11y' && 'selected'} onClick={() => this.setDisplay('a11y')}>
                  {i18n[lang].tabsA11y}
                </gcds-button>
              )}
            </div>

            {this.attributeObject && (
              <attribute-tab
                displayElement={this.displayElement as Element}
                attributeObject={this.attributeObject}
                class={this.display != 'attrs' ? 'hidden' : undefined}
              ></attribute-tab>
            )}

            {this.slotObject && (
              <slots-tab
                displayElement={this.displayElement as Element}
                slotObject={this.slotObject}
                slotHistory={this.slotHistory}
                class={this.display != 'slots' ? 'hidden' : undefined}
              ></slots-tab>
            )}

            {this.eventObject && <events-tab eventObject={this.eventObject} class={this.display != 'events' ? 'hidden' : undefined}></events-tab>}

            {this.accessibility && (
              <accessibility-tab
                class={`tabs--accessibility${this.display != 'a11y' ? ' hidden' : ''}`}
                landmarkDisplay={this.landmarkDisplay}
                lang={this.lang}
              ></accessibility-tab>
            )}
          </div>
        ) : null}
        {/* Change status */}
        <gcds-sr-only tag="span">
          <span id="change-status" role="status" aria-atomic="true" aria-relevant="removals"></span>
        </gcds-sr-only>
      </Host>
    );
  }
}
