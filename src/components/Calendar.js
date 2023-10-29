
let Holidays = require('date-holidays')
let hd = new Holidays('DE')
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
        xmlns:l="sap.ui.layout"
        xmlns:u="sap.ui.unified"
        xmlns:mvc="sap.ui.core.mvc"
        xmlns="sap.m"
        class="viewPadding">
        <l:VerticalLayout>
          <u:Calendar
              id="calendar"
              select="handleCalendarSelect" />
          <Button
              press="handleSelectToday"
              text="Select Today" />
          <l:HorizontalLayout>
            <Label
                text="Selected Date (yyyy-mm-dd):"
                class="labelMarginLeft" />
            <Text
                id="selectedDate"
                text="No Date Selected"
                class="labelMarginLeft"/>
          </l:HorizontalLayout>
        </l:VerticalLayout>
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
        'sap/ui/core/mvc/Controller'
      ], function (Controller) {
        "use strict";

        var CalendarType = sap.ui.core.CalendarType;

        return Controller.extend("ifm.calendar", {
          oFormatYyyymmdd: null,

          onInit: function() {
            console.log(hd);

            this.oFormatYyyymmdd = sap.ui.core.format.DateFormat.getInstance({pattern: "yyyy-MM-dd", calendarType: CalendarType.Gregorian});
          },
 
          handleCalendarSelect: function(oEvent) {
            var oCalendar = oEvent.getSource();
      
            this._updateText(oCalendar);
          },

          _updateText: function(oCalendar) {
            var oText = this.byId("selectedDate"),
              aSelectedDates = oCalendar.getSelectedDates(),
              oDate = aSelectedDates[0].getStartDate();
      
            oText.setText(this.oFormatYyyymmdd.format(oDate));
          },

          handleSelectToday: function() {
            var oCalendar = this.byId("calendar");
      
            oCalendar.removeAllSelectedDates();
            oCalendar.addSelectedDate(new sap.ui.unified.DateRange({startDate: sap/ui/core/date/UI5Date.getInstance}));
            this._updateText(oCalendar);
          }

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

