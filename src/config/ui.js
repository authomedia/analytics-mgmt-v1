import FormControl from '../components/form-control';
import Analytics from '../components/analytics'

const analytics = new Analytics(
  process.env.CLIENT_ID
  [process.env.SCOPES]
);

var ui = {
  analyticsUi: $('#analytics-ui'),
  authButton: $('#auth-button'),
  loadingOverlay: $('#loading-overlay'),
  logoutButton: $('#logout-button'),
  contentTitle: $('#content-title'),
  formControl: new FormControl(analytics),
  notifications: {
    container: $('#toasts'),
    toast: $('.toast').clone(),
    defaults: {
      animation: true,
      autohide: true,
      delay: 5000
    }
  },

  loggedIn: function() {
    // this.contentTitle.find('img').after('Remarketing Audiences');
    this.analyticsUi.attr('hidden', false);
    this.authButton.attr('hidden', true);
    this.loadingOverlay.attr('hidden', true);
    this.logoutButton.attr('hidden', false);
  },

  loggedOut: function() {
    // this.contentTitle.find('img').after('Log in');
    this.analyticsUi.attr('hidden', true);
    this.authButton.attr('hidden', false);
    this.loadingOverlay.attr('hidden', true);
    this.logoutButton.attr('hidden', true);
  }
}


export default ui;
