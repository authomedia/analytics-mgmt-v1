import Analytics from './components/analytics'
import ui from './config/ui';

// even though Rollup is bundling all your files together, errors and
// logs will still point to your original source modules
console.log('if you have sourcemaps enabled nn your devtools, click on main.js:5 -->');

// Replace with your client ID from the developer console.
window.CLIENT_ID = '683307450342-v1dk2489h2rgvjhoedsao7pqcj9q9ujd.apps.googleusercontent.com';

// Set authorized scope.
window.SCOPES = ['https://www.googleapis.com/auth/analytics.readonly'];

// Initialize analytics lib
var analytics  = new Analytics(CLIENT_ID, SCOPES);

window.authorize = function(event) {
  // Handles the authorization flow.
  // `immediate` should be false when invoked from the button click.
  var useImmediate = event ? false : true;
  var authData = {
    client_id: window.CLIENT_ID,
    scope: window.SCOPES,
    immediate: useImmediate
  };

  gapi.auth.authorize(authData, (response) => {
    var authButton = ui.authButton;
    if (response.error) {
      authButton.hidden = false;
    }
    else {
      authButton.hidden = true;
      analytics.queryAccounts();
    }
  });
}

// Add an event listener to the 'auth-button'.
ui.authButton.addEventListener('click', window.authorize);
