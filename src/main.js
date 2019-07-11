import moment from 'moment';

import ui from './config/ui';
import Logger from 'js-logger';


Logger.useDefaults();

Logger.setHandler(function (messages, context) {
  messages = Array.from(messages);
  let options = {};
  let action;

  //console.log(messages);
  if (typeof(messages[messages.length -1]) == 'object') {
    options = messages.pop();
    action = options['action'] || {};
  }

  let logMessage = $('<li></li>');

  let content = [
    $(`<span class='logger-timestamp'>${moment().format('hh:mm:ss')}</span>`),
    $(`<span class='logger-${context.level.name.toLowerCase()}'>${context.level.name}:</span>`)
  ];

  $.each(messages, (i, message) => {
    content.push($(`<span class='logger-message'>${message}</span>`));
  });

  if (action !== undefined) {
    let link = $('<a>');
    let linkContent = []

    if (action.icon) {
      linkContent.push($(`<span class="oi oi-${action.icon}"></span>`));
    }

    if (action.text) {
      linkContent.push(action.text);
    }

    link.html(linkContent);
    link.attr('href', '#');
    link.on('click', action.click)
    content.push(link);
  }

  ui.formControl.logger.append($(logMessage.html(content)));

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
  Logger.error("App initialized");

  $('[data-toggle="tooltip"]').tooltip();

  // Add an event listener to the 'auth-button'.
  ui.authButton.on('click', window.authorize);

  // Add event listener to logout
  ui.logoutButton.on('click', () => {
    gapi.auth.signOut()
    ui.loggedOut();
  })
})
