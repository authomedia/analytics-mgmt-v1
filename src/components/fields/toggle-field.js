import ModelBase from '../../models/model-base';

class ToggleField extends ModelBase {
  constructor(field, formControl) {
    super();
    this.field = field;
    this.formControl = formControl;

    this.field.on('change', (event) => {
      let elem = $(event.currentTarget);
      this.handleToggle(elem);
    });
  }

  isChecked() {
    return this.field.prop('checked');
  }

  handleToggle(elem) {
    throw 'Not implemented!'
  }
}

export default ToggleField;
