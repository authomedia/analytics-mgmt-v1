import SelectField from './select-field';

class FormControl {
  constructor() {
    this.accounts = new SelectField($("#ga-accounts"));
    this.properties = new SelectField($('#ga-properties'));
    this.profiles = new SelectField($('#ga-profiles'));
    this.debug = $("#query-output");
  }
}

export default FormControl;
