/* ---------------------------
 * React
 * --------------------------- */

function toPascalCase(str: string) {
  return str
    .split('-')
    .filter(Boolean)
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    .join('');
}

function toCamelCase(str: string) {
  return str.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
}

function formatAttr(name: string, rawValue: string, isBooleanPresence: boolean) {
  // React/JSX keeps aria-* and data-* attributes in kebab-case, unlike other props
  const isPreservedName = /^(aria|data)-/.test(name);
  // class -> className is the one HTML attribute name JSX renames outright
  const jsxName = name === 'class' ? 'className' : isPreservedName ? name : toCamelCase(name);

  if (isBooleanPresence) {
    return `${jsxName}={true}`;
  }

  const trimmed = rawValue.trim();

  // attr="true" / attr="false" -> attr={true} / attr={false}
  if (trimmed === 'true' || trimmed === 'false') {
    return `${jsxName}={${trimmed}}`;
  }

  // Try to detect JSON (arrays / objects) and turn it into a real expression
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed);
      return `${jsxName}={${JSON.stringify(parsed)}}`;
    } catch {
      // fall through to string handling if it wasn't valid JSON
    }
  }

  return `${jsxName}="${rawValue}"`;
}

/**
 * Scans a raw HTML string for any custom-element tags (i.e. tag names
 * containing a hyphen, per the web components spec) and returns the
 * unique tag names found, in order of first appearance. Works on nested
 * elements too, since it scans the raw markup rather than a single node.
 *
 * @param {string} html
 * @returns {string[]} lowercase tag names, e.g. ['gcds-input', 'gcds-button']
 */
function detectWebComponents(html: string) {
  const tagPattern = /<(gcds-[a-z0-9-]*)/gi;
  const found = [];
  const seen = new Set();
  let match;

  while ((match = tagPattern.exec(html)) !== null) {
    const tag = match[1].toLowerCase();
    if (!seen.has(tag)) {
      seen.add(tag);
      found.push(tag);
    }
  }

  return found;
}

/**
 * Builds a named import statement for every web component found in the
 * given HTML snippet.
 *
 * @param {string} html
 * @param {string} [packageName] - the package to import from
 * @returns {string} e.g. "import { GcdsInput, GcdsButton } from '@gcds-core/components-react';"
 *   or '' if no web components were found
 */
function generateImportStatement(html: string, packageName = '@gcds-core/components-react') {
  const tags = detectWebComponents(html);
  if (tags.length === 0) return '';

  const componentNames = tags.map(toPascalCase);
  return `import { ${componentNames.join(', ')} } from '${packageName}';`;
}

/**
 * Recursively converts a single DOM element (and all of its descendants)
 * into a JSX string. Web-component tags (containing a hyphen) get
 * PascalCased; ordinary HTML tags (div, span, p, ...) are left lowercase,
 * since that's what JSX expects for built-in elements. Attributes on
 * every element in the tree are run through the same formatAttr rules.
 *
 * @param {Element} el
 * @param {string} indent - current indentation, used for nested output
 * @returns {string}
 */
function elementToJsx(el: any, indent = ''): string {
  const tagName = el.tagName.toLowerCase();
  const isWebComponent = tagName.includes('-');
  const jsxTagName = isWebComponent ? toPascalCase(tagName) : tagName;

  const attrStrings = Array.from(el.attributes).map((attr: any) => {
    // An attribute with an empty value in HTML (e.g. `required`) means "present, no value"
    const isBooleanPresence = attr.value === '';
    return formatAttr(attr.name, attr.value, isBooleanPresence);
  });

  const openTag = [jsxTagName, ...attrStrings].join(' ');

  const childNodes = Array.from(el.childNodes).filter(
    (node: any) =>
      node.nodeType === 1 || // element
      (node.nodeType === 3 && node.textContent.trim().length > 0), // non-empty text
  );

  if (childNodes.length === 0) {
    return `${indent}<${openTag}></${jsxTagName}>`;
  }

  const childIndent = `${indent}  `;
  const childJsx = childNodes.map((node: any) => (node.nodeType === 3 ? `${childIndent}${node.textContent.trim()}` : elementToJsx(node, childIndent))).join('\n');

  return `${indent}<${openTag}>\n${childJsx}\n${indent}</${jsxTagName}>`;
}

