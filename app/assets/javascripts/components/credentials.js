/* =====================================================================

Credentials API implementation
https://developers.google.com/web/fundamentals/security/credential-management/

Most of this should be boilerplate, but the callbacks section is 
likely the place to customise these features. 

===================================================================== */

"use strict";

(function(document, window, Orn, Utils) {
  var Creds = {
    // =========================================================================
    // Configuration and settings
    // =========================================================================

    settings: {
      debug: true,
      // Login endpoint to send the credentials to
      loginEndpoint: "/users/sign_in.js",
      // Use modals instead of page loads
      loginFallbackModal: true,
      registerFallbackModal: true,
      // If the fallback modal settings above are
      // set to false, set the appropriate URLs
      // here to send the user when they don't have
      // API access
      loginFallbackPath: "/users/sign_in",
      loginSuccessPath: "/users/sign_up",
      // Field names to use for authentication
      userFieldName: "user[email]",
      passwordFieldName: "user[password]",
      csrfFieldName: "authenticity_token"
    },

    // Register the IDs for the user modals
    modals: {
      login: "#user-login",
      register: "#user-register"
    },

    // Register our in-page elements that trigger credentials
    // functions
    dataSelectors: {
      forms: "data-user-form",
      loginButton: "data-user-login",
      registerButton: "data-user-register",
      logout: "data-user-logout"
    },

    // Endpoints used for federated providers
    federatedEndpoints: {
      twitter: "https://api.twitter.com",
      facebook: "https://api.facebook.com",
      google: "https://accounts.google.com"
    },

    // If using federated providers, define them here
    getFederatedProviders: function() {
      return {
        providers: [Creds.federatedEndpoints.twitter, Creds.federatedEndpoints.facebook]
      };
    },

    
    // =========================================================================
    // Callbacks
    // Custom fallback functions to do UI stuff when certain
    // milstones in the workflow are met
    // Hint: Turn on debug mode above to see these callbacks fired in 
    // your console. 
    // =========================================================================

    callbacks: {
      // The user has pressed the login button and has been 
      // presented with the list of accounts to choose from, but
      // has not yet made a selection. 
      waitingForUserInput: function() {
        Creds.log("Waiting for user input");
      },
      // The user has made a selection from the account list, or 
      // has cancelled the request. 
      waitingForUserInputComplete: function() {
        Creds.log("Waiting for user complete");
      },
      // The user has made a selection and the login request has
      // been sent to the server, but the response has not yet
      // been received. 
      waitingForLoginResponse: function() {
        Creds.log("Waiting for Login Response");
      },
      // The login reponse has been received by the browser. 
      waitingForUserLoginResponseComplete: function() {
        Creds.log("Waiting for login response complete");
      },
      // The login response was bad 
      loginFailed: function(context, submissionType) {
        Creds.log("Login failed");
        context = context || "login";
        submissionType = submissionType || "modal";
        if(submissionType === "modal") {
          if (context === "register") {
            Creds.registerFallback();
          } else {
            Creds.loginFallback();
          }
        }
      },
      // The login response was good 
      loginSuccess: function() {
        Creds.log("Login success");
        window.location.reload();
      },
      // Generic device unsupported function when 
      // attempting to call Creds.getCredentials() directly.
      // This should theoretically never happen. 
      deviceUnsupported: function() {
        Creds.log("Device unsupported");
      },
      // No account was selected from the account list or 
      // no account was autologgedin 
      noAccountSelected: function() {
        Creds.log("No account was selected");
        Creds.loginFallback();
      },
      // Autologin failed 
      autoLoginFailed: function() {
        Creds.log("Autologin failed, possibly couldn't determine which account to use.");
      }
    },

    // =========================================================================
    // General Helpers
    // =========================================================================

    log: function(...message) {
      if (Creds.settings.debug) {
        console.log("[CREDENTIALS]", ...message);
      }
    },

    getCsrf: function() {
      var meta = document.querySelector("meta[name='csrf-token']");
      if (meta) {
        return meta.getAttribute("content");
      } else {
        console.warn("Unable to find CSRF token meta tag");
        return false;
      }
    },

    // =========================================================================
    // Modal Helpers
    // =========================================================================

    // Open login modal with a simple function
    openLoginModal: function() {
      Ornament.C.Lightbox.openLightbox({
        mainClass: Ornament.C.Lightbox.defaults.mainClass += " lightbox__small",
        items: {
          src: Creds.modals.login
        }
      });
    },

    // Open register modal with a simple function
    openRegisterModal: function() {
      Ornament.C.Lightbox.openLightbox({
        mainClass: Ornament.C.Lightbox.defaults.mainClass += " lightbox__small",
        items: {
          src: Creds.modals.register
        }
      });
    },

    // =========================================================================
    // Click Events
    // =========================================================================

    // When clicking a login link, check to see if credentials API is
    // supported. If it is, use it, if not, fallback to either the modal
    // or the fallback URL instead
    onClickLogin: function(event) {
      event.preventDefault();
      if (Creds.supported) {
        Creds.getCredentials();
      } else {
        Creds.loginFallback();
      }
    },

    // There is no credentials API for register, but we can use
    // the register fallback modal / link binding here too
    onClickRegister: function(event) {
      event.preventDefault();
      Creds.registerFallback();
    },

    onClickLogout: function(event) {
      if (Creds.supported) {
        Creds.log("Preventing autologin");
        // return navigator.credentials.preventSilentAccess();
      }
    },

    // If fallback modal is set to trute, show the modal,
    // otherwise redirect to the login link
    loginFallback: function() {
      if (Creds.settings.loginFallbackModal) {
        Creds.openLoginModal();
      } else {
        window.location = Creds.settings.loginFallbackPath;
      }
    },

    // If fallback modal is set to true, show the modal,
    // otherwise redirect to the register link
    registerFallback: function() {
      if (Creds.settings.registerFallbackModal) {
        Creds.openRegisterModal();
      } else {
        window.location = Creds.settings.registerFallbackPath;
      }
    },

    // =========================================================================
    // Get Credentials from Browser
    // =========================================================================

    getCredentials: function(options) {
      options = options || {};
      var isSilent = options.mediation && options.mediation === "silent";
      if (Creds.supported) {
        Creds.callbacks.waitingForUserInput();
        navigator.credentials
          .get({
            password: true,
            mediation: options.mediation || "optional",
            federated: Creds.getFederatedProviders()
          })
          .then(function(credential) {
            Creds.callbacks.waitingForUserInputComplete();
            if (credential) {
              // If a federated login type, check which type it
              // is and execute a federated login
              if (credential.type === "federated") {
                if (credential.provider === Creds.providers.twitter) {
                  Creds.callbacks.sendTwitterLoginRequest(credential);
                } else if (credential.provider === Creds.providers.facebook) {
                  Creds.callbacks.sendFacebookLoginRequest(credential);
                } else if (credential.provider) {
                  alert("Unsupported provider type: " + credential.provider);
                } else {
                  alert("Error: Federated credential request with no provider.");
                }
              } else {
                // If not federated, send the login request to our server
                Creds.log("Sending login request to server");
                return Creds.sendLoginRequest(credential, options);
              }
            } else if (!isSilent) {
              // If there is no credential selected and this isn't a
              // silent login (auto login) then the user was prompted
              // but did not select an account. They probably dismissed
              // the dialog.
              Creds.callbacks.noAccountSelected();
            } else if (isSilent) {
              // Could not autologin, possibly due to too many accounts
              // available and the browser not knowing which one to
              // autologin with
              Creds.callbacks.autoLoginFailed();
            }
          })
          .then(function(result, other) {
            Creds.callbacks.waitingForUserLoginResponseComplete();
            if (result) {
              Creds.log(result);
              if (result.status === 200) {
                Creds.callbacks.loginSuccess();
              } else {
                if (!isSilent) {
                  Creds.callbacks.loginFailed();
                }
              }
            }
          });
      } else {
        // Unsupported behaviour
        Creds.callbacks.deviceUnsupported();
      }
    },

    // =========================================================================
    // Send login to server
    // =========================================================================

    sendLoginRequest: function(credential, options) {
      options = options || {};
      // Fire the waiting function in case you want to show a waiting or
      // loading message
      Creds.callbacks.waitingForLoginResponse();
      var form = new FormData();
      form.append(Creds.settings.userFieldName, credential.id);
      form.append(Creds.settings.passwordFieldName, credential.password);
      if (Creds.settings.csrfFieldName) {
        form.append(Creds.settings.csrfFieldName, Creds.getCsrf());
      }
      // Send login request to the server
      return fetch(Creds.settings.loginEndpoint, {
        method: "POST",
        credentials: "include",
        body: form
      });
    },

    // =========================================================================
    // Federated logins
    // =========================================================================

    sendTwitterLoginRequest: function(credential, options) {
      // TODO
      return false;
    },

    sendFacebookLoginRequest: function(credential, option) {
      // TODO
      return false;
    },

    // =========================================================================
    // Storing and retrieving saved credentials for auto-login
    // =========================================================================

    onFormSubmit: function(event) {
      if (!Creds.supported) {
        return;
      }
      var context = "login";
      if (event.target.hasAttribute("data-devise-registration-form")) {
        context = "register";
      }
      var submissionType = "modal";
      var customSubmissionType = event.target.getAttribute(Creds.dataSelectors.forms);
      if (customSubmissionType) {
        submissionType = customSubmissionType;
      }
      // Stop the form from submitting
      event.preventDefault();
      Creds.log("Attempting to save credentials");
      // Attempt to sign in
      return fetch(Creds.settings.loginEndpoint, {
        method: "POST",
        credentials: "include",
        body: new FormData(event.target)
      })
        .then(function(result) {
          if (result.status === 200) {
            Creds.log("Login endpoint success");
            return Promise.resolve();
          } else {
            Creds.log("Login endpoint failed");
            return Promise.reject("Sign in failed");
          }
        })
        .then(function(user) {
          // Instantiate PasswordCredential with the form
          if (navigator.credentials) {
            var credential = new PasswordCredential(event.target);
            navigator.credentials.store(credential);
            Creds.callbacks.loginSuccess();
            return Promise.resolve(user);
          } else {
            return Promise.resolve(user);
          }
        })
        .then(function(user) {
          // Successful sign in
          if (user) {
            Creds.callbacks.loginSuccess();
          }
        })
        .catch(function(error) {
          Creds.callbacks.loginFailed(context, submissionType);
        });
    },

    storeCredentials: function(credential) {
      Creds.log("Requesting to store credentials");
      navigator.Creds.store(credential);
    },

    autoLogin: function() {
      if (Creds.supported) {
        Creds.log("Attempting auto signin");
        Creds.getCredentials({ mediation: "silent" });
      }
    },

    // =========================================================================
    // Logout 
    // =========================================================================

    onClickLogout: function(){
      if(Creds.supported) {
        Creds.log("Logging out");
        navigator.credentials.preventSilentAccess();
      }
    },

    // =========================================================================
    // Init
    // =========================================================================

    init: function() {
      // Two navigator properties are required
      // Must be on either https:// or localhost
      Creds.supported =
        navigator.credentials &&
        navigator.credentials.preventSilentAccess &&
        (location.protocol === "https:" || location.hostname.indexOf("localhost") > -1);
      // Assign elements
      Creds.$loginButtons = Utils.findData(
        Creds.dataSelectors.loginButton,
        false,
        false,
        false
      );
      Creds.$registerButtons = Utils.findData(
        Creds.dataSelectors.registerButton,
        false,
        false,
        false
      );
      Creds.$logoutButtons = Utils.findData(
        Creds.dataSelectors.logout,
        false,
        false,
        false
      );
      Creds.$userForms = Utils.findData(Creds.dataSelectors.forms, false, false, false);
      // Onclick handlers
      Creds.$loginButtons.forEach(function($loginButton) {
        Utils.bindOnce($loginButton, "click", Creds.onClickLogin);
      });
      Creds.$logoutButtons.forEach(function($logoutButton) {
        Utils.bindOnce($logoutButton, "click", Creds.onClickLogout);
      });
      Creds.$registerButtons.forEach(function($registerButton) {
        Utils.bindOnce($registerButton, "click", Creds.onClickRegister);
      });
      Creds.$userForms.forEach(function($userForm) {
        Utils.bindOnce($userForm, "submit", Creds.onFormSubmit);
      });
      // Attempt autologin if supported
      if (Creds.supported && !Ornament.User) {
        Creds.autoLogin();
      }
    }
  };

  Orn.registerComponent("Credentials", Creds);
})(document, window, Ornament, Ornament.Utilities);
