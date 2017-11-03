/* =====================================================================

Offline status
https://developer.mozilla.org/en-US/docs/Online_and_offline_events

===================================================================== */

"use strict";

(function (document, window, Orn, Utils) {

  var Offline = {
    supported: "onLine" in navigator,
    bodyClass: "body__offline",
    bindListeners: function(){
      window.addEventListener("online", Offline.updateOfflineState);
      window.addEventListener("offline", Offline.updateOfflineState);
    },
    updateOfflineState: function(event){
      if(navigator.onLine) {
        document.querySelector("body").classList.remove(Offline.bodyClass);
      } else {
        document.querySelector("body").classList.add(Offline.bodyClass);
      }
    },
    init: function(){
      if(Offline.supported) {
        Offline.bindListeners();
      }
    }
  }
  
  Orn.registerComponent("Offline", Offline);

}(document, window, Ornament, Ornament.Utilities));