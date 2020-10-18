import ToggleField from './toggle-field';
import events from '../../config/events';
import ui from '../../config/ui';

class ShowSessionsToggleField extends ToggleField {
  constructor(field,  formControl) {
    super(field, formControl);

    // if (this.field.prop('checked')) {
    //   ui.body.addClass('show-sessions');
    // }
  }

  handleToggle(elem) {
    // ui.body.toggleClass('show-sessions');

    this.formControl.emit(events.FIELDS.SHOW_SESSIONS.CHANGE, {
      state: this.isChecked(),
      elem: elem
    });
  }
}

export default ShowSessionsToggleField;
