import Page from '../page';
import events from '../../config/events';
import GoalsAuditFormControl from '../../components/forms/goals-audit-form-control';

class GoalsAuditPage extends Page {
  constructor() {
    super();
    this.formControl = new GoalsAuditFormControl();
  }

  init() {
    super.init();
    this.formControl.init();
    this.formControl.accounts.init();
  }
}

export default () => {
  $(function() {
    const page = new GoalsAuditPage();

    $(window).on(events.GOOGLE.AUTHORIZED, function() {
      page.init();
    })
  });
}
