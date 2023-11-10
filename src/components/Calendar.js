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
        xmlns:f="sap.f"
        xmlns:card="sap.f.cards"
        xmlns:layout="sap.ui.layout"
        xmlns:mvc="sap.ui.core.mvc"
        xmlns="sap.m">
        <f:Card class="sapUiMediumMargin" width="300px">
          <f:header>
            <card:Header
              title="Arrange Dates"
              subtitle="select a single calendar date"
              iconSrc="sap-icon://appointment" />
          </f:header>
          <f:content>
            <VBox alignItems="Center" justifyContent="Center">
              <u:Calendar
                id="calendar"
                visible="false"
                months="1"
                legend="legend"
                showCurrentDateButton="true"
                startDateChange="onStartDateChange"
                select="handleCalendarSelect"
                width="100%"/>
              <u:CalendarLegend id="legend"/>
            </VBox>
          </f:content> 
        </f:Card>
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
    _id = this.createGuid();
    _shadowRoot.querySelector("#oView").id = _id + "_oView";

    this._export_settings = {};
    this._export_settings.Calendar_Country = "DE";
    this._export_settings.Calendar_Visibility = "false";
    this._export_settings.list = {};
    this._export_settings.Calendar_Year = new Date().getFullYear();
    this.hd = new Holidays(this._export_settings.Calendar_Country);

  }

  onCustomWidgetBeforeUpdate(changedProperties) {
    if ("designMode" in changedProperties) {
      this._designMode = changedProperties["designMode"];
    };

    console.log('onCustomWidgetBeforeUpdate called');
    this._export_settings = { ...this._export_settings, ...changedProperties };
  }

  onCustomWidgetAfterUpdate(changedProperties) {
    console.log('onCustomWidgetAfterUpdate called');
    if ("sacDataBinding" in changedProperties) {
      this._updateData(changedProperties.sacDataBinding);
    };


    if ("list" in changedProperties) {
      this._export_settings.Calendar_Country = changedProperties["Calendar_Country"];
      this._export_settings.Calendar_Visibility = changedProperties["Calendar_Visibility"];
    };
    this.buildUI(this);
  }

  // SETTINGS
  get Calendar_Country() {
    return this._export_settings.Calendar_Country;
  }

  set Calendar_Country(value) {
    this._export_settings.Calendar_Country = value;
  }

  get Calendar_Visibility() {
    return this._export_settings.Calendar_Visibility;
  }

  set Calendar_Visibility(value) {
    this._export_settings.Calendar_Visibility = value;
  }

  static get observedAttributes() {
    return [
      "Calendar_Country",
      "Calendar_Visibility"
    ];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue != newValue) {
      this[name] = newValue;
    };
  }

  createGuid() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
      let r = Math.random() * 16 | 0,
        v = c === "x" ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  _updateData(dataBinding) {
    console.log('dataBinding:', dataBinding);
    if (!dataBinding) {
      console.error('dataBinding is undefined');
    }
    if (!dataBinding || !dataBinding.data) {
      console.error('dataBinding.data is undefined');
    }


    // Check if dataBinding and dataBinding.data are defined
    if (dataBinding && Array.isArray(dataBinding.data)) {
      // Transform the data into the correct format
      const transformedData = dataBinding.data.map(row => {
        console.log('row:', row);
        // Check if dimensions_0 and measures_0 are defined before trying to access their properties
        if (row.dimensions_0 && row.measures_0) {
          return {
            dimension: row.dimensions_0.label,
            measure: row.measures_0.raw
          };
        }
      }).filter(Boolean);  // Filter out any undefined values

      // this._renderChart(transformedData);
    } else {
      console.error('Data is not an array:', dataBinding && dataBinding.data);
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

          onInit: function () {
            this.oFormatYyyymmdd = sap.ui.core.format.DateFormat.getInstance({ pattern: "yyyy-MM-dd", calendarType: CalendarType.Gregorian });
            this.oFormatYyyy = sap.ui.core.format.DateFormat.getInstance({ pattern: "yyyy", calendarType: CalendarType.Gregorian });
            this._setToday();
            this._addSpecialDates();
            // this._addLegendItems();
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
            // this._addLegendItems();
          },

          _setToday: function () {
            var oView = this.getView();
            var oCalendar = oView.byId("calendar");

            // Set the passed list date to the current date
            // var oCurrentDate = new Date();
            var oCurrentDate = that_.list.map(item => new Date(item.id));
            oCalendar.focusDate(oCurrentDate);
          },

          _addLegendItems: function () {
            // var oView = this.getView();
            // var oCalendar = oView.byId("calendar");
            var oLegend = this.byId("legend");

            var oTodayLegendItem = new sap.ui.unified.CalendarLegendItem({
              type: sap.ui.unified.CalendarDayType.Type01,
              text: "Today"
              // color: "blue"
            });
            var oHolidayLegendItem = new sap.ui.unified.CalendarLegendItem({
              type: sap.ui.unified.CalendarDayType.Type01,
              text: "Public Holiday"
              // color: "red"
            });
            oLegend.addItem(oTodayLegendItem);
            oLegend.addItem(oHolidayLegendItem);
          },

          _addSpecialDates: function () {
            var oView = this.getView();
            var oCalendar = oView.byId("calendar");

            var holidayCalendar = that_.hd.getHolidays(that_._export_settings.Calendar_Year);
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
            var aSelectedDates = oCalendar.getSelectedDates();
            var oDate;
            if (aSelectedDates.length > 0) {
              oDate = aSelectedDates[0].getStartDate();
              if (that_.hd.isHoliday(this.oFormatYyyymmdd.format(oDate)) === true) {
                var msg = 'Please select a different date, since the current selection is a public holiday';
                sap.m.MessageBox.warning(msg);
              };
            } else {
              console.log("no holidays retrieved via API!")
            };
          },

        });
      });

      if (that_._export_settings.Calendar_Visibility === "true") {
        //### THE APP: place the XMLView somewhere into DOM ###
        var oView = sap.ui.xmlview({
          viewContent: jQuery(_shadowRoot.getElementById(_id + "_oView")).html(),
        });
        oView.placeAt(content);
        var oCalendar = oView.byId("calendar");
        oCalendar.setVisible(true);
      };



    });
  }

}