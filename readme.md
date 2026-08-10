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

--------

# Afficheur de code

Le composant `gcds-ext-code-display` offre une façon interactive de présenter et de documenter les composants de Système de design GC. Il affiche un aperçu des composants en temps réel ainsi que son code source, ses attributs, ses emplacements, ses événements et ses renseignements en matière d’accessibilité.

Développé à l’origine comme preuve de concept pour remplacer Storybook sur le [site de documentation de Système de design GC](https://github.com/cds-snc/gcds-docs), ce composant est construit à l’aide de [Système de design GC](https://design-system.canada.ca/en/).

## Fonctionnalités

### Aperçu du code

L’onglet **Aperçu du code** affiche un rendu interactif et en direct du composant à côté de son code source généré. Les utilisateurs et utilisatrices peuvent basculer entre les exemples de code HTML, React, Vue et Angular pour voir la mise en œuvre équivalente pour chaque cadre.

### Attributs

L’onglet **Attributs** affiche un tableau contenant chaque attribut de composant, y compris son nom, son type, sa valeur par défaut et une commande interactive pour modifier le composant actif.

Fournissez des métadonnées d’attribut en utilisant la propriété `attr` comme matrice d’objets avec la structure suivante :

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

### Emplacements

L’onglet **Emplacements** affiche un tableau des emplacements disponibles du composant, y compris le nom et la description de chaque emplacement, ainsi qu’une commande interactive pour modifier le rendu HTML dans cet emplacement.

Fournissez des métadonnées d’emplacement en utilisant la propriété `slots` comme matrice d’objets avec la structure suivante :

```ts
type SlotType = {
  name: string;
  description: string;
};
```

### Événements

L’onglet **Événements** affiche un tableau des événements du composant, y compris le nom de chaque événement, sa description et les détails de l’événement émis.

Fournissez des métadonnées d’événement en utilisant la propriété `events` comme matrice d’objets avec la structure suivante :

```ts
type EventType = {
  name: string;
  description: string;
  details: string | object;
};
```

### Accessibilité

L’onglet **Accessibilité** permet aux utilisateurs d’exécuter un audit d’accessibilité isolé du composant actif à l’aide de `axe-core`.

Activez cet onglet en définissant la propriété `accessibility`.
