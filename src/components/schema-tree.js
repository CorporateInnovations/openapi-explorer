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
      selectedResponse: { type: String, attribute: 'selected-request' }
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
        max-width: 315px;
      }
      .key.deprecated .key-label {
        text-decoration: line-through; 
      }
      .open-bracket {
        display: inline-block;
        cursor: pointer;
        background: none;
        border: none;
        padding: 0;
      }
      .collapsed .open-bracket{
        padding-right: 0;
      }
      .td.key > .open-bracket:first-child {
        margin-left: -2px;
      }

      .td key {
        padding-left: 48px;
      }

      .td key:last-child{
        margin-bottom: 0px !important;
      }
      
      .td key-descr:last-child{
        margin-bottom: 0px !important;
      }
      
      .close-bracket {
        display:inline-block;
        font-family: var(--font-mono);
      }

      .inside-bracket {
        border-radius: 8px;
      }
     
      .inside-bracket-wrapper {
        max-height: 10000px;
        transition: max-height 1.2s ease-in-out;
        overflow: hidden auto;
      }

      .inside-bracket-wrapper[data-inner-bracket="even"]{
        background: white;
      }

      .inside-bracket-wrapper[data-inner-bracket="odd"]{
        background: rgb(240, 240, 240, 0.5);
      }

      .tr.collapsed + .inside-bracket-wrapper {
        transition: max-height 1.2s ease-in-out -1.1s;
        max-height: 0;
      }

      .tdKeyAndDescMargin{
        margin-bottom: -25px;
      }

      .tdKeyAndDescMargin:last-child{
        margin-bottom: -25px;
      }

      .schemaTypeStyles {
        font-size: 19px !important;
        color: rgb(123, 135, 148);
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
      <div class="tree"> 
        ${this.data
          ? html`${this.generateTree(this.data['::type'] === 'array' ? this.data['::props'] : this.data)}`
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
        <span class="key-label xxx-of-key">${key.replace('::OPTION~', '')}</span>
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
          if(objectKeyDescr == this.selectedResponse){
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

    let baseIndentLevel = 20 * indentLevel + 8;

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
          openBracket = html`<span class="open-bracket array-of-object" @click="${this.toggleObjectExpand}">▾</span>`;
        } else {
          openBracket = html`<span class="open-bracket array-of-object" @click="${this.toggleObjectExpand}">▸</span>`;
        }
      } else {
        if (schemaLevel < this.schemaExpandLevel) {
          openBracket = html`<span class="open-bracket object" @click="${this.toggleObjectExpand}">▾</span>`;
        } else {
          openBracket = html`<span class="open-bracket object" @click="${this.toggleObjectExpand}">▸</span>`;
        }
      }
    } else if (data['::type'] === 'array') {
      if (dataType === 'array') {
        const arrType = arrayType !== 'object' ? arrayType : '';
        if (schemaLevel < this.schemaExpandLevel) {
          openBracket = html`<span class="open-bracket array-of-array" data-array-type="${arrType}" @click="${this.toggleObjectExpand}">▾</span>`;
        } else {
          openBracket = html`<span class="open-bracket array-of-array"  data-array-type="${arrType}" @click="${this.toggleObjectExpand}">▸</span>`;
        }
        closeBracket = ']]';
      } else {
        if (schemaLevel < this.schemaExpandLevel) {
          openBracket = html`<span class="open-bracket array" @click="${this.toggleObjectExpand}">▾</span>`;
        } else {
          openBracket = html`<span class="open-bracket array" @click="${this.toggleObjectExpand}">▸</span>`;
        }
        closeBracket = ']';
      }
    } else if (data['::type'] === 'xxx-of' && dataType === 'array') {
      if (schemaLevel < this.schemaExpandLevel) {
        openBracket = html`<span class="open-bracket array" @click="${this.toggleObjectExpand}">▾</span>`;
      } else {
        openBracket = html`<span class="open-bracket array" @click="${this.toggleObjectExpand}">▸</span>`;
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
      ${key.startsWith('::ONE~OF') ? '' : html`
      <div class="tr ${schemaLevel < this.schemaExpandLevel || data['::type'] && data['::type'].startsWith('xxx-of') ? '' : 'collapsed'} ${data['::type'] || 'no-type-info'}" style="align-items: baseline;">
        <div class="td key ${data['::deprecated'] ? 'deprecated' : ''}" style="min-width: 290px; margin-top:${indentLevel != 1 ? '15' : '0'}px ${keyLabel == '' ? 'display: none;' : ''}">
          ${data['::type'] === 'xxx-of-option' || data['::type'] === 'xxx-of-array' || key.startsWith('::OPTION')
            ? html`<span class='key-label xxx-of-key'>${keyLabel}</span><span class="xxx-of-descr">${keyDescr}</span>`
            : keyLabel === '::props' || keyLabel === '::ARRAY~OF'
              ? ''
              : schemaLevel > 0
                ? html`<span class="key-label" style="font-size: 18px; line-height: 1.5;">
                    ${keyLabel.replace(/\*$/, '')} ${openBracket}${keyLabel.endsWith('*') ? html`<br><span style="color:var(--red); font-size: 16px;"> required</span>` : ''}
                  </span>`
                : ''
          }
        </div>
        <div class="td key-descr">
        <span class="m-markdown-small" style="padding: 5px 0; vertical-align: middle;" title="${flags['🆁'] && 'Read only attribute' || flags['🆆'] && 'Write only attribute' || ''}">
          ${unsafeHTML(marked(displayLine))}
        </span>
        ${this.schemaDescriptionExpanded ? html`
          ${data['::metadata']?.constraints?.length ? html`<div style='display:inline-block; line-break:anywhere; margin-right:8px'><span class='bold-text'>Constraints: </span>${data['::metadata'].constraints.join(', ')}</div><br>` : ''}
        ` : ''}
      </div>
      </div>
    `}   
        <div class="inside-bracket-wrapper" style="${indentLevel != 0 ? 'padding-left: 30px; padding-right: 10px;' : ''} margin-bottom: 10px; ${key.startsWith('::ONE~OF') ? 'background: rgba(240, 240, 240, 0.2);' : ''}" data-inner-bracket="${indentLevel % 2 === 1 ? 'odd' : 'even'}";> 
          <div class='inside-bracket ${data['::type'] || 'no-type-info'} inside-bracket-object nestingStyles'>
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
          ${data['::type'] && data['::type'].includes('xxx-of') ? '' : html`<div class='close-bracket'> ${closeBracket} </div>`}
        </div>
      `;
    }

    // For Primitive Data types
    const { type, cssType, format, readOrWriteOnly, constraint, defaultValue, example, allowedValues, pattern, schemaDescription, schemaTitle, deprecated } = JSON.parse(data);
    let constraintSplit = constraint.split(': ')
    if (readOrWriteOnly === '🆁' && this.schemaHideReadOnly === 'true') {
      return undefined;
    }
    if (readOrWriteOnly === '🆆' && this.schemaHideWriteOnly === 'true') {
      return undefined;
    }

    return html`
        <div>
        <div class="tr primitive" style="font-size: 18px; padding: 10px 0;"> 
          <div class="td key ${deprecated ? 'deprecated' : ''}" style="line-height: 1.5; min-width: 290px; font-size: 18px;">
            ${keyLabel.endsWith('*') && keyLabel != ''
              ? html`<span class="key-label">${keyLabel.substring(0, keyLabel.length - 1)}</span></br><span style='color:var(--red); font-size: 16px;'>required</span>`
              : key.startsWith('::OPTION') && keyLabel != ''
                ? html`<span class='key-label xxx-of-key'>${keyLabel}</span><span class="xxx-of-descr">${keyDescr}</span>`
                : schemaLevel > 0
                  ? html`<span class="key-label">${keyLabel}</span>`
                  : ''
            }
          </div>
          <div class="td key-descr" style="line-height: 2;">  
            <span class="m-markdown-small" style="line-height: 1.7; font-size: 20px; font-family: var(--font-mono); vertical-align: middle;" title="${readOrWriteOnly === '🆁' && 'Read only attribute' || readOrWriteOnly === '🆆' && 'Write only attribute' || ''}">
              ${unsafeHTML(marked(`${dataType === 'array' && description || `${schemaTitle ? `**${schemaTitle}:**` : ''} <p class="schemaTypeStyles">${type}</p><p style="margin-top: 3px;">${schemaDescription}</p>` || ''}`))}
            </span>
            ${this.schemaDescriptionExpanded && (constraint || defaultValue || allowedValues || pattern || example) ? html` 
              <div style="margin-top: -5px;">
                ${constraint ? html`<div class="schemaDescriptions"><span>${constraintSplit[0]}: </span><span class="technicalWords">${constraintSplit[1]}</span></div><br>` : ''}
                ${defaultValue ? html`<div class="schemaDescriptions"><span>Default: </span><span class="technicalWords">${defaultValue}</span></div><br>` : ''}
                ${allowedValues ? html`<div class="schemaDescriptions"><span>Supported:</span>${allowedValues.split('┃').map((v, i) => html`${i > 0 ? '|' : ''}<span class="technicalWords">${v}</span>`)}</div>` : ''}
                ${pattern ? html`<div class="schemaDescriptions"><span>Pattern: </span><span class="technicalWords">${pattern}</span></div><br>` : ''}
                ${example ? html`<div class="schemaDescriptions"><span>Example: </span><span class="technicalWords">${example}</span></span></div><br>` : ''}
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
      e.target.innerHTML = '▸';
    } else {
      e.target.innerHTML = '▾';
    }
    this.requestUpdate();
  }
}

if (!customElements.get('openapi-explorer')) {
  customElements.define('schema-tree', SchemaTree);
}
