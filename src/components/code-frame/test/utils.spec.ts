/// <reference types="jest" />

import { convertToAngular, convertToReact, convertToVue } from '../utils';

describe('code frame utilities', () => {
	describe('convertToReact', () => {
		it('converts web components to PascalCase and generates unique imports', () => {
			const html = '<gcds-card><gcds-button button-role="primary">Continue</gcds-button></gcds-card>';

			expect(convertToReact(html)).toBe(
				"import { GcdsCard, GcdsButton } from '@gcds-core/components-react';\n\n<GcdsCard>\n  <GcdsButton buttonRole=\"primary\">\n    Continue\n  </GcdsButton>\n</GcdsCard>",
			);
		});

		it('keeps native HTML tags lowercase and ignores whitespace-only text nodes', () => {
			expect(convertToReact(' <div>\n  <span>Text</span>\n  </div> ')).toBe('<div>\n  <span>\n    Text\n  </span>\n</div>');
		});

		it('formats JSX attributes as booleans, expressions, and strings', () => {
			const html = `<gcds-input required disabled="false" data-testid="input" aria-label="Name" suggestions='[{"label":"A"}]' input-id="field" title="  Name  "></gcds-input>`;

			expect(convertToReact(html, '@example/components-react')).toBe(
				"import { GcdsInput } from '@example/components-react';\n\n<GcdsInput required={true} disabled={false} data-testid=\"input\" aria-label=\"Name\" suggestions={[{\"label\":\"A\"}]} inputId=\"field\" title=\"  Name  \"></GcdsInput>",
			);
		});

		it('renames class to className and omits imports when no web components exist', () => {
			expect(convertToReact('<div class="content"></div>')).toBe('<div className="content"></div>');
		});

		it('throws when the input does not contain an element', () => {
			expect(() => convertToReact('   ')).toThrow('Could not parse an element from the given HTML');
		});
	});

	describe('convertToAngular', () => {
		it('keeps tag names unchanged and recursively formats Angular attributes', () => {
			const html = `<gcds-input input-id="field" required disabled="true" data-testid="input" suggestions='[{"label":"Suggestion A"}]'><span>Enter a value</span></gcds-input>`;

			expect(convertToAngular(html)).toBe(
				'<gcds-input input-id="field" [required]="true" [disabled]="true" data-testid="input" [suggestions]="[{ label: \'Suggestion A\' }]">\n  <span>\n    Enter a value\n  </span>\n</gcds-input>',
			);
		});

		it('uses static kebab-case attributes for plain strings and quotes invalid object keys', () => {
			const html = `<gcds-panel config='{"display-mode":"compact","valid_key":true}' label="Panel"></gcds-panel>`;

			expect(convertToAngular(html)).toBe('<gcds-panel [config]="{ \'display-mode\': \'compact\', valid_key: true }" label="Panel"></gcds-panel>');
		});

		it('falls back to a static attribute when JSON-looking input is invalid', () => {
			expect(convertToAngular('<gcds-input options="{invalid}" input-id="field"></gcds-input>')).toBe('<gcds-input options="{invalid}" input-id="field"></gcds-input>');
		});

		it('throws when the input does not contain an element', () => {
			expect(() => convertToAngular('')).toThrow('Could not parse an element from the given HTML');
		});
	});

	describe('convertToVue', () => {
		it('keeps tag names unchanged and recursively formats bound attributes', () => {
			const html = `<gcds-select input-id="field" required enabled="false" data-testid="select" options='["A","B"]'><option value="a">A</option></gcds-select>`;

			expect(convertToVue(html)).toBe(
				'<gcds-select input-id="field" :required="true" :enabled="false" data-testid="select" :options="[\'A\', \'B\']">\n  <option value="a">\n    A\n  </option>\n</gcds-select>',
			);
		});

		it('preserves plain strings as static attributes', () => {
			expect(convertToVue('<div aria-label="Example" class="content" data-state="ready"></div>')).toBe('<div aria-label="Example" class="content" data-state="ready"></div>');
		});

		it('falls back to a static attribute when JSON-looking input is invalid', () => {
			expect(convertToVue('<gcds-input options="[invalid]"></gcds-input>')).toBe('<gcds-input options="[invalid]"></gcds-input>');
		});

		it('throws when the input does not contain an element', () => {
			expect(() => convertToVue('   ')).toThrow('Could not parse an element from the given HTML');
		});
	});
});
