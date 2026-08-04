# Code display

The `gcds-ext-code-display` component provides an interactive way to showcase and document GC Design Components. It renders a live component preview alongside its source code, attributes, slots, events, and accessibility information.

Originally developed as a proof of concept to replace Storybook on the [GC Design System documentation site](https://github.com/cds-snc/gcds-docs), this component is built using the [GC Design System](https://design-system.canada.ca/en/).

## Features

### Code preview

The **Code preview** tab displays a live, interactive rendering of the component alongside its generated source code. Users can switch between HTML, React, Vue, and Angular code examples to see the equivalent implementation for each framework.

### Attributes

The **Attributes** tab displays a table containing each component attribute, including its name, type, default value, and an interactive control for modifying the live component.

Provide attribute metadata using the `attr` property as an array of objects with the following structure:

```ts
type AttributesType = {
  name: string;
  control: 'select' | 'text' | 'none';
  options?: string[];
  required?: boolean;
  defaultValue?: string;
  type?: string;
};
```

### Slots

The **Slots** tab displays a table of the component's available slots, including each slot's name, description, and an interactive control for editing the HTML rendered within that slot.

Provide slot metadata using the `slots` property as an array of objects with the following structure:

```ts
type SlotType = {
  name: string;
  description: string;
};
```

### Events

The **Events** tab displays a table of the component's events, including each event's name, description, and emitted event detail.

Provide event metadata using the `events` property as an array of objects with the following structure:

```ts
type EventType = {
  name: string;
  description: string;
  details: string | object;
};
```

### Accessibility

The **Accessibility** tab lets users run an isolated accessibility audit of the live component using `axe-core`.

Enable this tab by setting the `accessibility` property.
