import { AchievementsCoreAdapter } from '@st-achievements/core';
import { StFirebaseApp } from '@st-api/firebase';

import { AppHandler, appHandler } from './app.handler.js';

const app = StFirebaseApp.create({
  adapter: new AchievementsCoreAdapter({
    authentication: false,
    throttling: false,
  }),
  controllers: [],
  providers: [AppHandler],
}).addEventarc(appHandler);

export const usr_achievement = {
  receiver: {
    events: app.getCloudEventHandlers(),
    http: app.getHttpHandler(),
  },
};
