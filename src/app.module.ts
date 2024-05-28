import { Module } from '@nestjs/common';
import { AchievementsCoreModule } from '@st-achievements/core';
import { CoreModule } from '@st-api/core';

import { AppHandler } from './app.handler.js';

@Module({
  imports: [
    CoreModule.forRoot(),
    AchievementsCoreModule.forRoot({
      authentication: false,
      throttling: false,
    }),
  ],
  controllers: [],
  providers: [AppHandler],
})
export class AppModule {}
