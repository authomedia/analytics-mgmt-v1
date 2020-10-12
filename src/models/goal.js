import ModelBase from './model-base';
import ui from '../config/ui';

class Goal extends ModelBase {
  constructor(data = {}) {
    super();
    console.log(data);
    let {

    } = data;
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
        return new Profile(response.result);
      })
      .catch((error) => {
        return error;
      });
  }

  static get _api() {
    return gapi.client.analytics.management.profiles;
  }

  static batch() {
    return gapi.client.newBatch();
  }

  get _api() {
    return this.constructor._api;
  }

  create(goal, resolve = true) {
    console.log(goal);
    return
    const request = this._api.insert({
      accountId: this.accountId,
      webPropertyId: this.webPropertyId,
      profileId: this.profileId
    }, this.toJson())

    if (resolve) {
      return this.deserialize(request)
    } else {
      return request;
    }
  }

  update(newValues, resolve = true) {
    if (newValues) {
      this.name = newValues.name;
      this.scope = newValues.scope;
      this.active = newValues.active;
    }
    return this._patch(this.toJson(), resolve);
  }

  destroy() {
    console.log('Custom dimensions cannot be destroyed');
  }

  deserialize(request) {
    return request.then((response) => {
      console.log(response);
      return new Profile(response.result);
    }).catch((error) => {
      console.log(error);
      // throw new Error(error);
    });
  }

  toJson() {
    return {
      excludeQueryParameters: this.excludeQueryParameters,
    }
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
    const request = this._api
      .patch({
        accountId: this.accountId,
        webPropertyId: this.webPropertyId,
        customDimensionId: `ga:dimension${this.index}`
      }, data);

    if (resolve) {
      return this.deserialize(request);
    } else {
      return request;
    }
  }
}

export default Goal;
