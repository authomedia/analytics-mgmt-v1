import ui from './config/ui';

window.clientId = process.env.CLIENT_ID;
window.scopes = [process.env.SCOPES];
window.locale = process.env.LOCALE;

const formControl = ui.formControl;


formControl.initAccountSelectionForm();
formControl.initRemarketingForm();

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

$(function() {
  // Add an event listener to the 'auth-button'.
  ui.authButton.on('click', window.authorize);

  // Add event listener to logout
  ui.logoutButton.on('click', () => {
    gapi.auth.signOut()
    ui.loggedOut();
  })
})
