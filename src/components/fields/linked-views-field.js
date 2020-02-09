import SelectField from './select-field';

class LinkedViewsField extends SelectField {
  constructor(field, formControl) {
    super(field, formControl);

    this.className = 'LinkedViews';
  }

  init(items) {
    this.handleResult(items);
  }

  handleResult(items) {
    super.handleResult(
      items.filter(Boolean),
      this.formControl.linkedViews,
      'view',
      'view',
      [],
      this.translate.analytics.errors[`no${this.className}`],
      {
        empty: true
      }
    );
  }
}

export default LinkedViewsField;
