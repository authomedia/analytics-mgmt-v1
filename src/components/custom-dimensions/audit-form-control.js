import SelectField from './select-field';
import AccountsField from './accounts-field';
import PropertiesField from './properties-field';
import ProfilesField from './profiles-field';
import RemarketingAudiencesField from './remarketing-audiences-field';
import LinkedViewsField from './linked-views-field';
import AdLinksField from './ad-links-field';
import LinkedAdAccountsField from './linked-ad-accounts-field';
import LiveApiToggleField from './live-api-toggle-field';
import AudienceTypeField from './audience-type-field';

import Modal from './modal';

class AuditFormControl {
  constructor(analytics) {
    this.analytics = analytics;

    this.modal = new Modal();

    this.debug = $('#query-output');
    this.logger = $('#logger-output > ul');

    this.loggerClear = $('#logger-clear');

    this.form = $('#ga-custom-dimensions-audit form');

    this.accounts = new AccountsField($('#ga-accounts'), this);
    this.properties = new PropertiesField($('#ga-properties'), this);

    this.submitButtons = $('button[type=submit]');

    // Bind Select2 elements
    $('.select2').select2({
      width: 'element'
    });

    this.initLoggerClearButton();
  }

  initLoggerClearButton() {
    this.loggerClear.on('click', (event) => {
      event.preventDefault();
      this.logger.empty();
    })
  }

  initRemarketingForm() {
    this.form.on('submit', (event) => {
      event.preventDefault();

      this.debug.html('');

      this.showConfirmModal(() => {
        this.profiles.field.find('option:selected').each((i, profile) => {
          this.debug.append(`${$(profile).text()}\n`);
          this.analytics.createRemarketingAudience($(profile));
          this.debug.append(`\n\n`);
        })
      })
    });
  }

  showConfirmModal(callback) {
    this.modal.showModal(
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
