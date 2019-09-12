import {LitElement, html} from 'lit-element';
/**
A simple component that provides basic autocomplete.

Example:

```
Basic autocomplete textbox: <nega-autocomplete items="[&quot;dog&quot;,&quot;cat&quot;,&quot;bird&quot;]"></nega-autocomplete>

Autocomplete custom textbox: <nega-autocomplete items="[&quot;dog&quot;,&quot;cat&quot;,&quot;bird&quot;]"><input placeholder="Animals" /></nega-autocomplete>
```

The following custom properties and mixins are also available for styling:
Custom property | Description | Default
----------------|-------------|----------
`--nega-autocomplete-container` | Mixin for suggestion box | `{}`
`--nega-autocomplete-item` | Mixin for each item | `{}`
`--nega-autocomplete-highlight` | Mixin for highlighted item | `{}`

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
class NegaAutoComplete extends LitElement {
  static get properties() {
    return {
      items: {type: Array},
      opened: {type: Boolean, reflect: true},
      maxSuggestions: Number
    }
  }
  constructor() {
    super()
    this.items = []
    this.opened = false
    this.maxSuggestions = 10
    
    this._suggestions = []
    this._bound = {}  // Keep reference of bound event handlers for disconnect
  }

  render() {
    return html`
    <style>
      :host {
        --nega-autocomplete-container: {};
        --nega-autocomplete-item: {};
        --nega-autocomplete-highlight: {};
      }

      ul {
        position: absolute;
        display: block;
        list-style-type: none;
        margin: 0;
        padding: 0;
        z-index: 10000;

        border: 1px solid grey;
        background: white;

        @apply --nega-autocomplete-container;
      }

      li {
        padding: 4px;

        @apply --nega-autocomplete-item;
      }

      li.active {
        background: whitesmoke;

        @apply --nega-autocomplete-highlight;
      }

      [hidden] {
        display: none;
      }
    </style>

    <slot id="dropdown-input"><input id="defaultInput" type="text"/></slot>
    <ul id="suggestions" ?hidden=${!this.opened} @mouseenter=${this._handleItemMouseEnter} @mouseleave=${this._handleItemMouseLeave}>
      ${this._suggestions.map(item => html`
      <li @click=${ev => this.autocomplete(item)}>${item}</li>
      `)}
    </ul>
    `
  }

  /**
   * Input element getter
   */
  get contentElement() {
    if (this._inputEl) return this._inputEl;  // Cache
    if (!this.hasUpdated) return;  // No shadow root, no element to use

    var slotInputList = this.shadowRoot.getElementById('dropdown-input').assignedElements()
    this._inputEl = slotInputList.length ? slotInputList[0] : this.shadowRoot.getElementById('defaultInput')
    return this._inputEl
  }

  /**
   * Value getter from input element.
   */
  get value() {
    return this.contentElement && this.contentElement.value
  }

  /**
   * Value setter to input element.
   */
  set value(value) {
    if (!this.contentElement) return;

    this.contentElement.value = value
  }

  firstUpdated() {
    this._suggestionEl = this.shadowRoot.getElementById('suggestions')
    this._suggestionEl.style.width = this.contentElement.getBoundingClientRect().width + 'px'

    this._bound.onKeyDown = this._handleKeyDown.bind(this)
    this._bound.onKeyUp = this._handleKeyUp.bind(this)
    this._bound.onFocus = this._handleFocus.bind(this)
    this._bound.onBlur = this._handleBlur.bind(this)

    this.contentElement.addEventListener('keydown', this._bound.onKeyDown)
    this.contentElement.addEventListener('keyup', this._bound.onKeyUp)
    this.contentElement.addEventListener('focus', this._bound.onFocus)
    this.contentElement.addEventListener('blur', this._bound.onBlur)
  }

  disconnectedCallback() {
    if (!this.contentElement) return // no events to remove
    this.contentElement.removeEventListener('keydown', this._bound.onKeyDown)
    this.contentElement.removeEventListener('keyup', this._bound.onKeyUp)
    this.contentElement.removeEventListener('focus', this._bound.onFocus)
    this.contentElement.removeEventListener('blur', this._bound.onBlur)
  }

  updated(changed) {
    if (changed.has('opened') && this.opened && this._suggestionEl.childElementCount) {
      // Highlight the first when there are suggestions
      this._highlightedEl = this._suggestionEl.children[0]
      this._highlightedEl.classList.add('active')
    }
  }

  /**
   * Open suggestions.
   */
  open() {
    if (this._suggestions.length) {
      this.opened = true
    }
  }

  /**
   * Close suggestions.
   */
  close() {
    this.opened = false
    this._highlightedEl = null
  }

  /**
   * Suggest autocomplete items.
   * @param {Array<String>} suggestions 
   */
  suggest(suggestions) {
    this._suggestions = suggestions || []
    this._suggestions.length ? this.open() : this.close()
    this.requestUpdate()
  }

  /**
   * Autocomplete input with `value`.
   * @param {String} value 
   */
  autocomplete(value) {
    this.contentElement.value = value
    this.close()
    this.dispatchEvent(new CustomEvent('autocomplete', {detail: {value: value}, composed: true, bubbles: true}))
  }

  _highlightPrev() {
    if (!this._highlightedEl || !this._highlightedEl.previousElementSibling) return;

    this._highlightedEl.classList.remove('active')
    this._highlightedEl = this._highlightedEl.previousElementSibling
    this._highlightedEl.classList.add('active')
  }

  _highlightNext() {
    if (!this._highlightedEl || !this._highlightedEl.nextElementSibling) return;

    this._highlightedEl.classList.remove('active')
    this._highlightedEl = this._highlightedEl.nextElementSibling
    this._highlightedEl.classList.add('active')
  }

  _handleKeyDown(ev) {
    // Prevent up and down from behaving as home and end on some browsers
    if (ev.key === 'ArrowUp' || ev.key === 'ArrowDown') {
      ev.preventDefault()
      ev.stopPropagation()
    }
  }
  
  _handleKeyUp(ev) {
    switch(ev.key) {
      case 'ArrowUp':
        ev.preventDefault()
        ev.stopPropagation()
        this._highlightPrev()
        break
      case 'ArrowDown':
        ev.preventDefault()
        ev.stopPropagation()
        this._highlightNext()
        break
      case 'Enter':
        // Select
        this._highlightedEl && this._highlightedEl.click()
        break
      default:
        // TODO debounce
        if (this.items.length) {
          var value = this.contentElement.value
          var suggestions = value && this.items
            .filter(item => item.toLowerCase().startsWith(value.toLowerCase()) && item !== value) // Collect the items that match
            .slice(0, this.maxSuggestions) // Limit results
          this.suggest(suggestions)
        }
    }
  }

  _handleFocus(ev) {
    this._blur = false
    this._suggestions.length && this.open()
  }

  _handleBlur(ev) {
    this._blur = true
    !this._mouseEnter && this.close()
  }

  // Handle mouse change focus to suggestions
  _handleItemMouseEnter(ev) {
    this._mouseEnter = true
  }

  _handleItemMouseLeave(ev) {
    this._mouseEnter = false
    this._blur && setTimeout(_ => this.close(), 500)  // Give user some slack before closing
  }
}
window.customElements.define('nega-autocomplete', NegaAutoComplete);
