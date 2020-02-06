import remarketing from './remarketing';
import customDimensions from './custom-dimensions'

const routes = {
  '/': remarketing,
  '/custom-dimensions': customDimensions
}

export default routes;
