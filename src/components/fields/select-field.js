import ui from '../../config/ui';
import Utilities from '../utilities';
import i18n from '../../config/i18n';

import ModelBase from '../../models/model-base';


class SelectField extends ModelBase {
  constructor(field, formControl) {
    super();

    this.translate = i18n[process.env.LOCALE];

    this.field = field;
    this.formControl = formControl;

    this.fieldID = this.field.prop('id');
    this.selectedLabel = $(`span#${this.fieldID}-selected`);
    this.selectAll = $(`a#${this.fieldID}-select-all`);

    this.initSelectAll();
    this.initShiftSelect();
  }

  init() {
    this.setSelectedLabel('');
    this.setFieldVal([]);
  }

  // Allow select all behaviour
  initSelectAll() {
    this.selectAll.data('mode', 'all');
    this.selectAll.on('click', (e) => {
      e.preventDefault();
      let options = [];
      let ids = [];

      if (this.selectAll.data('mode') == 'all') {
        options = this.field.children('option');
        ids = $.map(options, (elem, i) => {
          return $(elem).data().item.id;
        });
      }
      this.setFieldVal(ids);
    });
  }

  // Allow multi-select on Select2 fields
  initShiftSelect() {
    let countShift = 0;
    let shiftArray = [];
    let optionsSelected = [];

    this.field.on('select2:select', (e) => {
      if (e.params.originalEvent.shiftKey) {
        shiftArray.push(e.params.data.element.index);
        countShift++;
      }
      if (countShift == 2){
        optionsSelected = $.map(this.field.children('option:selected'), (elem, i) => {
          return $(elem).data().item.id;
        })
        for (let i = shiftArray[0]; i <= shiftArray[1]; i++) {
          let optionValue = this.field.children('option').eq(i).val();
          optionsSelected.push(optionValue);
        }
        this.field.val(optionsSelected);
        this.field.trigger('change');
        this.field.select2('close');
        countShift = 0;
        shiftArray = [];
        optionsSelected = [];
      }
    });
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
      ui.debug.html('');

      const selected = this.field.children('option:selected');
      if (selected.length) {
        $.each(selected, (i, elem) => {
          if ($(elem).text() !== 'None') {
            callback(i, elem);
          }
        });
      } else {
        callback(0, null);
      }
    })
  }

  setFieldVal(ids = []) {
    this.field.val(ids);
    this.field.trigger('change');

    if (ids.length) {
      this.selectAll.data('mode', 'none');
      this.selectAll.html(this.translate.select.none);
    } else {
      this.selectAll.data('mode', 'all');
      this.selectAll.html(this.translate.select.all);
    }
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
    this.setSelectedLabel('');
    this.selectAll.data('mode', 'all');
    this.selectAll.html(this.translate.select.all);
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
