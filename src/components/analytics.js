import ui from '../config/ui';
import formControl from '../config/formControl';
import Toast from './toast';
import Utilities from './utilities';
import debug from './debug';

// Initialize objects
var toast = new Toast();
var utilities = new Utilities();

class Analytics {
  constructor(CLIENT_ID, SCOPES) {
    this.CLIENT_ID = CLIENT_ID;
    this.SCOPES = SCOPES;
  }

  queryAccounts() {
    // Load the Google Analytics client library.
    gapi.client.load('analytics', 'v3').then(() => {

      // Get a list of all Google Analytics accounts for this user
      gapi.client.analytics.management.accounts.list().then((response) => { this.handleAccounts(response) });
    });
  }

  handleAccounts(response) {
    // Handles the response from the accounts list method.
    if (response.result.items && response.result.items.length) {
      // Populate accounts field
      utilities.populateOptions(response.result.items, formControl.accounts, 'name', 'id');

      formControl.debug.val('');

      // Trigger lookup on select/change
      formControl.accounts.on('change', () => {
        $.each(formControl.accounts.children("option:selected"), (i, elem) => {
          formControl.debug.val('');
          this.queryProperties($(elem).val());
        });
      })

    } else {
      toast.showMessage('Error', 'No accounts found for this user.');
    }
  }


  queryProperties(accountId) {
    // Get a list of all the properties for the account.
    gapi.client.analytics.management.webproperties.list({
      'accountId': accountId
    })
      .then((response) => { this.handleProperties(response) })
      .then(null, function(err) {
        // Log any errors.
        toast.showMessage('Error', err);
    });
  }


  handleProperties(response) {
    // Handles the response from the webproperties list method.
    if (response.result.items && response.result.items.length) {
      formControl.debug.val('');

      utilities.populateOptions(response.result.items, formControl.properties, 'name', 'id', ['accountId']);

       // Trigger lookup on select/change
      formControl.properties.on('change', () => {
        $.each(formControl.properties.children("option:selected"), (i, elem) => {
          formControl.debug.val('');
          this.queryProfiles($(elem).data('accountId'), $(elem).val());
        });
      })

    } else {
      toast.showMessage('Error', 'No properties found for this user.');
    }
  }


  queryProfiles(accountId, propertyId) {
    // Get a list of all Views (Profiles) for the first property
    // of the first Account.
    gapi.client.analytics.management.profiles.list({
        'accountId': accountId,
        'webPropertyId': propertyId
    })
    .then((response) => { this.handleProfiles(response) })
    .then(null, function(err) {
        // Log any errors.
      debug(err);
    });
  }


  handleProfiles(response) {
    // Handles the response from the profiles list method.
    if (response.result.items && response.result.items.length) {
      formControl.debug.val('');

      utilities.populateOptions(response.result.items, formControl.profiles, 'name', 'id');

       // Trigger lookup on select/change
      formControl.profiles.on('change', () => {
        $.each(formControl.profiles.children("option:selected"), (i, elem) => {
          formControl.debug.val('');
          this.queryCoreReportingApi($(elem).val());
        });
      })

      // // Get the first View (Profile) ID.
      // var firstProfileId = response.result.items[0].id;

      // // Query the Core Reporting API.
      // this.queryCoreReportingApi(firstProfileId);
    } else {
      toast.showMessage('Error', 'No views (profiles) found for this user.');
    }
  }


  queryCoreReportingApi(profileId) {
    // Query the Core Reporting API for the number sessions for
    // the past seven days.
    gapi.client.analytics.data.ga.get({
      'ids': 'ga:' + profileId,
      'start-date': '7daysAgo',
      'end-date': 'today',
      'metrics': 'ga:sessions'
    })
    .then(function(response) {
      var formattedJson = JSON.stringify(response.result, null, 2);
      debug(formattedJson);
    })
    .then(null, function(err) {
      // Log any errors.
      toast.showMessage('Error', err);
    });
  }
}

export default Analytics;
