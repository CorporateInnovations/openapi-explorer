import { LitElement, html, css } from 'lit';
import { marked } from 'marked';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { getI18nText } from '../languages';
import FontStyles from '../styles/font-styles.js';
import SchemaStyles from '../styles/schema-styles';
import BorderStyles from '../styles/border-styles';

export default class SchemaTree extends LitElement {
  static get properties() {
    return {
      data: { type: Object },
      schemaExpandLevel: { type: Number, attribute: 'schema-expand-level' },
      schemaDescriptionExpanded: { type: Boolean },
      schemaHideReadOnly: { type: String, attribute: 'schema-hide-read-only' },
      schemaHideWriteOnly: { type: String, attribute: 'schema-hide-write-only' },
      selectedRequest: { type: String, attribute: 'selected-request' }
    };
  }

  connectedCallback() {
    super.connectedCallback();
    if (!this.schemaExpandLevel || this.schemaExpandLevel < 1) { this.schemaExpandLevel = 99999; }
    this.schemaDescriptionExpanded = true;
    if (!this.schemaHideReadOnly || !'true false'.includes(this.schemaHideReadOnly)) { this.schemaHideReadOnly = 'true'; }
    if (!this.schemaHideWriteOnly || !'true false'.includes(this.schemaHideWriteOnly)) { this.schemaHideWriteOnly = 'true'; }
  }

  static finalizeStyles() {
    return [
      FontStyles,
      SchemaStyles,
      BorderStyles,
      css`
      .tree {
        min-height: 30px;
        font-size: 16px;
        text-align: left;
        line-height:calc(var(--font-size-small) + 6px);
      }

      .tree .key {
        max-width: 300px;
      }
      .key.deprecated .key-label {
        text-decoration: line-through; 
      }
      .collapsed{
        padding-right: 0;
      }
     
      .inside-bracket-wrapper {
        max-height: 10000px;
        transition: max-height 1.2s ease-in-out;
        overflow: hidden;
      }
      .tr.collapsed + .inside-bracket-wrapper {
        transition: max-height 1.2s ease-in-out -1.1s;
        max-height: 0;
      }

      .inside-bracket.array {
        border-left: 1px dotted var(--border-color);
      }
      .inside-bracket.xxx-of.option {
        border-left: 1px solid transparent;
      }`,
    ];
  }

  /* eslint-disable indent */
  render() {
    return html`
      <div class="tree"> 
        ${this.data
          ? html`${this.generateTree(this.data['::type'] === 'array' ? this.data['::props'] : this.data, this.data['::type'], this.data['::array-type'] || '')}`
          : html`<span class='mono-font' style='color:var(--red)'> ${getI18nText('schemas.schema-missing')} </span>`
        }
      </div>  
    `;
  }

  // ***** Toggles Collapse ***** //

  toggleSchemaDescription() {
    this.schemaDescriptionExpanded = !this.schemaDescriptionExpanded;
    this.requestUpdate();
  }

