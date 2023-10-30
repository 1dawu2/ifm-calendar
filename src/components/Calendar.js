
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
        xmlns:m="sap.m">
        <m:VBox>
            <u:Calendar
              id="calendar"
              months="2"
              select="handleCalendarSelect" />
            <m:Button
              press="onBtnPress"
              text="Select Today"
              class="sapUiSmallMarginEnd" />
            <m:Text
                id="selectedDate"
                text="No Date Selected"/>
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
    this._export_settings.Calendar_Country = "DE";
    this.hd = new Holidays(this._export_settings.Calendar_Country);
    console.log(this.hd);

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
          },
 
          onBeforeRendering: function() {
          },
        
        
          onAfterRendering: function() {        
          },
        
        
          onExit: function() {        
          },

          handleCalendarSelect: function(oEvent) {
            //var oCalendar = oEvent.getSource();
            var oCalendar = this.byId("calendar");
      
            this._updateText(oCalendar);
          },

          _initCalendar: function() {            
          },

          _updateText: function(oCalendar) {
            var oText = this.byId("selectedDate");
            var aSelectedDates = oCalendar.getSelectedDates();
            var oDate;
            if (aSelectedDates.length > 0) {
              oDate = aSelectedDates[0].getStartDate();
              oText.setText(this.oFormatYyyymmdd.format(oDate));
              if (that_.hd.isHoliday(this.oFormatYyyymmdd.format(oDate)) === false) {
                console.log('check if holidy: selected day is not a public holiday');
              } else {
                console.log('check if holiday: selected day is a public holiday');
              };
            } else {
              oText.setValue("No Date Selected");
            };
          },

          onBtnPress: function() {
            var oCalendar = this.byId("calendar");
      
            oCalendar.removeAllSelectedDates();
            oCalendar.addSelectedDate(new sap.ui.unified.DateRange({startDate: sap.ui.core.format.DateFormat.getDateInstance()}));
            this._updateText(oCalendar);
            oCalendar.focusDate(new Date());
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

