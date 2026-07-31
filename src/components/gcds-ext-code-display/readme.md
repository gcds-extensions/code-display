# element-display



<!-- Auto Generated Below -->


## Properties

| Property          | Attribute          | Description | Type                                      | Default               |
| ----------------- | ------------------ | ----------- | ----------------------------------------- | --------------------- |
| `accessibility`   | `accessibility`    |             | `boolean`                                 | `false`               |
| `attrs`           | `attrs`            |             | `AttributesType[] \| string`              | `undefined`           |
| `events`          | `events`           |             | `EventType[] \| string`                   | `undefined`           |
| `framework`       | `framework`        |             | `"angular" \| "html" \| "react" \| "vue"` | `'html'`              |
| `gcdsPath`        | `gcds-path`        |             | `string`                                  | `'/components/dist/'` |
| `landmarkDisplay` | `landmark-display` |             | `boolean`                                 | `false`               |
| `slots`           | `slots`            |             | `SlotType[] \| string`                    | `undefined`           |


## Dependencies

### Depends on

- [code-frame](../code-frame)
- [attribute-tab](../attribute-tab)
- [slots-tab](../slots-tab)
- [events-tab](../events-tab)
- [accessibility-tab](../accessibility-tab)

### Graph
```mermaid
graph TD;
  gcds-ext-code-display --> code-frame
  gcds-ext-code-display --> attribute-tab
  gcds-ext-code-display --> slots-tab
  gcds-ext-code-display --> events-tab
  gcds-ext-code-display --> accessibility-tab
  style gcds-ext-code-display fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
