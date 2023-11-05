let Holidays = require('date-holidays')
let _shadowRoot;
let tmpl = document.createElement("template");
tmpl.innerHTML = `
  <div id="ifm_calendar" name="ifm_calendar">
    <slot name="content"></slot>
  </div>
    <script id="oView" name="oView" type="sapui5/xmlview">
      <mvc:View
        controllerName="ifm.calendar"
        xmlns:u="sap.ui.unified"
        xmlns:layout="sap.ui.layout"
        xmlns:mvc="sap.ui.core.mvc"
        xmlns="sap.m">
        <layout:Grid defaultSpan="XL2 L2 M3 S12" class="sapUiSmallMargin">
          <layout:content>
            <u:Calendar id="calendar" startDateChange="onStartDateChange" select="handleCalendarSelect" legend="legend" width="100%"/>
            <u:CalendarLegend id="legend" standardItems="Today"/>
          </layout:content>          
        </layout:Grid>
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

  }

  onCustomWidgetBeforeUpdate(changedProperties) {
    if ("designMode" in changedProperties) {
      this._designMode = changedProperties["designMode"];
    }
  }

  onCustomWidgetAfterUpdate(changedProperties) {
    if ("list" in changedProperties) {
      this._export_settings.Calendar_Country = changedProperties["Calendar_Country"];
    }
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
    };
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
            this._setToday();
            this._addSpecialDates();
          },
 
          onBeforeRendering: function() {
          },
        
        
          onAfterRendering: function() {        
          },
        
        
          onExit: function() {        
            this.byId("calendar").removeAllSelectedDates();
          },

          onStartDateChange: function (oEvent) {
            var oCalendar = oEvent.getSource();
            var oStartDate = oCalendar.getStartDate();
            var selectedYear = oStartDate.getFullYear();
      
            console.log("Selected year: " + selectedYear);
            // Do something with the selected year value
          },

          _setToday: function() {
            var oView = this.getView();
            var oCalendar = oView.byId("calendar");
            
            // Set the selected date to the current date
            var oCurrentDate = new Date();
            oCalendar.focusDate(oCurrentDate);
          },

          _addSpecialDates: function() {
            var oView = this.getView();
            var oCalendar = oView.byId("calendar");
      
            var holidayCalendar = that_.hd.getHolidays(2024);
            console.log("holiday calendar 2023");
            console.log(holidayCalendar);            
      
            var aSpecialDates = holidayCalendar.map(function (holiday) {
              return {
                date: new Date(holiday.date),
                type: sap.ui.unified.CalendarDayType.Type01,
                description: holiday.name
              };
            });
      
            aSpecialDates.forEach(function (specialDate) {
              var oDateRange = new sap.ui.unified.DateTypeRange({
                startDate: specialDate.date,
                type: specialDate.type,
                tooltip: specialDate.description
              });
              oCalendar.addSpecialDate(oDateRange);
            });
          },        

          handleCalendarSelect: function(oEvent) {
            //var oCalendar = oEvent.getSource();
            var oCalendar = this.byId("calendar");
      
            this._updateDate(oCalendar);
          },

          _updateDate: function(oCalendar) {
            var oText = this.byId("selectedDate");
            var aSelectedDates = oCalendar.getSelectedDates();
            var oDate;
            if (aSelectedDates.length > 0) {
              oDate = aSelectedDates[0].getStartDate();
              if (that_.hd.isHoliday(this.oFormatYyyymmdd.format(oDate)) === false) {
                console.log('check if holidAy: selected day is not a public holiday');
              } else {
                console.log('check if holiday: selected day is a public holiday');

              };
            } else {
              console.log("no holidays retrieved via API!")
            };
          },

          // onBtnPress: function() {
          //   var oCalendar = this.byId("calendar");
      
          //   oCalendar.removeAllSelectedDates();
          //   oCalendar.addSelectedDate(new sap.ui.unified.DateRange({startDate: sap.ui.core.format.DateFormat.getDateInstance()}));
          //   this._updateDate(oCalendar);
          //   oCalendar.focusDate(new Date());
          // }

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

