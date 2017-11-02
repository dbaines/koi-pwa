/* =====================================================================

WebShare API 
https://developers.google.com/web/updates/2016/09/navigator-share

Implementation:
<button data-webshare>Share this link</button>

By default it will share with the page title and the URL of the current
page.
These can be customised with data attributes:

<button
  data-title="My awesome website"
  data-text="Hey, check out this awesome website I made" 
  data-url="http://www.mywebsite.com.au"
>Share</button>

===================================================================== */

"use strict";

(function (document, window, Orn, Utils) {

  var WebShare = {

    selector: "data-webshare",
    detailsAttributes: {
      title: "data-webshare-title",
      text: "data-webshare-text",
      url: "data-webshare-url"
    },

    getShareDetailsFromElement: function(element){
      var details = {
        title: document.title, 
        url: document.location.href
      }
      ["title", "text", "url"].map(function(key){
        if(element.hasAttribute(WebShare.detailsAttributes[key])) {
          details[key] = element.getAttribute(WebShare.detailsAttributes[key]);
        }
      });
    },

    onShare: function(event){
      if(WebShare.enabled) {
        var details = getShareDetailsFromElement(event.currentTarget);
        navigator.share(details).then(function() {
          Ornament.trackEvent("WebShare", details.title);
        }).catch(function(error) {
          alert("There was a problem sharing.");
          console.log("[WEBSHARE]", error);
        });
      } else {
        Ornament.C.Lightbox.openLightbox({
          mainClass: Ornament.C.Lightbox.defaults.mainClass += " lightbox__small",
          items: {
            src: "#share"
          }
        });
      }
    },

    init: function(){
      WebShare.enabled = "share" in navigator;
      WebShare.$shares = Utils.findData(WebShare.selector, false, false, false);
      WebShare.$shares.forEach(function($share){
        Utils.bindOnce($share, "click", WebShare.onShare);
      })
    }
  }
  
  Orn.registerComponent("WebShare", WebShare);

}(document, window, Ornament, Ornament.Utilities));