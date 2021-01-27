import remarketing from './remarketing';
import customDimensionsUpload from './custom-dimensions/upload';
import customDimensionsAudit from './custom-dimensions/audit';
import customMetricsUpload from './custom-metrics/upload';
import customMetricsAudit from './custom-metrics/audit';
import goalsAudit from './goals/audit';
import profilesAudit from './profiles/audit';

const routes = {
  '/': remarketing,
  '/custom-dimensions/upload': customDimensionsUpload,
  '/custom-dimensions/audit': customDimensionsAudit,
  '/custom-metrics/upload': customMetricsUpload,
  '/custom-metrics/audit': customMetricsAudit,
  '/goals/audit': goalsAudit,
  '/profiles/audit': profilesAudit,
}

export default routes;
