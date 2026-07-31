import { Component, h, Prop, State, Watch, Element, Event, EventEmitter } from '@stencil/core';
import Prism from 'prismjs';
import 'prismjs/components/prism-jsx';
import prettier from 'prettier/standalone';
import prettierPluginHTML from 'prettier/plugins/html';
import prettierPluginBabel from 'prettier/plugins/babel';
import prettierPluginEstree from 'prettier/plugins/estree';
import {
  formatSrcDoc,
  assignLanguage,
  iframeListeners,
} from '../../utils/utils';
import {
  convertToReact,
  convertToAngular,
  convertToVue
} from './utils';
import i18n from './i18n/i18n';

@Component({
  tag: 'code-frame',
  styleUrls: ['prism.css', 'code-frame.css'],
  shadow: true,
})
export class CodeFrame {
  @Element() el: HTMLElement;
  private landmarkIframe?: HTMLIFrameElement;

  /* ---------------------------
   * Props
   * --------------------------- */

  /*
   * Source HTML code to be formatted and highlighted
   */
  @Prop() source: string;

  /*
   * Display landmark elements in iframe
   */
  @Prop() landmarkDisplay?: boolean = false;

  /*
   * Enable accessibility tests using axe-core in iframe
   */
  @Prop() accessibility?: boolean = false;

  /*
   * Starting framework for code preview generation
   */
  @Prop() framework?: 'html' | 'react' | 'vue' | 'angular' = 'html';

  /*
   * Path to gcds package on site
   */
  @Prop() gcdsPath?: string = '/components/dist/';

  /* ---------------------------
   * Events
   * --------------------------- */

  @Event() statusUpdate!: EventEmitter<Object>;

  /* ---------------------------
   * State
   * --------------------------- */

  @State() showCode = true;
  @State() activeFormat = '';
  @State() htmlCode = '';
  @State() reactCode = '';
  @State() vueCode = '';
  @State() angularCode = '';
  @State() copyLabel = 'Copy code';
  @State() lang = 'en';

  private codeEl?: HTMLElement;

  /* ---------------------------
   * Watchers
   * --------------------------- */

  @Watch('source')
  async onSourceChange() {
    await this.formatCodePreview();

    if (this.landmarkDisplay && this.landmarkIframe) {
      this.landmarkIframe.srcdoc = formatSrcDoc(this.source, this.accessibility, this.gcdsPath as string, this.lang);
    }
  }

  @Watch('framework')
  async onFrameworkChange() {
    this.activeFormat = this.framework ?? 'html';
    await this.updateDisplayedCode();
  }

  /* ---------------------------
   * Lifecycle
   * --------------------------- */

  async componentWillLoad() {
    // Define lang attribute
    this.lang = assignLanguage(this.el);

    this.copyLabel = i18n[this.lang].copyLabel;

    this.activeFormat = this.framework ?? 'html';

    if (window) {
      window.addEventListener('message', (e) => {
        if (e.source !== this.landmarkIframe?.contentWindow) return;
        if (e.data?.type === 'navigate') {
          window.location.href = e.data.url;
        }
      });
    }
  }

  componentDidLoad() {
    this.formatCodePreview();

    if (this.landmarkDisplay && this.landmarkIframe) {
      this.landmarkIframe.srcdoc = formatSrcDoc(this.source, this.accessibility, this.gcdsPath as string, this.lang);

      this.landmarkIframe.onload = () => {
        const intervalId = setInterval(() => {
          const hydratedComponent = this.landmarkIframe?.contentDocument?.body.querySelector('.hydrated');

          if (hydratedComponent) {
            clearInterval(intervalId);

            iframeListeners(this.landmarkIframe!);
          }
        }, 100);
      }
    }
  }

  /* ---------------------------
   * Helpers
   * --------------------------- */

