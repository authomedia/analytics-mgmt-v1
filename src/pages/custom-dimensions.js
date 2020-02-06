import bsCustomFileInput from 'bs-custom-file-input'
import CsvFileField from '../components/csv-file-field';
import CustomDimensionsValidator from '../utilities/custom-dimensions-validator';
import Page from './page';
import TableGenerator from '../utilities/table-generator';
import Utilities from '../components/utilities';
import ui from '../config/ui';

import db from '../models/db';


class CustomDimensionsPage extends Page {
  constructor() {
    super()

    bsCustomFileInput.init()

    this.field = $('#custom-dimensions-csv');
    this.wrapper = $('#custom-dimensions-table-wrapper');
    this.updateButton = $('#custom-dimensions-update-button');
    this.customDimensionsFileField = new CsvFileField(this.field);
    this.customDimensionsValidator = new CustomDimensionsValidator();
    this.tableGenerator = new TableGenerator();

    this.customDimensionsFileField.on('change', (file) => {
      if(file == undefined) {
        this.updateTable();
        this.enableButton(false)
      }
    });

    db.customDimensions.toArray((data) => {
      console.log(data);
      data.unshift(['index','name', 'scope', 'active']);
      this.updateTable(data);
      ui.loggedIn();
    })


    this.customDimensionsFileField.on('end', (data) => {
      if (this.customDimensionsValidator.validate(data)) {
        this.updateTable(data);
        this.enableButton(true, () => {
          this.updateDatabase(data).then(() => {
            db.customDimensions.each((item) => {
              console.log(item);
            });
            this.enableButton(false);
          });
        });
      } else {
        this.updateTable();
        this.enableButton(false);
        this.handleError(this.customDimensionsValidator.errorsToString());
      }
    });
  }


  updateTable(data) {
    this.tableGenerator.setData(data);
    this.tableGenerator.generateTable(this.wrapper)
  }

  async updateDatabase(data) {
    const dbData = Utilities.mapRows(data[0], data.slice(1, data.length))
    console.log(dbData);
    var ids = await db.customDimensions.bulkPut(dbData);
    console.log("Got ids", ids);
  }

  enableButton(active, callback ) {
    this.updateButton.prop('disabled', !active);
    if (active) {
      this.updateButton.removeClass('btn-warning')
      this.updateButton.addClass('btn-success');
      this.updateButton.on('click', callback);
    } else {
      this.updateButton.addClass('btn-warning');
      this.updateButton.removeClass('btn-success');
      this.updateButton.off('click')
    }
  }
}

export default () => {
  $(function() {
    const page = new CustomDimensionsPage();
  });
}
