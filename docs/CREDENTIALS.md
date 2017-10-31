# Credentials API

The objectives of the credentials API are:

* Allow the user to sign in with a system account 
* If no system account found, sign up via a modal 
* Allow fallback pages for sign in / sign up workflows outside of modal / API 
* On successful login, save credentials for autologin in future 

This is made of several features:

* Generated and customised devise views - `app/views/users`  
* Generated and customised devise controllers - `app/controllers/user`
* Ornament Credentials component - `app/assets/javascripts/credentials.js`
* Lightbox implementation in the global template - `app/views/layouts/global.html.erb`