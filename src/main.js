import moment from 'moment';

import ui from './config/ui';
import Logger from 'js-logger';


Logger.useDefaults();

Logger.setHandler(function (messages, context) {
  let logMessage = $(`<li></li>`);

  let content = [
    $(`<span class='logger-timestamp'>${moment().format('h:mm:ss')}</span>`),
    $(`<span class='logger-${context.level.name.toLowerCase()}'>${context.level.name}:</span>`)
  ];

  messages = Array.from(messages);

  console.log(messages);

  $.each(messages, (i, message) => {
    content.push($(message));
  });

  // content.push('foo')

  // debugger;

  // console.log(content.text());

  logMessage = logMessage.html(content);

  ui.formControl.logger.append($(logMessage));

  let loggerContainer = ui.formControl.logger.parent()
  loggerContainer.prop('scrollTop', loggerContainer.prop('scrollHeight'));

  Logger.createDefaultHandler()(messages, context);
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
  Logger['info']($("<span>App initialized</span>"));

  $('[data-toggle="tooltip"]').tooltip();

  // Add an event listener to the 'auth-button'.
  ui.authButton.on('click', window.authorize);

  // Add event listener to logout
  ui.logoutButton.on('click', () => {
    gapi.auth.signOut()
    ui.loggedOut();
  })
})
