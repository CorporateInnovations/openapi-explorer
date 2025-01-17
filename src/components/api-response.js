import { LitElement, html, css } from 'lit';
import { copyToClipboard } from '../utils/common-utils';
import { marked } from 'marked';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { schemaInObjectNotation, generateExample, getTypeInfo } from '../utils/schema-utils';
import { getI18nText } from '../languages';
import FontStyles from '../styles/font-styles.js';
import FlexStyles from '../styles/flex-styles';
import TableStyles from '../styles/table-styles';
import InputStyles from '../styles/input-styles';
import TabStyles from '../styles/tab-styles';
import BorderStyles from '../styles/border-styles';
import SchemaStyles from '../styles/schema-styles';
import './schema-tree';
import './schema-table';

export default class ApiResponse extends LitElement {
  
  constructor() {
    super();
    this.selectedStatus = '';
    this.headersForEachRespStatus = {};
    this.mimeResponsesForEachStatus = {};
    this.activeSchemaTab = 'model';
    this.showResponseTemplate = true;
    this.selectedResponseExample = 0;
    this.selectedResponse = 1;
  }

  static get properties() {
    return {
      callback: { type: String },
      responses: { type: Object },
      parser: { type: Object },
      includeNulls: { type: Boolean, attribute: 'display-nulls', converter(value) { return value === 'true'; } },
      schemaStyle: { type: String, attribute: 'schema-style' },
      renderStyle: { type: String, attribute: 'render-style' },
      selectedStatus: { type: String, attribute: 'selected-status' },
      selectedMimeType: { type: String, attribute: 'selected-mime-type' },
      activeSchemaTab: { type: String, attribute: 'active-schema-tab' },
      schemaExpandLevel: { type: Number, attribute: 'schema-expand-level' },
      schemaHideWriteOnly: { type: String, attribute: 'schema-hide-write-only' },
    };
  }

  static finalizeStyles() {
    return [
      SchemaStyles,
      FontStyles,
      FlexStyles,
      TabStyles,
      TableStyles,
      InputStyles,
      BorderStyles,
      css`
      .resp-head{
        vertical-align: middle;
        padding:16px 0 8px;
      }
      .resp-head.divider{
        border-top: 1px solid var(--border-color);
        margin-top:10px;
      }
      .resp-status{ 
        font-weight:bold;
        font-size:calc(var(--font-size-small) + 1px);
      }
      .resp-descr{
        font-size:calc(var(--font-size-small) + 1px);
      }
      .top-gap{margin-top:16px;}
      .example-panel{
        font-size:var(--font-size-small);
        margin:0;
      }
      .generic-tree {
        background: rgb(51, 51, 51);
        color: white;
      }
      .example-panel.generic-tree {
        margin-top: 8px;
      }
      pre.generic-tree {
        border: none;
        padding: 8px 10px 10px;
      }
      .example-panel select {
        margin-left: 8px;
        padding-top: 8px;
        min-width: 100px;
        max-width: 100%
      }
      .example-panel .example {
        padding: 0 12px;
      }
      .focused-mode,
      .read-mode {
        padding-top:24px;
        margin-top:12px;
        border-top: 1px dashed var(--border-color);
      }
      
      #schemaOptions {
        border: 2px solid black;
        margin: 10px 0;
        padding: 10px;
        border-radius: 5px; 
        font-weight: 700;
        overflow: auto;
      }

      #copy-button-primary {
        box-shadow: none;
        margin-left: auto;
        align-items: end;
        justify-content: center;
        border-radius: 17px;
        background-color: #0741c5;
        color: white;
        font-weight: 700;
        border-color: #0741c5;
        width: 65px;
        height: 26px; 
        font-size: 14px; 
        margin-top: 3px;
      }
      `,
    ];
  }

  render() {
    return html`
    <div data-selected-request-body-type="${this.selectedRequestBodyType}">
      <div class="col regular-font response-panel ${this.renderStyle}-mode" style="border: 1.8px solid rgb(236, 236, 236); padding: 20px;">
        <div class="${this.callback === 'true' ? 'tiny-title' : 'req-res-title'}" style="font-size: 20px;">
        ${this.callback === 'true' ? 'CALLBACK RESPONSE' : getI18nText('operations.response')}
        <div style="margin: 0; display:flex; float: right; color: #999999; background-color: rgb(236, 236, 236); padding: 3px 11px 3px 11px; font-size: 14px; border-radius: 30px; cursor: pointer;" @click='${(e) =>{ e.preventDefault(); this.toggleResponseTemplate()}}'}>
         ${this.showResponseTemplate ? getI18nText('schemas.collapse-desc') : getI18nText('schemas.expand-desc')}
        </div>
        </div>
        <div>
          ${this.responseTemplate()}
        </div>
      </div>
      </div>
    `;
  }
  