  generateTree(data, dataType = 'object', arrayType = '', flags = {}, key = '', description = '', schemaLevel = 0, indentLevel = 0) {
    if (!data) {
      return html`<div class="null" style="display:inline;">
        <span class="key-label xxx-of-key"> ${key.replace('::OPTION~', '')}</span>
        ${
          dataType === 'array'
            ? html`<span class='mono-font'> [ ] </span>`
            : dataType === 'object'
              ? html`<span class='mono-font'> { } </span>`
              : html`<span class='mono-font'> schema undefined </span>`
        }
      </div>`;
    }
    if (Object.keys(data).length === 0) {
      return html`<span class="key object">${key}:{ }</span>`;
    }
    let keyLabel = '';
    let keyDescr = '';
    if (key.startsWith('::ONE~OF') || key.startsWith('::ANY~OF')) {
      keyLabel = key.replace('::', '').replace('~', ' ');
      for (let object in data) {
        if (object.startsWith('::OPTION')) {
          const splitParts = object.split('~');
          let objectKeyDescr = splitParts[1];
          if(objectKeyDescr == this.selectedRequest){
            data = data[object];
           }
         } 
      }

    } else if (key.startsWith('::OPTION')) {
      const parts = key.split('~');
      keyLabel = parts[1];
      keyDescr = parts[2];
    } else {
      keyLabel = key;
    }

    const leftPadding = 16;
    // Min-width used for model keys: `td key `
    const minFieldColWidth = 300 - (indentLevel * leftPadding);
    let openBracket = '';
    let closeBracket = '';
    const newSchemaLevel = data['::type'] && data['::type'].startsWith('xxx-of') ? schemaLevel : (schemaLevel + 1);
    const newIndentLevel = dataType === 'xxx-of-option' || data['::type'] === 'xxx-of-option' ? indentLevel : (indentLevel + 1);
    if (data['::type'] === 'object') {
      if (dataType === 'array') {
        if (schemaLevel < this.schemaExpandLevel) {
          openBracket = html`<span class="open-bracket array-of-object" @click="${this.toggleObjectExpand}">[{</span>`;
        } else {
          openBracket = html`<span class="open-bracket array-of-object" @click="${this.toggleObjectExpand}">[{...}]</span>`;
        }
        closeBracket = '}]';
      } else {
        if (schemaLevel < this.schemaExpandLevel) {
          openBracket = html`<span class="open-bracket object" @click="${this.toggleObjectExpand}">{</span>`;
        } else {
          openBracket = html`<span class="open-bracket object" @click="${this.toggleObjectExpand}">{...}</span>`;
        }
        closeBracket = '}';
      }
    } else if (data['::type'] === 'array') {
      if (dataType === 'array') {
        const arrType = arrayType !== 'object' ? arrayType : '';
        if (schemaLevel < this.schemaExpandLevel) {
          openBracket = html`<span class="open-bracket array-of-array" data-array-type="${arrType}" @click="${this.toggleObjectExpand}">[[ ${arrType} </span>`;
        } else {
          openBracket = html`<span class="open-bracket array-of-array"  data-array-type="${arrType}" @click="${this.toggleObjectExpand}">[[...]]</span>`;
        }
        closeBracket = ']]';
      } else {
        if (schemaLevel < this.schemaExpandLevel) {
          openBracket = html`<span class="open-bracket array" @click="${this.toggleObjectExpand}">[</span>`;
        } else {
          openBracket = html`<span class="open-bracket array" @click="${this.toggleObjectExpand}">[...]</span>`;
        }
        closeBracket = ']';
      }
    } else if (data['::type'] === 'xxx-of' && dataType === 'array') {
      if (schemaLevel < this.schemaExpandLevel) {
        openBracket = html`<span class="open-bracket array" @click="${this.toggleObjectExpand}">[</span>`;
      } else {
        openBracket = html`<span class="open-bracket array" @click="${this.toggleObjectExpand}">[...]</span>`;
      }
      closeBracket = ']';
    }

    if (typeof data === 'object') {
      if (flags['🆁'] && this.schemaHideReadOnly === 'true') {
        return undefined;
      }
      if (flags['🆆'] && this.schemaHideWriteOnly === 'true') {
        return undefined;
      }

      let selection = null;
      const displayLine = [flags['🆁'] || flags['🆆'], description].filter(v => v).join(' ');
      return html`
        <div class="inside-bracket-wrapper">
          <div class='inside-bracket ${data['::type'] || 'no-type-info'}' style='padding-left: 0;'>
            ${Array.isArray(data) && data[0] ? html`${this.generateTree(data[0], 'xxx-of-option', '', data[0]['::flags'] || {}, '::ARRAY~OF', '', newSchemaLevel, newIndentLevel)}`
              : html`
                ${Object.keys(data).map((dataKey) =>
                  !['::title', '::description', '::type', '::props', '::deprecated', '::array-type', '::dataTypeLabel', '::flags'].includes(dataKey)
                  || data[dataKey]['::type'] === 'array' && data[dataKey]['::type'] === 'object'
                  ? html`${this.generateTree(data[dataKey]['::type'] === 'array' ? data[dataKey]['::props'] : data[dataKey],
                        data[dataKey]['::type'], data[dataKey]['::array-type'] || '', data[dataKey]['::flags'], dataKey, data[dataKey]['::description'], newSchemaLevel, newIndentLevel)}`
                  : ''
                )}`
            }
          </div>
        </div>
      `;
    }

    // For Primitive Data types
    const { type, cssType, format, readOrWriteOnly, constraint, defaultValue, example, allowedValues, pattern, schemaDescription, schemaTitle, deprecated } = JSON.parse(data);
    if (readOrWriteOnly === '🆁' && this.schemaHideReadOnly === 'true') {
      return undefined;
    }
    if (readOrWriteOnly === '🆆' && this.schemaHideWriteOnly === 'true') {
      return undefined;
    }
    return html`
      <div class="underline">
        <div class="tr primitive" style="font-size: 16px;">
          <div class="td key ${deprecated ? 'deprecated' : ''}" style='min-width: 268px; font-size: 16px;'>
            ${keyLabel.endsWith('*')
              ? html`<span class="key-label">${keyLabel.substring(0, keyLabel.length - 1)}</span></br><span style='color:var(--red);'>required</span>`
              : key.startsWith('::OPTION')
                ? html`<span class='key-label xxx-of-key'>${keyLabel}</span><span class="xxx-of-descr">${keyDescr}</span>`
                : schemaLevel > 0
                  ? html`<span class="key-label">${keyLabel}</span>`
                  : ''
            }
          </div>
          <div class="td key-descr">  
            <span class="m-markdown-small" style="font-family: var(--font-mono); vertical-align: middle;" title="${readOrWriteOnly === '🆁' && 'Read only attribute' || readOrWriteOnly === '🆆' && 'Write only attribute' || ''}">
              ${unsafeHTML(marked(`${dataType === 'array' && description || `${schemaTitle ? `**${schemaTitle}:**` : ''} <p style="color: lightgrey;">${type}</p>${schemaDescription}` || ''}`))}
            </span>
            <p style="margin: 0; margin-block: 0;">${unsafeHTML(marked(`${readOrWriteOnly && `<strong>readOnly: true </strong> ` || ''} `)) }</p>
            ${example ? html` <span>${example}</span>`: ''}
            ${this.schemaDescriptionExpanded && (constraint || defaultValue || allowedValues || pattern || example) ? html` 
              <br>
              <div class="testing" style="line-height: 25px; font-weight: 700;">
                ${constraint ? html`<div style='display:inline-block; line-break:anywhere; margin-right:8px'><span class='bold-text'>Constraints: </span>${constraint}</div><br>` : ''}
                ${defaultValue ? html`<div style='display:inline-block; line-break:anywhere; margin-right:8px'><span class='bold-text'>Default: </span>${defaultValue}</div><br>` : ''}
                ${allowedValues ? html`<div style='display:inline-block; line-break:anywhere; margin-right:8px'><span class='bold-text'>Allowed: </span>${allowedValues}</div><br>` : ''}
                ${pattern ? html`<div style='display:inline-block; line-break: anywhere; margin-right:8px'><span class='bold-text'>Pattern: </span>${pattern}</div><br>` : ''}
                ${example ? html`<div style='display:inline-block; line-break: anywhere; margin-right:8px'><span class='bold-text'>Example: </span>${example}</div><br>` : ''}
              </div>` 
            : ''}
            </div>
        </div>   
      </div>
    `;
  }
  /* eslint-enable indent */

  toggleObjectExpand(e) {
    const rowEl = e.target.closest('.tr');
    rowEl.classList.toggle('collapsed');
    if (rowEl.classList.contains('collapsed')) {
      e.target.innerHTML = e.target.classList.contains('array-of-object')
        ? '[{...}]'
        : e.target.classList.contains('array-of-array')
          ? '[[...]]'
          : e.target.classList.contains('array')
            ? '[...]'
            : '{...}';
    } else {
      e.target.innerHTML = e.target.classList.contains('array-of-object')
        ? '[{'
        : e.target.classList.contains('array-of-array')
          ? '[['
          : e.target.classList.contains('object')
            ? '{'
            : '[';
    }
    this.requestUpdate();
  }
}

if (!customElements.get('openapi-explorer')) {
  customElements.define('schema-tree', SchemaTree);
}
