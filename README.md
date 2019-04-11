# \<nega-autocomplete\>

[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/kennethklee/nega-autocomplete)

An autocomplete web component.

Example:

<!---
```
<custom-element-demo>
  <template>
    <script src="../webcomponentsjs/webcomponents-lite.js"></script>
    <script type="module" src="nega-autocomplete.js">
    <style is="custom-style">
      #container {
        display: flex;
      }
    </style>
    <div id="container">
      <next-code-block></next-code-block>
    </div>
  </template>
</custom-element-demo>
```
-->
```html
<nega-autocomplete items="[&quot;dog&quot;,&quot;cat&quot;,&quot;bird&quot;,&quot;fish&quot;,&quot;rabbit&quot;,&quot;fox&quot;,&quot;bear&quot;]">
  <input type="text" placeholder="Animals" />
</nega-autocomplete>
```

# Usage

## Installation

```shell
npm install --save nega-autocomplete
```

## In an html file

```html
<html>
  <head>
    <script type="module">
      import 'nega-autocomplete/nega-autocomplete.js';
    </script>
  </head>
  <body>
    <nega-autocomplete items="[&quot;dog&quot;,&quot;cat&quot;,&quot;bird&quot;,&quot;fish&quot;,&quot;rabbit&quot;,&quot;fox&quot;,&quot;bear&quot;]">
      <input type="text" placeholder="Animals" />
    </nega-autocomplete>
  </body>
</html>
```

## In a Polymer 3 element

```js
import {PolymerElement, html} from '@polymer/polymer';
import 'nega-autocomplete/nega-autocomplete.js';

class SampleElement extends PolymerElement {
  static get template() {
    return html`
      <nega-autocomplete .items=[[items]]>
        <input type="text" placeholder="Animals" />
      </nega-autocomplete>
    `;
  }

  static get properties() {
    return {
      items: {type: Array, value: ['dog', 'cat', 'bird', 'fish', 'rabbit', 'fox', 'bear']}
    }
  }
}
customElements.define('sample-element', SampleElement);
```


# Contributing

Feel free to fork and send over PRs. Still a lot of places this can be improved, i.e. styling, more options, or better behaviors.

## Installation

```
git clone https://github.com/kennethklee/nega-autocomplete
cd nega-autocomplete
npm install
```

## Running locally

```
$ npm start
```

## Running tests

```
$ npm test
```