  toggleResponseTemplate() {
    this.showResponseTemplate = !this.showResponseTemplate;
    this.requestUpdate();
  }

  resetSelection() {
    this.selectedStatus = '';
    this.selectedMimeType = '';
  }

  /* eslint-disable indent */
  responseTemplate() {
    if (!this.responses) { return ''; }
    for (const statusCode in this.responses) {
      if (!this.selectedStatus) {
        this.selectedStatus = statusCode;
      }
      const allMimeResp = {};
      for (const mimeResp in (this.responses[statusCode] && this.responses[statusCode].content)) {
        const mimeRespObj = this.responses[statusCode].content[mimeResp];
        if (!this.selectedMimeType) {
          this.selectedMimeType = mimeResp;
        }
        // Generate Schema
        const schemaTree = schemaInObjectNotation(mimeRespObj.schema, { includeNulls: this.includeNulls });
        // Generate Example
        const respExamples = generateExample(
          (mimeRespObj.examples || ''),
          (mimeRespObj.example || ''),
          mimeRespObj.schema,
          mimeResp,
          true,
          false,
          mimeResp.includes('json') ? 'json' : 'text',
        );
        allMimeResp[mimeResp] = {
          description: this.responses[statusCode].description,
          examples: respExamples,
          selectedExample: this.selectedResponseExample,
          schemaTree,
        };
      }
      // Headers for each response status
      const tempHeaders = [];
      for (const key in this.responses[statusCode] && this.responses[statusCode].headers) {
        tempHeaders.push({ name: key, ...this.responses[statusCode].headers[key] });
      }
      this.headersForEachRespStatus[statusCode] = tempHeaders;
      this.mimeResponsesForEachStatus[statusCode] = allMimeResp;
    }

    if (this.showResponseTemplate) {
    return html`
    <div class="table-title top-gap row" id="responseTemplate" style="font-size: 16px;">
          REQUEST BODY 
          <span style="font-weight: 400; margin-left: 5px; font-family: Courier New;">${this.selectedMimeType}</span>
        </div>       
    <div class='row' style='flex-wrap:wrap'>
      ${Object.keys(this.responses).map((respStatus) => html`
        ${respStatus === '$$ref' // Swagger-Client parser creates '$$ref' object if JSON references are used to create responses - this should be ignored
          ? ''
          : html`
            <button 
              @click="${(e) => {
                this.selectedStatus = respStatus;
                if (this.responses[respStatus].content && Object.keys(this.responses[respStatus].content)[0]) {
                  this.selectedMimeType = Object.keys(this.responses[respStatus].content)[0];
                } else {
                  this.selectedMimeType = undefined;
                }
              }}"
              class="m-btn small ${this.selectedStatus === respStatus ? 'primary' : ''}"
              id="${this.selectedStatus < 250 ? 'm-btnGreen' : 'm-btnGreenNotSelected'}"
              part="btn--resp ${this.selectedStatus === respStatus ? 'btn-fill--resp' : 'btn-outline--resp'} btn-response-status"
              style="margin: 8px 4px 0 0;"> 
              ${respStatus}
            </button>`
          }`)
        }
      </div>

      ${Object.keys(this.responses).map((status) => html`
        <div style = 'display: ${status === this.selectedStatus ? 'block' : 'none'}' >
          <div style="margin: 10px 0 15px 0;">
            <span class="resp-descr m-markdown ">${unsafeHTML(marked(this.responses[status] && this.responses[status].description || ''))}</span>
            ${(this.headersForEachRespStatus[status] && this.headersForEachRespStatus[status].length > 0)
              ? html`${this.responseHeaderListTemplate(this.headersForEachRespStatus[status])}`
              : ''
            }
          </div>
          
          ${Object.keys(this.mimeResponsesForEachStatus[status]).length === 0 
            ? ''
            : html`
            <div style="display: ${this.selectedStatus == 200 ? 'block' : 'none'}"></div>
              <div class="tab-panel col" style="border-radius: 5px;">
                <div class="tab-buttons row" @click="${(e) => { if (e.target.tagName.toLowerCase() === 'button') { this.activeSchemaTab = e.target.dataset.tab; } }}">
                  <button class="tab-btn ${this.activeSchemaTab === 'model' ? 'active' : ''}" data-tab='model'>${getI18nText('operations.model')}</button>
                  <button class="tab-btn ${this.activeSchemaTab === 'example' ? 'active' : ''}" data-tab='example'>${getI18nText('operations.example')}</button>
                  <div style="flex:1"></div>
                  <span class="m-btn outline-primary" id="copy-button-primary" style="display: ${this.activeSchemaTab === 'example' ? 'flex' : 'none'};" @click="${(e) => {e.preventDefault(); copyToClipboard(JSON.stringify(this.mimeResponsesForEachStatus[status][this.selectedMimeType].examples[this.selectedResponseExample].exampleValue, null, 2), e);}}">Copy
                     </span>
                </div>
                ${this.activeSchemaTab === 'example'
                  ?
                    Object.keys(this.mimeResponsesForEachStatus[status]).includes(this.selectedMimeType) ?
                      Object.keys(this.mimeResponsesForEachStatus[status][this.selectedMimeType]).includes('examples') ?
                        this.mimeResponsesForEachStatus[status][this.selectedMimeType].examples.length > 1 ?
                          html`
                            <select id="schemaOptions" @change='${(e) => {this.onSelectExample(e); this.requestUpdate()}}'>
                              ${this.mimeResponsesForEachStatus[status][this.selectedMimeType].examples.map((responseExample, key) => {
                                return html`<option value="${key}">${responseExample["exampleSummary"]}</option>`;
                              })}
                            </select>
                            <div class='tab-content col' style='flex:1;'>
                              ${this.mimeExampleTemplate(this.mimeResponsesForEachStatus[status][this.selectedMimeType])}
                            </div>`
                        : html` <div class='tab-content col' style='flex:1;'>
                          ${this.mimeExampleTemplate(this.mimeResponsesForEachStatus[status][this.selectedMimeType])}
                        </div>`
                      : ''
                    : ''
                  : Object.keys(this.mimeResponsesForEachStatus[status]).includes(this.selectedMimeType) ?
                    html `<div class='tab-content col' style='flex:1;'>
                      ${this.mimeSchemaTemplate(this.mimeResponsesForEachStatus[status][this.selectedMimeType])}
                    </div>`
                    : ''
                }
              </div>`
          }`)
        }
    `;
      }
      return html``;
  }


