import { css } from 'lit';

export default css`

*, *:before, *:after { box-sizing: border-box; }

.tr {
  display: flex;
  flex: none;
  box-sizing: content-box;
}

.td {
  display: block;
  flex: 0 0 auto;
}
.key {
  font-family: var(--font-mono);
  white-space: normal;
  word-break: break-all;
  color: black;
}

.key-descr {
  font-family:var(--font-regular);
  flex-shrink: 1;
  text-overflow: ellipsis;
  overflow: hidden;
  display: none;
  max-height: auto;
}

.tr > div > .key-label{
  font-size: calc(var(--font-size-small) + 1px);
}

.toolbar {
  display: none;
}

.xxx-of-key {
  font-size: calc(var(--font-size-small) - 2px); 
  font-weight:bold; 
  background-color:var(--primary-color); 
  color: var(--primary-btn-text-color);
  border-radius:2px;
  line-height:calc(var(--font-size-small) + 6px);
  padding:0px 5px; 
  margin-bottom:1px; 
  display:inline-block;
}

.xxx-of-descr {
    font-family: var(--font-regular);
    font-size: calc(var(--font-size-small) - 1px);
    margin-left: 2px;
}

.stri, .string, .uri, .url, .byte, .bina, .binary, .date, .datetime, .date-time, .pass, .password, .ipv4, .ipv4, .uuid, .emai, .email, .host, .hostname { color: #716f6f; }
.inte, .numb, .int6, .int64, .int3, .int32, .floa, .float, .doub, .double, .deci, .decimal, .blue { color:var(--blue); }
.null { color:var(--red); }
.bool, .boolean { color:var(--orange); }
.cons, .const { color:var(--yellow); }

.tree .toolbar {
  display: flex;
  justify-content: space-between;
}

.toolbar {
  width:100%;
}
.toolbar-item {
  cursor: pointer;
  padding: 5px 0 5px 1rem;
  margin: 0 1rem !important;
 
  flex-shrink: 0;
}
.tree .toolbar .toolbar-item {
  display: none;
}
.schema-root-type {
  cursor:auto;
  color:var(--fg2);
  font-weight: bold;
  text-transform: uppercase;
}
.schema-root-type.xxx-of {
  display:none;
}
.toolbar-item:first-of-type { margin:0 2px 0 0;}

.underline {
  padding: 10px 0;
  border-bottom: 1px solid #e2e2e2;
}

.underline:last-of-type {
  border-bottom: none;
}

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

.technicalWords {
  border-radius: 4px;
  background-color: rgb(245, 247, 250);
  color: rgb(51, 51, 51);
  padding: 0px 3px;
  border: 1px solid rgb(228, 231, 235);
  display: inline-flex;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  font-size: var(--font-size-small);
}

@media only screen and (min-width: 1595px) {

.schemaDescriptions {
  display:inline-block;
  line-break:anywhere;
  margin-right:8px;
  display: contents;
  align-items: center;
}
`;
