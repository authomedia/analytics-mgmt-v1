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

const analytics = new Analytics(
  process.env.CLIENT_ID
  [process.env.SCOPES]
);

class GoalsAuditFormControl extends FormControlBase {
  constructor() {
    super();

    this.analytics = analytics;

    this.accounts = new AccountsField($('#ga-accounts'), this);
    this.properties = new PropertiesField($('#ga-properties'), this);
    this.profiles = new ProfilesField($('#ga-profiles'), this);

    this.auditButton = new SubmitButton($('#audit-button'), this);

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

    this.initFormSubmit();
    this.initAuditButton();
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
        this.analytics.createGoals($(profile), this.goalForm);
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
}

export default GoalsAuditFormControl;
