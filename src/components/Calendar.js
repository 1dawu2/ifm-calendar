
let Holidays = require('date-holidays')
let hd = new Holidays()
let _shadowRoot;
let tmpl = document.createElement("template");
tmpl.innerHTML = `
    <style>
    </style>
    <div id="ifm_calendar" name="ifm_calendar">
      <slot name="content"></slot>
    </div>
    <script id="oView" name="oView" type="sapui5/xmlview">
      <mvc:View
        controllerName="ifm.calendar"
        xmlns:core="sap.ui.core"
        xmlns:m="sap.m"
        xmlns:mvc="sap.ui.core.mvc">
        <m:VBox>        
          <m:FlexBox
            height="100%">

          </m:FlexBox>
        </m:VBox>
      </mvc:View>
    </script>
  `;

export default class IFMCalendar extends HTMLElement {

  constructor() {
    super();

    _shadowRoot = this.attachShadow({
      mode: "open"
    });

    _shadowRoot.appendChild(tmpl.content.cloneNode(true));

    this._export_settings = {};
    this._export_settings.Calendar_Country = "";

  }

  onCustomWidgetResize(width, height) {
  }

  connectedCallback() {
  }

  disconnectedCallback() {
  }

  onCustomWidgetBeforeUpdate(changedProperties) {
  }

  onCustomWidgetAfterUpdate(changedProperties) {
    this.buildUI(this);
  }

  // SETTINGS
   get Calendar_Country() {
    return this._export_settings.Calendar_Country;
  }
  set Calendar_Country(value) {
    this._export_settings.Calendar_Country = value;
  }

  static get observedAttributes() {
    return [
      "Calendar_Country",
    ];
  }

  async initCalendar(that) {
    var that_ = that;
    
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue != newValue) {
      this[name] = newValue;
    }
  }

  buildUI(that) {
    var that_ = that;

    let content = document.createElement('div');
    content.slot = "content";
    that_.appendChild(content);

    sap.ui.getCore().attachInit(function () {
      "use strict";

      //### Controller ###
      sap.ui.define([
        "jquery.sap.global",
        "sap/f/Card",
        "sap/ui/core/mvc/Controller"
      ], function (jQuery, Controller) {
        "use strict";

        return Controller.extend("ifm.calendar", {

          onInit: function (oEvent) {
          },

          onPress: function (oEvent) {
            const authURL = encodeURI(`${that_._export_settings.DSP_oAuthURL}?response_type=code&client_id=${that_._export_settings.DSP_clientID}`);
            var sFrame = `<iframe id='authorizationFrame' src='${authURL}' style='width: 600px; height: 600px;'></iframe>`;
            var ui5Frame = new sap.ui.core.HTML({
              content: [sFrame]
            });

            var ui5Card = new sap.f.Card({
              content: [ui5Frame]
            });

            var ui5ScrollContainer = new sap.m.ScrollContainer({
              height: "600px",
              width: "600px",
              content: [ui5Card]
            });

            var ui5Dialog = new sap.m.Dialog({
              title: "Authorization Code",
              content: [ui5ScrollContainer],
              beginButton: new sap.m.Button({
                text: "OK",
                press: function () {
                  ui5Dialog.close();
                }.bind(this)
              }),
              afterClose: function () {
                ui5Dialog.destroyContent();
              }
            });

            ui5Dialog.open();

          },
        });
      });

      //### THE APP: place the XMLView somewhere into DOM ###
      var oView = sap.ui.xmlview({
        viewContent: jQuery(_shadowRoot.getElementById("oView")).html(),
      });
      oView.placeAt(content);

    });
  }
}

