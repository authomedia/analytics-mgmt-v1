import util from 'util';
import dedent from 'dedent';

import Analytics from '../analytics'
import FormControlBase from './form-control-base';
import AccountsField from '../fields/accounts-field';
import PropertiesField from '../fields/properties-field';
import ProfilesField from '../fields/profiles-field';
import SubmitButton from '../ui/submit-button';

import constants from '../../config/constants';
import events from '../../config/events';
import ui from '../../config/ui';
import { translate } from '../../utilities/translate'
import db from '../../models/db';

import AuditTable from '../audit-table';
import Goal from '../../models/goal';

import SnapshotManager from '../../utilities/snapshot-manager';

const analytics = new Analytics(
  process.env.CLIENT_ID
  [process.env.SCOPES]
);

class GoalsAuditFormControl extends FormControlBase {
  constructor() {
    super();

    this.analytics = analytics;

    this.formName = 'GoalsAuditForm';

    this.accounts = new AccountsField($('#ga-accounts'), this);
    this.properties = new PropertiesField($('#ga-properties'), this);
    this.profiles = new ProfilesField($('#ga-profiles'), this);

    this.auditButton = new SubmitButton($('#audit-button'), this);
    this.goalFunnelToggle = $('#ga-goal-funnel-toggle');

    this.goalFunnelFields = $('#ga-goal-funnel');

    this.formFields  = {
      goal: {
        id: $('#ga-goal-id'),
        active: $('#ga-goal-active'),
        eventValue: $('#ga-goal-event-value'),
        urlDestination: {
          details: $('#ga-goal-url-destination-details'),
          caseSensitive: $('#ga-goal-url-destination-case-sensitive'),
          matchType: $('#ga-goal-url-destination-match-type'),
        },
        visitTimeOnSite: {
          details: $('#ga-goal-visit-time-on-site-details'),
          comparisonType: $('#ga-goal-visit-time-on-site-comparison-type'),
          comparisonValue: $('#ga-goal-visit-time-on-site-comparison-value')
        },
        numPages: {
          details: $('#ga-goal-visit-num-pages'),
          comparisonType: $('#ga-goal-visit-num-pages-comparison-type'),
          comparisonValue: $('#ga-goal-visit-num-pages-comparison-value')
        },
        event: {
          details: $('#ga-goal-event-details'),
          conditions: [{
            type: $('#ga-goal-event-conditions[type]'),
            comparisonType: $('#ga-goal-event-conditions[comparison-type]'),
            comparisonValue: $('#ga-goal-event-conditions[comparison-value]'),
            matchType: $('#ga-goal-event-conditions[match-type]'),
            expression: $('#ga-goal-event-conditions[expression]'),
          }],
          useEventValue: $('#ga-goal-event-use-event-value')
        }
      }
    }
    // this.auditTable = new AuditTable(
    //   'Goals',
    //   'goal',
    //   Goal,
    //   'Audit Goals'
    // );

    this.goalFunnelToggle.on('change', () => {
      this.goalFunnelFields.toggleClass('d-none');
    })

    const goalsFunnelRepeater = this.form.repeater({
      initEmpty: false,
      isFirstItemUndeletable: true,
      show: function(i) {
        // Set toggle label actions
        // let toggle = $(this).find('.custom-control-input');
        // let toggleLabel = $(this).find('.custom-control-label');
        // let toggleName = toggle.attr('name');
        // toggle.attr('id', toggleName);
        // toggleLabel.attr('for', toggleName);

        // Show field
        $(this).show();
        $(this).collapse('show');
      },
      hide: function (deleteElement) {
        $(this).collapse('hide');
      },
      ready: function(setIndexes) {
        console.log('ready');
      }
    });


    this.initFormSubmit();
    this.initAuditButton();

    this.snapshotManager = new SnapshotManager(
      this.formName,
      this.form,
      this.serializeForm.bind(this),
      this.hydrateForm.bind(this)
    );
  }

  initAuditButton() {
    this.auditButton.on(events.BUTTONS.SUBMIT.CLICK, (event) => {
      this.form.submit();
    })

    this.on(events.FIELDS.PROPERTIES.CHANGE, (event) => {
      this.auditButton.toggle(event.elem);
    });
  }

  initFormSubmit() {
    this.form.on('submit', (event) => {
      event.preventDefault();
      this.profiles.field.find('option:selected').each((i, profile) => {
        ui.debug.append(`${$(profile).text()}\n`);
        this.analytics.createGoals($(profile), this.formFields);
        ui.debug.append(`\n\n`);
      });

      // const headers = {
      //   'excludeQueryParameters': 'Exclude URL Params'
      // }

      // this.listProfiles(options).then((data) => {
      //   this.displayAuditTable(headers, data);
      // });

    });
  }

  // listProfiles(options) {
  //   return Promise.all(
  //     options.map(async (i, elem) => {
  //       const item = $(elem).data('item');
  //       return await this.analytics.listProfiles(item.accountId, item.webPropertyId).then((response) => {
  //         return {
  //           item: item,
  //           objects: response
  //         }
  //       });
  //     })
  //   )
  // }

  // displayAuditTable(headers,data) {
  //   this.modal.showModal(
  //     'Audit Goals',
  //     this.auditTable.generateTable(headers, data),
  //     {
  //       callback: (event) => {
  //         console.log(event);
  //       }
  //     }
  //   );
  // }

  serializeForm() {
    const goal = this.formFields.goal;

    const serializedForm = {
      goal: {
        id: goal.id.val(),
        active: goal.active.val(),
        eventValue: goal.eventValue.val(),
        urlDestination: {
          details: goal.urlDestination.details.val(),
          caseSensitive: goal.urlDestination.caseSensitive.val(),
          matchType: goal.urlDestination.matchType.val(),
        },
        visitTimeOnSite: {
          details: goal.visitTimeOnSite.details.val(),
          comparisonType: goal.visitTimeOnSite.comparisonType.val(),
          comparisonValue: goal.visitTimeOnSite.comparisonValue.val()
        },
        numPages: {
          details: goal.numPages.details.val(),
          comparisonType: goal.numPages.comparisonType.val(),
          comparisonValue: goal.numPages.comparisonValue.val()
        },
        event: {
          details: goal.event.details.val(),
          conditions: [],
          useEventValue: goal.event.useEventValue.val()
        }
      }
    }

    // serializedForm.goal.event.conditions = '' // FIXME

    return serializedForm;
  }

  hydrateForm(data) {
    const goal = this.formFields.goal;

    goal.id.val(data.goal.id);
    goal.active.val(data.goal.active);
    goal.eventValue.val(data.goal.eventValue);

    goal.urlDestination.details.val(data.goal.urlDestination.details);
    goal.urlDestination.caseSensitive.val(data.goal.urlDestination.caseSensitive);
    goal.urlDestination.matchType.val(data.goal.urlDestination.matchType);

    goal.visitTimeOnSite.details.val(data.goal.urlDestination.details);
    goal.visitTimeOnSite.comparisonType.val(data.goal.urlDestination.comparisonType);
    goal.visitTimeOnSite.comparisonValue.val(data.goal.urlDestination.comparisonValue);

    goal.numPages.details.val(data.goal.numPages.details);
    goal.numPages.comparisonType.val(data.goal.numPages.comparisonType);
    goal.numPages.comparisonValue.val(data.goal.numPages.comparisonValue);

    goal.event.details.val(data.goal.event.details);
    // goal.event.conditions.val(data.goal.event.conditions); // FIXME
    goal.event.useEventValue.val(data.goal.event.useEventValue);
  }
}

export default GoalsAuditFormControl;
