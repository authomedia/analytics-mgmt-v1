import SelectField from './select-field';
import events from '../../config/events';

class AdLinksField extends SelectField {
  constructor(field, formControl) {
    super(field, formControl);

    this.className = 'AdLinks';

    this.handleChange((i, elem) => {
      this.formControl.emit(events.FIELDS.AD_LINKS.CHANGE, {
        i: i,
        elem: elem
      });
    });

    this.formControl.on(events.FIELDS.ACCOUNTS.CHANGE, (event) => {
      this.empty();
    });

    this.formControl.on(events.FIELDS.PROPERTIES.CHANGE, (event) => {
      this.empty();

      if (event.elem) {
        this.init($(event.elem).data('accountId'), $(event.elem).val(), $(event.elem).text());
      }
    });
  }

  init(accountId, propertyId, propertyName) {
    gapi.client.analytics.management.webPropertyAdWordsLinks.list({
      'accountId': accountId,
      'webPropertyId': propertyId
    })
    .then((response) => {
      response.result.parentName = propertyName;
      this.handleResult(response.result)
    })
    .then(null, (err) => {
      console.log(err);
      this.handleError(`${propertyName}: ${err.result.error.message}`);
    });

    gapi.client.analytics.management.remarketingAudience.list({
      'accountId': accountId,
      'webPropertyId': propertyId,
      'itemsPerPage': 2000
    })
    .then((response) => {
      response.parentName = propertyName;

      let linkedAdAccounts = {
        parentName: response.parentName,
        items: []
      };

      let seenAdAccounts = []

      // Get Adwords activity for all accounts
      let linkedViewIds = response.result.items.map((item) => {
        return item.linkedViews;
      }).flat();
      // Get Unique linked views
      linkedViewIds = Array.from(new Set(linkedViewIds));
      linkedViewIds.map((linkedViewId) => {
        return this.checkAdwordsActivity(linkedViewId);
      });


      response.result.items.filter((item, i) => {
        return item.linkedAdAccounts.map((linkedAdAccount, i) => {
          if (!seenAdAccounts.includes(linkedAdAccount.linkedAccountId)) {
            if (linkedAdAccount.type == 'ANALYTICS' || linkedAdAccount.type == 'ADWORDS_LINKS') {
              // // Currently, do nothing with ANALYTICS or ADWORDS_LINKS type
              // linkedAdAccount.label = `${linkedAdAccount.type} > ${linkedAdAccount.webPropertyId}`;
              // linkedAdAccount.linkedAccountId = linkedAdAccount.webPropertyId; // FIXME: HACK ALERT!!
            } else {
              linkedAdAccount = this.castToAdwordsLink(linkedAdAccount);
              linkedAdAccounts.items.push(linkedAdAccount);
            }
            seenAdAccounts.push(linkedAdAccount.linkedAccountId);
          }
        })
      });

      this.handleAdAccounts(linkedAdAccounts);
    })
    .then(null, (err) => {
      this.handleError(`${propertyName}: ${err.result.error.message}`);
    })
  }

  checkAdwordsActivity(linkedViewId) {
    let resultsHash = {};
    if (!linkedViewId) {
      return resultsHash;
    }

    const apiQuery = gapi.client.analytics.data.ga.get({
      'ids': `ga:${linkedViewId}`,
      'start-date': '90daysAgo',
      'end-date': 'yesterday',
      'metrics': 'ga:sessions,ga:impressions,ga:adCost',
      'dimensions': 'ga:adwordsCustomerID',
      'filters': 'ga:sessions>0',
      'samplingLevel': 'HIGHER_PRECISION'
    });

    apiQuery.execute((results) => {
      console.log(results);

      // TODO: Split data by "ga:adwordsCustomerID"
      if (results.totalResults === 0) {
        console.log(`No results for ga:${linkedViewId}`);
        return resultsHash;
      }

      results.rows.map((row) => {
        resultsHash[row[0]] = resultsHash[row[0]] || 0;
        resultsHash[row[0]] += row[1];
      });

      console.log(resultsHash);
      return resultsHash;
    });
  }

  castToAdwordsLink(linkedAdAccount) {
    return {
      label: `${linkedAdAccount.type} > ${linkedAdAccount.linkedAccountId}`,
      linkedAccountId: linkedAdAccount.linkedAccountId,
      adWordsAccounts: [{
        // autoTaggingEnabled: true,
        customerId: linkedAdAccount.linkedAccountId,
        // kind: "analytics#adWordsAccount",
        type: linkedAdAccount.type
      }],
      entity: {
        webPropertyRef: {
          accountId: linkedAdAccount.accountId,
          href: `https://www.googleapis.com/analytics/v3/management/accounts/${linkedAdAccount.accountId}/webproperties/${linkedAdAccount.webPropertyId}`,
          id: linkedAdAccount.webPropertyId,
          internalWebPropertyId: linkedAdAccount.internalWebPropertyId,
          kind: "analytics#webPropertyRef",
          name: linkedAdAccount.parentName
        }
      },
      id: linkedAdAccount.id, // TBC
      kind: "analytics#entityAdWordsLink",
      name: linkedAdAccount.parentName,
      profileIds: [
        // TBC
      ],
      // selfLink: `https://www.googleapis.com/analytics/v3/management/accounts/${linkedAdAccount.accountId}/webproperties/${linkedAdAccount.webPropertyId}/entityAdWordsLinks/${linkedAdAccount.id}`
    }
  }

  handleAdAccounts(linkedAdAccounts) {
    super.handleResult(
      linkedAdAccounts.items,
      this.field,
      'label',
      'linkedAccountId',
      [],
      `${this.translate.analytics.errors[`no${this.className}`]}`,
      {
        parentName: linkedAdAccounts.parentName
      }
    );
  }

  handleResult(result) {
    super.handleResult(
      result.items,
      this.field,
      'name',
      'id',
      [],
      `${result.parentName}: ${this.translate.analytics.errors[`no${this.className}`]}`,
      {
        parentName: result.parentName
      }
    );
  }
}

export default AdLinksField;
