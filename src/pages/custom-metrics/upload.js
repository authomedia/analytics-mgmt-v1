import bsCustomFileInput from 'bs-custom-file-input'

import CsvFileField from '../../components/fields/csv-file-field';
import CustomMetricsValidator from '../../utilities/custom-metrics-validator';
import Page from '../page';
import TableGenerator from '../../utilities/table-generator';
import Utilities from '../../components/utilities';

import constants from '../../config/constants';
import ui from '../../config/ui';
import db from '../../models/db';


class CustomMetricsUploadPage extends Page {
  constructor() {
    super()

    bsCustomFileInput.init()

    this.field = $('#custom-metrics-csv');
    this.wrapper = $('#custom-metrics-table-wrapper');
    this.updateButton = $('#custom-metrics-update-button');
    this.customMetricsFileField = new CsvFileField(this.field);
    this.customMetricsValidator = new CustomMetricsValidator();
    this.tableGenerator = new TableGenerator();

    this.customMetricsFileField.on('change', (file) => {
      if(file == undefined) {
        this.updateTable();
        this.enableButton(false)
      }
    });

    db.customMetrics.toArray((data) => {
      data.unshift(constants.DB_FIELDS2);
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


    this.customMetricsFileField.on('end', (data) => {
      if (this.customMetricsValidator.validate(data)) {
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
        this.handleError(this.customMetricsValidator.errorsToString());
      }
    });
  }


  updateTable(data) {
    this.tableGenerator.setData(this.currentData);
    this.tableGenerator.generateTable(this.wrapper)
  }

  async updateDatabase(data) {
    const dbData = Utilities.mapRows(data[0], data.slice(1, data.length))
    return await db.customMetrics.clear()
      .then(() => {
        db.customMetrics.bulkPut(dbData)
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
    new CustomMetricsUploadPage();
  });
}
