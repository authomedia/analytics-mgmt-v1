import TableBuilder from 'table-builder'

import ModelBase from '../models/model-base';

class TableGenerator extends ModelBase {
  constructor(data) {
    super()
    this.data = data;
  }

  setData(data) {
    this.data = data;
    this.generateTable();
  }

  generateTable(target) {
    if (this.data == undefined) {
      $(target).html('');
      return;
    }
    try {
      const headerRow = this.data[0];
      const headers = this.mapHeaders(headerRow)

      let dataRows = this.data.slice(1, this.data.length);
      dataRows = this.mapRows(headerRow, dataRows);

      const csvTable = new TableBuilder({ class: 'table'})
                            .setHeaders(headers)
                            .setData(dataRows);

      $(target).html(csvTable.render());
    } catch (e) {
      this.handleError(e.message);
    }
  }

  mapRows(headers, rows) {
    return rows.map((row, i) => {
      let obj = {};

      row.map((col, j) => {
        obj[headers[j].toString()] = col;
      });

      return obj;
    });
  }

  mapHeaders(headers) {
    let obj = {};
    headers.map((col, i) => {
      obj[col] = col;
    });
    return obj
  }
}

export default TableGenerator;
