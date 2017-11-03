"use strict";

(function(document, window, Orn, Utils) {
  var Notifications = {

    showNotification: function(callback){
      if (typeof Notification !== "undefined") {
        if (Notification.status === "granted") {
          callback();
        } else {
          Notification.requestPermission(function(status) {
            if (status === "granted") {
              callback();
            }
          });
        }
      } else {
        alert("Device does not support notifications");
      }
    },

    showSampleNotification: function(){
      Notifications.showNotification(function(){
        var message = new Notification("Fund My Neighbourhood", {
          body: "Fund my neighbourhood is closing soon!",
          icon: "/android-chrome-192x192.png"
        });
      });
    },
    
    showSampleNotificationWithActions: function(){
      Notifications.showNotification(function(){
        if(Ornament.features.serviceWorker && Ornament.ServiceWorker) {
          var options = {
            body: "This is the body of the notification. This notification has actions.",
            icon: "/android-chrome-192x192.png",
            vibrate: [100, 50, 100],
            data: {
              dateOfArrival: Date.now(),
              primaryKey: 2
            },
            actions: [
              {
                action: "geolocation",
                title: "Geolocate Me",
                icon: "/assets/notifications/geolocation.png"
              },
              {
                action: "close",
                title: "Close Notification",
                icon: "/assets/notifications/close.png"
              }
            ]
          };
          Ornament.ServiceWorker.showNotification("Actionable Notification", options);
        } else {
          alert("Device does not support serviceWorkers so it cannot support actionable notifications");
        }
      });
    },

    init: function() {
      document.querySelectorAll("[data-notification-sample]").forEach(function($node){
        Utils.bindOnce($node, "click", Notifications.showSampleNotification);
      });
      document
        .querySelectorAll("[data-notification-with-actions]")
        .forEach(function($node) {
          Utils.bindOnce($node, "click", Notifications.showSampleNotificationWithActions);
        });
    }
  };

  Orn.registerComponent("Notifications", Notifications);
})(document, window, Ornament, Ornament.Utilities);
