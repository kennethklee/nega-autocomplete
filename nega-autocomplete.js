import {LitElement, html} from 'lit-element';
/**
A simple component that provides basic autocomplete.

Example:

```
Basic autocomplete textbox: <nega-autocomplete items=" items="[&quot;dog&quot;,&quot;cat&quot;,&quot;bird&quot;]"></nega-autocomplete>

Autocomplete custom textbox: <nega-autocomplete items=" items="[&quot;dog&quot;,&quot;cat&quot;,&quot;bird&quot;]"><input placeholder="Animals" /></nega-autocomplete>
```

@element nega-autocomplete
@demo demo/index.html
*/
/**
 * `nega-autocomplete`
 * Auto complete component
 *
 * @customElement
 * @demo demo/index.html
 */
class NegaAutoComplete extends  LitElement {
  static get properties() {
    return {
      suggestions: {type: Array},
      items: {type: Array},
      opened: {type: Boolean, reflect: true},
      maxSuggestions: Number
    }
  }
  constructor() {
    super()
    this.auto = true
    this.items = []
    this.suggestions = []
    this.opened = false
    this.maxSuggestions = 10

    // Keep reference of bound event handlers for disconnect
    this._bound = {}
  }

  render() {
    return html`
    <style>
      ul {
        position: absolute;
        display: block;
        list-style-type: none;
        margin: 0;
        padding: 0;
        z-index: 10000;

        border: 1px solid grey;
        background: white;
      }

      li.active {
        font-weight: bold;
        background: whitesmoke;
      }

      [hidden] {
        display: none;
      }
    </style>

    <slot id="dropdown-input"><input id="defaultInput" type="text"/></slot>
    <ul id="suggestions" ?hidden=${!this.opened}>
      ${this.suggestions.map(item => html`
      <li @click=${ev => this.autocomplete(item)}>${item}</li>
      `)}
    </ul>
    `
  }

  firstUpdated() {
    var slotInputList = this.shadowRoot.getElementById('dropdown-input').assignedElements()
    this._inputEl = slotInputList.length ? slotInputList[0] : this.shadowRoot.getElementById('defaultInput')
    this._suggestionEl = this.shadowRoot.getElementById('suggestions')
    this._suggestionEl.style.width = this._inputEl.getBoundingClientRect().width + 'px'

    this._bound.onKeyDown = this._onKeyDown.bind(this)
    this._bound.onKeyUp = this._onKeyUp.bind(this)
    this._bound.onFocus = this._onFocus.bind(this)
    this._bound.onBlur = this._onBlur.bind(this)

    this._inputEl.addEventListener('keydown', this._bound.onKeyDown);
    this._inputEl.addEventListener('keyup', this._bound.onKeyUp);
    this._inputEl.addEventListener('focus', this._bound.onFocus);
    this._inputEl.addEventListener('blur', this._bound.onBlur);
  }

  disconnectedCallback() {
    this._inputEl.removeEventListener('keydown', this._bound.onKeyDown);
    this._inputEl.removeEventListener('keyup', this._bound.onKeyUp);
    this._inputEl.removeEventListener('focus', this._bound.onFocus);
    this._inputEl.removeEventListener('blur', this._bound.onBlur);
  }

  updated(changed) {
    if (changed.has('suggestions') && this._suggestionEl.children[0]) {
      // Highlight the first when there's suggestions
      this._highlightedEl = this._suggestionEl.children[0]
      this._highlightedEl.classList.add('active')
    }
  }
  
  highlightPrev() {
    if (!this._highlightedEl || !this._highlightedEl.previousElementSibling) return;

    this._highlightedEl.classList.remove('active')
    this._highlightedEl = this._highlightedEl.previousElementSibling
    this._highlightedEl.classList.add('active')
    // console.log('prev', this._highlightedEl)
  }

  highlightNext() {
    if (!this._highlightedEl || !this._highlightedEl.nextElementSibling) return;

    this._highlightedEl.classList.remove('active')
    this._highlightedEl = this._highlightedEl.nextElementSibling
    this._highlightedEl.classList.add('active')
    // console.log('next', this._highlightedEl)
  }

  open() {
    this.opened = true
  }

  close() {
    this.opened = false
    this._highlightedEl = null
  }

  autocomplete(value) {
    this._inputEl.value = value
    this.close()
    this.dispatchEvent(new CustomEvent('autocomplete', {detail: {value: value}, composed: true, bubbles: true}))
  }

  _onKeyDown(ev) {
    if (ev.key === 'ArrowUp' || ev.key === 'ArrowDown') {
      ev.preventDefault()
      ev.stopPropagation()
    }
  }
  
  _onKeyUp(ev) {
    switch(ev.key) {
      case 'ArrowUp':
        ev.preventDefault()
        ev.stopPropagation()
        this.highlightPrev()
        break
      case 'ArrowDown':
        ev.preventDefault()
        ev.stopPropagation()
        this.highlightNext()
        break
      case 'Enter':
        // Select
        this._highlightedEl && this._highlightedEl.click()
        break
      default:
        // Suggest
        // TODO debounce
        if (this.items.length) {
          var value = this._inputEl.value
          if (value) {
            this.suggestions = this.items
              .filter(item => item.startsWith(value) && item !== value) // Collect the items that match
              .slice(0, this.maxSuggestions) // Limit results
            this.open()
          } else {
            this.suggestions = []
            this.close()
          }
        }
    }
  }

  _onFocus(ev) {
    if (this.suggestions.length) {
      this.open()
    }
  }

  _onBlur(ev) {
    // Give it some time to process clicks
    setTimeout(_ => this.close(), 200)
  }
}
window.customElements.define('nega-autocomplete', NegaAutoComplete);
