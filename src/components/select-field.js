import ui from '../config/ui';
import Utilities from './utilities';

import ModelBase from '../models/model-base';


class SelectField extends ModelBase {
  constructor(field, formControl) {
    super();

    this.field = field;
    this.formControl = formControl;

    this.fieldID = this.field.prop('id');
    this.selectedLabel = $(`span#${this.fieldID}-selected`);
  }

  val() {
    return this.field.val();
  }

  data() {
    return this.field.select2('data');
  }

  handleChange(callback) {
    this.field.on('change', () => {
      this.prepareSelectedLabel();

      $.each(this.field.children('option:selected'), (i, elem) => {
        ui.formControl.debug.html('');
        if ($(elem).text() !== 'None') {
          callback(i, elem);
        }
      });
    })
  }

  handleResult(items, field, keyField, valueField, dataFields, errorMsg, options = {}) {
    if (items && items.length) {
      if (options.parentName) {
        items.map((item) => {
          item[keyField] = `${options.parentName} > ${item[keyField]}`;
        });
      }

      this.populate(
        items,
        keyField,
        valueField,
        dataFields,
        options
      );
    } else {
      this.handleError(errorMsg);
    }
  }

  empty(addNoneOption = true) {
    this.field.empty()
    this.field.val(null);
    // if (addNoneOption) {
    //   this.populateNoneOption();
    // }
    this.setSize();
  }

  setSize() {
    this.field.attr('size', this.field.children('option').length);

    this.field.select2({
      placeholder: 'None selected - pick some',
      closeOnSelect: false
      // allowClear: true
    });
  }

  prepareSelectedLabel() {
    // Get number of items and number selected
    const total = this.field.children();
    const selected = this.field.children('option:selected');

    // Clear existing label
    this.setSelectedLabel('');

    const label = selected.length ? `${selected.length} of ${total.length} selected` : '';

    this.setSelectedLabel(label);
  }

  setSelectedLabel(text) {
    if (this.selectedLabel.length) {
      this.selectedLabel.html(text);
    }
  }

  populate(items, keyField, valueField, dataFields = [], options = {}) {
    this.emptyNone();
    if (options.empty) {
      this.empty(false);
    }
    $.each(items, (key, value) => {
      if (value !== "" && value !== undefined) {
        this.populateOption(key, value, keyField, valueField, dataFields);
      }
    });
    // this.sortOptions();
    this.setSize();
  }

  sortOptions() {
    let opts = this.field.find('option')
    opts.sort((a, b) => {
      let labelA = $(a).text().toUpperCase(); // ignore upper and lowercase
      let labelB = $(b).text().toUpperCase(); // ignore upper and lowercase
      if (labelA < labelB) {
        return -1;
      }
      if (labelA > labelB) {
        return 1;
      }

      return 0;
    });



    console.log(opts);
  }

  populateNoneOption() {
    this.field.append($(new Option(null, 'None')));
  }

  emptyNone() {
    this.field.find('option').filter(function(index) {
      return this.text == 'None';
    }).remove();
  }

  populateOption(key, value, keyField, valueField, dataFields = []) {
    let selectOption = $(new Option(value[keyField], value[valueField])).data('item', value);

    this.field.append(selectOption);

    $.each(dataFields, function(i, dataKey) {
      selectOption.data(dataKey, value[dataKey])
    });
  }

  eachOption(callback) {
    $.each(this.field.find('option'), callback);
  }
}

export default SelectField;
