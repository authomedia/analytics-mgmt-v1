import Analytics from '../analytics'

import FormControlBase from './form-control-base';

import AccountsField from '../fields/accounts-field';
import PropertiesField from '../fields/properties-field';
import SubmitButton from '../ui/submit-button';

import TableGenerator from '../../utilities/table-generator';

import constants from '../../config/constants';
import events from '../../config/events';
import ui from '../../config/ui';
import { translate } from '../../utilities/translate'
import db from '../../models/db';

const analytics = new Analytics(
  process.env.CLIENT_ID
  [process.env.SCOPES]
);

class AuditFormControl extends FormControlBase {
  constructor() {
    super();
    this.analytics = analytics;
    this.accounts = new AccountsField($('#ga-accounts'), this);
    this.properties = new PropertiesField($('#ga-properties'), this);
    this.auditButton = new SubmitButton($('#custom-dimensions-audit-button'), this);
    this.wrapper = $('#custom-dimensions-table-wrapper');
    this.tableGenerator = new TableGenerator();

    this.initFormSubmit();
    this.initAuditButton();

    db.customDimensions.toArray((data) => {
      data.unshift(constants.DB_FIELDS);
      this.currentData = data;
      this.updateTable(data);
    });
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

      const options = this.properties.field.find('option:selected');
      this.listCustomDimensions(options).then((data) => {
        this.displayAuditTable(data);
      });
    });
  }

  listCustomDimensions(options) {
    return Promise.all(
      options.map(async (i, elem) => {
        const item = $(elem).data('item');
        return await this.analytics.listCustomDimensions(item.accountId, item.id).then((response) => {
          return response;
        });
      })
    )
  }

  generateAuditTable(data) {
    return data;
  }

  displayAuditTable(data) {
    this.modal.showModal(
      translate('analytics.modals.customDimensions.audit'),
      this.generateAuditTable(data),
      {
      callback: (event) => {
        console.log(event);
      }
    });
  }

  updateTable(data) {
    this.tableGenerator.setData(this.currentData);
    this.tableGenerator.generateTable(this.wrapper)
  }
}

export default AuditFormControl;
