import SelectField from './select-field';
import events from '../config/events';

class LinkedAdAccountsField extends SelectField {
  constructor(field, formControl) {
    super(field, formControl);

    this.className = 'LinkedAdAccounts';

    this.handleChange((i, elem) => {
      this.formControl.emit(events.FIELDS.LINKED_AD_ACCOUNTS.CHANGE, {
        i: i,
        elem: elem
      });
    });

    this.formControl.on(events.FIELDS.ACCOUNTS.CHANGE, (event) => {
      this.empty();
    });

    this.formControl.on(events.FIELDS.PROPERTIES.CHANGE, (event) => {
      this.empty();
    });
  }

  init(elem) {
    let items = elem.data('linkedAdAccounts');
    let linkedViews = elem.data('linkedViews');

    items = items.map(function(item) {
      item.label = `${item.type} > ${item.linkedAccountId}`;
      item.linkedViews = linkedViews
      return item;
    });

    this.handleResult();
  }

  handleResult(response) {
    super.handleResult(
      response.result.items,
      this.field,
      'label',
      'linkedAccountId',
      [],
      this.translate.analytics.errors[`no${this.className}`],
      {
        parentName: response.parentName
      }
    );
  }
}

export default LinkedAdAccountsField;
