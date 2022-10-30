import { html } from 'lit';
import { marked } from 'marked';
import { componentIsInSearch, pathIsInSearch } from '../utils/common-utils';
import { getI18nText } from '../languages';

function onExpandCollapse(tagId) {
  const tag = this.resolvedSpec.tags.find(t => t.elementId === tagId);
  if (!tag) {
    return;
  }
  tag.expanded = !tag.expanded;
  if (tag.expanded && this.operationsCollapsed) {
    this.resolvedSpec.tags.filter(t => t.elementId !== tagId).forEach(t => t.expanded = false);
  }
  this.requestUpdate();
}

export function expandCollapseAll() {
  const expand = this.operationsCollapsed;
  this.operationsCollapsed = !expand;
  this.resolvedSpec.tags.forEach((tag) => { tag.expanded = expand; });
  this.requestUpdate();
}

export function expandCollapseAllComponents() {
  const expand = this.componentsCollapsed;
  this.componentsCollapsed = !expand;
  this.resolvedSpec.components.forEach((component) => { component.expanded = expand; });
  this.requestUpdate();
}

/* eslint-disable indent */
export default function navbarTemplate() {
  return html`
  <nav class='nav-bar ${this.renderStyle}' part="section-navbar">
    <slot name="nav-header"></slot>
    ${(this.allowSearch === 'false' && this.allowAdvancedSearch === 'false')
      ? ''
      : html`
        <div style="display:flex; flex-direction:row; justify-content:center; align-items:center; padding:24px; ${this.allowAdvancedSearch === 'false' ? 'border-bottom: 1px solid var(--nav-hover-bg-color)' : ''}">
          ${this.allowSearch === 'false'
            ? ''
            : html`
              <div style="display:flex; flex:1; line-height:22px;">
                <input id="nav-bar-search" 
                  part = "textbox textbox-nav-filter"
                  style = "width:100%; padding-right:20px; color:var(--nav-hover-text-color); border-color:var(--secondary-color); background-color:var(--nav-hover-bg-color)" 
                  type = "text"
                  placeholder = "${getI18nText('menu.filter')}"
                  @change = "${this.onSearchChange}"  
                  spellcheck = "false" 
                >
                <div style="margin: 6px 5px 0 -24px; font-size:var(--font-size-regular); cursor: pointer;">&#x21a9;</div>
              </div>  
              ${this.matchPaths
                ? html`
                  <div @click = '${this.onClearSearch}' style='margin-left:5px; cursor: pointer; align-self:center; color:var(--nav-text-color)' class='small-font-size primary-text bold-text'> CLEAR </div>`
                : ''
              }
            `
          }
          ${this.allowAdvancedSearch === 'false' || this.matchPaths
            ? ''
            : html`
              <button class="m-btn primary" part="btn btn-fill btn-search" style="margin-left:5px;" @click="${this.onShowSearchModalClicked}">
                ${getI18nText('menu.search')}
              </button>
            `
          }
        </div>
      `
    }
    ${html`<nav class='nav-scroll' part="navbar-scroll">
      ${(this.showInfo === 'false' || !this.resolvedSpec.info)
        ? ''
        : html`<div class='nav-bar-info'  id='link-overview' data-content-id='overview' @click = '${(e) => this.scrollToEventTarget(e, false)}'>
          ${this.isV1 && this.resolvedSpec.info.title || getI18nText('menu.overview')}
        </div>`
      }
    
      ${this.allowServerSelection === 'false'
        ? ''
        : html`<div class='nav-bar-info' id='link-servers' data-content-id='servers' @click = '${(e) => this.scrollToEventTarget(e, false)}'> ${getI18nText('menu.api-servers')} </div>`
      }
      ${(this.allowAuthentication === 'false' || !this.resolvedSpec.securitySchemes)
        ? ''
        : html`<div class='nav-bar-info' id='link-auth' data-content-id='auth' @click = '${(e) => this.scrollToEventTarget(e, false)}'> ${getI18nText('menu.authentication')} </div>`
      }

      <slot name="nav-section" class="custom-nav-section" data-content-id='section' @click = '${(e) => this.scrollToCustomNavSectionTarget(e, false)}'></slot>

      <div class="sticky-scroll-element">
        <div class='nav-bar-section' part="navbar-operations-header">
          <slot name="operations-header">
            <div class='nav-bar-section-title'>${getI18nText('menu.operations')}</div>  
          </slot>
          <div style="" part="navbar-operations-header-collapse">
            ${this.resolvedSpec.tags.length > 1 && this.resolvedSpec.tags.some((tag) => tag.paths.some((path) => pathIsInSearch(this.matchPaths, path)))
              ? html`
                <div @click="${() => { expandCollapseAll.call(this); }}"
                    style="font-size: 16px; transform: rotate(${this.operationsCollapsed ? '-90deg' : '0deg'}); cursor: pointer; transition: transform 0.1s ease;">▾</div>`
              : ''
            }  
          </div>
        </div>
      </div>

      <!-- TAGS AND PATHS-->
      ${this.resolvedSpec.tags
        .filter((tag) => tag.paths.some((path) => pathIsInSearch(this.matchPaths, path)))
        .map((tag) => html`
          <slot name="nav-${tag.elementId}">
            <div class='nav-bar-tag-and-paths ${tag.expanded ? '' : 'collapsed'}'>
              ${tag.name === 'General ⦂'
                ? html``
                : html`
                  <div  class='nav-bar-tag' id="link-${tag.elementId}" data-content-id='${tag.elementId}'
                    @click='${() => { onExpandCollapse.call(this, tag.elementId); }}'>

                    <div style="display: flex; justify-content: space-between; width: 100%;">
                      <div>${tag.name}</div>
                      <div class="nav-bar-tag-icon">▾</div>
                    </div>
                  </div>
                `
              }

              <div class="nav-bar-section-wrapper">
                <div>
                  ${tag.headers.map((header) => html`
                    <div 
                      class='nav-bar-h${header.depth}' 
                      id="link-${tag.elementId}--${new marked.Slugger().slug(header.text)}"  
                      data-content-id='${tag.elementId}--${new marked.Slugger().slug(header.text)}' 
                      @click='${(e) => this.scrollToEventTarget(e, false)}'>
                      ${header.text}
                    </div>`
                  )}
                </div>
                <div class='nav-bar-paths-under-tag'>
                  <!-- Paths in each tag (endpoints) -->
                  ${tag.paths.filter((v) => pathIsInSearch(this.matchPaths, v)).map((p) => html`
                  <div class='nav-bar-path ${this.usePathInNavBar === 'true' ? 'small-font' : ''}'
                    data-content-id='${p.elementId}' id='link-${p.elementId}' @click = '${(e) => { this.scrollToEventTarget(e, false); }}'>
                    <span style="${p.deprecated ? 'filter:opacity(0.5)' : ''}">
                      ${this.usePathInNavBar === 'true'
                        ? html`<div class='mono-font' style="display: flex;">
                            <div style="min-width: 1rem; margin-right: .5rem; flex-shrink: 0;">${p.method.toUpperCase()}</div>
                            <div style="display: flex; flex-wrap: wrap;">${p.path.split('/').filter(t => t.trim()).map(t => html`<span>/${t}</span>`)}</div>
                          </div>`
                        : p.summary || p.shortSummary
                      }
                      ${p.isWebhook ? '(Webhook)' : ''}
                    </span>
                  </div>`)}
                </div>
              </div>
            </div>
          </slot>
        `)
      }

      <!-- COMPONENTS -->
      ${this.resolvedSpec.components?.length && !this.hideComponents
        ? html`
          <div class="sticky-scroll-element">
            <div id='link-components' class='nav-bar-section'>
              <slot name="components-header">
                <div class='nav-bar-section-title'>${getI18nText('menu.components')}</div>
              </slot>
              
              ${this.resolvedSpec.components.some((c) => c.subComponents.some(s => componentIsInSearch(this.matchPaths, s)))
                ? html`
                  <div style="" part="navbar-components-header-collapse">
                    <div @click="${() => { expandCollapseAllComponents.call(this); }}"
                    style="font-size: 16px; transform: rotate(${this.componentsCollapsed ? '-90deg' : '0deg'}); cursor: pointer; transition: transform 0.1s ease;">▾</div>`
                : ''}
              </div>
            </div>
          </div>

          ${this.resolvedSpec.components.filter((c) => c.subComponents.some(s => componentIsInSearch(this.matchPaths, s))).map((component) => html`
            <div class="nav-bar-tag-and-paths ${component.expanded ? '' : 'collapsed'}">
              <div class='nav-bar-tag'
                data-content-id='cmp--${component.name.toLowerCase()}' 
                id='link-cmp--${component.name.toLowerCase()}' 
                @click='${(e) => this.scrollToEventTarget(e, false)}'>
                ${component.name}
              </div>

              <div class="nav-bar-section-wrapper">
                <div class="nav-bar-paths-under-tag">
                  ${component.subComponents.filter(s => componentIsInSearch(this.matchPaths, s)).map((p) => html`
                    <div class='nav-bar-path' data-content-id='cmp--${p.id}' id='link-cmp--${p.id}' @click='${(e) => this.scrollToEventTarget(e, false)}'>
                      <span> ${p.name} </span>
                    </div>`
                  )}
                </div>
              </div>
            </div>`
          )}`
        : ''
      }
    </nav>`
  }
</nav>
`;
}
/* eslint-enable indent */
