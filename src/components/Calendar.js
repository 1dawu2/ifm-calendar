
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
        xmlns="sap.m">
        <l:VerticalLayout width="100%">
          <l:content>
            <u:Calendar id="calendar" width="100%"/>
          </l:content>
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
    this.hd = new Holidays(this._export_settings.Calendar_Country);

  }

  onCustomWidgetResize(width, height) {
  }

  connectedCallback() {
  }

  disconnectedCallback() {
  }

  onCustomWidgetBeforeUpdate(changedProperties) {
    // if ("designMode" in changedProperties) {
    //   this._designMode = changedProperties["designMode"];
    // };
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
            this._addSpecialDates();
          },
 
          onBeforeRendering: function() {
          },
        
        
          onAfterRendering: function() {        
          },
        
        
          onExit: function() {        
          },

          _addSpecialDates: function() {
            var oView = this.getView();
            var oCalendar = oView.byId("calendar");
      
            var holidayCalendar = that_.hd.getHolidays();
            console.log("holiday calendar 2023");
            console.log(holidayCalendar);            
      
            var aSpecialDates = holidayCalendar.map(function (holiday) {
              return {
                date: new Date(holiday.date),
                type: sap.ui.unified.CalendarDayType.Type01
              };
            });
      
            aSpecialDates.forEach(function (specialDate) {
              var oDateRange = new sap.ui.unified.DateTypeRange({
                startDate: specialDate.date,
                type: specialDate.type
              });
              oCalendar.addSpecialDate(oDateRange);
            });
          },

          handleShowSpecialDays: function(oEvent) {
            var oCal = this.byId("calendar"),
              oLeg = this.byId("calendarHolidays"),
              bPressed = oEvent.getParameter("pressed");
      
            if (bPressed) {
              oRefDate = UI5Date.getInstance();
              for (var i = 1; i <= 10; i++) {
                var sType = "";
                if (i < 10) {
                  sType = "Type0" + i;
                } else {
                  sType = "Type" + i;
                }
                oLeg.addItem(new CalendarLegendItem({
                  type: sType,
                  text : "Placeholder " + i
                }));
              };      
            } else {
              oCal.destroySpecialDates();
              oLeg.destroyItems();
            }
          },

          handleCalendarSelect: function(oEvent) {
            //var oCalendar = oEvent.getSource();
            var oCalendar = this.byId("calendar");
      
            this._updateText(oCalendar);
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

