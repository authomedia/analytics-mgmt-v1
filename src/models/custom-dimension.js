import dedent from 'dedent';

import ModelBase from './model-base';
import ui from '../config/ui';

class CustomDimension extends ModelBase {
  constructor(profile, customDimension) {
    super();

    // Retry behaviour
    this.maxRetries = 5;
    this.initialWaitTime = 1000; // ms
    this.profile = profile;
    this.customDimension = customDimension;
  }

  create() {
    let customDimensions = this.toJson();
    this.debugJson(customDimensions);

    return;

    customDimensions.forEach((customDimensions) => {
      let request = gapi.client.analytics.management.customDimensions.insert(customDimension);
      this.executeRequest(request, customDimension);
    })
  }

  executeRequest(request, customDimension, retries = 0) {
    request.execute((response) => {
      // Handle the response.
      if (response.code && response.message) {
        let message = dedent(`
          ${customDimension.name}: ${customDimension.message}
        `);

        let options = {
          action: {
            text: 'RETRY',
            icon: 'reload',
            click: (event) => {
              let elem = $(event.currentTarget);
              this.executeRequest(request, customDimension);
            }
          }
        }

        this.handleRetry(
          response,
          request,
          audience,
          message,
          options,
          retries
        );

        // Always handle final errors with a toast message
        this.handleError(message, options);

      } else {
        let message = dedent(`
          ${customDimension.name}: ${this.translate.messages.customDimensionSuccess}
        `);

        this.handleSuccess(message);
      }
      this.debug(this.profile);
      this.debugJson(response);
      this.debug(`\n\n`);
    });
  }

  handleRetry(response, request, audience, message, options, retries = 0) {
    if (response.code == 429 || response.code == 403 || response.code == 400) {
      if (retries < this.maxRetries) {

        let waitTime = (Math.pow(2, retries) + Math.random());

        retries = retries += 1;

        this.handleError(`${response.error.data[0].reason}: ${message}`, options);

        // Wait for backoff time before trying again
        console.log(`Waiting for ${waitTime}s before continuing`);
        setTimeout(() => {
          this.executeRequest(request, audience, retries);
        }, waitTime * 1000);
      }
    }
  }

  toJson() {
    if (this.formIsValid()) {

      let requestBody = {
        accountId: this.profile.accountId,
        webPropertyId: this.profile.webPropertyId,
        resource: this.buildResource(this.customDimension)
      }

      return requestBody;

    } else {
      this.handleError(this.translate.analytics.errors.customDimensionsValidationError);
      return [];
    }
  }

  buildResource(customDimension) {
    const resource = {
      name: customDimension.name,
      index: customDimension.index,
      scope: customDimension.scope,
      active: customDimension.active == 1 ? true : false
    }

    return resource;
  }


  formIsValid() {
    return this.customDimension !== undefined;
  }

}

export default CustomDimension;
