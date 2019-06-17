import FormControl from '../components/form-control';

var ui = {
  analyticsUi: $('#analytics-ui'),
  authButton: $('#auth-button'),
  loadingOverlay: $('#loading-overlay'),
  logoutButton: $('#logout-button'),
  formControl: new FormControl(),
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
    this.analyticsUi.attr('hidden', false);
    this.authButton.attr('hidden', true);
    this.loadingOverlay.attr('hidden', true);
    this.logoutButton.attr('hidden', false);
  },

  loggedOut: function() {
    this.analyticsUi.attr('hidden', true);
    this.authButton.attr('hidden', false);
    this.loadingOverlay.attr('hidden', true);
    this.logoutButton.attr('hidden', true);
  }
}


export default ui;
