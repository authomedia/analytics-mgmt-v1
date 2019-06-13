import ui from '../config/ui';
import Utilities from './utilities';

class SelectField {
  constructor(field) {
    this.field = field;
  }

  handleChange(callback) {
    this.field.on('change', () => {
      $.each(this.field.children('option:selected'), (i, elem) => {
        ui.formControl.debug.html('');
        if ($(elem).text() !== 'None') {
          callback(i, elem);
        }
      });
    })
  }

  empty(addNoneOption = true) {
    this.field.empty()
    if (addNoneOption) {
      this.populateNoneOption();
    }
    this.setSize();
  }

  setSize() {
    this.field.attr('size', this.field.children('option').length);
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
    this.setSize();
  }

  populateNoneOption() {
    this.field.append($('<option></option>').text('None'));
  }

  emptyNone() {
    this.field.find('option').filter(function(index) {
      return this.text == 'None';
    }).remove();
  }

  populateOption(key, value, keyField, valueField, dataFields = []) {
    var selectOption = $('<option></option>')
                       .attr('value', value[valueField])
                       .data('item', value)
                       .text(value[keyField]);
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