  responseHeaderListTemplate(respHeaders) {
    return html`
      <div style="padding:16px 0 8px 0" class="resp-headers small-font-size bold-text">${getI18nText('operations.response-headers')}</div> 
      <table role="presentation" style="border-collapse: collapse; margin-bottom:16px; border:1px solid var(--border-color); border-radius: var(--border-radius)"
        class="small-font-size mono-font">
        ${respHeaders.map((v) => {
          const typeData = getTypeInfo(v.schema);
          return html`
            <tr>
              <td style="padding:8px; vertical-align: baseline; min-width:160px; border-top: 1px solid var(--light-border-color); text-overflow: ellipsis;">
                ${v.name || ''}
              </td> 
              <td class="${typeData?.cssType || ''}"
                style="padding:4px; vertical-align: baseline; min-width: 100px; padding:0 5px; border-top: 1px solid var(--light-border-color); text-overflow: ellipsis;">
                ${typeData?.format || typeData?.type || ''}
              </td> 
              <td style="padding:8px; vertical-align: baseline; border-top: 1px solid var(--light-border-color);text-overflow: ellipsis;">
                <div class="m-markdown-small regular-font" >${unsafeHTML(marked(v.description || ''))}</div>
              </td>
              <td style="padding:8px; vertical-align: baseline; border-top: 1px solid var(--light-border-color); text-overflow: ellipsis;">
                ${typeData?.example || ''}
              </td>
            </tr>
          `;
        })}
    </table>`;
  }

  modelExamplesDropdown(schemaOptionKey ,obj) {
    if(this.selectedResponse.length <= 0){
      this.selectedResponse = schemaOptionKey.split('~')[1];
    }
    return html`<option value="${schemaOptionKey.split('~')[1]}">${obj['::description']}</option>`;
  }
  
  mimeTypeDropdownTemplate(mimeTypes) {
    return html`
      <select aria-label='mime type' @change="${(e) => { this.selectedMimeType = e.target.value; }}" style='margin-bottom: -1px; z-index:1'>
        ${mimeTypes.map((mimeType) => html`<option value='${mimeType}' ?selected = '${mimeType === this.selectedMimeType}'> ${mimeType} </option>`)}
      </select>`;
  }

