import EventEmitter from 'events';
import events from '../../config/events';

class SubmitButton extends EventEmitter {
  constructor(elem, formControl) {
    super();
    this.elem = $(elem);
    this.formControl = formControl;
    this.init();
  }

  init() {
    this.elem.on('click', (event) => {
      this.emit(events.BUTTONS.SUBMIT.CLICK, {
        elem: this
      })
    });
  }

  toggle(state) {
    state ? this.enable() : this.disable();
  }

  enable() {
    this.elem.removeClass('btn-warning')
    this.elem.addClass('btn-success');
    this.elem.prop('disabled', false);
  }

  disable() {
    this.elem.addClass('btn-warning');
    this.elem.removeClass('btn-success');
    this.elem.prop('disabled', true);
  }
}

export default SubmitButton;