/**
 * @param {string} html - a web component element, optionally with nested
 *   children (web components or plain HTML), e.g.
 *   '<gcds-input suggestions=\'[...]\' input-id="x" required></gcds-input>'
 * @returns {string} equivalent JSX, fully recursive over the element tree
 */
function webComponentToJsx(html: string) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html.trim(), 'text/html');
  const el = doc.body.firstElementChild;

  if (!el) throw new Error('Could not parse an element from the given HTML');

  return elementToJsx(el);
}

/**
 * Converts a web component HTML snippet into JSX and prepends the
 * matching import statement(s) for the code preview block.
 *
 * @param {string} html
 * @param {string} [packageName]
 * @returns {string} full code block: import(s) + blank line + JSX
 */
export function convertToReact(html: string, packageName = '@gcds-core/components-react') {
  const jsx = webComponentToJsx(html);
  const importStatement = generateImportStatement(html, packageName);

  return importStatement ? `${importStatement}\n\n${jsx}` : jsx;
}

/* ---------------------------
 * Angular
 * --------------------------- */

/**
 * Converts a parsed JSON value (from JSON.parse) into a TypeScript/JS
 * object-literal-style string suitable for an Angular template expression,
 * e.g. { label: 'Suggestion A' } instead of {"label":"Suggestion A"}.
 *
 * @param {*} value
 * @returns {string}
 */
function toJsExpression(value: any): string {
  if (Array.isArray(value)) {
    return `[${value.map(toJsExpression).join(', ')}]`;
  }

  if (value !== null && typeof value === 'object') {
    const entries: string[] = Object.entries(value).map(([key, val]) => {
      const safeKey = /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key) ? key : `'${key}'`;
      return `${safeKey}: ${toJsExpression(val)}`;
    });
    return `{ ${entries.join(', ')} }`;
  }

  if (typeof value === 'string') {
    return `'${value.replace(/'/g, "\\'")}'`;
  }

  return String(value); // numbers, booleans, null
}

/**
 * Formats a single attribute for an Angular template.
 *
 * @param {string} name - original (kebab-case) attribute name
 * @param {string} rawValue - the raw attribute value from the HTML
 * @param {boolean} isBooleanPresence - true if the attr had no value, e.g. `required`
 * @returns {string}
 */
function formatAttrAngular(name: string, rawValue: string, isBooleanPresence: boolean) {
  // aria-* / data-* are native HTML attributes; leave them alone, unbound
  const isPreservedName = /^(aria|data)-/.test(name);
  const propName = isPreservedName ? name : toCamelCase(name);

  if (isBooleanPresence) {
    return `[${propName}]="true"`;
  }

  const trimmed = rawValue.trim();

  // attr="true" / attr="false" -> [prop]="true" / [prop]="false"
  if (trimmed === 'true' || trimmed === 'false') {
    return `[${propName}]="${trimmed}"`;
  }

  // JSON-looking values (arrays/objects) become a bound JS-literal expression
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed);
      return `[${propName}]="${toJsExpression(parsed)}"`;
    } catch {
      // not valid JSON, fall through to plain string handling
    }
  }

  // Plain strings stay as static attributes, using the original kebab-case
  // name and no property binding brackets.
  return `${name}="${rawValue}"`;
}

/**
 * Recursively converts a single DOM element (and all descendants) into an
 * Angular template string. Tag names are left as-is for both web components
 * and plain HTML elements, since Angular does not rename them.
 *
 * @param {Element} el
 * @param {string} indent
 * @returns {string}
 */
function elementToAngularTemplate(el: Element, indent = ''): string {
  const tagName = el.tagName.toLowerCase();

  const attrStrings = Array.from(el.attributes).map((attr: any) => {
    const isBooleanPresence = attr.value === '';
    return formatAttrAngular(attr.name, attr.value, isBooleanPresence);
  });

  const openTag = [tagName, ...attrStrings].join(' ');

  const childNodes = Array.from(el.childNodes).filter(
    (node: any) =>
      node.nodeType === 1 || // element
      (node.nodeType === 3 && node.textContent.trim().length > 0), // non-empty text
  );

  if (childNodes.length === 0) {
    return `${indent}<${openTag}></${tagName}>`;
  }

  const childIndent = `${indent}  `;
  const childTemplate = childNodes.map((node: any) => (node.nodeType === 3 ? `${childIndent}${node.textContent.trim()}` : elementToAngularTemplate(node, childIndent))).join('\n');

  return `${indent}<${openTag}>\n${childTemplate}\n${indent}</${tagName}>`;
}

