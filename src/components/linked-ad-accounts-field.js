import SelectField from './select-field';

class LinkedAdAccountsField extends SelectField {
  constructor(field, formControl) {
    super(field, formControl);

    this.className = 'LinkedAdAccounts';
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
