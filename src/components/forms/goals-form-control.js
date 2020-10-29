import util from 'util';
import dedent from 'dedent';

import Analytics from '../analytics'
import FormControlBase from './form-control-base';
import AccountsField from '../fields/accounts-field';
import PropertiesField from '../fields/properties-field';
import ProfilesField from '../fields/profiles-field';
import SubmitButton from '../ui/submit-button';
import LiveApiToggleField from '../fields/live-api-toggle-field';


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

class GoalsFormControl extends FormControlBase {
  constructor() {
    super();

    this.analytics = analytics;

    this.formName = 'GoalsForm';

    this.accounts = new AccountsField($('#ga-accounts'), this);
    this.properties = new PropertiesField($('#ga-properties'), this);
    this.profiles = new ProfilesField($('#ga-profiles'), this);
    this.liveApiCallToggle = new LiveApiToggleField($('#ga-live-api-call-toggle'), this);

    this.goalFunnelFields = $('#ga-goal-funnel');

    const goalFunnelToggle = $('#ga-goal-funnel-toggle');
    const goalsFunnelRepeater = this.form.repeater({
      initEmpty: false,
      isFirstItemUndeletable: true,
      show: function(i) {
        // Show field
        $(this).show();
        $(this).collapse('show');

        // Remove the element from the DOM once it is collapsed/hidden
        $(this).on('hidden.bs.collapse', (event) => {
          $(event.currentTarget).remove();
        });
      },
      hide: function (deleteElement) {
        $(this).collapse('hide');
      },
      ready: function(setIndexes) {
        console.log('ready');
      }
    });

    // Set both instance and local vars so we can also reference them in the object below
    this.goalsFunnelRepeater = goalsFunnelRepeater;
    this.goalFunnelToggle = goalFunnelToggle;

    this.formFields = {
      goal: {
        name: $('#ga-goal-name'),
        id: $('#ga-goal-id'),
        active: $('#ga-goal-active'),
        tab: $('#ga-goal-tab'),
        eventValue: $('#ga-goal-event-value'),
        type: $('#ga-goal-type'),
        urlDestination: {
          details: $('#ga-goal-url-destination-details'),
          caseSensitive: $('#ga-goal-url-destination-case-sensitive'),
          matchType: $('#ga-goal-url-destination-match-type'),
          firstStepRequired: $('#ga-goal-url-destination-first-step-required'),
          funnelToggle: goalFunnelToggle,
          funnel: goalsFunnelRepeater,
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

    this.formFields.goal.tab.on('show.bs.tab', (event) => {
      const elem = $(event.target);
      console.log(elem.data('value'));
      this.formFields.goal.type.val(elem.data('value'));
    })


    this.initFormSubmit();
    // this.initAuditButton();

    this.snapshotManager = new SnapshotManager(
      this.formName,
      this.form,
      this.serializeForm.bind(this),
      this.hydrateForm.bind(this)
    );
  }

  getFunnelFields() {
    return $('#ga-goal-funnel').find('input[type=text]');
  }

  // initAuditButton() {
  //   this.auditButton.on(events.BUTTONS.SUBMIT.CLICK, (event) => {
  //     this.form.submit();
  //   })

  //   this.on(events.FIELDS.PROPERTIES.CHANGE, (event) => {
  //     this.auditButton.toggle(event.elem);
  //   });
  // }

  initFormSubmit() {
    this.form.on('submit', (event) => {
      event.preventDefault();
      this.profiles.field.find('option:selected').each((i, profile) => {
        ui.debug.append(`${$(profile).text()}\n`);
        this.analytics.upsertGoal(
          $(profile).data('item'),
          this.serializeForm().goal,
          this.liveApiCallToggle.isChecked()
        );
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
        name: goal.name.val(),
        id: goal.id.val(),
        active: goal.active.prop('checked'),
        eventValue: goal.eventValue.val(),
        tab: goal.tab.find('li a.nav-link.active').prop('id'),
        type: goal.type.val(),
        urlDestination: {
          details: goal.urlDestination.details.val(),
          matchType: goal.urlDestination.matchType.val(),
          caseSensitive: goal.urlDestination.caseSensitive.prop('checked'),
          firstStepRequired: goal.urlDestination.firstStepRequired.prop('checked'),
          funnelToggle: goal.urlDestination.funnelToggle.prop('checked'),
          funnel: goal.urlDestination.funnel.repeaterVal()['ga-goal-funnel-list'],
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

    goal.name.val(data.goal.name);
    goal.id.val(data.goal.id);
    goal.active.prop('checked', data.goal.active);
    goal.eventValue.val(data.goal.eventValue);

    goal.tab.find(`li a.nav-link#${data.goal.tab}`).trigger('click');

    goal.urlDestination.details.val(data.goal.urlDestination.details);
    goal.urlDestination.caseSensitive.prop('checked', data.goal.urlDestination.caseSensitive);
    goal.urlDestination.firstStepRequired.prop('checked', data.goal.urlDestination.firstStepRequired);
    goal.urlDestination.matchType.val(data.goal.urlDestination.matchType);
    if (data.goal.urlDestination.funnelToggle && !goal.urlDestination.funnelToggle.prop('checked')) {
      goal.urlDestination.funnelToggle.trigger('click');
    }
    goal.urlDestination.funnel.setList(data.goal.urlDestination.funnel);


    goal.visitTimeOnSite.details.val(data.goal.visitTimeOnSite.details);
    goal.visitTimeOnSite.comparisonType.val(data.goal.visitTimeOnSite.comparisonType);
    goal.visitTimeOnSite.comparisonValue.val(data.goal.visitTimeOnSite.comparisonValue);

    goal.numPages.details.val(data.goal.numPages.details);
    goal.numPages.comparisonType.val(data.goal.numPages.comparisonType);
    goal.numPages.comparisonValue.val(data.goal.numPages.comparisonValue);

    goal.event.details.val(data.goal.event.details);


    // goal.event.conditions.val(data.goal.event.conditions); // FIXME

    goal.event.useEventValue.val(data.goal.event.useEventValue);
  }
}

export default GoalsFormControl;
