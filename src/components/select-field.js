import ui from '../config/ui';
import Utilities from './utilities';

class SelectField {
  constructor(field) {
    this.field = field;
  }

  handleChange(callback) {
    this.field.on('change', () => {
      $.each(this.field.children("option:selected"), (i, elem) => {
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
    this.field.attr("size", this.field.children('option').length);
  }

  populate(items, keyField, valueField, dataFields = []) {
    this.empty(false);
    $.each(items, (key, value) => {
      this.populateOption(key, value, keyField, valueField, dataFields);
    });
    this.setSize();
  }

  populateNoneOption() {
    this.field.append($("<option></option>").text('None'));
  }

  populateOption(key, value, keyField, valueField, dataFields = []) {
    var selectOption = $("<option></option>")
                       .attr("value", value[valueField])
                       .text(value[keyField]);
    this.field.append(selectOption);

    $.each(dataFields, function(i, dataKey) {
      selectOption.data(dataKey, value[dataKey])
    });
  }
}

export default SelectField;
