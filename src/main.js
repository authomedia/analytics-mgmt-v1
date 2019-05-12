import ui from './config/ui';

import Analytics from './components/analytics'

window.clientId = process.env.CLIENT_ID;
window.scopes = [process.env.SCOPES];
window.locale = process.env.LOCALE;

var formControl = ui.formControl;
var analytics  = new Analytics(clientId, scopes, formControl, locale);

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
      analytics.queryAccounts();
    }
  });
}

$(function() {
  // Add an event listener to the 'auth-button'.
  ui.authButton.on('click', window.authorize);

  // Add event listener to logout
  ui.logoutButton.on('click', () => {
    gapi.auth.signOut()
    ui.loggedOut();
  })
})
