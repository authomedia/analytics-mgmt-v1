import ui from '../config/ui';
import Toast from './toast';
import i18n from '../config/i18n';

class Analytics {
  constructor(clientId, scopes, formControl, locale) {
    this.clientId = clientId;
    this.scopes = scopes;
    this.locale = locale
    this.translate = i18n[this.locale]

    this.toast = new Toast();

    this.formControl = formControl;
    this.initFormControls();
  }

  // Setup account UI
  initFormControls() {
    this.formControl.accounts.handleChange((i, elem) => {
      this.formControl.properties.empty();
      this.formControl.profiles.empty();
      this.queryProperties($(elem).val());
    });

    this.formControl.properties.handleChange((i, elem) => {
      this.formControl.profiles.empty();
      this.queryProfiles($(elem).data('accountId'), $(elem).val());
    });

    this.formControl.profiles.handleChange((i, elem) => {
      this.queryCoreReportingApi($(elem).val());
    });
  }

  queryAccounts() {
    gapi.client.load('analytics', 'v3').then(() => {
      gapi.client.analytics.management.accounts.list().then((response) => {
        this.handleAccounts(response);
      });
    });
  }

  queryProperties(accountId) {
    gapi.client.analytics.management.webproperties.list({
      'accountId': accountId
    })
      .then((response) => { this.handleProperties(response) })
      .then(null, (err) => {
        this.handleError(err);
    });
  }

  queryProfiles(accountId, propertyId) {
    gapi.client.analytics.management.profiles.list({
        'accountId': accountId,
        'webPropertyId': propertyId
    })
    .then((response) => { this.handleProfiles(response) })
    .then(null, (err) => {
      this.handleError(err);
    });
  }

  handleResult(items, field, keyField, valueField, dataFields, errorMsg) {
    if (items && items.length) {
      field.populate(
        items,
        keyField,
        valueField,
        dataFields
      );
    } else {
      this.handleError(errorMsg);
    }
  }

  handleAccounts(response) {
    this.handleResult(
      response.result.items,
      this.formControl.accounts,
      'name',
      'id',
      [],
      this.translate.analytics.errors.noAccounts
    );
  }

  handleProperties(response) {
    this.handleResult(
      response.result.items,
      this.formControl.properties,
      'name',
      'id',
      ['accountId'],
      this.translate.analytics.errors.noProperties
    );
  }

  handleProfiles(response) {
    this.handleResult(
      response.result.items,
      this.formControl.profiles,
      'name',
      'id',
      [],
      this.translate.analytics.errors.noProfiles
    );
  }

  queryCoreReportingApi(profileId) {
    gapi.client.analytics.data.ga.get({
      'ids': 'ga:' + profileId,
      'start-date': '7daysAgo',
      'end-date': 'today',
      'metrics': 'ga:sessions'
    })
    .then((response) => {
      var formattedJson = JSON.stringify(response.result, null, 2);
      this.formControl.debug.html(formattedJson);
    })
    .then(null, (err) => {
      this.handleError(err);
    });
  }

  handleError(errorMsg) {
    this.toast.showMessage(this.translate.titles.error, errorMsg);
  }
}

export default Analytics;
