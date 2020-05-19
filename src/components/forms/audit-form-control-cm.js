import util from 'util';
import dedent from 'dedent';
// import TableBuilder from 'table-builder';

import CustomMetric from '../../models/custom-metric';

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
    this.auditButton = new SubmitButton($('#custom-metrics-audit-button'), this);
    this.wrapper = $('#custom-metrics-table-wrapper');
    this.tableGenerator = new TableGenerator();

    this.initFormSubmit();
    this.initAuditButton();


    db.customMetrics.toArray((data) => {
      this.currentData = Object.assign({}, data);

      data.unshift(constants.DB_FIELDS2);
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

      this.listCustomMetrics(options).then((data) => {
        this.displayAuditTable(data);
      });

      // Testing only
      // this.findCustomDimension($(options[0]).data('item'), 2).then((data) => {
      //   console.log(data);
      // })
    });
  }


  async findCustomMetric(item, index) {
    return await this.analytics.findCustomMetric(item.accountId, item.id, index).then((response) => {
      return {
        item: item,
        customMetric: response
      }
    });
  }


  listCustomMetrics(options) {
    return Promise.all(
      options.map(async (i, elem) => {
        const item = $(elem).data('item');
        return await this.analytics.listCustomMetrics(item.accountId, item.id).then((response) => {
          return {
            item: item,
            customMetrics: response
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
          title: translate('analytics.tables.customMetrics.property')
        }
      ],
      onPostBody: (e) => {
        table.find('[data-toggle="popover"]').popover({
          html: true,
          container: 'body'
        });
        table.find('[data-toggle="tooltip"]').tooltip({
          html: true,
          container: 'body'
        });
      }
    };

    Object.values(this.currentData).map((item) => {
      const label = `customMetric${item.index}`;
      options.columns.push({
        field: label,
        title: item.index,
        formatter: this.formatCell.bind(this),
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
          const cdBatch = CustomMetric.batch();
          var requireSync = false;

          Object.values(row).forEach((value) => {
            if (value.event && value.customMetric === undefined) {
              let cm = new CustomMetric({
                webPropertyId: value.property.id,
                accountId: value.property.accountId,
                index: value.data.index,
                name: value.data.name,
                type: value.data.type,
                active: value.data.active,
                scope: value.data.scope
              })

              let req = cm.create(false);
              cdBatch.add(req, {id: value.data.index});
              cm.deserialize(req).then((data) => {
                value.customMetric = data;
                value.updating = false;
                value.event(table, value, row, index);
              }).catch((error) => {
                value.updating = false;
                value.success = false;
                value.event(table, value, row, index);
              });;

              value.updating = true;
              requireSync = true
            } else if (value.event && value.customMetric && !value.customMetric.eq(value.data)) {

              let req = value.customMetric.update(value.data, false);
              cmBatch.add(req, {id: value.data.index});
              value.customMetric.deserialize(req).then((data) => {
                value.customMetric = data;
                value.updating = false;
                value.event(table, value, row, index);
              }).catch((error) => {
                value.updating = false;
                value.success = false;
                value.event(table, value, row, index);
              });
              value.updating = true;
              requireSync = true;
            }
          });

          if (requireSync) {
            table.bootstrapTable('updateRow', {
              index: index,
              row: row
            });

            console.log(cmBatch);

            cmBatch.then((data) => {
              console.log(data);

              table.bootstrapTable('updateRow', {
                index: index,
                row: row
              });
            });
          }
        }
      }
    })

    let rows = data.map((item) => {
      let row = this.newRow(item);

      Object.values(this.currentData).forEach((col) => {
        return this.buildCell(item, col, row);
      });

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
    let label = `customMetric${col.index}`;
    let customMetric = item.customMetrics.filter((cell) => {
      return col.index == cell.index;
    })[0];

    row[label] = {
      field: label,
      customMetric: customMetric,
      data: col,
      property: item.item,
      event: this.updateCell.bind(this),
      updating: false
    };

    return row;
  }

  formatCell(value, row, index, field) {
    let icon, color, opts, popoverContent;
    opts = "";
    if (value.updating == true) {
      return '<div class="spinner-grow text-primary spinner-small" role="status"><span class="sr-only">Loading...</span></div>';
    }
    if (value.success == false) {
      icon = 'oi-warning';
      color = 'text-warning';
      return `<span class="hoverable oi ${icon} ${color}"></span>`;
    }
    if (value.customMetric == undefined) {
      icon = 'oi-cloud-upload hoverable';
      color = 'text-medium-light';
    } else {
      let same = value.customMetric.eq(value.data);
      icon = same ? 'oi-check' : 'oi-circle-x hoverable';
      color = same ? 'text-success' : 'text-danger';

      if (!same) {
        popoverContent = dedent(`
          <div class='table-auditor text-center'>
          <div class='row'>
            <div class='col-3 heading'></div>
            <div class='col-3 heading'><b>Mine</b></div>
            <div class='col-3 heading'><b>Theirs</b></div>
            <div class='col-3 heading'><b>Match?</b></div>
          </div>
          <div class='row'>
            <div class='col-3 heading'><b>Index</b></div>
            <div class='col-3'>${value.data.index}</div>
            <div class='col-3'>${value.customMetric.index}</div>
            <div class='col-3'>${this.buildIcon(value.customMetric.index == value.data.index)}</div>
          </div>
          <div class='row'>
            <div class='col-3 heading'><b>Name</b></div>
            <div class='col-3'>${value.data.name}</div>
            <div class='col-3'>${value.customMetric.name}</div>
            <div class='col-3'>${this.buildIcon(value.customMetric.name == value.data.name)}</div>
          </div>
          <div class='row'>
            <div class='col-3 heading'><b>Scope</b></div>
            <div class='col-3'>${value.data.scope}</div>
            <div class='col-3'>${value.customMetric.scope}</div>
            <div class='col-3'>${this.buildIcon(value.customMetric.scope == value.data.scope)}</div>
          </div>
          <div class='row'>
            <div class='col-3 heading'><b>Type</b></div>
            <div class='col-3'>${value.data.type}</div>
            <div class='col-3'>${value.customMetric.type}</div>
            <div class='col-3'>${this.buildIcon(value.customMetric.type == value.data.type)}</div>
          </div>
          <div class='row'>
            <div class='col-3 heading'><b>Active?</b></div>
            <div class='col-3'>${value.data.active == 1 ? 'true' : 'false'}</div>
            <div class='col-3'>${value.customMetric.active}</div>
            <div class='col-3'>${this.buildIcon(value.customMetric.active == value.data.active)}</div>
          </div>
          </div>
        `).trim().replace(/\n|\r/g, "");
        opts = `data-toggle="popover" data-html="true" data-trigger="hover" data-placement="right" title="Audit Values" data-content="${popoverContent}"`;
      }
    }

    return `<span class="oi ${icon} ${color}" ${opts}></span>`;
  }

  buildIcon(same, opts) {
    const icon = same ? 'oi-check' : 'oi-circle-x';
    const color = same ? 'text-success' : 'text-danger';
    return `<span class='oi ${icon} ${color}' ${opts}></span>`
  }

  updateCell(table, value, row, index) {
    table.find('[data-toggle="popover"]').popover('dispose');
    // Dont allow multiple overlapping update events
    if (value.updating == true) {
      return;
    }

    // Activate spinner
    value.updating = true;
    table.bootstrapTable('updateCell', {
      index: index,
      value: value,
      field: value.field
    });

    // Decide if to create or update
    if (value.customMetric == undefined) {
      // Create a new one
      value.customMetric = new CustomMetric(value.data);
      value.customMetric.accountId = value.property.accountId;
      value.customMetric.webPropertyId = value.property.id;

      // console.log(value.customDimension);
      value.customMetric.create().then((data) => {
        value.customMetric = data;
        this.handleSuccess('Created new custom metric');
        value.updating = false;
        table.bootstrapTable('updateCell', {
          index: index,
          value: value,
          field: value.field
        });
      })
    } else {
      if (value.customMetric.eq(value.data) && value.success) {
        return;
      };

      // Update existing one
      value.customMetric.update(value.data).then((data) => {
        this.handleSuccess('Updated custom metric');
        value.updating = false;
        value.success = true
        table.bootstrapTable('updateCell', {
          index: index,
          value: value,
          field: value.field
        })
      }).catch((error) => {
        this.handleError(error);
        value.updating = false;
        value.success = false
        table.bootstrapTable('updateCell', {
          index: index,
          value: value,
          field: value.field
        });
      });
    }
  }

  displayAuditTable(data) {
    this.modal.showModal(
      translate('analytics.modals.customMetrics.audit'),
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
