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
    this.adLinks = new SelectField($('#ga-ad-links'));
    this.linkedAdAccounts = new SelectField($('#ga-linked-ad-accounts'));

    this.audienceType = new SelectField($('#ga-remarketing-audience-type'));

    this.liveApiCallToggle = $('#ga-live-api-call-toggle');

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

    $('.select2').select2({
      width: 'element'
    });
  }

  showSimpleAudienceTypeTabs() {
    $('.ga-remarketing-audience-type-simple-tab').show();
    $('.ga-remarketing-audience-type-state-based-tab').hide();

    $('.ga-remarketing-audience-type-simple-tab a:first').tab('show');

    $('#ga-remarketing-audience-sb-include-conditions, #ga-remarketing-audience-sb-exclude-conditions').find('input, textarea').val(null);

  }

  showStateBasedAudienceTypeTabs() {
    $('.ga-remarketing-audience-type-simple-tab').hide();
    $('.ga-remarketing-audience-type-state-based-tab').show();

    $('.ga-remarketing-audience-type-state-based-tab a:first').tab('show');

    $('#ga-remarketing-audience-include-conditions').find('input, textarea').val(null);
  }
}

export default FormControl;
