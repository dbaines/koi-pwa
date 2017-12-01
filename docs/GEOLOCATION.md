# Geolocation

Geolocation can be enhanced over the out-of-the-box browser experience by implementing several modals throughout your appliction:

1) The user clicks the Geolocate button  
2) A modal is presenting telling the user that they are about to be asked for Geolocation permissions. The modal has a button in it that acts as the real Geolocation request. The user is given the option to dismiss the modal if they aren't comfortable providing permission  
3) The user clicks the "Ok" button in the prompt modal and is presented with the browser geolocation request  
4) If the user denies the browser request we present a modal saying the user has denied the request
5) If the user approves the browser request, the application continues with the Geolocation workflow and does whatever it needs to do with the user location. 

We can also implement the Permissions API to check the current permission state.  
If the user has provided permissions we can ignore the entire modal workflow and just trigger the geolocation event immediately.  
If the user has denied permissions we can throw up the denied modal immediately instead.  
If the user has neither granted or denied permissions the default permission state is "prompt" which will then trigger the whole modal workflow above. 

### References

1. [Web Fundamentals - User Location](https://developers.google.com/web/fundamentals/native-hardware/user-location/)