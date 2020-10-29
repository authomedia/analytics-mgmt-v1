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

import DataTable from '../data-table';
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
    this.liveApiCallToggle = new LiveApiToggleField($('#ga-live-api-call-toggle'), this);
    this.auditButton = new SubmitButton($('#audit-button'), this);

    this.formFields = {}


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
      const options = this.profiles.field.find('option:selected')

      const headers = {
        'id': 'ID',
        'name': 'Name',
        'type': 'Type',
        'value': 'Value',
        'active': 'Active?',
        'eventDetails': 'Event',
        'urlDestinationDetails': 'URL',
        'timeOnSiteDetails': 'Time',
        'noPagesDetails': 'No. Pages'
      }

      this.listGoals(options).then((data) => {
        this.displayDataTable(headers, data);
      });

    });
  }

  listGoals(options) {
    return Promise.all(
      options.map(async (i, elem) => {
        const item = $(elem).data('item');

        return await this.analytics.listGoals(item.accountId, item.webPropertyId, item.id).then((response) => {
          return {
            item: item,
            objects: response
          }
        });
      })
    )
  }

  displayDataTable(headers, data) {
    const dataTable = new DataTable(
      'Goals',
      'goal',
      Goal,
      'Audit Goals'
    );

    this.modal.showModal(
      'Audit Goals',
      dataTable.generateTable(headers, data),
      {
        callback: (event) => {
          console.log(event);
        }
      }
    );
  }
}

export default GoalsAuditFormControl;
