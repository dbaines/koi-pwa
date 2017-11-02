# Credentials API

The credentials API can be used to allow one-click login using stored device accounts. 
For example in Chrome you can click the login button and be presented with accounts that you have saved. Clicking on the account will log you in.  

We can enhance this behaviour by listening for cancels or bad logins to then fallback to a login form in a modal. The login form can use an AJAX form to even further enhance the login experience. 

When the user has successfully logged in, the browser will remember that they have chosen to login via this account and will continuily log them in every time they visit the site until the user opts to specifically log out. 

This is made of several features:

* Generated and customised devise views - `app/views/users`  
* Generated and customised devise controllers - `app/controllers/user`
* Ornament Credentials component - `app/assets/javascripts/credentials.js`
* Lightbox implementation in the global template - `app/views/layouts/global.html.erb`

## References

1. [Web Fundamentals - The Credentials Management API](https://developers.google.com/web/fundamentals/security/credential-management/)