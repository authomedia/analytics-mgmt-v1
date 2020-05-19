import dedent from 'dedent';

import ModelBase from './model-base';
import ui from '../config/ui';

class RemarketingAudience extends ModelBase {
  constructor(profile, formControl) {
    super();

    // Retry behaviour
    this.maxRetries = 5;
    this.initialWaitTime = 1000; // ms

    this.formControl = formControl;

    this.profile = $(profile).data('item');
    this.property = profile.property;
    this.remarketingForm = this.formControl.remarketingForm;

    this.linkedAdAccounts = this.filterAdAccounts();
  }

  create() {
    let audiences = this.toJson();

    this.debugJson(audiences);

    if (this.formControl.liveApiCallToggle.isChecked()) {
      audiences.forEach((audience) => {
        let request = gapi.client.analytics.management.remarketingAudience.insert(audience);
        this.executeRequest(request, audience);
      })
    }
  }

  executeRequest(request, audience, retries = 0) {
    request.execute((response) => {
      // Handle the response.
      if (response.code && response.message) {
        let message = dedent(`
          ${audience.webPropertyId} >
            ${audience.resource.name}:
            ${response.message}
        `);

        let options = {
          action: {
            text: 'RETRY',
            icon: 'reload',
            click: (event) => {
              let elem = $(event.currentTarget);
              this.executeRequest(request, audience);
            }
          }
        }

        // this.handleRetry(
        //   response,
        //   request,
        //   audience,
        //   message,
        //   options,
        //   retries
        // );

        // Always handle final errors with a toast message
        this.handleError(message, options);

      } else {
        let message = dedent(`
          ${audience.webPropertyId} >
            ${audience.resource.name}:
            ${this.translate.messages.remarketingSuccess}
        `);

        this.handleSuccess(message);
      }
      this.debug($(this.profile).text());
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

  filterAdAccounts() {
    return this.formControl.adLinks.field.find('option:selected')
      .filter((i, item) => {
        return $(item).data('item').entity.webPropertyRef.id == this.profile.webPropertyId;
      })
      .map((i, item) => {
        return $(item).data('item');
      })
  }

  toJson() {
    if (this.remarketingFormIsValid()) {

      let membershipDurationDays = this.getMembershipDurationDays();

      return membershipDurationDays.map((days) => {
        let requestBody = {
          accountId: this.profile.accountId,
          webPropertyId: this.profile.webPropertyId,
          resource: this.buildResource(days)
        }

        $.extend(requestBody.resource, this.buildSimpleConditions(days));
        $.extend(requestBody.resource, this.buildStateBasedConditions(days));

        return requestBody;
      });

    } else {
      this.handleError(this.translate.analytics.errors.remarketingAudiencesValidationError);
      return [];
    }
  }

  getMembershipDurationDays() {
    let membershipDurationDays = this.remarketingForm.audienceDefinition.includeConditions.membershipDurationDays.val().split(',');
    if (this.formControl.audienceType.val() == "STATE_BASED") {
      membershipDurationDays = this.remarketingForm.stateBasedAudienceDefinition.includeConditions.membershipDurationDays.val().split(',');
    }
    return membershipDurationDays.map((days) => {
      return days.trim();
    }).filter(Boolean);
  }

  buildResource(days) {
    let resource = {
      name: `${this.remarketingForm.name.val()} - ${days} Days`,
      linkedViews: [this.profile.id],
      linkedAdAccounts: this.buildLinkedAccounts(this.linkedAdAccounts, this.profile),
      audienceType: this.remarketingForm.audienceType.val(),
    }

    return resource;
  }

  buildSimpleConditions(days) {
    let includeConditions = this.remarketingForm.audienceDefinition.includeConditions;

    includeConditions.days = days;

    if (this.includeConditionsIsValid(includeConditions)) {
      return {
        audienceDefinition: {
          includeConditions: this.buildIncludeConditions(includeConditions)
        }
      }
    }
  }

  buildStateBasedConditions(days) {
    let includeConditions = this.remarketingForm.stateBasedAudienceDefinition.includeConditions;
    let excludeConditions = this.remarketingForm.stateBasedAudienceDefinition.excludeConditions;

    includeConditions.days = days;

    let resource = {}

    if (
      this.includeConditionsIsValid(includeConditions) ||
      this.excludeConditionsIsValid(excludeConditions)
    ) {
      resource.stateBasedAudienceDefinition = {};

      if (this.includeConditionsIsValid(includeConditions)) {
        resource.stateBasedAudienceDefinition.includeConditions = this.buildIncludeConditions(includeConditions);
      }

      if (this.excludeConditionsIsValid(excludeConditions)) {
        resource.stateBasedAudienceDefinition.excludeConditions = this.buildExcludeConditions(excludeConditions);
      }
    }

    return resource;
  }

  buildIncludeConditions(includeConditions) {
    if (this.includeConditionsIsValid(includeConditions)) {
      let daysToLookBack = parseInt(includeConditions.daysToLookBack.val());
      daysToLookBack = daysToLookBack > 0 ? daysToLookBack : null;

      return {
        daysToLookBack: daysToLookBack,
        segment: includeConditions.segment.val(),
        membershipDurationDays: parseInt(includeConditions.days),
        isSmartList: includeConditions.isSmartList.prop('checked')
      }
    }
  }

  buildExcludeConditions(excludeConditions) {
    if (this.excludeConditionsIsValid(excludeConditions)) {
      return {
        exclusionDuration: excludeConditions.exclusionDuration.val(),
        segment: excludeConditions.segment.val()
      }
    }
  }

  buildLinkedAccounts(linkedAdAccounts, profile){
    return $.makeArray(linkedAdAccounts.map((i, linkedAdAccount) => {
      return linkedAdAccount.adWordsAccounts.map((adWordsAccount, j) => {
        return {
          linkedAccountId: adWordsAccount.customerId,
          type: adWordsAccount.type ? adWordsAccount.type : 'ADWORDS_LINKS',
        }
      })
    })).flat(Infinity);
  }

  remarketingFormIsValid() {
    return this.remarketingForm.name.val() !== '';
  }

  includeConditionsIsValid(includeConditions) {
    return (
      includeConditions.segment.val() !== '' &&
      parseInt(includeConditions.daysToLookBack.val()) >= 0 &&
      (parseInt(includeConditions.days) > 0 && parseInt(includeConditions.days) <= 540)
    );
  }

  excludeConditionsIsValid(excludeConditions) {
    return (excludeConditions.segment.val() !== '');
  }
}

export default RemarketingAudience;
