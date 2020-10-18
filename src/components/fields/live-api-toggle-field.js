import ToggleField from './toggle-field';

class LiveApiToggleField extends ToggleField {
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
