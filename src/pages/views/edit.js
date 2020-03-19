import Page from '../page';
import events from '../../config/events';
import ViewEditFormControl from '../../components/forms/view-edit-form-control';

class ViewEditPage extends Page {
  constructor() {
    super();
    this.formControl = new ViewEditFormControl()
  }

  init() {
    super.init();
    this.formControl.init();
    this.formControl.accounts.init();
  }
}

export default () => {
  $(function() {
    const page = new ViewEditPage();

    $(window).on(events.GOOGLE.AUTHORIZED, function() {
      page.init();
    })
  });
}
