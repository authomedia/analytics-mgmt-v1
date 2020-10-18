import Modal from '../components/ui/modal';

var ui = {
  body: $('body'),
  analyticsUi: $('#analytics-ui'),
  authButton: $('#auth-button'),
  loadingOverlay: $('#loading-overlay'),
  logoutButton: $('#logout-button'),
  contentTitle: $('#content-title'),

  modal: {}, // initialized during init()

  debug: $('#query-output'),
  logger: $('#logger-output > ul'),

  loggerClear: $('#logger-clear'),

  notifications: {
    container: $('#toasts'),
    toast: $('.toast').clone(),
    defaults: {
      animation: true,
      autohide: true,
      delay: 5000
    }
  },

  modals: {
    container: $('#modals'),
    modal: $('#modals > .modal'),
    defaults: {
      primaryText: "Confirm submit",
      secondaryText: "Cancel",
      callback: (event) => {}
    }
  },

  init: function() {
    this.modal = new Modal(this);
    this.initLoggerClearButton();
    this.initTooltips();
    this.initLogoutButton();
    this.initGoogleAuthButton();
  },

  initLoggerClearButton() {
    this.loggerClear.on('click', (event) => {
      event.preventDefault();
      this.logger.empty();
    })
  },

  initTooltips: function() {
    $('[data-toggle="tooltip"]').tooltip();
  },

  initGoogleAuthButton: function() {
    // Add an event listener to the 'auth-button'.
    this.authButton.on('click', window.authorize);
  },

  initLogoutButton: function() {
    // Add event listener to logout
    this.logoutButton.on('click', () => {
      gapi.auth.signOut()
      this.loggedOut();
    });
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

$(function() {
  ui.init()
});

export default ui;
