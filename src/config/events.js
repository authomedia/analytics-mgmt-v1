const events = {
  GOOGLE: {
    AUTHORIZED: 'google:authorized',
    UNAUTHORIZED: 'google:unauthorized'
  },
  BUTTONS: {
    SUBMIT: {
      CLICK: 'buttons:submit:click'
    },
    BUTTON: {
      CLICK: 'buttons:button:click'
    }
  },
  FIELDS: {
    PROPERTIES: {
      CHANGE: 'fields:properties:change'
    },
    ACCOUNTS: {
      CHANGE: 'fields:accounts:change'
    },
    PROFILES: {
      CHANGE: 'fields:profiles:change'
    },
    REMARKETING_AUDIENCES: {
      CHANGE: 'fields:remarketingAudiences:change'
    },
    LINKED_AD_ACCOUNTS: {
      CHANGE: 'fields:linkedAdAccounts:change'
    },
    AD_LINKS: {
      CHANGE: 'field:adLinks:change'
    },
    DV360_LINKS: {
      CHANGE: 'field:dv360Links:change'
    },
    SHOW_SESSIONS: {
      CHANGE: 'field:showSessions:change'
    }
  }
}

export default events;