/**
 * @param {string} html - a web component element, optionally with nested
 *   children, e.g.
 *   '<gcds-input suggestions=\'[...]\' input-id="x" required></gcds-input>'
 * @returns {string} equivalent Angular template markup
 */
export function convertToAngular(html: string) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html.trim(), 'text/html');
  const el = doc.body.firstElementChild;

  if (!el) throw new Error('Could not parse an element from the given HTML');

  return elementToAngularTemplate(el);
}

/* ---------------------------
 * Vue
 * --------------------------- */

/**
 * Formats a single attribute for a Vue template.
 *
 * @param {string} name - original (kebab-case) attribute name
 * @param {string} rawValue - the raw attribute value from the HTML
 * @param {boolean} isBooleanPresence - true if the attr had no value, e.g. `required`
 * @returns {string}
 */
function formatAttrVue(name: string, rawValue: string, isBooleanPresence: boolean) {
  // aria-* / data-* are native HTML attributes; leave them alone, unbound
  const isPreservedName = /^(aria|data)-/.test(name);
  const propName = isPreservedName ? name : toCamelCase(name);

  if (isBooleanPresence) {
    return `:${propName}="true"`;
  }

  const trimmed = rawValue.trim();

  // attr="true" / attr="false" -> :prop="true" / :prop="false"
  if (trimmed === 'true' || trimmed === 'false') {
    return `:${propName}="${trimmed}"`;
  }

  // JSON-looking values (arrays/objects) become a bound JS-literal expression
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed);
      return `:${propName}="${toJsExpression(parsed)}"`;
    } catch {
      // not valid JSON, fall through to plain string handling
    }
  }

  // Plain strings stay as static attributes, using the original kebab-case
  // name and no `:` binding needed.
  return `${name}="${rawValue}"`;
}

/**
 * Recursively converts a single DOM element (and all descendants) into a
 * Vue template string. Tag names are left as-is for both web components
 * and plain HTML elements, since Vue does not rename them.
 *
 * @param {Element} el
 * @param {string} indent
 * @returns {string}
 */
function elementToVueTemplate(el: Element, indent = ''): string {
  const tagName = el.tagName.toLowerCase();

  const attrStrings = Array.from(el.attributes).map(attr => {
    const isBooleanPresence = attr.value === '';
    return formatAttrVue(attr.name, attr.value, isBooleanPresence);
  });

  const openTag = [tagName, ...attrStrings].join(' ');

  const childNodes = Array.from(el.childNodes).filter((node): node is Element | Text => {
    if (node.nodeType === 1) return true;
    if (node.nodeType === 3) {
      const text = node.textContent?.trim();
      return Boolean(text && text.length > 0);
    }
    return false;
  });

  if (childNodes.length === 0) {
    return `${indent}<${openTag}></${tagName}>`;
  }

  const childIndent = `${indent}  `;
  const childTemplate = childNodes
    .map(node => {
      if (node.nodeType === 3) {
        return `${childIndent}${node.textContent?.trim() ?? ''}`;
      }

      return elementToVueTemplate(node as Element, childIndent);
    })
    .join('\n');

  return `${indent}<${openTag}>\n${childTemplate}\n${indent}</${tagName}>`;
}

/**
 * @param {string} html - a web component element, optionally with nested
 *   children, e.g.
 *   '<gcds-input suggestions=\'[...]\' input-id="x" required></gcds-input>'
 * @returns {string} equivalent Vue template markup
 */
export function convertToVue(html: string) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html.trim(), 'text/html');
  const el = doc.body.firstElementChild;

  if (!el) throw new Error('Could not parse an element from the given HTML');

  return elementToVueTemplate(el);
}
