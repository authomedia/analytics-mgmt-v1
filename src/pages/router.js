import remarketingAudiencesIndex from './remarketing-audiences/index';
import customDimensionsUpload from './custom-dimensions/upload';
import customDimensionsAudit from './custom-dimensions/audit';
import customMetricsUpload from './custom-metrics/upload';
import customMetricsAudit from './custom-metrics/audit';
import goalsAudit from './goals/audit';
import profilesAudit from './profiles/audit';
import administrationSnapshots from './administration/snapshots';

const routes = {
  '/remarketing-audiences': remarketingAudiencesIndex,
  '/custom-dimensions/upload': customDimensionsUpload,
  '/custom-dimensions/audit': customDimensionsAudit,
  '/custom-metrics/upload': customMetricsUpload,
  '/custom-metrics/audit': customMetricsAudit,
  '/goals': goalsAudit,
  '/profiles/audit': profilesAudit,
  '/administration/snapshots': administrationSnapshots,
}

export default routes;
