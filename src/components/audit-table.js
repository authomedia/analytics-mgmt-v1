import dedent from 'dedent';

class AuditTable {
  constructor(title, label, objectClass) {
    this.title = title;
    this.label = label;
    this.objectClass = objectClass
    this.table = $(`<table id='${label}-table'></table>`);
    this.tableClasses = 'table table-striped table-bordered table-responsive-xl text-center';
  }

  generateTable(headers, data) {
    this.initOptions();
    this.generateHeaders(headers);
    this.generateActions();
    let rows = this.generateRows(data);
    this.options.data = this.sortRows(rows);
    this.table.bootstrapTable(this.options);
    return this.table;
  }

  initOptions() {
    // Set up initial table options
    this.options = {
      classes: this.tableClasses,
      columns: [
        {
          field: 'property',
          title: this.title
        }
      ],
      onPostBody: (e) => {
        this.table.find('[data-toggle="popover"]').popover({
          html: true,
          container: 'body'
        });
        this.table.find('[data-toggle="tooltip"]').tooltip({
          html: true,
          container: 'body'
        });
      }
    };
  }

  generateHeaders(headers) {
    this.headers = headers;

    Object.keys(headers).map((key) => {
      this.buildColumn(key, headers[key]);
    });
  }

  generateActions() {
    this.options.columns.push({
      field: 'actions',
      title: 'Actions',
      events: {
        'click .action-sync': (e, value, row, index) => {
          Object.values(row).forEach(async (value) => {
            this.syncItem();
          });
        }
      }
    })
  }

  generateRows(data) {
    return data.map((item) => {
      let row = this.newRow(item);

      console.log(item);

      Object.keys(this.headers).forEach((col) => {
        return this.buildCell(item, col, row);
      });

      return row;
    });
  }

  buildPopoverContent(value) {
    return dedent(`
      <div class='table-auditor text-center'>
        <div class='row'>
          <div class='col-3 heading'></div>
          <div class='col-3 heading'><b>Mine</b></div>
          <div class='col-3 heading'><b>Theirs</b></div>
          <div class='col-3 heading'><b>Match?</b></div>
        </div>
      </div>
    `).trim().replace(/\n|\r/g, "");
  }

  sortRows(rows) {
    // Sort rows by first column
    return rows.sort((a, b) => {
      if (a.property < b.property) {
        return -1;
      }
      if (a.property > b.property) {
        return 1;
      }
      return 0;
    });
  }

  buildColumn(header, title) {
    const field = `${this.label}${header}`;
    this.options.columns.push({
      field: field,
      title: title,
      formatter: this.formatCell.bind(this),
      events: {
        'click .oi': (e, value, row, index) => {
          return value.event(this.table, value, row, index)
        }
      }
    });
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

  cellMatcher(col, cell) {
    return col.index == cell.index;
  }

  buildCell(item, col, row) {
    let field = `${this.label}${col}`;
    let obj = item.objects.filter((cell) => {
      return this.cellMatcher(col, cell);
    })[0];

    row[field] = {
      field: field,
      obj: obj,
      data: col,
      property: item.item,
      event: this.updateCell.bind(this),
      updating: false
    };

    return row;
  }

  buildIcon(same, opts) {
    const icon = same ? 'oi-check' : 'oi-circle-x';
    const color = same ? 'text-success' : 'text-danger';
    return `<span class='oi ${icon} ${color}' ${opts}></span>`
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
    if (value.obj == undefined) {
      icon = 'oi-cloud-upload hoverable';
      color = 'text-medium-light';
    } else {
      let same = value.obj.eq(value.data);
      icon = same ? 'oi-check' : 'oi-circle-x hoverable';
      color = same ? 'text-success' : 'text-danger';

      if (!same) {
        popoverContent = this.buildPopoverContent(value);
        opts = `data-toggle="popover" data-html="true" data-trigger="hover" data-placement="right" title="Audit Values" data-content="${popoverContent}"`;
      }
    }

    return `<span class="oi ${icon} ${color}" ${opts}></span>`;
  }

  updateCell(value, row, index) {
    this.table.find('[data-toggle="popover"]').popover('dispose');
    // Dont allow multiple overlapping update events
    if (value.updating == true) {
      return;
    }

    // Activate spinner
    value.updating = true;
    this.table.bootstrapTable('updateCell', {
      index: index,
      value: value,
      field: value.field
    });

    this.performUpdateAction(value, row, index);
  }


  syncItem(value, row, index) {
    return value.event(this.table, value, row, index);
  }

  performUpdateAction(value, row, index) {
    // Decide if to create or update
    if (value.obj == undefined) {
      // Create a new one
      value.obj = new this.objectClass(value.data);
      value.obj.accountId = value.property.accountId;
      value.obj.webPropertyId = value.property.id;

      // console.log(value.obj);
      value.obj.create().then((data) => {
        value.obj = data;
        this.handleSuccess('Created new object');
        value.updating = false;
        this.table.bootstrapTable('updateCell', {
          index: index,
          value: value,
          field: value.field
        });
      })
    } else {
      if (value.obj.eq(value.data) && value.success) {
        return;
      };

      // Update existing one
      value.obj.update(value.data).then((data) => {
        this.handleSuccess('Updated object');
        value.updating = false;
        value.success = true
        this.table.bootstrapTable('updateCell', {
          index: index,
          value: value,
          field: value.field
        })
      }).catch((error) => {
        this.handleError(error);
        value.updating = false;
        value.success = false
        this.table.bootstrapTable('updateCell', {
          index: index,
          value: value,
          field: value.field
        });
      });
    }
  }
}

export default AuditTable;