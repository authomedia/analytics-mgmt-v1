import SelectField from './select-field';

class LinkedAdAccountsField extends SelectField {
  constructor(field, formControl) {
    super(field, formControl);

    this.className = 'LinkedAdAccounts';

    // this.handleChange((i, elem) => {
    //   this.formControl.profiles.empty();
    //   this.formControl.remarketingAudiences.empty();
    //   this.formControl.linkedAdAccounts.empty();
    //   this.formControl.adLinks.empty();

    //   this.profiles.init($(elem).data('accountId'), $(elem).val(), $(elem).text());
    //   this.adLinks.init($(elem).data('accountId'), $(elem).val(), $(elem).text());
    // });
  }

  init(elem) {
    let items = elem.data('linkedAdAccounts');
    let linkedViews = elem.data('linkedViews');

    // items = items.filter(Boolean).filter(function(item) {
    //   return item.type !== 'ANALYTICS';
    // });

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
