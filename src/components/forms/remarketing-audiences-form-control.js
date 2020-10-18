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
import DV360LinksField from '../fields/dv360-links-field';

// import LinkedAdAccountsField from '../fields/linked-ad-accounts-field';
import LiveApiToggleField from '../fields/live-api-toggle-field';
import ShowSessionsToggleField from '../fields/show-sessions-toggle-field';
import AudienceTypeField from '../fields/audience-type-field';
import Button from '../ui/button';

import ui from '../../config/ui';

import { translate } from '../../utilities/translate'
import SnapshotManager from '../../utilities/snapshot-manager';

const analytics = new Analytics(
  process.env.CLIENT_ID
  [process.env.SCOPES]
);

class RemarketingAudiencesFormControl extends FormControlBase {
  constructor() {
    super();

    this.analytics = analytics;

    this.formName = 'RemarketingAudiencesForm';

    this.accounts = new AccountsField($('#ga-accounts'), this);
    this.properties = new PropertiesField($('#ga-properties'), this);
    this.profiles = new ProfilesField($('#ga-profiles'), this);
    this.remarketingAudiences = new RemarketingAudiencesField($('#ga-remarketing'), this);
    this.linkedViews = new LinkedViewsField($('#ga-linked-views'), this);
    this.adLinks = new AdLinksField($('#ga-ad-links'), this);
    this.dv360Links = new DV360LinksField($('#ga-dv360-links'), this);

    this.audienceType = new AudienceTypeField($('#ga-remarketing-audience-type'), this);
    this.liveApiCallToggle = new LiveApiToggleField($('#ga-live-api-call-toggle'), this);
    this.showSessionsToggle = new ShowSessionsToggleField($('#ga-show-sessions-toggle'), this);

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

  init() {
    this.snapshotManager = new SnapshotManager(
      this.formName,
      this.remarketingForm,
      this.serializeForm.bind(this),
      this.hydrateForm.bind(this)
    );

    this.form.on('submit', (event) => {
      event.preventDefault();

      ui.debug.html('');

      this.showConfirmModal(() => {
        this.profiles.field.find('option:selected').each((i, profile) => {
          ui.debug.append(`${$(profile).text()}\n`);
          // this.analytics.listRemarketingAudiences($(profile), this);
          this.analytics.createRemarketingAudience($(profile), this);
          ui.debug.append(`\n\n`);
        })
      })
    });
  }


  showConfirmModal(callback) {
    ui.modal.showModal(
      translate('analytics.modals.remarketingAudienceModalTitle'),
      `<p>${this.getAudienceInfo()}</p>`,
      {
        primaryText: translate('analytics.modals.primaryText'),
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

  serializeForm() {
    const form = this.remarketingForm;

    return {
      name: form.name.val(),
      audienceType: form.audienceType.val(),
      audienceDefinition: {
        includeConditions: {
          daysToLookBack: form.audienceDefinition.includeConditions.daysToLookBack.val(),
          segment: form.audienceDefinition.includeConditions.segment.val(),
          membershipDurationDays: form.audienceDefinition.includeConditions.membershipDurationDays.val(),
          isSmartList: form.audienceDefinition.includeConditions.isSmartList.prop('checked'),
        }
      },
      stateBasedAudienceDefinition: {
        includeConditions: {
          daysToLookBack: form.stateBasedAudienceDefinition.includeConditions.daysToLookBack.val(),
          segment: form.stateBasedAudienceDefinition.includeConditions.segment.val(),
          membershipDurationDays: form.stateBasedAudienceDefinition.includeConditions.membershipDurationDays.val(),
          isSmartList: form.stateBasedAudienceDefinition.includeConditions.isSmartList.val(),
        },
        excludeConditions: {
          segment: form.stateBasedAudienceDefinition.excludeConditions.segment.val(),
          exclusionDuration: form.stateBasedAudienceDefinition.excludeConditions.exclusionDuration.val(),
        }
      }
    }
  }

  hydrateForm(data) {
    const form = this.remarketingForm;

    form.name.val(data.name);
    form.audienceType.val(data.audienceType);
    form.audienceType.trigger('change');

    form.audienceDefinition.includeConditions.daysToLookBack.val(
      data.audienceDefinition.includeConditions.daysToLookBack
    );
    form.audienceDefinition.includeConditions.segment.val(
      data.audienceDefinition.includeConditions.segment
    );
    form.audienceDefinition.includeConditions.membershipDurationDays.val(
      data.audienceDefinition.includeConditions.membershipDurationDays
    );
    form.audienceDefinition.includeConditions.isSmartList.val(
      data.audienceDefinition.includeConditions.isSmartList
    );

    form.stateBasedAudienceDefinition.includeConditions.daysToLookBack.val(
      data.stateBasedAudienceDefinition.includeConditions.daysToLookBack
    );
    form.stateBasedAudienceDefinition.includeConditions.segment.val(
      data.stateBasedAudienceDefinition.includeConditions.segment
    );
    form.stateBasedAudienceDefinition.includeConditions.membershipDurationDays.val(
      data.stateBasedAudienceDefinition.includeConditions.membershipDurationDays
    );
    form.stateBasedAudienceDefinition.includeConditions.isSmartList.prop(
      'checked',
      data.stateBasedAudienceDefinition.includeConditions.isSmartList
    );

    form.stateBasedAudienceDefinition.excludeConditions.segment.val(
      data.stateBasedAudienceDefinition.excludeConditions.segment
    );
    form.stateBasedAudienceDefinition.excludeConditions.exclusionDuration.val(
      data.stateBasedAudienceDefinition.excludeConditions.exclusionDuration
    );
  }
}

export default RemarketingAudiencesFormControl;