  onSelectExample(e) {   
    const exampleContainerEl = e.target.closest('.response-panel').querySelector('.example-panel');
    const exampleEls = [...exampleContainerEl.querySelectorAll('.example')];
    this.selectedResponseExample = e.target.value;
    exampleEls.forEach((v) => {
      v.style.display = v.dataset.example === e.target.value ? 'block' : 'none';
    });
  }

  mimeExampleTemplate(mimeRespDetails) {
    mimeRespDetails.selectedExample = this.selectedResponseExample;
    mimeRespDetails.examples.map((mimeResponse) => {
      if (mimeResponse["exampleSummary"] === this.selectedResponse){
        return mimeResponse["exampleValue"]
      } else {
        return 
      }
    })

    if (!mimeRespDetails) {
      return html`
        <pre style='color:var(--red)' class = 'example-panel border-top'> No example provided </pre>
      `;
    }
    return html`
      ${mimeRespDetails.examples.length === 1
        ? html`
          ${mimeRespDetails.examples[0].exampleSummary && mimeRespDetails.examples[0].exampleSummary.length > 80 ? html`<div style="padding: 4px 0"> ${mimeRespDetails.examples[0].exampleSummary} </div>` : ''}
          ${mimeRespDetails.examples[0].exampleDescription ? html`<div class="m-markdown-small" style="padding: 4px 0;"> ${unsafeHTML(marked(mimeRespDetails.examples[0].exampleDescription || ''))} </div>` : ''}
          ${mimeRespDetails.examples[0].exampleFormat === 'json'
            ? html`
              <json-tree 
                render-style = '${this.renderStyle}'
                .data="${mimeRespDetails.examples[0].exampleValue}"
                class = 'example-panel pad-top-8'
                style="background-color: #393939;"
              ></json-tree>`
            : html`
              <pre style="white-space: pre-wrap; line-break: anywhere;" class = 'example-panel generic-tree border-top pad-top-8'>${mimeRespDetails.examples[0].exampleValue}</pre>
            `
          }`
        : html`
          <span class = 'example-panel generic-tree ${this.renderStyle === 'read' ? 'border pad-8-16' : 'border-top pad-top-8'}' style="border-top: none; margin-top: 0;">
          ${mimeRespDetails.examples.length -1 >= mimeRespDetails.selectedExample ?
            mimeRespDetails.examples.map((v) =>
             html`
              <div class="example" data-example = '${v.exampleId}' style = "display: ${v.exampleId === mimeRespDetails.examples[mimeRespDetails.selectedExample].exampleId ? 'block' : 'none'}">
                ${v.exampleFormat === 'json'
                  ? html`
                    <json-tree
                      render-style = '${this.renderStyle}'
                      .data = '${v.exampleValue}'
                    ></json-tree>`
                  : html`<pre class="generic-tree">${v.exampleValue}</pre>`
                }
              </div>`)
              : html`<pre class="generic-tree">No Example</pre>`}
          </span>  
        `
      }
    `;
  }

  mimeSchemaTemplate(mimeRespDetails) {
    if (!mimeRespDetails) {
      return html`
        <pre style='color:var(--red)' class = '${this.renderStyle === 'read' ? 'border pad-8-16' : 'border-top'}'> Schema not found</pre>
      `;
    }

    return html`
      ${this.schemaStyle === 'table'
        ? html`
          <schema-table
            render-style = '${this.renderStyle}'
            .data = '${mimeRespDetails.schemaTree}'
            class = 'example-panel ${this.renderStyle === 'read' ? 'border pad-8-16' : 'border-top pad-top-8'}'
            schema-expand-level = "${this.schemaExpandLevel}"
            schema-hide-read-only = false
            schema-hide-write-only = ${this.schemaHideWriteOnly}
          > </schema-table> `
        : html`
          <schema-tree
            render-style = '${this.renderStyle}'
            .data = '${mimeRespDetails.schemaTree}'
            selected-request = "${"Selected Resonse:", this.selectedResponse}"
            class = 'example-panel ${this.renderStyle === 'read' ? 'border pad-8-16' : 'pad-top-8'}'
            schema-expand-level = "${this.schemaExpandLevel}"
            schema-hide-read-only = false
            schema-hide-write-only = ${this.schemaHideWriteOnly}
          > </schema-tree>`
      }`;
  }
  /* eslint-enable indent */
}

// Register the element with the browser
if (!customElements.get('openapi-explorer')) {
  customElements.define('api-response', ApiResponse);
}
