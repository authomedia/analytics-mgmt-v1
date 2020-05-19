import ModelBase from './model-base';
import ui from '../config/ui';

class CustomMetric extends ModelBase {
  constructor(customMetric = {}) {
    super();
    this.index = customMetric.index
    this.name = customMetric.name;
    this.scope = customMetric.scope;
    this.type = customMetric.type;
    this.active = customMetric.active;
    this.accountId = customMetric.accountId;
    this.webPropertyId = customMetric.webPropertyId;
  }

  static async all(accountId, webPropertyId) {
    return await gapi.client.analytics.management.customMetrics.list({
      accountId: accountId,
      webPropertyId: webPropertyId
    }).then((response) => {
      return response.result.items.map((item) => {
        return new CustomMetric(item);
      })
    }).catch((err) => {
      console.log(err);
      return err;
    });
  }

  static async find(accountId, webPropertyId, index) {
    return await this._api
      .get({
        accountId: accountId,
        webPropertyId: webPropertyId,
        customMetricId: `ga:metric${index}`
      })
      .then((response) => {
        return new CustomMetric(response.result);
      })
      .catch((error) => {
        return error;
      });
  }

  static get _api() {
    return gapi.client.analytics.management.customMetrics;
  }

  static batch() {
    return gapi.client.newBatch();
  }

  get _api() {
    return this.constructor._api;
  }




  // NB. Create MUST be triggered squentially - it will not use the index value
  create(resolve = true) {
    const request = this._api.insert({
      accountId: this.accountId,
      webPropertyId: this.webPropertyId
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
      this.type = newValues.type;
      this.active = newValues.active;
    }
    return this._patch(this.toJson(), resolve);
  }

  destroy() {
    console.log('Custom metrics cannot be destroyed');
  }

  deserialize(request) {
    return request.then((response) => {
      console.log(response);
      return new CustomMetric(response.result);
    }).catch((error) => {
      console.log(error);
      // throw new Error(error);
    });
  }

  async activate() {
    return await this._patch({
      active: true
    });
  }

  async deactivate() {
    return await this._patch({
      active: false
    });
  }

  toJson() {
    return {
      name: this.name,
      scope: this.scope,
      type: this.type,
      active: (this.active == "1" || this.active)
    }
  }

  eq(other) {
    if (other == undefined) {
      return false;
    }
    return parseInt(this.index) == parseInt(other.index) &&
           this.name == other.name &&
           this.scope == other.scope &&
           this.type == other.type &&
           this.active == (other.active == "1");
  }


  _patch(data, resolve = true) {
    const request = this._api
      .patch({
        accountId: this.accountId,
        webPropertyId: this.webPropertyId,
        customMetricId: `ga:metric${this.index}`
      }, data);

    if (resolve) {
      return this.deserialize(request);
    } else {
      return request;
    }
  }
}

export default CustomMetric;
