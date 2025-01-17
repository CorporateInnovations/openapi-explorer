import { LitElement, html, css } from 'lit';
import { copyToClipboard } from '../utils/common-utils';
import { getI18nText } from '../languages';
import FontStyles from '../styles/font-styles.js';
import BorderStyles from '../styles/border-styles';
import InputStyles from '../styles/input-styles';

export default class JsonTree extends LitElement {
  static get properties() {
    return {
      data: { type: Object },
      renderStyle: { type: String, attribute: 'render-style' },
    };
  }

  static finalizeStyles() {
    return [
      FontStyles,
      BorderStyles,
      InputStyles,
      css`
      :host{
        display:flex;
      }

      .json-tree {
        background: var(--primary-color);
        color: white;
        padding: 12px; 

        min-height: 30px;
        font-family: "Courier New", sans-serif;
        font-size: var(--font-size-regular);
        overflow:hidden;
        word-break: break-all;
        flex:1;
        line-height: var(--font-size-regular);
      }
      
     .inside-bracket-wrapper {
        max-height: 10000px;
        transition: max-height 1.2s ease-in-out;
        overflow: hidden;
      }
      
      .inside-bracket {
        padding-left: 30px;
      }

      .string{color:var(--green);}
      .null{color:var(--red);}
      .boolean{color:var(--orange);}
      .object{color:white}

      .toolbar {
        display: none;
      }

      .tree .toolbar {
        display: flex;
        justify-content: space-between;
        width:100%;
      }

      .tree .item {
        /* match schema-tree.tr */
        border-bottom: 1px dotted transparent;
      }
      .toolbar-item {
        cursor: pointer;
        margin: 0 1rem !important;
        flex-shrink: 0;
      }
      .tree .toolbar .toolbar-item {
        display: none;
      }
      .inside-bracket.xxx-of {
        padding:5px 0px;
        border-style: dotted;
        border-width: 0 0 1px 0;
        border-color:var(--primary-color);
      }
      .key-descr {
        line-height: 1.7;
      }
      .schema-root-type.xxx-of {
        display:none;
      }
      .toolbar-item:first-of-type { margin:0 2px 0 0;}
      
      
      @media only screen and (min-width: 576px) {
        .key-descr {
          display: block;
        }
        .tree .toolbar .toolbar-item {
          display: block;
        }
        .toolbar {
          display: flex;
        }
      }

      .toolbar-backup {
        position: absolute;
        right:6px;
        display:flex;
        align-items: center;
      }`,
    ];
  }

  /* eslint-disable indent */
  render() {
    return html`
      <div class="json-tree tree" style="background: #393939;">
        ${this.generateTree(this.data, true)}
      </div>  
    `;
  }

    generateTree(data, isLast = false) {
    if (data === null) {
      return html`<div class="null" style="display:inline;">null</div>`;
    }
    if (typeof data === 'object' && (data instanceof Date === false)) {
      const detailType = Array.isArray(data) ? 'array' : 'pure_object';
      if (Object.keys(data).length === 0) {
        return html`${(Array.isArray(data) ? '[ ],' : '{ },')}`;
      }
      return html`
      <div class="open-bracket ${detailType === 'array' ? 'array' : 'object'} " @click="${this.toggleExpand}" > ${detailType === 'array' ? '[' : '{'}</div>
      <div class="inside-bracket-wrapper">
        <div class="inside-bracket">
          ${Object.keys(data).map((key, i, a) => html`
            <div class="item"> 
              ${detailType === 'pure_object' ? html`"${key}":` : ''}
              ${this.generateTree(data[key], i === (a.length - 1))}
            </div>`)
          }
        </div>
      </div>
      <div class="close-bracket">${detailType === 'array' ? ']' : '}'}</div>
      `;
    }

    return (typeof data === 'string' || data instanceof Date)
      ? html`<span class="${typeof data}">"${data}"</span>${isLast ? '' : ','}`
      : html`<span class="${typeof data}">${data}</span>${isLast ? '' : ','}`;
  }
}
// Register the element with the browser
if (!customElements.get('openapi-explorer')) {
  customElements.define('json-tree', JsonTree);
}
