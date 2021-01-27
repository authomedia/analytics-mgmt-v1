import EventEmitter from 'events';

import Analytics from '../analytics'

import FormControlBase from './form-control-base';

import SelectField from '../fields/select-field';
import AccountsField from '../fields/accounts-field';
import PropertiesField from '../fields/properties-field';
import ProfilesField from '../fields/profiles-field';
import RemarketingAudiencesField from '../fields/remarketing-audiences-field';
import LinkedViewsField from '../fields/linked-views-field';
import AdLinksField from '../fields/ad-links-field';
import LinkedAdAccountsField from '../fields/linked-ad-accounts-field';
import LiveApiToggleField from '../fields/live-api-toggle-field';
import AudienceTypeField from '../fields/audience-type-field';

import events from '../../config/events';
import ui from '../../config/ui';

const analytics = new Analytics(
  process.env.CLIENT_ID
  [process.env.SCOPES]
);

class FormControl extends FormControlBase {
  constructor() {
    super();

    this.analytics = analytics;

    this.accounts = new AccountsField($('#ga-accounts'), this);
    this.properties = new PropertiesField($('#ga-properties'), this);
    this.profiles = new ProfilesField($('#ga-profiles'), this);
    this.remarketingAudiences = new RemarketingAudiencesField($('#ga-remarketing'), this);
    this.linkedViews = new LinkedViewsField($('#ga-linked-views'), this);
    this.adLinks = new AdLinksField($('#ga-ad-links'), this);
    this.linkedAdAccounts = new LinkedAdAccountsField($('#ga-linked-ad-accounts'), this);

    this.audienceType = new AudienceTypeField($('#ga-remarketing-audience-type'), this);
    this.liveApiCallToggle = new LiveApiToggleField($('#ga-live-api-call-toggle'), this);

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
  }

  initRemarketingForm() {
    this.form.on('submit', (event) => {
      event.preventDefault();

      ui.debug.html('');

      this.showConfirmModal(() => {
        this.profiles.field.find('option:selected').each((i, profile) => {
          ui.debug.append(`${$(profile).text()}\n`);
          this.analytics.createRemarketingAudience($(profile), this);
          ui.debug.append(`\n\n`);
        })
      })
    });
  }

  showConfirmModal(callback) {
    ui.modal.showModal(
      this.analytics.translate.analytics.modals.remarketingAudienceModalTitle,
      `<p>${this.getAudienceInfo()}</p>`,
      {
        primaryText: this.analytics.translate.analytics.modals.primaryText,
        callback: (event) => {
          callback();
        }
      }
    )
  }

  getAudienceInfo() {
    let numProfiles = this.profiles.field.find('option:selected').length;
    let numDays = this.getMembershipDurationDays().length;
    let totalAudiences = numDays * numProfiles;

    return `Will create ${numDays} audiences for ${numProfiles} selected views/profiles (total ${totalAudiences})`;
  }

  // TODO: Refactor this as it is duplicated in here and the RemarketingAudiences class!
  getMembershipDurationDays() {
    let membershipDurationDays = this.remarketingForm.audienceDefinition.includeConditions.membershipDurationDays.val().split(',');
    if (this.audienceType.val() == "STATE_BASED") {
      membershipDurationDays = this.remarketingForm.stateBasedAudienceDefinition.includeConditions.membershipDurationDays.val().split(',');
    }
    return membershipDurationDays.map((days) => {
      return days.trim();
    }).filter(Boolean);
  }
}

export default FormControl;
