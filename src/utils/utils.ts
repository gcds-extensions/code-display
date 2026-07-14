export const assignLanguage = (el: HTMLElement) => {
  let lang = '';
  if (!el.getAttribute('lang')) {
    const closestLangAttribute = closestElement('[lang]', el)?.getAttribute('lang');
    if (closestLangAttribute == 'en' || !closestLangAttribute) {
      lang = 'en';
    } else {
      lang = 'fr';
    }
  } else if (el.getAttribute('lang') == 'en') {
    lang = 'en';
  } else {
    lang = 'fr';
  }

  return lang;
};

// Allows use of closest() function across shadow boundaries
export const closestElement = (selector, el) => {
  if (el) {
    return (el && el != document && typeof window != 'undefined' && el != window && el.closest(selector)) || closestElement(selector, el.getRootNode().host);
  }

  return null;
};

// Removes unwanted attributes from display element
export const removeUnwantedAttributes = html => {
  const regex = /\s*(aria-[a-z-]+|class|(?<!-)\brole\b)="[^"]*"/g;
  return html.replace(regex, '');
};

export type AttributesType = {
  name: string;
  control: 'select' | 'text' | 'none';
  options?: Array<string>;
  required?: boolean;
  defaultValue?: string;
  type?: string;
  onlyProperty?: boolean;
};

export type SlotType = {
  name: string;
  description: string;
};

export type EventType = {
  name: string;
  description: string;
  details: string | object;
};

export const srcDoc = `<!DOCTYPE html>
<html lang="{{lang}}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Landmark Elements</title>
  <link rel="stylesheet" href="/components/dist/gcds.css" />
  <script type="module" src="/components/dist/gcds.esm.js"></script>
  <link
    rel="stylesheet"
    href="https://cdn.design-system.alpha.canada.ca/@gcds-core/css-shortcuts@latest/dist/gcds-css-shortcuts.min.css"
  />
  {{axeScript}}
</head>
<body class="p-150">
  {{displayElement}}
</body>
</html>`;

export const formatSrcDoc = (displayElement: string, accessibility: boolean = false, lang: string = 'en') => {
  let doc = srcDoc;
  if (accessibility) {
    const axeScript = `<script src="https://cdn.jsdelivr.net/npm/axe-core@4.7.2/axe.min.js"></script>`;
    doc = doc.replace('{{axeScript}}', axeScript);
  } else {
    doc = doc.replace('{{axeScript}}', '');
  }
  doc = doc.replace('{{lang}}', lang);
  doc = doc.replace('{{displayElement}}', displayElement);

  return doc;
};

/* ---------------------------
 * Iframe Helpers
 * --------------------------- */

export const iframeListeners = (iframe: HTMLIFrameElement) => {
  const resize = new ResizeObserver(() => {
    setIframeHeight(iframe);
  });

  resize.observe(iframe.contentDocument.body);

  // Build extra logic to handle opening of nav-groups desktop and mobile versions
  const handleMutations = mutationsList => {
    for (const mutation of mutationsList) {
      if (mutation.target.nodeName == 'GCDS-NAV-GROUP') {
        if (mutation.target.classList.contains('gcds-mobile-nav')) {
          const additionalHeight = mutation.target.shadowRoot.querySelector('ul.gcds-nav-group__list')?.getBoundingClientRect().height || 0;
          // Additional logic to keep body from shrinking
          iframe.contentDocument.body.style.height = `${additionalHeight / 16 + 7.25}rem`;
          setIframeHeight(iframe, additionalHeight / 16 + 3);
        } else if (mutation.target.closest('gcds-top-nav') && iframe.contentWindow.innerWidth <= 1024) {
          const additionalHeight =
            mutation.target
              .closest('gcds-top-nav')
              .shadowRoot.querySelector('gcds-nav-group.gcds-mobile-nav')
              .shadowRoot.querySelector('ul.gcds-nav-group__list')
              ?.getBoundingClientRect().height || 0;
          iframe.contentDocument.body.style.height = `${additionalHeight / 16 + 7.25}rem`;
          setIframeHeight(iframe, additionalHeight / 16);
        } else {
          const additionalHeight = mutation.target.shadowRoot.querySelector('ul.gcds-nav-group__list')?.getBoundingClientRect().height || 0;
          iframe.contentDocument.body.style.height = 'auto';
          setIframeHeight(iframe, additionalHeight / 16);
        }
      }
    }
  };

  const observer = new MutationObserver(handleMutations);

  // Check for gcds-nav-group inside gcds-top-nav
  const navGroup = iframe.contentDocument.querySelector('gcds-top-nav > gcds-nav-group');

  if (navGroup) {
    observer.observe(navGroup, {
      attributes: true,
      attributeFilter: ['open'],
    });
  }

  // Mobile top-nav and side-nav

  const nav = iframe.contentDocument.querySelector('gcds-top-nav') || iframe.contentDocument.querySelector('gcds-side-nav');

  if (nav) {
    observer.observe(nav.shadowRoot.querySelector('gcds-nav-group.gcds-mobile-nav'), {
      attributes: true,
      attributeFilter: ['open'],
    });
  }
};

const setIframeHeight = (iframe: HTMLIFrameElement, additional: number = 0) => {
  iframe.style.setProperty('--component-display-iframe-height', `${iframe.contentDocument.body.getBoundingClientRect().height / 16 + additional + 3}rem`);
};
