import util from 'util';
import dedent from 'dedent';

// import View from '../../models/view';
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
import View from '../../models/view';

const analytics = new Analytics(
  process.env.CLIENT_ID
  [process.env.SCOPES]
);

class ViewEditFormControl extends FormControlBase {
  constructor() {
    super();
    this.analytics = analytics;
    this.accounts = new AccountsField($('#ga-accounts'), this);
    this.properties = new PropertiesField($('#ga-properties'), this);
    this.profiles = new ProfilesField($('#ga-profiles'), this);

    this.auditButton = new SubmitButton($('#audit-button'), this);

    this.auditTable = new AuditTable(
      'Profile',
      'view',
      View,
      'Modal title'
    );

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
      const options = this.profiles.field.find('option:selected');

      const headers = {
        'excludeQueryParameters': 'Exclude URL Params'
      }

      this.listViews(options).then((data) => {
        this.displayAuditTable(headers, data);
      });

    });
  }

  listViews(options) {
    return Promise.all(
      options.map(async (i, elem) => {
        const item = $(elem).data('item');
        console.log(item);
        return await this.analytics.listViews(item.accountId, item.webPropertyId).then((response) => {
          return {
            item: item,
            objects: response
          }
        });
      })
    )
  }

  displayAuditTable(headers,data) {
    this.modal.showModal(
      'Audit Profiles',
      this.auditTable.generateTable(headers, data),
      {
      callback: (event) => {
        console.log(event);
      }
    });
  }
}

export default ViewEditFormControl;
