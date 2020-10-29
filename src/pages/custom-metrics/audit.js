import Page from '../page';
import events from '../../config/events';
import CustomMetricsAuditFormControl from '../../components/forms/custom-metrics-audit-form-control';

class CustomMetricsAuditPage extends Page {
  constructor() {
    super();
    this.formControl = new CustomMetricsAuditFormControl()
  }

  init() {
    super.init();
    this.formControl.init();
    this.formControl.accounts.init();
  }
}

export default () => {
  $(function() {
    const page = new CustomMetricsAuditPage();

    $(window).on(events.GOOGLE.AUTHORIZED, function() {
      page.init();
    })
  });
}
