import SelectField from './select-field';
import events from '../../config/events';

class PropertiesField extends SelectField {
  constructor(field, formControl) {
    super(field, formControl);

    this.className = 'Properties';

    this.handleChange((i, elem) => {
      this.formControl.emit(events.FIELDS.PROPERTIES.CHANGE, {
        i: i,
        elem: elem
      });
    });

    this.formControl.on(events.FIELDS.ACCOUNTS.CHANGE, (event) => {
      this.empty();

      if (event.elem) {
        this.init($(event.elem).val(), $(event.elem).text());
      }
    });
  }

  init(accountId, accountName) {
    super.init();
    gapi.client.analytics.management.webproperties.list({
      'accountId': accountId
    })
      .then((response) => {
        response.parentName = accountName;
        this.handleResult(response)
      })
      .then(null, (err) => {
        this.handleError(`${accountName}: ${err}`);
    });
  }

  handleResult(response) {
    super.handleResult(
      response.result.items,
      this.field,
      'name',
      'id',
      ['accountId'],
      this.translate.analytics.errors[`no${this.className}`],
      {
        parentName: response.parentName
      }
    );
  }
}

export default PropertiesField;
