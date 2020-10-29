import Page from '../page';
import events from '../../config/events';
import CustomDimensionsAuditFormControl from '../../components/forms/custom-dimensions-audit-form-control';

class CustomDimensionsAuditPage extends Page {
  constructor() {
    super();
    this.formControl = new CustomDimensionsAuditFormControl()
  }

  init() {
    super.init();
    this.formControl.init();
    this.formControl.accounts.init();
  }
}

export default () => {
  $(function() {
    const page = new CustomDimensionsAuditPage();

    $(window).on(events.GOOGLE.AUTHORIZED, function() {
      page.init();
    })
  });
}
