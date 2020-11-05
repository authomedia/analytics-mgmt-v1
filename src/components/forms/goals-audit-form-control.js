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

    const header = $(`<div class="row">
      <div class="col">Audit Goals</div>
      <div class="col">${this.generateGoalSelectors()}<div>
    <div>`);

    header.find('#ga-goal-id').on('change', (e) => {
      const goalId = parseInt($(e.currentTarget).val(), 10);
      console.log(goalId);
      if (goalId == 0) {
        return this.modal.updateBody(dataTable.generateTable(headers, data));
      }

      const dupData = $.extend(true, [], data);

      const filteredData = dupData.map((row) => {
        row.objects = row.objects.filter((obj) => {
          return parseInt(obj.data.id, 10) === goalId;
        })
        return row;
      })
      return this.modal.updateBody(dataTable.generateTable(headers, filteredData));
    });

    console.log(data);

    this.modal.showModal(
      header,
      dataTable.generateTable(headers, data),
      {
        callback: (event) => {
          console.log(event);

        }
      }
    );
  }

  generateGoalSelectors() {
    return `
      <select type="text" name="ga-goal-id" id="ga-goal-id" class="form-control">
        <option value="0" selected>SHOW ALL</option>
        <option value="1">Goal Id 1 / Goal Set 1</option>
        <option value="2">Goal Id 2 / Goal Set 1</option>
        <option value="3">Goal Id 3 / Goal Set 1</option>
        <option value="4">Goal Id 4 / Goal Set 1</option>
        <option value="5">Goal Id 5 / Goal Set 1</option>

        <option value="6">Goal Id 6 / Goal Set 2</option>
        <option value="7">Goal Id 7 / Goal Set 2</option>
        <option value="8">Goal Id 8 / Goal Set 2</option>
        <option value="9">Goal Id 9 / Goal Set 2</option>
        <option value="10">Goal Id 10 / Goal Set 2</option>

        <option value="11">Goal Id 11 / Goal Set 3</option>
        <option value="12">Goal Id 12 / Goal Set 3</option>
        <option value="13">Goal Id 13 / Goal Set 3</option>
        <option value="14">Goal Id 14 / Goal Set 3</option>
        <option value="15">Goal Id 15 / Goal Set 3</option>

        <option value="16">Goal Id 16 / Goal Set 4</option>
        <option value="17">Goal Id 17 / Goal Set 4</option>
        <option value="18">Goal Id 18 / Goal Set 4</option>
        <option value="19">Goal Id 19 / Goal Set 4</option>
        <option value="20">Goal Id 20 / Goal Set 4</option>
      </select>
    `;
  }
}

export default GoalsAuditFormControl;