  /*
   * Formats the source code and applies syntax highlighting
   */
  private async formatCodePreview() {
    if (!this.source) return;

    const code = await prettier.format(this.source, {
      parser: 'html',
      plugins: [prettierPluginHTML],
      printWidth: 80,
      htmlWhitespaceSensitivity: 'ignore',
      singleQuote: true
    });

    const react = await prettier.format(convertToReact(code), {
      parser: 'babel',
      plugins: [prettierPluginBabel, prettierPluginEstree],
      printWidth: 80,
      htmlWhitespaceSensitivity: 'ignore',
      jsxSingleQuote: false,
      singleQuote: true
    });

    const angular = await prettier.format(convertToAngular(code), {
      parser: 'html',
      plugins: [prettierPluginHTML],
      printWidth: 80,
      htmlWhitespaceSensitivity: 'ignore',
      singleQuote: true
    });

    const vue = await prettier.format(convertToVue(code), {
      parser: 'vue',
      plugins: [prettierPluginHTML],
      printWidth: 80,
      htmlWhitespaceSensitivity: 'ignore',
      singleQuote: true
    });

    this.htmlCode = Prism.highlight(code, Prism.languages.html, 'html');
    this.vueCode = Prism.highlight(vue, Prism.languages.html, 'html');
    this.reactCode = Prism.highlight(react, Prism.languages.jsx, 'jsx');
    this.angularCode = Prism.highlight(angular, Prism.languages.html, 'html');

    this.updateDisplayedCode();
  }

  /*
   * Updates the displayed code based on the active format
   */
  private updateDisplayedCode() {
    if (!this.codeEl) return;

    this.codeEl.innerHTML = this.getActiveCode();
  }

  /*
  * Retrieves the code corresponding to the active format
  */
  private getActiveCode() {
    switch (this.activeFormat) {
      case 'react':
        return this.reactCode;
      case 'vue':
        return this.vueCode;
      case 'angular':
        return this.angularCode;
      case 'html':
      default:
        return this.htmlCode;
    }
  }

  /* ---------------------------
   * Actions
   * --------------------------- */

  /*
   * Handles the format selection change (HTML or React)
   */
  private onFormatChange(e: Event) {
    const value = (e.target as HTMLSelectElement).value;
    this.activeFormat = value as 'html' | 'react' | 'vue' | 'angular';

    this.updateDisplayedCode();

    setTimeout(() => {
      this.statusUpdate.emit({ name: value, type: 'framework' });
    }, 2500);
  }

  /*
   * Copies the current code to clipboard
   */
  private copyCode() {
    const code = this.codeEl?.textContent;

    if (!code) return;

    navigator.clipboard.writeText(code);

    this.copyLabel = i18n[this.lang].copiedLabel;

    setTimeout(() => {
      this.copyLabel = i18n[this.lang].copyLabel;
    }, 3000);
  }

  /* ---------------------------
   * Render
   * --------------------------- */

  render() {
    const { lang } = this;

    return (
      <section class="code-frame" aria-label={i18n[lang].componentPreview}>
        {/* Code actions bar: Format selection and toggle visibility */}
        <div class="code-actions-bar">
          <gcds-select
            selectId="code-format"
            label={i18n[lang].selectEnvironment}
            hide-label name="select"
            value={this.activeFormat}
            onChange={e => this.onFormatChange(e)}
          >
            <option value="html">HTML</option>
            <option value="react">React</option>
            <option value="vue">Vue</option>
            <option value="angular">Angular</option>
          </gcds-select>
          <gcds-button button-role="secondary" onClick={() => (this.showCode = !this.showCode)}>
            {this.showCode ? i18n[lang].hideLabel : i18n[lang].showLabel}
          </gcds-button>
        </div>

        {/* Component preview area */}
        <div class="component-preview">
          {this.landmarkDisplay ?
            <iframe
              title={i18n[lang].componentExample}
              ref={element => (this.landmarkIframe = element as HTMLIFrameElement)}
              style={{ '--component-display-iframe-height': '12rem' }}
              tabIndex={0}
            />
            :
            <slot></slot>
          }
        </div>

        {/* Code preview area: Displays the formatted code */}
        <div class={`code-preview${!this.showCode ? ' hidden' : ''}`}>
          <pre class="language-html">
            <code ref={el => (this.codeEl = el as HTMLElement)}></code>

            {this.showCode && (
              <gcds-button button-role="secondary" size="small" onClick={() => this.copyCode()}>
                {this.copyLabel}
              </gcds-button>
            )}
          </pre>
        </div>
      </section>
    );
  }
}
