import SelectField from './select-field';
import AccountsField from './accounts-field';
import PropertiesField from './properties-field';
import ProfilesField from './profiles-field';
import RemarketingAudiencesField from './remarketing-audiences-field';
import LinkedViewsField from './linked-views-field';
import AdLinksField from './ad-links-field';
import LinkedAdAccountsField from './linked-ad-accounts-field';
import ToggleField from './toggle-field';

class FormControl {
  constructor(analytics) {
    this.analytics = analytics;

    this.debug = $('#query-output');
    this.form = $('#analytics-ui form');

    this.accounts = new AccountsField($('#ga-accounts'), this);
    this.properties = new PropertiesField($('#ga-properties'), this);
    this.profiles = new ProfilesField($('#ga-profiles'), this);
    this.remarketingAudiences = new RemarketingAudiencesField($('#ga-remarketing'), this);
    this.linkedViews = new LinkedViewsField($('#ga-linked-views'), this);
    this.adLinks = new AdLinksField($('#ga-ad-links'), this);
    this.linkedAdAccounts = new LinkedAdAccountsField($('#ga-linked-ad-accounts'), this);

    this.audienceType = new SelectField($('#ga-remarketing-audience-type'), this);

    this.submitButtons = $('button[type=submit]');

    this.liveApiCallToggle = new ToggleField($('#ga-live-api-call-toggle'), this);

    // Build Remarketing Audiences Form Lookups
    this.remarketingForm = {
      name: $('#ga-remarketing-name'),
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

    // Bind Select2 elements
    $('.select2').select2({
      width: 'element'
    });
  }

  // Setup account UI
  initAccountSelectionForm() {
    this.showSimpleAudienceTypeTabs();
  }

  initRemarketingForm() {
    this.audienceType.handleChange((i, elem) => {
      elem = $(elem);

      if (elem.val() == 'SIMPLE') {
        this.showSimpleAudienceTypeTabs();
      }

      if (elem.val() == 'STATE_BASED') {
        this.showStateBasedAudienceTypeTabs();
      }

    })

    this.form.on('submit', (event) => {
      event.preventDefault();

      this.debug.html('');

      this.profiles.field.find('option:selected').each((i, profile) => {
        this.debug.append(`${$(profile).text()}\n`);
        this.analytics.createRemarketingAudience($(profile));
        this.debug.append(`\n\n`);
      })
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
