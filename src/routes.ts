import { verifyGatewayRequest } from '@eoladapo/jobman-shared';
import { Application } from 'express';

const BASE_PATH = '/api/v1/order';

const appRoutes = (app: Application): void => {
  app.use('');
  app.use(BASE_PATH, verifyGatewayRequest);
};

export { appRoutes };
