import ui from './config/ui';
import Logger from 'js-logger';
import customLogger from './components/custom-logger';

// Setup Logger
Logger.useDefaults();
Logger.setHandler(customLogger);

// Setup GA Client
window.clientId = process.env.CLIENT_ID;
window.scopes = [process.env.SCOPES];
window.locale = process.env.LOCALE;

// Setup form control
const formControl = ui.formControl;
formControl.audienceType.init();
formControl.initRemarketingForm();

// Setup GA client callbacks
window.authorize = function(event) {
  var useImmediate = event ? false : true;
  var authData = {
    client_id: window.clientId,
    scope: window.scopes,
    immediate: useImmediate
  };

  gapi.auth.authorize(authData, (response) => {
    if (response.error) {
      ui.loggedOut();
    } else {
      ui.loggedIn()
      formControl.accounts.init();
    }
  });
}

// Initialize app
$(function() {
  Logger.info('App initialized');

  $('[data-toggle="tooltip"]').tooltip();

  // Add an event listener to the 'auth-button'.
  ui.authButton.on('click', window.authorize);

  // Add event listener to logout
  ui.logoutButton.on('click', () => {
    gapi.auth.signOut()
    ui.loggedOut();
  })
})
