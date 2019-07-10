import ui from './config/ui';
import Logger from 'js-logger';

Logger.useDefaults();

Logger.setHandler(function (messages, context) {
  ui.formControl.logger.append(`${context.level.name}: ${messages[0]}\n`);
  Logger.createDefaultHandler()(messages,context);
});

window.clientId = process.env.CLIENT_ID;
window.scopes = [process.env.SCOPES];
window.locale = process.env.LOCALE;

const formControl = ui.formControl;


formControl.audienceType.init();
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
