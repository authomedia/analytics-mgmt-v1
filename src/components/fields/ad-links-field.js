import commaNumber from 'comma-number';

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

      // Get Adwords activity for all accounts
      let linkedViewIds = response.result.items.map((item) => {
        return item.profileIds;
      }).flat();

      // Get Unique linked views
      linkedViewIds = Array.from(new Set(linkedViewIds));
      console.log(linkedViewIds);

      const activeAccounts = {}

      Promise.all(
        linkedViewIds.map(async (linkedViewId) => {
          await this.checkAdwordsActivity(linkedViewId, activeAccounts);
        })
      ).then(() => {
        response.result.items = response.result.items.filter((item) => {
          item.adWordsAccounts.map((account) => {
            const shortId = account.customerId.replace(/-/g, '');
            const accountSessions = activeAccounts[shortId] || 0;

            item.name = `${item.name} (${commaNumber(accountSessions)} sessions)`;
            item.sessions = item.sessions || 0;
            item.sessions += accountSessions;
            return account;
          });

          return (item.sessions > 0) ? true : false;
        });

        this.handleResult(response.result)
      })
      // console.log(activeAccounts);


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

      let seenAdAccounts = [];

      // Get Adwords activity for all accounts
      let linkedViewIds = response.result.items.map((item) => {
        return item.linkedViews;
      }).flat();

      // Get Unique linked views
      linkedViewIds = Array.from(new Set(linkedViewIds));
      const activeAccounts = {}
      linkedViewIds.map((linkedViewId) => {
        this.checkAdwordsActivity(linkedViewId, activeAccounts);
      });

      console.log('Active Accounts: ', activeAccounts);

      response.result.items.filter((item, i) => {
        return item.linkedAdAccounts.map((linkedAdAccount, i) => {
          if (!seenAdAccounts.includes(linkedAdAccount.linkedAccountId)) {
            if (linkedAdAccount.type == 'ANALYTICS' || linkedAdAccount.type == 'ADWORDS_LINKS') {
              // // Currently, do nothing with ANALYTICS or ADWORDS_LINKS type
              // linkedAdAccount.label = `${linkedAdAccount.type} > ${linkedAdAccount.webPropertyId}`;
              // linkedAdAccount.linkedAccountId = linkedAdAccount.webPropertyId; // FIXME: HACK ALERT!!
              console.log('adwords account');
            } else {
              linkedAdAccount = this.castToAdwordsLink(linkedAdAccount);

              if (
                linkedAdAccount.linkedAccountId &&
                activeAccounts[linkedAdAccount.linkedAccountId.replace(/-/g, '')]
              ) {
                linkedAdAccounts.items.push(linkedAdAccount);
              } else {
                console.log(linkedAdAccount.linkedAccountId, linkedAdAccount.label, 'does not have any active ad traffic');
              }
            }

            seenAdAccounts.push(linkedAdAccount.linkedAccountId);
          }
        })
      });

      this.handleAdAccounts(linkedAdAccounts);
    })
    .then(null, (err) => {
      console.log(err)
      // this.handleError(`${propertyName}: ${err.result.error.message}`);
    })
  }

  async checkAdwordsActivity(linkedViewId, accounts) {
    const minSessions = 100;
    const minImpressions = 0;

    if (!linkedViewId) {
      return accounts;
    }

    return await gapi.client.analytics.data.ga.get({
      'ids': `ga:${linkedViewId}`,
      'start-date': '90daysAgo',
      'end-date': 'yesterday',
      'metrics': 'ga:sessions,ga:impressions,ga:adCost,ga:adClicks',
      'dimensions': 'ga:adwordsCustomerID',
      'filters': `ga:sessions>${minSessions};ga:impressions>${minImpressions}`,
      'samplingLevel': 'HIGHER_PRECISION'
    }).then((response) => {
      const results = response.result;

      if (results.totalResults === 0) {
        console.log(`No results for ga:${linkedViewId}`);
        return accounts;
      }

      results.rows.map((row) => {
        // const sessions = parseInt(row[1]);
        // const adClicks = parseInt(row[3]);
        // if (sessions > (adClicks * 0.8)) {
        // console.log(row[0], ': Ad Clicks count is within 20% of session count', sessions, adClicks * 0.8);
        accounts[row[0]] = accounts[row[0]] || 0;
        accounts[row[0]] = parseInt(row[1]);
        // }
      });

      return accounts;
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

  handleAdAccounts(result) {
    super.handleResult(
      result.items,
      this.field,
      'label',
      'linkedAccountId',
      [],
      `${result.parentName}: ${this.translate.analytics.errors[`no${this.className}`]}`,
      {
        parentName: result.parentName
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
