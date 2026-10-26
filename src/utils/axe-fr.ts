import axeLocaleFr from 'axe-core/locales/fr.json';

/*
 * French axe-core locale that works under a strict Content Security Policy.
 *
 * axe.configure({ locale }) compiles the locale's doT templates with `new Function()`,
 * which throws an EvalError when the page's CSP doesn't allow 'unsafe-eval'.
 * In fr.json only the two failure-summary templates use doT, so we provide them
 * as plain functions (axe calls failureMessage as a function at run time).
 * Everything else is plain text that axe localizes without eval.
 */

type SummaryKey = 'any' | 'none';

// "Corriger l’un des éléments suivants :" — the template's text before its {{ }} logic
const header = (key: SummaryKey) => axeLocaleFr.failureSummaries[key].failureMessage.split('{{')[0].trim();

// Same output as the doT template: the header, then each message on its own indented line
export const failureSummary = (key: SummaryKey) => (messages: string[]) => header(key) + messages.map(message => '\n  ' + message.split('\n').join('\n  ')).join('');

export const axeLocaleFrCspSafe = {
  ...axeLocaleFr,
  failureSummaries: {
    any: { failureMessage: failureSummary('any') },
    none: { failureMessage: failureSummary('none') },
  },
};
