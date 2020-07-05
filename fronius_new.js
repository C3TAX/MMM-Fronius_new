"use strict";

Module.register("MMM-fronius", {

    firstUpdate: true,
    result: {},
    defaults: {
    prettyName: true,
    stripName: true,
    title: "PV Anlage",
    url: "", // Deprecated
    urls: [], // Added as a new parameter to maintain backwards compatibility
    ipaddfr: [],  //Inverter Ip Address from Config


    updateInterval: 100, //50 standart
    singleLine: false,
    values: [
        'Body.Data.Inverters.1.P',  //Solar output from Json
        'Body.Data.Site.P_Grid', //Grid Draw from Json
        'Body.Data.Site.P_Load',  //Total load from Json
        'Body.Data.Inverters.1.E_Day', // Tages Ertrag
        'Body.Data.Inverters.1.E_Total', // Gesamt Ertrag
        'Body.Data.Site.rel_Autonomy', // Autonomie %
        ],
    //Give everything Pretty names that make sense
    replaceName: [
                ["P", "Aktuell&nbsp;:&nbsp;&nbsp; "],
                ["P_Grid", "Einspeisen&nbsp;:&nbsp;&nbsp; "],
                ["P_Load", "Verbrauch&nbsp;:&nbsp;&nbsp; "],
                ["E_Day", "Tag&nbsp;:&nbsp;&nbsp; "],
                ["E_Total", "Gesamt&nbsp;:&nbsp;&nbsp; "],
                ["rel_Autonomy", "Autonomie&nbsp;:&nbsp;&nbsp; "],
    ],
        arrayName: "",
        arraySize: 999
  },

    start: function() {
        var ipaddfr = this.config.ipaddfr;  //Define ip address var and send to console
        console.log("Fronius inverter ip:" + ipaddfr);
        this.getStats();
        this.scheduleUpdate();
    },

    getStyles: function () {
        return ["style.css"];
    },

  isEmpty: function(obj) {
    for(var key in obj) {
      if(obj.hasOwnProperty(key)) {
        return false;
      }
    }

    return true;
  },

  getDom: function() {
    var wrapper = document.createElement("ticker");
    wrapper.className = "dimmed small";

    var data = this.result;
    var statElement =  document.createElement("header");
    var title = this.config.title;
    statElement.innerHTML = title;
    wrapper.appendChild(statElement);
 
    if (data && !this.isEmpty(data)) {
      var tableElement = document.createElement("table");
      var values = this.config.values;
 
      if (this.config.arrayName.length > 0) {
        try {
          data = this.byString(data, this.config.arrayName);
 
        if (data && data.length) {
            for (var i = 0; i < data.length && i < this.config.arraySize; i++) {
              this.addValues(data[i], values, tableElement);
 
                 if (i < data.length - 1) {
                var hr = document.createElement("hr");
                hr.style = "border-color: #444;"
                tableElement.appendChild(hr);
              }
            }
          } else {
            this.addValues(data, values, tableElement);
          }
        } catch (e) {
          console.error(e);
          this.addValues(data, values, tableElement);
        }
      } else {
        this.addValues(data, values, tableElement);
      }
 
      wrapper.appendChild(tableElement);
    } else {
      var error = document.createElement("span");
      error.innerHTML = this.firstUpdate ? "Lade Daten ..." : "Error fetching stats.";
      wrapper.appendChild(error);
    }

    return wrapper;
  },

  addValues: function(data, values, tableElement) {

    var grid; //  for clear number

    if (values.length > 0) {
      for (var i = 0; i < values.length; i++) {
        var val = this.getValue(data, values[i]);

        //Items in Json from inverter have too many decimal places,  round them and add the W to the end for display
        if(i == 1) {
            grid = val; //  clear grid number / Nur Zahl
        }

        if (typeof val == 'number'){

          if(i <=2) { val = Math.round(val) + ' W ' ; }
          if(i >= 3 && i <= 4) { val = Math.round(val/1000).toFixed(1) + ' kW' ; }
          if(i >=5) { val = Math.round(val) + ' % ' ; }
         }

        // Abfrage Einspeisen oder Beziehen
        // Wenn Einspeisen,dann Schriftfarbe gruen, wenn Beziehen,dann Schriftfarbe rot
        if (values[i] == 'Body.Data.Site.P_Grid') {
            if (grid >= 0) {
            val = "<span class='red'>" + val + "</span>"
            } else {
                val = "<span class='green'>" + val + "</span>"
            }
        }

        if (val) {
          tableElement.appendChild(this.addValue(values[i], val));
        }
      }
    } else {
      for (var key in data) {
        if (data.hasOwnProperty(key)) {
          tableElement.appendChild(this.addValue(key, data[key]));
        }
      }
    }
  },

  getValue: function(data, value) {
    if (data && value) {
      var split = value.split(".");
      var current = data;
      while (split.length > 0) {
       current = current[split.shift()];
      }

      return current;
    }

    return null;
  },

  addValue: function(name, value) {
    // This is a nasty hack, don't do this in prod kids
    var row = this.config.singleLine ? document.createElement("span") : document.createElement("tr");
    var split = name.split(".");
    var strippedName = split[split.length - 1];

    if (this.config.stripName) {
      name = strippedName;
    }

    // Replace overrides not stripping the name
    if (this.matchesReplace(strippedName)) {
      name = this.replaceName(strippedName);
    } else if (this.config.prettyName) {
      name = name.replace(/([A-Z])/g, function($1){return "_"+$1.toLowerCase();});
      name = name.split("_").join(" ");
      name = name.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
    }

    row.innerHTML = "";

    if (name.length > 0) {
      name = name.replace(/['"]+/g, '');
      row.innerHTML = "<td class='white'>" + name + "</td>";

        if (name == "Einspeisen&nbsp;:&nbsp;&nbsp; ") {   // Abfrage Einspeisen oder Beziehen
          var str2 = value.slice(18, -10);  // vorne und hiner von value was  abschneiden
           if (str2 > 0) {
                var name = "Beziehen&nbsp;:&nbsp;&nbsp; ";
                row.innerHTML = "<td class='red'>" + name + "</td>";  // Wenn Beziehen Schrift Rot
            } else {
                var name = "Einspeisen&nbsp;:&nbsp;&nbsp; ";
                row.innerHTML = "<td class='green'>" + name + "</td>"; //  Wenn Einspeisen Schrift Gruen
                }
           }
    }

    return row;
  },
 
  matchesReplace: function(name) {
    for (var i = 0; i < this.config.replaceName.length; i++) {
      var n = this.config.replaceName[i];
      if (n[0].toLowerCase() === name.toLowerCase()) {
  //      console.log("matched")
        return true;
      }
    }
 
    return false;
  },
 
  replaceName: function(name) {
    for (var i = 0; i < this.config.replaceName.length; i++) {
      var n = this.config.replaceName[i];
      if (n[0].toLowerCase() === name.toLowerCase()) {
        return n[1];
      }
    }
 
    return name;
  },
 
  scheduleUpdate: function(delay) {
    var nextLoad = this.config.updateInterval;
    if (typeof delay !== "undefined" && delay >= 0) {
      nextLoad = delay;
    }
 
    var self = this;
    setInterval(function() {
      self.getStats();
    }, nextLoad);
  },
 
  getStats: function () {
var ipaddfr = this.config.ipaddfr;
var url = ("http://" + ipaddfr + "/solar_api/v1/GetPowerFlowRealtimeData.fcgi");  //add correct path to ip address so we can find the info on the inverter
 
this.url = (this.config.url.length > 0) ? [this.config.url] : [];
 
 
 var allUrls = this.config.urls.concat(url);
    this.sendSocketNotification("GET_STATS", allUrls);
  },
 
  socketNotificationReceived: function(notification, payload) {
    if (notification === "STATS_RESULT") {
      this.result = payload;
      this.firstUpdate = false;
      this.updateDom(); // 500 is fade
    }
  },
 
  // function from https://stackoverflow.com/questions/6491463
  byString: function(o, s) {
    s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
    s = s.replace(/^\./, '');           // strip a leading dot
    var a = s.split('.');
    for (var i = 0, n = a.length; i < n; ++i) {
        var k = a[i];
        if (k in o) {
            o = o[k];
        } else {
            return;
        }
    }
    return o;
  }
});
