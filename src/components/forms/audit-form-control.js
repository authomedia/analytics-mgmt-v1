import util from 'util';
// import TableBuilder from 'table-builder';

import CustomDimension from '../../models/custom-dimension';

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
      this.currentData = Object.assign({}, data);

      data.unshift(constants.DB_FIELDS);
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

      // Testing only
      // this.findCustomDimension($(options[0]).data('item'), 2).then((data) => {
      //   console.log(data);
      // })
    });
  }

  async findCustomDimension(item, index) {
    return await this.analytics.findCustomDimension(item.accountId, item.id, index).then((response) => {
      return {
        item: item,
        customDimension: response
      }
    });
  }

  listCustomDimensions(options) {
    return Promise.all(
      options.map(async (i, elem) => {
        const item = $(elem).data('item');
        return await this.analytics.listCustomDimensions(item.accountId, item.id).then((response) => {
          return {
            item: item,
            customDimensions: response
          }
        });
      })
    )
  }

  generateAuditTable(data) {
    let table = $(`<table id='audit-table'></table>`);
    let tableClasses = 'table table-striped table-bordered table-responsive-xl text-center';

    let options = {
      classes: tableClasses,
      columns: [
        {
          field: 'property',
          title: translate('analytics.tables.customDimensions.property')
        }
      ]
    };

    Object.values(this.currentData).map((item) => {
      const label = `customDimension${item.index}`;
      options.columns.push({
        field: label,
        title: item.index,
        formatter: this.formatCell,
        events: {
          'click .oi': (e, value, row, index) => {
            return value.event(table, value, row, index)
          }
        }
      });
    });

    options.columns.push({
      field: 'actions',
      title: 'Actions',
      events: {
        'click .action-sync': (e, value, row, index) => {
          Object.values(row).forEach((item) => {
            if (item.event) {
              item.event(table, item, row, index);
            }
          });
        }
      }
    })

    let rows = data.map((item) => {
      let row = this.newRow(item);

      Object.values(this.currentData).forEach((col) => {
        return this.buildCell(item, col, row);
      })

      return row;
    });

    rows = rows.sort((a, b) => {
      if (a.property < b.property) {
        return -1;
      }
      if (a.property > b.property) {
        return 1;
      }
      return 0;
    })

    options.data = rows;

    table.bootstrapTable(options);

    return table;
  }

  newRow(item) {
    return {
      property: item.item.name,
      actions: `
        <a href="javascript:void(0);" class="action-sync">
          <span class="oi oi-random"></span>
          Sync
        </a>
      `
    };
  }

  buildCell(item, col, row) {
    let label = `customDimension${col.index}`;
    let customDimension = item.customDimensions.filter((cell) => {
      return col.index == cell.index;
    })[0];

    row[label] = {
      field: label,
      customDimension: customDimension,
      data: col,
      property: item.item,
      event: this.updateCell.bind(this),
      updating: false
    };

    return row;
  }

  formatCell(value, row, index, field) {
    let icon, color;
    if (value.updating == true) {
      return '<div class="spinner-grow text-primary spinner-small" role="status"><span class="sr-only">Loading...</span></div>';
    }
    if (value.customDimension == undefined) {
      icon = 'oi-circle-x';
      color = 'text-warning';
    } else {
      let same = value.customDimension.eq(value.data);
      icon = same ? 'oi-circle-check' : 'oi-circle-x';
      color = same ? 'text-success' : 'text-danger';
    }

    return `<span class="oi ${icon} ${color}"></span>`;
  }

  updateCell(table, value, row, index) {
    // Dont allow multiple overlapping update events
    if (value.updating == true) {
      return;
    }

    // Activate spinner
    value.updating = true;
    table.bootstrapTable('updateCell', {index: index, value: value, field: value.field});

    // Decide if to create or update
    if (value.customDimension == undefined) {
      // Create a new one
      value.customDimension = new CustomDimension(value.data);
      value.customDimension.accountId = value.property.accountId;
      value.customDimension.webPropertyId = value.property.id;

      console.log(value.customDimension);
      //value.customDimension.create().then((data) => {
        this.handleSuccess('Created new custom dimension');
        value.updating = false;
        table.bootstrapTable('updateCell', {index: index, value: value, field: value.field});
      //});
    } else {
      // Update existing one
      value.customDimension.update(value.data).then((data) => {
        this.handleSuccess('Updated custom dimension');
        value.updating = false;
        table.bootstrapTable('updateCell', {index: index, value: value, field: value.field});
      });
    }
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
    this.tableGenerator.setData(data);
    this.tableGenerator.generateTable(this.wrapper)
  }
}

export default AuditFormControl;
