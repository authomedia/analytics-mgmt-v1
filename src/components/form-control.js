import SelectField from './select-field';

class FormControl {
  constructor() {
    this.debug = $('#query-output');
    this.form = $('#analytics-ui form');

    this.accounts = new SelectField($('#ga-accounts'));
    this.properties = new SelectField($('#ga-properties'));
    this.profiles = new SelectField($('#ga-profiles'));
    this.remarketingAudiences = new SelectField($('#ga-remarketing'));
    this.linkedViews = new SelectField($('#ga-linked-views'));
    this.linkedAdAccounts = new SelectField($('#ga-linked-ad-accounts'));

    this.remarketingForm = {
      name: $('#ga-remarketing-name'),
      description: $('#ga-remarketing-description'),
      audienceType: $('#ga-remarketing-audience-type'),
      audienceDefinition: {
        includeConditions: {
          daysToLookBack: $('#ga-remarketing-include-condition-days-to-look-back'),
          segment: $('#ga-remarketing-include-condition-segment'),
          membershipDurationDays: $('#ga-remarketing-include-condition-membership-duration-days'),
          isSmartList: $('#ga-remarketing-include-condition-is-smart-list')
        }
      },
      stateBasedAudienceDefinition: {
        includeConditions: {
          daysToLookBack: $('#ga-remarketing-sb-include-condition-days-to-look-back'),
          segment: $('#ga-remarketing-sb-include-condition-segment'),
          membershipDurationDays: $('#ga-remarketing-sb-include-condition-membership-duration-days'),
          isSmartList: $('#ga-remarketing-sb-include-condition-is-smart-list')
        },
        excludeConditions: {
          segment: $('#ga-remarketing-sb-exclude-condition-segment'),
          exclusionDuration: $('#ga-remarketing-sb-exclusion-duration'),
        }
      }
    }
  }
}

export default FormControl;
