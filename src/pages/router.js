import remarketing from './remarketing';
import customDimensionsUpload from './custom-dimensions/upload';
import customDimensionsAudit from './custom-dimensions/audit';
import customMetricsUpload from './custom-metrics/upload';
import customMetricsAudit from './custom-metrics/audit';


const routes = {
  '/': remarketing,
  '/custom-dimensions/upload': customDimensionsUpload,
  '/custom-dimensions/audit': customDimensionsAudit,
  '/custom-metrics/upload': customMetricsUpload,
  '/custom-metrics/audit': customMetricsAudit,
}

export default routes;
