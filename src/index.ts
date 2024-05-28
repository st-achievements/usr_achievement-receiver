import { AchievementsCoreAdapter } from '@st-achievements/core';
import { StFirebaseApp } from '@st-api/firebase';

import { appHandler } from './app.handler.js';
import { AppModule } from './app.module.js';

const app = StFirebaseApp.create(AppModule, {
  adapter: new AchievementsCoreAdapter(),
}).addEventarc(appHandler);

export const usr_achievement = {
  receiver: {
    events: app.getCloudEventHandlers(),
    http: app.getHttpHandler(),
  },
};
