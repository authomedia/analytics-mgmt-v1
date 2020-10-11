import Dexie from 'dexie';

import constants from '../config/constants';

const db = new Dexie(process.env.DB_NAME);
const customDimensionsFields = constants.DB_FIELDS_CUSTOM_DIMENSIONS.join(', ');
const customMetricsFields = constants.DB_FIELDS_CUSTOM_METRICS.join(', ');
const snapshotsFields = constants.DB_FIELDS_SNAPSHOTS.join(', ');

db.version(1).stores({
  customDimensions: customDimensionsFields,
  customMetrics: customMetricsFields,
  snapshots: snapshotsFields,
});

export default db;
