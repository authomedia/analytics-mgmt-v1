import bsCustomFileInput from 'bs-custom-file-input'

import CsvFileField from '../../components/fields/csv-file-field';
import CustomDimensionsValidator from '../../utilities/custom-dimensions-validator';
import Page from '../page';
import TableGenerator from '../../utilities/table-generator';
import Utilities from '../../components/utilities';

import constants from '../../config/constants';
import ui from '../../config/ui';
import db from '../../models/db';


class CustomDimensionsUploadPage extends Page {
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
      data.unshift(constants.DB_FIELDS);
      // data = data.sort((a, b) => {
      //   let ai = parseInt(a.index);
      //   let bi = parseInt(b.index)
      //   if (ai < bi) {
      //     return -1;
      //   }
      //   if (ai > bi) {
      //     return 1;
      //   }
      //   return 0;
      // })
      this.currentData = data;
      this.updateTable(data);
      ui.loggedIn();
    })


    this.customDimensionsFileField.on('end', (data) => {
      if (this.customDimensionsValidator.validate(data)) {
        this.currentData = data;
        this.updateTable();
        this.enableButton(true, () => {
          this.updateDatabase(data).then(() => {
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
    this.tableGenerator.setData(this.currentData);
    this.tableGenerator.generateTable(this.wrapper)
  }

  async updateDatabase(data) {
    const dbData = Utilities.mapRows(data[0], data.slice(1, data.length))
    return await db.customDimensions.clear()
      .then(() => {
        db.customDimensions.bulkPut(dbData)
      })
      .catch((err) => {
        this.handleError('Problem clearing the db');
      });
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
      this.updateButton.off('click');
    }
  }
}

export default () => {
  $(function() {
    new CustomDimensionsUploadPage();
  });
}
