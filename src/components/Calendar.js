
let Holidays = require('date-holidays')
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
        <l:VerticalLayout class="sapUiContentPadding">
          <u:Calendar
              id="calendar"
              months="2"
              select="handleCalendarSelect" />
          <l:HorizontalLayout allowWrapping="true">
            <Button
              press="handleSelectToday"
              text="Select Today"
              class="sapUiSmallMarginEnd" />
            <Label
                text="Selected Date (yyyy-mm-dd):"
                class="sapUiSmallMarginEnd" />
            <Text
                id="selectedDate"
                text="No Date Selected"/>
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
    this._export_settings.Calendar_Country = "DE";

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
          oFormatYyyy: null,

          onInit: function() {          
            this.oFormatYyyymmdd = sap.ui.core.format.DateFormat.getInstance({pattern: "yyyy-MM-dd", calendarType: CalendarType.Gregorian});
            this.oFormatYyyy = sap.ui.core.format.DateFormat.getInstance({pattern: "yyyy", calendarType: CalendarType.Gregorian});
            //this._initCalendar();
            //console.log("init calendar:");
          },
 
          handleCalendarSelect: function(oEvent) {
            var oCalendar = oEvent.getSource();
      
            this._updateText(oCalendar);
          },

          _initCalendar: function() {
            var hd = new Holidays(that_._export_settings.Calendar_Country)
            var oCalendar = this.byId("calendar");
            console.log("Calendar:");
            console.log(oCalendar);
            aSelectedDates = oCalendar.getSelectedDates(),
            oDate = aSelectedDates[0].getStartDate();
            hd.getHolidays(this.oFormatYyyy.format(oDate));
            console.log(hd);
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
            oCalendar.addSelectedDate(new sap.ui.unified.DateRange({startDate: sap.ui.core.date.UniversalDate.getInstance()}));
            this._updateText(oCalendar);
            this._initCalendar();
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

