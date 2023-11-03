import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { marked } from 'marked';
import { getI18nText } from '../languages';
import { downloadFile } from '../utils/common-utils';

/* eslint-disable indent */
export default function overviewTemplate() {
  return html`
    <section id="overview" part="section-overview"
      class="observe-me ${this.renderStyle === 'focused' ? 'section-gap--focused-mode' : 'section-gap'}">
      <img class="overview-bg-img" src="/images/eun-bg.png">
      ${this.resolvedSpec && this.resolvedSpec.info
        ? html`
          <slot name="overview">
            <div id="api-title" part="label-overview-title" class="section-padding">
              ${this.resolvedSpec.info.title}
              ${!this.resolvedSpec.info.version ? '' : html`
                <span style = 'color: black; font-size:var(--font-size-small);font-weight:bold'>
                  version ${this.resolvedSpec.info.version}
                </span>`
              }
            </div>
            <div id="api-info" style="font-size:calc(var(--font-size-regular) - 1px); margin-top:8px;" class="section-padding">
              ${this.resolvedSpec.info.contact && this.resolvedSpec.info.contact.email
                ? html`<span>${this.resolvedSpec.info.contact.name || getI18nText('overview.email')}: 
                  <a href="mailto:${this.resolvedSpec.info.contact.email}" part="anchor anchor-overview">${this.resolvedSpec.info.contact.email}</a>
                </span>`
                : ''
              }
              ${this.resolvedSpec.info.contact && this.resolvedSpec.info.contact.url
                ? html`<span>URL: <a href="${this.resolvedSpec.info.contact.url}" part="anchor anchor-overview">${this.resolvedSpec.info.contact.url}</a></span>`
                : ''
              }
              ${this.resolvedSpec.info.license
                ? html`<span>License: 
                  ${this.resolvedSpec.info.license.url
                  ? html`<a href="${this.resolvedSpec.info.license.url}" part="anchor anchor-overview">${this.resolvedSpec.info.license.name}</a>`
                  : this.resolvedSpec.info.license.name
                } </span>`
                : ''
              }
              ${this.resolvedSpec.info.termsOfService
                ? html`<span><a href="${this.resolvedSpec.info.termsOfService}" part="anchor anchor-overview">${getI18nText('overview.terms-of-service')}</a></span>`
                : ''
              }
            </div>
          </slot>
          <slot name="overview-api-description"; style="color: black;">
            <p>Connected is ready to help euNetworks customers move to an automated system-to-system integration. Making it easier to rapidly expand your network, get quotes and pricing, order bandwidth and manage network services.</p>
            <p><a href="/contact" id="contactUsOverview" style="color: rgb(8, 79, 240);">contact us</a> if you’re not yet a customer and would like access to our powerful bandwidth infrastructure products.</p>
            <div style="display: flex;">
              <button class="buttons"; style="margin-right: 20px;"><a href="/contact" style=" color: white;">contact us</a></button>
              <button class="buttons"; @click="${(e)=>{e.preventDefault; downloadFile(JSON.stringify(this.apiObject), 'application/json', 'OpenAPI Specification')}}">download OpenAPI specification</button>
            </div>
          </slot>
        `
        : ''
      }
    </section>
  `;
}
/* eslint-enable indent */
