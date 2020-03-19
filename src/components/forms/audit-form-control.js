import util from 'util';
import dedent from 'dedent';
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
      const label = `customDimension${item.index}`;
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
          const cdBatch = CustomDimension.batch();
          var requireSync = false;

          Object.values(row).forEach(async (value) => {
            if (value.event && value.customDimension === undefined) {
              let cd = new CustomDimension({
                webPropertyId: value.property.id,
                accountId: value.property.accountId,
                index: value.data.index,
                name: value.data.name,
                active: value.data.active,
                scope: value.data.scope
              })

              await cd.create().then((data) => {
                value.customDimension = data;
                value.updating = false;
                value.event(table, value, row, index);
              }).catch((error) => {
                value.updating = false;
                value.success = false;
                value.event(table, value, row, index);
              });

              // let req = cd.create(false);
              // cdBatch.add(req, {id: value.data.index});
              // cd.deserialize(req).then((data) => {
              //   value.customDimension = data;
              //   value.updating = false;
              //   value.event(table, value, row, index);
              // }).catch((error) => {
              //   value.updating = false;
              //   value.success = false;
              //   value.event(table, value, row, index);
              // });;

              value.updating = true;
              // requireSync = true
            } else if (value.event && value.customDimension && !value.customDimension.eq(value.data)) {
              console.log(value.customDimension);
              await value.customDimension.update(value.data).then((data) => {
                value.customDimension = data;
                value.updating = false;
                value.event(table, value, row, index);
              }).catch((error) => {
                value.updating = false;
                value.success = false;
                value.event(table, value, row, index);
              });

              // let req = value.customDimension.update(value.data, false);
              // cdBatch.add(req, {id: value.data.index});
              // value.customDimension.deserialize(req).then((data) => {
              //   value.customDimension = data;
              //   value.updating = false;
              //   value.event(table, value, row, index);
              // }).catch((error) => {
              //   value.updating = false;
              //   value.success = false;
              //   value.event(table, value, row, index);
              // });
              value.updating = true;
              // requireSync = true;
            }

            setTimeout(() => {
              console.log('waiting')
            }, 1000);
          });

          // if (requireSync) {
          //   table.bootstrapTable('updateRow', {
          //     index: index,
          //     row: row
          //   });

          //   console.log(cdBatch);

          //   cdBatch.then((data) => {
          //     console.log(data);

          //     table.bootstrapTable('updateRow', {
          //       index: index,
          //       row: row
          //     });
          //   });
          // }
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
    if (value.customDimension == undefined) {
      icon = 'oi-cloud-upload hoverable';
      color = 'text-medium-light';
    } else {
      let same = value.customDimension.eq(value.data);
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
            <div class='col-3'>${value.customDimension.index}</div>
            <div class='col-3'>${this.buildIcon(value.customDimension.index == value.data.index)}</div>
          </div>
          <div class='row'>
            <div class='col-3 heading'><b>Name</b></div>
            <div class='col-3'>${value.data.name}</div>
            <div class='col-3'>${value.customDimension.name}</div>
            <div class='col-3'>${this.buildIcon(value.customDimension.name == value.data.name)}</div>
          </div>
          <div class='row'>
            <div class='col-3 heading'><b>Scope</b></div>
            <div class='col-3'>${value.data.scope}</div>
            <div class='col-3'>${value.customDimension.scope}</div>
            <div class='col-3'>${this.buildIcon(value.customDimension.scope == value.data.scope)}</div>
          </div>
          <div class='row'>
            <div class='col-3 heading'><b>Active?</b></div>
            <div class='col-3'>${value.data.active == 1 ? 'true' : 'false'}</div>
            <div class='col-3'>${value.customDimension.active}</div>
            <div class='col-3'>${this.buildIcon(value.customDimension.active == value.data.active)}</div>
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
    if (value.customDimension == undefined) {
      // Create a new one
      value.customDimension = new CustomDimension(value.data);
      value.customDimension.accountId = value.property.accountId;
      value.customDimension.webPropertyId = value.property.id;

      // console.log(value.customDimension);
      value.customDimension.create().then((data) => {
        value.customDimension = data;
        this.handleSuccess('Created new custom dimension');
        value.updating = false;
        table.bootstrapTable('updateCell', {
          index: index,
          value: value,
          field: value.field
        });
      })
    } else {
      if (value.customDimension.eq(value.data) && value.success) {
        return;
      };

      // Update existing one
      value.customDimension.update(value.data).then((data) => {
        this.handleSuccess('Updated custom dimension');
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
