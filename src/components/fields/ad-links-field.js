import commaNumber from 'comma-number';

import queue from '../../utilities/queue';
import SelectField from './select-field';
import events from '../../config/events';
import AdvertiserActivity from '../../utilities/advertiser-activity';

class AdLinksField extends SelectField {
  constructor(field, formControl) {
    super(field, formControl);

    this.className = 'AdLinks';

    this.advertiserActivity = new AdvertiserActivity();

    this.showSessions = true;

    this.queue = queue;

    this.loadingQueue = [];

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
        this.init(
          $(event.elem).data('accountId'),
          $(event.elem).val(),
          $(event.elem).text().replace('---', '')
        );
      }
    });

    this.formControl.on(events.FIELDS.SHOW_SESSIONS.CHANGE, (event) => {
      this.showSessions = event.elem.prop('checked');
      console.log('Show sessions:', this.showSessions);
      console.log(this.field);

      this.field.find('option:selected').each((i, item) => {
        const elem = $(item).data('item');
        console.log(elem);
      });

      this.field.find('option').each((i, option) => {
        option = $(option);

        if (option.data('disabled')) {
          if (event.state == false) {
            option.prop('disabled', false);
          } else {
            option.prop('disabled', true);
          }
        }
      });

      this.setFieldVal();
      this.setSize();
    });
  }

  async init(accountId, propertyId, propertyName) {
    const params = {
      accountId: accountId,
      webPropertyId: propertyId
    }

    this.showLoader(params);

    Promise.all([
      this.loadAdwordsLinks(params),
      this.loadAdStats(params)
    ]).then((results) => {
      results[0].parentName = propertyName;

      this.appendSessionData(results[0], results[1]);

      const adwordsAccounts = this.getFlatAdwordsAccounts(results[0]);

      this.debugJson(adwordsAccounts);

      this.handleResult(adwordsAccounts);
      this.hideLoader();

      this.handleSuccess(`Loaded linked AdWords Accounts for ${propertyName}`);

    }).catch((error) => {
      this.hideLoader();
      try {
        this.handleError(error.result.error.message);
      } catch (e) {
        this.handleError(error.message);
      }
    });
  }

  loadAdwordsLinks(params) {
    return new Promise((resolve, reject) => {
      return this.queue(() => {
        gapi.client.analytics.management.webPropertyAdWordsLinks.list(params)
          .then((response) => {

            response.result.items.forEach((item) => {
              item.adWordsAccounts.forEach((adwordsAccount) => {
                adwordsAccount.name = adwordsAccount.customerId;
                adwordsAccount.webPropertyId = item.entity.webPropertyRef.id;
                adwordsAccount.internalWebPropertyId = item.entity.webPropertyRef.internalWebPropertyId;
                adwordsAccount.accountId = item.entity.webPropertyRef.accountId;
                adwordsAccount.id = adwordsAccount.customerId;
                adwordsAccount.type = 'ADWORDS_LINKS';
              });
            });

            return resolve(response.result);
          }).then(null, (error) => {
            return reject(error);
          });
      })
    });
  }

  appendSessionData(results, sessions) {
    if (this.showSessions) {
      results.items.forEach((item) => {
        item.adWordsAccounts.forEach((adwordsAccount) => {
          const sessionData = sessions[adwordsAccount.customerId.replace(/-/g, '')] || this.advertiserActivity.emptyObject(adwordsAccount.customerId, adwordsAccount.customerId);
          adwordsAccount.sessionData = sessionData;
          if (sessionData.sessions && sessionData.sessions > 0) {
            adwordsAccount.name = `${adwordsAccount.name} (${sessionData.sessions} sessions)`;
            adwordsAccount.hidden = false;
          } else {
            adwordsAccount.name = `${adwordsAccount.name} (0 sessions)`;
            adwordsAccount.hidden = true;
          }
        });
      });
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
      }).flat().sort((itemA, itemB) => {
        if (itemA.sessionData.sessions > itemB.sessionData.sessions) {
          return -1;
        } else if (itemA.sessionData.sessions < itemB.sessionData.sessions) {
          return 1;
        } else {
          return 0;
        }
        // if (itemA.name > itemB.name) {
        //   return 1;
        // } else if (itemA.name < itemB.name) {
        //   return -1;
        // } else {
        //   return 0;
        // }
      }),
    }
  }

  loadAdStats(params) {
    return new Promise((resolve, reject) => {
      const activeAccounts = {};

      if (!this.showSessions) {
        console.log('Skipping session lookup');
        return resolve(activeAccounts);
      }

      console.log('Loading session data');
      return this.queue(() => {
        gapi.client.analytics.management.profiles.list(params)
          .then((response) => {
            const promises = [];

            response.result.items.forEach((item) => {
              promises.push(
                this.advertiserActivity.find(item.id, activeAccounts, 'adwords')
              );
            });

            Promise.all(promises).then((results) => {
              return resolve(activeAccounts);
            }).catch((error) => {
              return resolve(activeAccounts);
            });
          }).then(null, (error) => {
            return reject(error);
          });
      });
    });
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
        hidden: 'hidden',
        group: {
          name: result.parentName
        }
      }
    );
  }
}

export default AdLinksField;
