import { css } from 'lit';

export default css`
*.api-request, *.api-request:before, *.api-request:after, .api-request *, .api-request *:before, .api-request *:after { box-sizing: border-box; }

.api-request.focused-mode,
.api-request.read-mode {
  margin-top:25px;
}
.api-request .param-name,
.api-request .param-type {
  margin: 1px 0;
  line-height: var(--font-size-small);
}
.api-request .param-name {
  color: var(--fg); 
  font-family: var(--font-mono);
}
.api-request .param-name.deprecated {
  text-decoration: line-through;
}
.api-request .param-type {
  color: var(--light-fg); 
  font-family: var(--font-regular);
}
.api-request .param-constraint {
  min-width:100px;
}
.api-request .param-constraint:empty {
  display:none;
}
.api-request .top-gap{margin-top:14px;}

.api-request .textarea {
  min-height:220px; 
  padding:5px;
  resize:vertical;
}

.api-request .response-message{
  font-weight:bold;
  text-overflow: ellipsis;
}
.api-request .response-message.error {
  color:var(--red);
}
.api-request .response-message.success {
  color:var(--blue);
}

.api-request .file-input-container {
  align-items:flex-end;
}
.api-request .file-input-container .input-set:first-child .file-input-remove-btn{
  visibility:hidden;
}

.api-request .file-input-remove-btn{
  font-size:16px;
  color:var(--red);
  outline: none;
  border: none;
  background:none;
  cursor: pointer;
}

.api-request .v-tab-btn {
  font-size: var(--smal-font-size);
  height:24px; 
  border:none; 
  background:none; 
  opacity: 0.3;
  cursor: pointer;
  padding: 4px 8px;
}
.api-request .v-tab-btn.active {
  font-weight: bold;
  background: var(--bg);
  opacity: 1;
}

.api-request .border{
  border:1px solid var(--border-color);
  border-radius: var(--border-radius);
}
.api-request .light-border{
  border:1px solid var(--light-border-color);
  border-radius: var(--border-radius);
}
.api-request .pad-8-16{
  padding: 8px 16px;
}

.api-request .mar-top-8{
  margin-top: 8px;
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
  font-size: calc(var(--font-size-small));
  margin-top: 3px;
}

@media only screen and (min-width: 768px) {
  .api-request .textarea {
    padding:8px;
  }
.grey-border {
  border: 1.8px solid rgba(236,236,236,255);
  padding: 20px;
  border-radius: 4px;
 }
}

select[class="schemaSelectDropdown"]{
  border:2px solid #000;
  min-width:290px;
  max-width: 100%;
  margin-top: 10px;
  padding:10px;
  border-radius:5px;
  font-weight:700;
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

@media only screen and (max-width: 767px) {
  .mbl-styling {
    padding: 20px;
    border: 1.8px solid #ececec;
  }
}

@media only screen and (min-width: 767px) {
  .mbl-border {
    border: none !important;
    padding: 0 !important;
  }
}
`;
