import ModelBase from './model-base';
import ui from '../config/ui';

class Goal extends ModelBase {
  constructor(profile, data = {}, live = false) {
    super();
    console.log(data);
    this.profile = profile;
    this.live = live;
    this.data = data;
  }

  static async all(accountId, webPropertyId) {
    return await this._api.list({
      accountId: accountId,
      webPropertyId: webPropertyId
    }).then((response) => {
      return response.result.items.map((item) => {
        return new Profile(item);
      })
    }).catch((err) => {
      console.log(err);
      return err;
    });
  }

  static async find(accountId, webPropertyId, profileId) {
    return await this._api
      .get({
        accountId: accountId,
        webPropertyId: webPropertyId,
        profileId: profileId
      })
      .then((response) => {
        return new Goal(response.result);
      })
      .catch((error) => {
        return error;
      });
  }

  static get _api() {
    return gapi.client.analytics.management.goals;
  }

  static batch() {
    return gapi.client.newBatch();
  }

  get _api() {
    return this.constructor._api;
  }
  upsert(resolve = false) {
    this.create(resolve).then((response1) => {
      console.log(response1);
    }).catch((error1) => {
      console.log(error1);
      this.update(resolve).then((response2) => {
        console.log(response2);
      }).catch((error2) => {
        console.log(error2)
      });
    });
  }

  create(resolve = true) {
    if (this.live) {
      const request = this._api.insert({
        accountId: this.profile.accountId,
        webPropertyId: this.profile.webPropertyId,
        profileId: this.profile.id
      }, this.toJson())

      if (resolve) {
        return this.deserialize(request)
      } else {
        return request;
      }
    } else {
      return;
    }
  }

  update(resolve = true) {
    return this._patch(this.toJson(), resolve);
  }

  destroy() {
    console.log('TODO');
  }

  deserialize(request) {
    return request.then((response) => {
      console.log(response);
      return new Goal(response.result);
    }).catch((error) => {
      console.log(error);
      // throw new Error(error);
    });
  }

  toJson() {
    const obj = {
      id: this.data.id,
      name: this.data.name,
      active: this.data.active,
      type: this.data.type,
      value: this.data.eventValue,
    }

    switch(this.data.type) {
    case "URL_DESTINATION":
      obj.urlDestinationDetails = {
        caseSensitive: this.data.urlDestination.caseSensitive,
        firstStepRequired: this.data.urlDestination.firstStepRequired,
        matchType: this.data.urlDestination.matchType,
        url: this.data.urlDestination.details,
        steps: this.data.urlDestination.funnel.map((step, i) => {
          return {
            number: (i + 1),
            name: step['ga-goal-funnel-step-name'],
            url: step['ga-goal-funnel-screen-page']
          }
        })
      }
      break;

    case "VISIT_NUM_PAGES":
      obj.visitNumPagesDetails = {
        comparisonType: this.data.numPages.comparisonType,
        comparisonValue: this.data.numPages.comparisonValue || 0
      }
      break;

    case "VISIT_TIME_ON_SITE":
      obj.visitTimeOnSiteDetails = {
        comparisonType: this.data.visitTimeOnSite.comparisonType,
        comparisonValue: this.data.visitTimeOnSite.comparisonValue || 0
      }
      break;

    case "EVENT":
      obj.eventDetails = {
        // eventConditions: [{
        //   comparisonType:
        //   comparisonValue:
        //   expression:
        //   matchType:
        //   type:
        // }],
        eventConditions: []
      }
      break;
    }

    return obj
  }

  eq(other) {
    if (other == undefined) {
      return false;
    }
    return parseInt(this.index) == parseInt(other.index) &&
           this.name == other.name &&
           this.scope == other.scope &&
           this.active == (other.active == "1");
  }


  _patch(data, resolve = true) {
    if (this.live) {
      const request = this._api.patch({
          accountId: this.profile.accountId,
          webPropertyId: this.profile.webPropertyId,
          profileId: this.profile.id,
          goalId: this.data.id
        }, this.toJson());

      if (resolve) {
        return this.deserialize(request);
      } else {
        return request;
      }
    } else {
      return;
    }
  }
}

export default Goal;
