import EventEmitter from 'events';

class FormControlBase extends EventEmitter {
  constructor() {
    super();

    this.form = $('#analytics-ui form');

    this.submitButtons = $('button[type=submit]');

    // Bind Select2 elements
    $('.select2').select2({
      width: 'element'
    });
  }

  init() {

  }
}

export default FormControlBase;
