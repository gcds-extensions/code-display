/// <reference types="jest" />
import { axeLocaleFrCspSafe } from '../axe-fr';

describe('axeLocaleFrCspSafe', () => {
  // doT templates ({{ }}) are compiled by axe with eval, which a strict CSP blocks
  it('contains no doT templates', () => {
    expect(JSON.stringify(axeLocaleFrCspSafe)).not.toContain('{{');
  });
});
