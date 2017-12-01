/* =====================================================================

Geolocation
https://developers.google.com/web/fundamentals/native-hardware/user-location/

===================================================================== */

"use strict";

(function (document, window, Orn, Utils) {

  var Geolocation = {
    
    dataSelectors: {
      requestButton: "data-geolocate-request",
      buttons: "data-geolocate",
      nudgeBanner: "data-geolocate-nudge"
    },

    localStorageKeys: {
      acceptedPermissions: "geolocationPermissionsAccepted",
      deniedPermissions: "geolocationPermissionsDenied"
    },

    modalIds: {
      request: "#geolocation-request",
      denied: "#geolocation-denied",
      unavailable: "#geolocation-unavailable"
    },

    // Class to apply to buttons when waiting for response
    waitingForLocationClass: "geolocation--waiting",

    // Data attribute to store previous button state in
    buttonDataOldHtml: "data-geolocation-old-html",

    // Default guessed permission to prompt
    // we're overriding this with the permissions API
    // below. For browsers that don't support the permissions
    // API we're assuming prompt is the permission set, which will 
    // show the request modal if they've already allowed permissions 
    // This is an acceptable fallback UX
    permission: "prompt",

    // Permission API can watch for change events and update 
    // the permission above automatically. Unsuprisingly this 
    // doesn't work on all browsers (Firefox)
    // So we default this to false, then update to true when
    // the first watch event is fired 
    permissionWatchable: false,

    // =========================================================================
    // Button alterations 
    // =========================================================================

    // Provide visual feedback to the user that geolocation is 
    // waiting by replacing the button with a spinner
    buttonWaitingForLocation: function(element){
      element.style.width = element.getBoundingClientRect().width + "px";
      element.classList.add(Geolocation.waitingForLocationClass);
      element.setAttribute(Geolocation.buttonDataOldHtml, element.innerHTML);
      element.innerHTML = Orn.icons.spinner;
    },

    // When a geolocation event is finished, restore the button
    // to it's original state 
    buttonLocationFinished: function(element) {
      element.classList.remove(Geolocation.waitingForLocationClass);
      element.innerHTML = element.getAttribute(Geolocation.buttonDataOldHtml);
      element.removeAttribute(Geolocation.buttonDataOldHtml);
      element.style.width = "";
    },

    // =========================================================================
    // Geolocation event 
    // =========================================================================

    onGeolocate: function(event){
      event.preventDefault();
      if(!Ornament.features.geolocation) {
        Geolocation.openUnavailableModal("Geolocation is not supported on this device.");
        return;
      }
      var targetElement = event.currentTarget || event.target;
      // Don't fire another Geolocation request if there is already
      // one pending
      if(targetElement.classList.contains(Geolocation.waitingForLocationClass)) {
        return;
      }
      // Add waiting state to the button
      Geolocation.buttonWaitingForLocation(targetElement);
      // Start counting down to show the prompt message 
      Geolocation.timeout = setTimeout(Geolocation.showNudgeBanner, 5000);
      // Ask for permissions to the user location
      navigator.geolocation.getCurrentPosition(function(position){
        Geolocation.onGeolocateSuccess(position, targetElement);
      }, function(error){
        Geolocation.onGeolocateFailed(error, targetElement);
      });
    },

    onGeolocateSuccess: function(position, element){
      // Close the request permissions modal
      Orn.C.Lightbox.closeLightbox();
      // Update permissions to granted
      Geolocation.updatePermission("granted");
      // Clear the nudge banner
      Geolocation.hideNudgeBanner();
      clearTimeout(Geolocation.timeout);
      // Restore the button state 
      Geolocation.buttonLocationFinished(element);
      // Fire a jQuery event on success with the position 
      $(element).trigger("ornament:geolocation:success", [position]);
      // Send the location to the document too 
      $(document).trigger("ornament:geolocation:success", [position]);
    },

    onGeolocateFailed: function(error, element){
      // Hide the nudge banner and clear the timeout
      Geolocation.hideNudgeBanner();
      clearTimeout(Geolocation.timeout);
      // Restore the button state 
      Geolocation.buttonLocationFinished(element);
      // Determine which error to handle
      switch(error.code) {
        case error.PERMISSION_DENIED:
          // Update state to denied so that we can 
          // feed the denied state back to the user 
          // We need to force this due to a bug in firefox
          // Denying permissions in Firefox leaves the permission
          // as "prompt" even though no prompt is presented
          // to the user
          Geolocation.updatePermission("denied", true);
          // Close the modal
          Geolocation.openDeniedModal();
          // Trigger a generic error event on the button 
          // and a specific denied event
          $(element).trigger("ornament:geolocation:error");
          $(element).trigger("ornament:geolocation:denied");
          break;
        case error.POSITION_UNAVAILABLE:
          // Position was unavailable is technically a granted
          // state so we can update the permissions to reflect that
          Geolocation.updatePermission("granted");
          // Feedback to the user that we couldn't get their location
          Geolocation.openUnavailableModal("Sorry, there was an error getting your location: " + error.message);
          // Trigger a generic error event on the button
          // and a specific unavailable event
          $(element).trigger("ornament:geolocation:error");
          $(element).trigger("ornament:geolocation:unavailable");
          break;
        case error.TIMEOUT:
          // The user didn't accept the prompt or it
          // took too long to return the location 
          Geolocation.showNudgeBanner();
          // Trigger a generic error event on the button
          // and a specific timeout event
          $(element).trigger("ornament:geolocation:error");
          $(element).trigger("ornament:geolocation:timeout");
          break;
      }
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
    // Open request permission modal
    // =========================================================================

    // Open the permission modal explaining what's about to happen 
    openRequestPermissionModal: function(){
      Orn.C.Lightbox.openLightbox({
        mainClass: Orn.C.Lightbox.defaults.mainClass += " lightbox__small",
        items: {
          src: Geolocation.modalIds.request
        }
      });
    },

    // Open the modal explaining to the user that they have denied
    // permissions 
    openDeniedModal: function(){
      Orn.C.Lightbox.openLightbox({
        mainClass: Orn.C.Lightbox.defaults.mainClass += " lightbox__small",
        items: {
          src: Geolocation.modalIds.denied
        }
      });
    },

    // Open the modal explaining to the user that the location
    // information is unavaiable
    openUnavailableModal: function(message){
      message = message || false;
      if(message) {
        $("[data-geolocation-error-unavailable]").html(message);
      }
      Orn.C.Lightbox.openLightbox({
        mainClass: Orn.C.Lightbox.defaults.mainClass += " lightbox__small",
        items: {
          src: Geolocation.modalIds.unavailable
        }
      });
    },

    // Check if user has already given permission
    // If they have, bubble on to the geolocate event
    // If they haven't, show the geolocation modal
    requestPermission: function(event){
      if(!Ornament.features.geolocation) {
        Geolocation.openUnavailableModal("Geolocation is not supported on this device.");
        return;
      }
      if(Geolocation.permission === "granted") {
        Geolocation.onGeolocate(event);
      } else if(Geolocation.permission === "denied") {
        Geolocation.openDeniedModal();
      } else {
        Geolocation.openRequestPermissionModal();
      }
    },

    // Use the permissions API to determine the access permissions
    // that the user has allowed. 
    // For browsers that don't support the permissions API, you can
    // pass in a string that you think the permission should
    // be set to. 
    // This won't be perfect since Firefox has a "allow temporary" 
    // state that isn't supported in the Geolocation API
    updatePermission: function(permission){
      if(!Geolocation.permissionWatchable || !"permissions" in navigator) {
        Geolocation.permission = permission;
      }
    },

    // =========================================================================
    // Init 
    // =========================================================================

    init: function(){
      Geolocation.$buttons = Utils.findData(Geolocation.dataSelectors.buttons, false, false, false);
      Geolocation.$requestors = Utils.findData(Geolocation.dataSelectors.requestButton, false, false, false);
      Geolocation.$nudgeBanner = Utils.findData(Geolocation.dataSelectors.nudgeBanner, false, false, false)[0];
      Geolocation.$buttons.forEach(function($button){
        Orn.U.bindOnce($button, "click", Geolocation.onGeolocate);
      });
      Geolocation.$requestors.forEach(function($button){
        Orn.U.bindOnce($button, "click", Geolocation.requestPermission);
      });

      // Get permissions from permissions API
      if("permissions" in navigator) {
        navigator.permissions.query({name:'geolocation'}).then(function(permission) {
          Geolocation.permission = permission.state;
          // Watch the API to update when needed
          permission.addEventListener("change", function(){
            // If this function has been executed, then we can 
            // make the logical assumption that this browser supports
            // watching permissions, we can mark this as true to
            // use the watched permission instead of updating via
            // the updatePermissions function
            Geolocation.permissionWatchable = true;
            Geolocation.permission = this.state;
          });
        });
      }
    }
  }
  
  Orn.registerComponent("Geolocation", Geolocation);

}(document, window, Ornament, Ornament.Utilities));