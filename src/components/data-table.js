import dedent from 'dedent';

class DataTable {
  constructor(title, label, objectClass) {
    this.title = title;
    this.label = label;
    this.objectClass = objectClass
    this.table = $(`<table id='${label}-table' data-show-export="true" data-show-columns="true"></table>`);
    this.tableClasses = 'table table-striped table-bordered table-responsive-xl text-center';
  }

  generateTable(headers, data) {
    this.initOptions();
    this.generateHeaders(headers);
    let rows = this.generateRows(data);
    this.options.data = this.sortRows(rows);
    const bs = this.table.bootstrapTable('destroy').bootstrapTable(this.options);
    return bs;
  }

  initOptions() {
    // Set up initial table options
    this.options = {
      classes: this.tableClasses,
      // showExport: true,
      exportDataType: "basic",
      exportTypes: [
        'csv',
        'json'
      ],
      exportOptions: {
        fileName: function () {
          return 'exportName'
        }
      },
      columns: [
        {
          field: 'property',
          title: this.title
        }
      ]
    };
  }

  generateHeaders(headers) {
    this.headers = headers;

    Object.keys(headers).map((key) => {
      this.buildColumn(key, headers[key]);
    });
  }

  generateRows(data) {
    return data.map((item) => {
      return item.objects.map((obj) => {
        let row = this.newRow(item);

        Object.keys(this.headers).forEach((col) => {
          return this.buildCell(item, obj, col, row);
        });

        return row;
      }).flat();
    }).flat();
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
      cellStyle: this.styleCell.bind(this),
      events: {
        'click .oi': (e, value, row, index) => {
          return value.event(this.table, value, row, index)
        }
      }
    });
  }

  newRow(item) {
    return {
      property: item.item.name
    };
  }

  cellMatcher(col, cell) {
    return col.index == cell.index;
  }

  buildCell(item, obj, col, row) {
    let field = `${this.label}${col}`;

    row[field] = {
      field: field,
      obj: obj,
      data: col,
      property: item.item,
      updating: false
    };

    return row;
  }

  buildIcon(same, opts) {
    const icon = same ? 'oi-check' : 'oi-circle-x';
    const color = same ? 'text-success' : 'text-danger';
    return `<span class='oi ${icon} ${color}' ${opts}></span>`
  }

  styleCell(value, row, index, field) {
    let cellValue = 'Not set';
    let cellStyle = {};
    if (value.obj && value.obj.data) {
      cellValue = value.obj.data[value.data];

      if (cellValue == undefined) {
        cellValue = 'Not set';
      }

      if (typeof cellValue === 'object' && cellValue !== null) {
        cellStyle = {
          classes: 'data-table-cell-scroll'
        };
      }
    }

    return cellStyle;
  }

  formatCell(value, row, index, field) {
    let cellValue = 'Not set';
    if (value.obj && value.obj.data) {
      cellValue = value.obj.data[value.data];

      if (cellValue == undefined) {
        cellValue = 'Not set';
      }

      if (typeof cellValue === 'object' && cellValue !== null) {
        cellValue = `<pre class="text-left">${JSON.stringify(cellValue, null, 2)}</pre>`;
      }
    }

    return `<span>${cellValue}</span>`;
  }
}

export default DataTable;
