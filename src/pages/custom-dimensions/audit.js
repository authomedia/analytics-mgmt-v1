import Page from '../page';
import AccountsField from '../../components/accounts-field';
import PropertiesField from '../../components/properties-field';

import TableGenerator from '../../utilities/table-generator';
import Analytics from '../../components/analytics'

import events from '../../config/events';
import ui from '../../config/ui';
import db from '../../models/db';

const analytics = new Analytics(
  process.env.CLIENT_ID
  [process.env.SCOPES]
);

class CustomDimensionsAuditPage extends Page {
  constructor() {
    super();
    this.analytics = analytics;
    this.accounts = new AccountsField($('#ga-accounts'), this);
    this.on(events.FIELDS.ACCOUNTS.CHANGE, (event) => {
      if (event.elem) {
        this.properties.init($(event.elem).val(), $(event.elem).text());
      }
    });

    this.properties = new PropertiesField($('#ga-properties'), this);
    // this.on(events.FIELDS.PROPERTIES.CHANGE, (event) => {
    //   if (event.elem) {
    //     this.profiles.init($(event.elem).data('accountId'), $(event.elem).val(), $(event.elem).text());
    //     this.adLinks.init($(event.elem).data('accountId'), $(event.elem).val(), $(event.elem).text());
    //   }
    // })

    this.submitButtons = $('button[type=submit]');

    // Bind Select2 elements
    $('.select2').select2({
      width: 'element'
    });
  }

  init() {
    console.log('page ready');
  }

  initForm() {

  }

  handleAccountsFieldChange(i, elem) {
    console.log(this)
    this.properties.empty();

    if (elem) {
      this.properties.init($(elem).val(), $(elem).text());
    }
  }
}

export default () => {
  $(function() {
    const page = new CustomDimensionsAuditPage();

    $(window).on(events.GOOGLE.AUTHORIZED, function() {
      page.init();
      page.initForm();
      page.accounts.init();
    })
  });
}
