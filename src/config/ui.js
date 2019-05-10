var ui = {
  authButton: document.getElementById('auth-button'),
  notifications: {
    container: $('#toasts'),
    toast: $('.toast').clone(),
    defaults: {
      animation: true,
      autohide: true,
      delay: 2000
    }
  }
}


export default ui;
