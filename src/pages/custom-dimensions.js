import bsCustomFileInput from 'bs-custom-file-input'
import CsvFileField from '../components/csv-file-field';
import CustomDimensionsValidator from '../utilities/custom-dimensions-validator';
import Page from './page';
import TableGenerator from '../utilities/table-generator';
import ui from '../config/ui';


class CustomDimensionsPage extends Page {
  constructor() {
    super()

    bsCustomFileInput.init()
    ui.loggedIn();

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

    this.customDimensionsFileField.on('end', (data) => {
      if (this.customDimensionsValidator.validate(data)) {
        this.updateTable(data);
        this.enableButton(true);
      } else {
        this.updateTable();
        this.enableButton(false);
        this.handleError(this.customDimensionsValidator.errorsToString());
      }
    });

    this.updateButton.on('click', (e) => {
      console.log(e);
    });
  }

  updateTable(data) {
    this.tableGenerator.setData(data);
    this.tableGenerator.generateTable(this.wrapper)
  }

  enableButton(active) {
    this.updateButton.prop('disabled', !active);
    if (active) {
      this.updateButton.removeClass('btn-warning')
      this.updateButton.addClass('btn-success');
    } else {
      this.updateButton.addClass('btn-warning');
      this.updateButton.removeClass('btn-success');
    }
  }
}

export default () => {
  $(function() {
    const page = new CustomDimensionsPage();
  });
}
