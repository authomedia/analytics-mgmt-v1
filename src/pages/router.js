import remarketing from './remarketing';
import customDimensions from './custom-dimensions';
import customDimensionsAudit from './custom-dimensions/audit';

const routes = {
  '/': remarketing,
  '/custom-dimensions': customDimensions,
  '/custom-dimensions/audit': customDimensionsAudit,
}

export default routes;
