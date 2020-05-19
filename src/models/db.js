import Dexie from 'dexie';

import constants from '../config/constants';

const db = new Dexie(process.env.DB_NAME);
const dbFields = constants.DB_FIELDS.join(', ');
const dbFields2 = constants.DB_FIELDS2.join(', ');

db.version(1).stores({
  customDimensions: dbFields,
  customMetrics: dbFields2
});

export default db;
