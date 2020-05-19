import TableBuilder from 'table-builder'
import Utilities from '../components/utilities';

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
      const headers = Utilities.mapHeaders(headerRow)

      let dataRows = this.data.slice(1, this.data.length);
      dataRows = Utilities.mapRows(headerRow, dataRows);

      const csvTable = new TableBuilder({ class: 'table'})
                            .setHeaders(headers)
                            .setData(dataRows);

      $(target).html(csvTable.render());
    } catch (e) {
     this.handleError(e.message);
    }
  }
}

export default TableGenerator;
