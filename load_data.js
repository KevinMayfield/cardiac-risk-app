(function(window){
  window.extractData = function() {
    var ret = $.Deferred();

    FHIR.oauth2.ready(function(smart){
      var patient = smart.patient;
      var pt = patient.read();
      var labs = smart.patient.api.fetchAll({type: "Observation", query: {code: {$or: ['http://snomed.info/sct|1001371000000100',
              'http://snomed.info/sct|1005671000000105',
           'http://snomed.info/sct|1005681000000107', 'http://snomed.info/sct|75367002']}}});

      $.when(pt, labs).done(function(patient, labs){
        var byCodes = smart.byCodes(labs, 'code');

        var gender = patient.gender;

          dob = new XDate(patient.birthDate);
          age = Math.floor(dob.diffYears(new XDate()));

          var fname = patient.name[0].given.join(" "),
          lname = patient.name[0].family;


          var hscrp = byCodes("1001371000000100");
          // https://snomedbrowser.com/Codes/Details/1005671000000105
          var cholesterol = byCodes("1005671000000105"); //, "1003441000000101");
          var hdl = byCodes("1005681000000107");
          var systolic = byCodes("72313002");

          var missingData = [];
          if (hscrp.length == 0) {
            missingData = missingData.concat(["hs-CRP"]);
          }
          if (cholesterol.length == 0) {
            missingData = missingData.concat(["Cholesterol"]);
          }
          if (hdl.length == 0) {
            missingData = missingData.concat(["HDL"]);
          }

          // default logic for demonstration purposes
          console.log('systolic');
          if (systolic.length == 0) {
            systolic = "120";
          } else {
            systolic = systolic[0].valueQuantity.value;
            if (systolic < 105) {
              systolic = 105
            }
            if (systolic > 200) {
              systolic = 200;
            }
          }
          console.log('missing data check');
          if (missingData.length > 0) {
            var missingDataMessage = "No results (";
            var delimiter = "";
            for(var i = 0; i < missingData.length; i++) {
              missingDataMessage += delimiter + missingData[i];
              delimiter = ", ";
            }
            missingDataMessage += ") for " + fname + " " + lname + ".";
            alert(missingDataMessage);
            return ret.reject();
          }

          p = defaultPatient();
          p.birthday = {value:dob};
          p.age = {value:age};
          p.gender={value:gender};
          p.givenName={value:fname};
          p.familyName={value:lname};

          p.hsCRP={value:hscrp_in_mg_per_l(hscrp[0])};

          p.cholesterol={value:cholesterol_in_mg_per_dl(cholesterol[0])};

          p.HDL={value:cholesterol_in_mg_per_dl(hdl[0])};

          p.LDL = {value:p.cholesterol.value-p.HDL.value};
          p.sbp = {value:systolic};

          ret.resolve(p);
      });
    });
    return ret.promise();
  };

  function defaultPatient(){
    return {
      smoker_p: {value: false},
      fx_of_mi_p: {value: false}
    }
  };

  /**
  * Unit conversion formula.
  * See values at http://www.amamanualofstyle.com/page/si-conversion-calculator
  */
  cholesterol_in_mg_per_dl = function(v){
    if (v.valueQuantity.unit === "mg/dL"){
      return parseFloat(v.valueQuantity.value);
    }
    else if (v.valueQuantity.unit === "mmol/L"){
      return parseFloat(v.valueQuantity.value)/ 0.026;
    }
    console.log("Unanticipated cholesterol units: " + v.valueQuantity.unit);
    throw "Unanticipated cholesterol units: " + v.valueQuantity.unit;
  };

  /**
  * Unit conversion formula.
  * See values at http://www.amamanualofstyle.com/page/si-conversion-calculator
  */
  hscrp_in_mg_per_l = function(v){
    // TODO KGM Don't have test data with hscrp so using dummy result
    if (v=== undefined) return 2.90;
    if (v.valueQuantity.unit === "mg/L"){
      return parseFloat(v.valueQuantity.value);
    }
    else if (v.valueQuantity.unit === "mmol/L"){
      return parseFloat(v.valueQuantity.value.value)/ 0.10;
    }
    console.log("Unanticipated hsCRP units: " + v.valueQuantity.unit);
    throw "Unanticipated hsCRP units: " + v.valueQuantity.unit;
  };

})(window);
