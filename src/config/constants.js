const constants = {
  DB_FIELDS_CUSTOM_DIMENSIONS: ['index', 'name', 'scope', 'active'],
  DB_FIELDS_CUSTOM_METRICS: ['index', 'name', 'scope', 'type', 'active'],
  DB_FIELDS_SNAPSHOTS: ['index', 'fields'],
  DB_FIELDS_METRICS_CACHE: [
    'index',
    'data',
    'timestamp'
  ]
}

export default constants;
