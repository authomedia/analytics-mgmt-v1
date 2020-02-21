import dedent from 'dedent';

import ModelBase from './model-base';
import ui from '../config/ui';

class CustomDimension extends ModelBase {
  constructor(customDimension = {}) {
    super();
    this.index = customDimension.index
    this.name = customDimension.name;
    this.scope = customDimension.scope;
    this.active = customDimension.active;
    this.accountId = customDimension.accountId;
    this.webPropertyId = customDimension.webPropertyId;
  }

  static async all(accountId, webPropertyId) {
    return await gapi.client.analytics.management.customDimensions.list({
      accountId: accountId,
      webPropertyId: webPropertyId
    }).then((response) => {
      return response.result.items.map((item) => {
        return new CustomDimension(item);
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
        customDimensionId: `ga:dimension${index}`
      })
      .then((response) => {
        return new CustomDimension(response.result);
      })
      .catch((error) => {
        return error;
      });
  }

  static get _api() {
    return gapi.client.analytics.management.customDimensions;
  }

  get _api() {
    return this.constructor._api;
  }

  // NB. Create MUST be triggered squentially - it will not use the index value
  async create() {
    return await this._api.insert({
        accountId: this.accountId,
        webPropertyId: this.webPropertyId
      }, this.toJson())
      .then((response) => {
        return response
      }).
      catch((error) => {
        return error;
      });
  }

  update(newValues) {
    if (newValues) {
      this.name = newValues.name;
      this.scope = newValues.scope;
      this.active = newValues.active;
    }
    return this._patch(this.toJson())
  }

  destroy() {
    console.log('Custom dimensions cannot be destroyed');
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
      active: this.active
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


  _patch(data) {
    return this._api
      .patch({
        accountId: this.accountId,
        webPropertyId: this.webPropertyId,
        customDimensionId: `ga:dimension${this.index}`
      }, data)
      .then((response) => {
        return response
      }).
      catch((error) => {
        return error;
      });
  }


}

// class CustomDimension extends ModelBase {
//   constructor(profile, customDimension) {
//     super();

//     // Retry behaviour
//     this.maxRetries = 5;
//     this.initialWaitTime = 1000; // ms
//     this.profile = profile;
//   }

//   all() {
//     let request = gapi.client.analytics.management.customDimensions.list(profile, webPropertyId);
//     this.executeRequest(request)
//   }

//   create(customDimension) {
//     let customDimensions = this.toJson(customDimension);
//     this.debugJson(customDimensions);

//     return;

//     customDimensions.forEach((customDimensions) => {
//       let request = gapi.client.analytics.management.customDimensions.insert(customDimension);
//       this.executeRequest(request, customDimension);
//     })
//   }

//   executeRequest(request, customDimension, retries = 0) {
//     request.execute((response) => {
//       // Handle the response.
//       if (response.code && response.message) {
//         let message = dedent(`
//           ${customDimension.name}: ${customDimension.message}
//         `);

//         let options = {
//           action: {
//             text: 'RETRY',
//             icon: 'reload',
//             click: (event) => {
//               let elem = $(event.currentTarget);
//               this.executeRequest(request, customDimension);
//             }
//           }
//         }

//         this.handleRetry(
//           response,
//           request,
//           audience,
//           message,
//           options,
//           retries
//         );

//         // Always handle final errors with a toast message
//         this.handleError(message, options);

//       } else {
//         let message = dedent(`
//           ${customDimension.name}: ${this.translate.messages.customDimensionSuccess}
//         `);

//         this.handleSuccess(message);
//       }
//       this.debug(this.profile);
//       this.debugJson(response);
//       this.debug(`\n\n`);
//     });
//   }

//   handleRetry(response, request, audience, message, options, retries = 0) {
//     if (response.code == 429 || response.code == 403 || response.code == 400) {
//       if (retries < this.maxRetries) {

//         let waitTime = (Math.pow(2, retries) + Math.random());

//         retries = retries += 1;

//         this.handleError(`${response.error.data[0].reason}: ${message}`, options);

//         // Wait for backoff time before trying again
//         console.log(`Waiting for ${waitTime}s before continuing`);
//         setTimeout(() => {
//           this.executeRequest(request, audience, retries);
//         }, waitTime * 1000);
//       }
//     }
//   }

//   toJson(customDimension) {
//     if (this.isValid(customDimension)) {

//       let requestBody = {
//         accountId: this.profile.accountId,
//         webPropertyId: this.profile.webPropertyId,
//         resource: this.buildResource(customDimension)
//       }

//       return requestBody;

//     } else {
//       this.handleError(this.translate.analytics.errors.customDimensionsValidationError);
//       return [];
//     }
//   }

//   buildResource(customDimension) {
//     const resource = {
//       name: customDimension.name,
//       index: customDimension.index,
//       scope: customDimension.scope,
//       active: customDimension.active == 1 ? true : false
//     }

//     return resource;
//   }


//   isValid(customDimension) {
//     return customDimension !== undefined;
//   }

// }

export default CustomDimension;
