import Logger from 'js-logger';

import ui from '../config/ui';
import events from '../config/events';

const authorizer = function(event) {
  var useImmediate = event ? false : true;
  var authData = {
    client_id: window.clientId,
    scope: window.scopes,
    immediate: useImmediate
  };

  gapi.auth.authorize(authData, (response) => {
    if (response.error) {
      ui.loggedOut();
      Logger.info('User is not logged in');
      $(window).trigger(events.GOOGLE.UNAUTHORIZED, {response: response});
    } else {
      ui.loggedIn();
      Logger.info('User is logged in');
      $(window).trigger(events.GOOGLE.AUTHORIZED, {response: response});
    }
  });
}

// Setup GA client callbacks
window.authorize = authorizer

// Setup GA Client
window.clientId = process.env.CLIENT_ID;
window.scopes = [process.env.SCOPES];
window.locale = process.env.LOCALE;

export default authorizer;
