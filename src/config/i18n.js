var i18n = {
  en: {
    titles: {
      error: "Error",
      success: "Success!"
    },
    messages: {
      remarketingSuccess: "Created remarketing campaign",
      customDimensionSuccess: "Created custom dimension",
      customMetricSuccess: "Created custom metric",
    },
    analytics: {
      modals: {
        remarketingAudienceModalTitle: 'Create Remarketing Audience',
        primaryText: 'Create Audiences',
        customDimensions: {
          audit: 'Audit Custom Dimensions'
        },
        customMetrics: {
          audit: 'Audit Custom Metrics'
        }
      },
      tables: {
        customDimensions: {
          property: "Property"
        },
        customMetrics: {
          property: "Property"
        }
      },
      errors: {
        noAccounts: 'No accounts found for this user.',
        noProperties: 'No properties found for this user.',
        noProfiles: 'No views (profiles) found for this user.',
        noRemarketingAudiences: 'No remarketing audiences found for this account',
        noLinkedViews: 'No linked views found for this remarketing audience',
        noAdLinks: 'No Adwords accounts are linked to this account',
        noLinkedAdAccounts: 'No linked ad accounts found for this remarketing audience',
        remarketingAudiencesValidationError: 'There is a problem with your remarketing audience settings. Please check!',
        customDimensionsValidationError: 'There is a problem with your custom dimensions. Please check!',
        customMetricsValidationError: 'There is a problem with your custom metrics. Please check!'
      }
    },
    select: {
      all: 'Select all',
      none: 'Select none'
    },
    validations: {
      range: '%s should be between %s and %s',
      inclusion: '%s should include one of the the following: %s',
      length: '%s should be between %s and %s in length',
      matches: '%s should include one of %s'
    }
  }
}

export default i18n;
