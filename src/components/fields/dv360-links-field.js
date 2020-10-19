import commaNumber from 'comma-number';

import queue from '../../utilities/queue';
import SelectField from './select-field';
import events from '../../config/events';
import AdvertiserActivity from '../../utilities/advertiser-activity';

class DV360LinksField extends SelectField {
  constructor(field, formControl) {
    super(field, formControl);

    this.className = 'DV360Links';

    this.advertiserActivity = new AdvertiserActivity();

    this.showSessions = true;

    this.queue = queue;

    this.loadingQueue = [];

    this.handleChange((i, elem) => {
      this.formControl.emit(events.FIELDS.DV360_LINKS.CHANGE, {
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
        this.init(
          $(event.elem).data('accountId'),
          $(event.elem).val(),
          $(event.elem).text().replace('---', '')
        );
      }
    });
  }

  init(accountId, propertyId, propertyName) {
    const params = {
      'accountId': accountId,
      'webPropertyId': propertyId,
      'itemsPerPage': 2000
    }

    this.showLoader(params);

    gapi.client.analytics.management.remarketingAudience.list(params).then((response) => {
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
        this.advertiserActivity.find(
          linkedViewId,
          activeAccounts,
          'dv360'
        );
      });

      console.log('Active Accounts: ', activeAccounts);

      response.result.items.filter((item, i) => {
        return item.linkedAdAccounts.map((linkedAdAccount, i) => {
          if (!seenAdAccounts.includes(linkedAdAccount.linkedAccountId)) {
            if (linkedAdAccount.type == 'ANALYTICS' || linkedAdAccount.type == 'ADWORDS_LINKS') {
              // These are handled by a different field now
            } else {
              console.log(linkedAdAccount.type);
              linkedAdAccount = this.castToAdwordsLink(linkedAdAccount);

              if (linkedAdAccount.linkedAccountId) {
                // const shortId = linkedAdAccount.customerId.replace(/-/g, '');
                // const accountSessions = activeAccounts[shortId] || 0;
                // linkedAdAccount.name = `${linkedAdAccount.name} (${commaNumber(accountSessions)} sessions)`;
              }

              linkedAdAccounts.items.push(linkedAdAccount);
            }

            seenAdAccounts.push(linkedAdAccount.linkedAccountId);
          }
        })
      });

      const adwordsAccounts = this.getFlatAdwordsAccounts(linkedAdAccounts)
      this.handleResult(adwordsAccounts);

      this.hideLoader();
    })
    .then(null, (err) => {
      this.hideLoader();
      // this.handleError(`${propertyName}: ${err.result.error.message}`);
    })
  }

  castToAdwordsLink(linkedAdAccount) {
    console.log(linkedAdAccount);

    if (linkedAdAccount.type == "OPTIMIZE") {
      linkedAdAccount.linkedAccountId = linkedAdAccount.accountId;
    }

    return {
      name: `${linkedAdAccount.type} > ${linkedAdAccount.linkedAccountId}`,
      linkedAccountId: linkedAdAccount.linkedAccountId,
      adWordsAccounts: [{
        name: `${linkedAdAccount.type} > ${linkedAdAccount.linkedAccountId}`,
        id: linkedAdAccount.linkedAccountId,
        type: linkedAdAccount.type,
        customerId: linkedAdAccount.linkedAccountId,
        webPropertyId: linkedAdAccount.webPropertyId,
        accountID: linkedAdAccount.accountId,
        internalWebPropertyId: linkedAdAccount.internalWebPropertyId,
        // autoTaggingEnabled: true,
        // kind: "analytics#adWordsAccount",
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
      parentName: linkedAdAccount.parentName,
      profileIds: [
        // TBC
      ],
      // selfLink: `https://www.googleapis.com/analytics/v3/management/accounts/${linkedAdAccount.accountId}/webproperties/${linkedAdAccount.webPropertyId}/entityAdWordsLinks/${linkedAdAccount.id}`
    }
  }

  getFlatAdwordsAccounts(results) {
    return {
      parentName: results.parentName,
      items: results.items.map((item) => {
        return item.adWordsAccounts.map((adwordsAccount) => {
          // if (this.showSessions) {
          //   if (adwordsAccount.sessionData.sessions > 0) {
          //     return adwordsAccount;
          //   }
          // } else {
          return adwordsAccount;
          // }
        }).filter(Boolean);
      }).flat(),
    }
  }

  showLoader(item) {
    this.loadingQueue.push(item);
    super.showLoader();
  }

  hideLoader() {
    this.loadingQueue.pop();
    if (this.loadingQueue.length <= 0) {
      super.hideLoader();
    }
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
        parentName: "---",
        group: {
          name: result.parentName
        }
      }
    );
  }
}

export default DV360LinksField;
