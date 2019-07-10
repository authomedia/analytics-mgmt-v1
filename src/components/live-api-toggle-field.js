import ModelBase from '../models/model-base';

class LiveApiToggleField extends ModelBase {
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
    if (elem.prop('checked')) {
      this.formControl.submitButtons.removeClass('btn-warning');
      this.formControl.submitButtons.addClass('btn-success');
    } else {
      this.formControl.submitButtons.addClass('btn-warning');
      this.formControl.submitButtons.removeClass('btn-success');
    }
  }
}

export default LiveApiToggleField;
