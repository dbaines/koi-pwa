/* =====================================================================

Geolocation
https://developers.google.com/web/fundamentals/native-hardware/user-location/

===================================================================== */

"use strict";

(function (document, window, Orn, Utils) {

  var Geolocation = {

    dataSelectors: {
      buttons: "data-geolocate",
      nudgeBanner: "data-geolocate-nudge"
    },

    // =========================================================================
    // Geolocation callbacks
    // =========================================================================

    updateMapWithLocation: function(position){
      
    },

    // =========================================================================
    // Button alterations 
    // =========================================================================

    buttonWaitingForLocation: function(element){
      element.classList.add("geolocation--waiting");
    },

    buttonLocationFinished: function(element) {
      element.classList.remove("geolocation--waiting");
    },

    // =========================================================================
    // Geolocation event 
    // =========================================================================

    onGeolocate: function(event){
      event.preventDefault();
      var targetElement = event.currentTarget || event.target;
      Geolocation.timeout = setTimeout(Geolocation.showNudgeBanner, 5000);
      navigator.geolocation.getCurrentPosition(function(position){
        Geolocation.onGeolocateSuccess(position, targetElement);
      }, function(error){
        Geolocation.onGeolocateFailed(error, targetElement);
      });
    },

    onGeolocateSuccess: function(position, element){
      Geolocation.hideNudgeBanner();
      clearTimeout(Geolocation.timeout);
      Geolocation.buttonWaitingForLocation(element);
      Geolocation.updateMapWithLocation(position);
    },

    onGeolocateFailed: function(error, element){
      Geolocation.hideNudgeBanner();
      clearTimeout(Geolocation.timeout);
      switch(error.code) {
        case error.TIMEOUT:
          // The user didn't accept the prompt 
          Geolocation.showNudgeBanner();
          break;
      }
      Geolocation.buttonLocationFinished(element);
    },

    // =========================================================================
    // Nudge banner 
    // =========================================================================

    showNudgeBanner: function(){
      Geolocation.$nudgeBanner.style.display = "block";
    },

    hideNudgeBanner: function(){
      Geolocation.$nudgeBanner.style.display = "none";
    },

    // =========================================================================
    // Init 
    // =========================================================================

    init: function(){
      Geolocation.$buttons = Utils.findData(Geolocation.dataSelectors.buttons, false, false, false);
      Geolocation.$nudgeBanner = Utils.findData(Geolocation.dataSelectors.nudgeBanner, false, false, false)[0];
      Geolocation.$buttons.forEach(function($button){
        Ornament.U.bindOnce($button, "click", Geolocation.onGeolocate);
      });
    }
  }
  
  Orn.registerComponent("Geolocation", Geolocation);

}(document, window, Ornament, Ornament.Utilities));