import SelectField from './select-field';

class AdLinksField extends SelectField {
  constructor(field, formControl) {
    super(field, formControl);

    this.className = 'AdLinks';

    // Initialize with empty callback for n of n selected behaviour
    this.handleChange((i, elem) => { });
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
      this.handleError(`${propertyName}: ${err}`);
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

      response.result.items.filter((item, i) => {
        return item.linkedAdAccounts.map((linkedAdAccount, i) => {
          if (!seenAdAccounts.includes(linkedAdAccount.linkedAccountId)) {
            if (linkedAdAccount.type == "ANALYTICS" || linkedAdAccount.type == "ADWORDS_LINKS") {
              // // Currently, do nothing with ANALYTICS or ADWORDS_LINKS type
              // console.log(linkedAdAccount);
              // linkedAdAccount.label = `${linkedAdAccount.type} > ${linkedAdAccount.webPropertyId}`;
              // linkedAdAccount.linkedAccountId = linkedAdAccount.webPropertyId; // FIXME: HACK ALERT!!
            } else {
              linkedAdAccount = this.castToAdwordsLink(linkedAdAccount);
              linkedAdAccounts.items.push(linkedAdAccount);
            }
            seenAdAccounts.push(linkedAdAccount.linkedAccountId);
          }
        })
      })

      this.handleAdAccounts(linkedAdAccounts);
    })
    .then(null, (err) => {
      this.handleError(`${propertyName}: ${err}`)
    })
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
    console.log(result);

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
