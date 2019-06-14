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
      this.formControl.remarketingAudiences.empty();
      //this.formControl.linkedViews.empty();
      this.formControl.linkedAdAccounts.empty();

      this.queryProperties($(elem).val(), $(elem).text());
    });

    this.formControl.properties.handleChange((i, elem) => {
      this.formControl.profiles.empty();
      this.formControl.remarketingAudiences.empty();
      //this.formControl.linkedViews.empty();
      this.formControl.linkedAdAccounts.empty();


      this.queryProfiles($(elem).data('accountId'), $(elem).val(), $(elem).text());
      this.queryRemarketingAudiences($(elem).data('accountId'), $(elem).val(), $(elem).text());
    });

    this.formControl.remarketingAudiences.handleChange((i, elem) => {
      this.handleRemarketingLinkedAdAccounts($(elem));
    });

    this.formControl.profiles.handleChange((i, elem) => {
      // todo
    });

    this.formControl.form.on('submit', (event) => {
      event.preventDefault();
      // this.formControl.profiles.eachOption((i, elem) => {
      //   this.queryCoreReportingApi($(elem).val(), $(elem).text());
      // });

      this.formControl.linkedAdAccounts.eachOption((i, elem) => {
        this.createRemarketingAudience($(elem));
      })
    });
  }

  queryAccounts() {
    gapi.client.load('analytics', 'v3').then(() => {
      gapi.client.analytics.management.accounts.list().then((response) => {
        this.handleAccounts(response);
      });
    });
  }

  queryProperties(accountId, accountName) {
    gapi.client.analytics.management.webproperties.list({
      'accountId': accountId
    })
      .then((response) => {
        response.parentName = accountName;
        this.handleProperties(response)
      })
      .then(null, (err) => {
        this.handleError(err);
    });
  }

  queryProfiles(accountId, propertyId, propertyName) {
    gapi.client.analytics.management.profiles.list({
      'accountId': accountId,
      'webPropertyId': propertyId
    })
    .then((response) => {
      response.parentName = propertyName;
      this.handleProfiles(response)
    })
    .then(null, (err) => {
      this.handleError(err);
    });
  }

  queryRemarketingAudiences(accountId, propertyId, propertyName) {
    gapi.client.analytics.management.remarketingAudience.list({
      'accountId': accountId,
      'webPropertyId': propertyId
    })
    .then((response) => {
      response.parentName = propertyName;
      this.handleRemarketingAudiences(response)
    })
    .then(null, (err) => {
      this.handleError(err);
    });
  }

  handleResult(items, field, keyField, valueField, dataFields, errorMsg, options = {}) {
    if (items && items.length) {
      if (options.parentName) {
        items.map((item) => {
          item[keyField] = `${options.parentName} > ${item[keyField]}`;
        });
      }

      field.populate(
        items,
        keyField,
        valueField,
        dataFields,
        options
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
      this.translate.analytics.errors.noAccounts,
      {
        empty: true
      }
    );
  }

  handleProperties(response) {
    this.handleResult(
      response.result.items,
      this.formControl.properties,
      'name',
      'id',
      ['accountId'],
      this.translate.analytics.errors.noProperties,
      {
        parentName: response.parentName
      }
    );
  }

  handleProfiles(response) {
    this.handleResult(
      response.result.items,
      this.formControl.profiles,
      'name',
      'id',
      ['accountId'],
      this.translate.analytics.errors.noProfiles,
      {
        parentName: response.parentName
      }
    );
  }

  handleRemarketingAudiences(response) {
    this.handleResult(
      response.result.items,
      this.formControl.remarketingAudiences,
      'name',
      'id',
      [
        'linkedViews',
        'linkedAdAccounts'
      ],
      this.translate.analytics.errors.noRemarketingAudiences,
      {
        parentName: response.parentName
      }
    );
  }

  handleRemarketingLinkedViews(items) {
    this.handleResult(
      items.filter(Boolean),
      this.formControl.linkedViews,
      'view',
      'view',
      [],
      this.translate.analytics.errors.noLinkedViews,
      {
        empty: true
      }
    );
  }


  handleRemarketingLinkedAdAccounts(elem) {
    let items = elem.data('linkedAdAccounts');
    let linkedViews = elem.data('linkedViews');

    items = items.filter(Boolean).filter(function(item) {
      return item.type !== 'ANALYTICS';
    });

    items = items.map(function(item) {
      item.label = `${item.type} > ${item.linkedAccountId}`;
      item.linkedViews = linkedViews
      return item;
    });

    this.handleResult(
      items,
      this.formControl.linkedAdAccounts,
      'label',
      'linkedAccountId',
      [],
      this.translate.analytics.errors.noLinkedAdAccounts,
      {
        empty: false
      }
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
      let formattedJson = JSON.stringify(response.result, null, 2);
      this.formControl.debug.html(formattedJson);
    })
    .then(null, (err) => {
      this.handleError(err);
    });
  }

  createRemarketingAudience(elem) {
    let requestBody = this.buildRemarketingAudienceJson(elem);
    console.log(requestBody);

    let formattedJson = JSON.stringify(requestBody, null, 2);
    this.formControl.debug.html(formattedJson);

    // TODO: Submit new
    // let request = gapi.client.analytics.management.remarketingAudience.insert(requestBody);
    // request.execute((response) => {
    //   // Handle the response.
    //   console.log(response);

    //   let formattedJson = JSON.stringify(response.result, null, 2);
    //   this.formControl.debug.html(formattedJson);
    // });

    // TODO: Patch existing
    // let request = gapi.client.analytics.management.remarketingAudience.patch(requestBody);
    // request.execute((response) => {
    //   // Handle the response.
    //   console.log(response);

    //   let formattedJson = JSON.stringify(response.result, null, 2);
    //   this.formControl.debug.html(formattedJson);
    // });
  }

  buildRemarketingAudienceJson(elem) {
    let linkedAdAccount = Object.assign({}, elem.data('item'));
    let linkedViews = linkedAdAccount.linkedViews;
    delete(linkedAdAccount.label); // remove label
    delete(linkedAdAccount.linkedViews); // remove linkedViews

    let remarketingForm = this.formControl.remarketingForm;

    if (remarketingForm.name.val() !== '' && linkedViews.length > 0) {
      let requestBody = {
        accountId: linkedAdAccount.accountId,
        webPropertyId: linkedAdAccount.propertyId,
        // 'remarketingAudienceId': audienceId // required for patch
        resource: {
          name: remarketingForm.name.val(),
          description: remarketingForm.description.val(),
          linkedViews: linkedViews,
          linkedAdAccounts: [linkedAdAccount],
          audienceType: remarketingForm.audienceType.val(),
        }
      }

      let includeConditions = remarketingForm.audienceDefinition.includeConditions;
      let sbIncludeConditions = remarketingForm.stateBasedAudienceDefinition.includeConditions;
      let sbExcludeConditions = remarketingForm.stateBasedAudienceDefinition.excludeConditions;

      if (this.includeConditionsIsValid(includeConditions)) {
        requestBody.resource.audienceDefinition = {
          includeConditions: {
            kind: 'analytics#includeConditions',
            daysToLookBack: includeConditions.daysToLookBack.val(),
            segment: includeConditions.segment.val(),
            membershipDurationDays: includeConditions.membershipDurationDays.val(),
            isSmartList: includeConditions.isSmartList.prop('checked')
          }
        }
      }

      if (
        this.includeConditionsIsValid(sbIncludeConditions) ||
        this.excludeConditionsIsValid(sbExcludeConditions)
      ) {
        requestBody.resource.stateBasedAudienceDefinition = {};

        if (this.includeConditionsIsValid(sbIncludeConditions)) {
          requestBody.resource.stateBasedAudienceDefinition.includeConditions = {
            kind: 'analytics#includeConditions',
            daysToLookBack: sbIncludeConditions.daysToLookBack.val(),
            segment: sbIncludeConditions.segment.val(),
            membershipDurationDays: sbIncludeConditions.membershipDurationDays.val(),
            isSmartList: sbIncludeConditions.isSmartList.prop('checked')
          }
        }

        if (this.excludeConditionsIsValid(sbExcludeConditions)) {
          requestBody.resource.stateBasedAudienceDefinition.excludeConditions = {
            exclusionDuration: sbExcludeConditions.exclusionDuration.val(),
            segment: sbExcludeConditions.segment.val()
          }
        }
      }

      return requestBody;
    }
  }

  includeConditionsIsValid(includeConditions) {
    return (
      includeConditions.segment.val() !== '' &&
      includeConditions.daysToLookBack.val() >= 0 &&
      (includeConditions.membershipDurationDays.val() > 0 && includeConditions.membershipDurationDays.val() <= 540)
    );
  }

  excludeConditionsIsValid(excludeConditions) {
    return (excludeConditions.segment.val() !== '');
  }

  handleError(errorMsg) {
    this.toast.showMessage(this.translate.titles.error, errorMsg);
  }
}

export default Analytics;
