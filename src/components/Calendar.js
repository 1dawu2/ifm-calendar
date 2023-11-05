(function () {
  let Holidays = require('date-holidays')
  let _shadowRoot;
  let _id;
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
        <VBox alignItems="Center" justifyContent="Center">
          <u:Calendar id="calendar" startDateChange="onStartDateChange" select="handleCalendarSelect" width="100%"/>
          <VBox class="legendBox">
            <HBox alignItems="Center" justifyContent="Center">
              <Label text="Today" design="Bold"/>
              <Avatar displaySize="S" src="sap-icon://circle-task-2" displayShape="Circle"/>
            </HBox>
            <HBox alignItems="Center" justifyContent="Center">
              <Label text="Non-working Days"/>
              <Avatar displaySize="S" src="sap-icon://circle-task" displayShape="Circle"/>
            </HBox>
          </VBox>
        </VBox>
      </mvc:View>
    </script>
  `;

  class IFMCalendar extends HTMLElement {

    constructor() {
      super();

      _shadowRoot = this.attachShadow({
        mode: "open"
      });

      _shadowRoot.appendChild(tmpl.content.cloneNode(true));
      _id = createGuid();
      _shadowRoot.querySelector("#oView").id = _id + "_oView";

      this._export_settings = {};
      this._export_settings.Calendar_Country = "DE";
      this._export_settings.Calendar_Year = new Date().getFullYear();
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
      buildUI(this);
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
  }
  function createGuid() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
      let r = Math.random() * 16 | 0,
        v = c === "x" ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  function buildUI(that) {
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

          onInit: function () {
            this.oFormatYyyymmdd = sap.ui.core.format.DateFormat.getInstance({ pattern: "yyyy-MM-dd", calendarType: CalendarType.Gregorian });
            this.oFormatYyyy = sap.ui.core.format.DateFormat.getInstance({ pattern: "yyyy", calendarType: CalendarType.Gregorian });
            this._setToday();
            this._addSpecialDates();
          },

          onBeforeRendering: function () {
          },


          onAfterRendering: function () {
          },


          onExit: function () {
            this.byId("calendar").removeAllSelectedDates();
          },

          onStartDateChange: function (oEvent) {
            var oCalendar = oEvent.getSource();
            var oStartDate = oCalendar.getStartDate();
            var selectedYear = oStartDate.getFullYear();
            that._export_settings.Calendar_Year = selectedYear;
            this._addSpecialDates();
          },

          _setToday: function () {
            var oView = this.getView();
            var oCalendar = oView.byId("calendar");

            // Set the selected date to the current date
            var oCurrentDate = new Date();
            oCalendar.focusDate(oCurrentDate);
          },

          _addSpecialDates: function () {
            var oView = this.getView();
            var oCalendar = oView.byId("calendar");

            var holidayCalendar = that_.hd.getHolidays(that_._export_settings.Calendar_Yearexpor);
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

          handleCalendarSelect: function (oEvent) {
            //var oCalendar = oEvent.getSource();
            var oCalendar = this.byId("calendar");

            this._updateDate(oCalendar);
          },

          _updateDate: function (oCalendar) {
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
})();