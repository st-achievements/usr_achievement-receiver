import { PubSubService } from '@st-achievements/core';
import { ach, Drizzle, usr } from '@st-achievements/database';
import {
  createEventarcHandler,
  EventarcHandler,
  Logger,
} from '@st-api/firebase';
import { and, eq, inArray, isNull, not, notExists, or, sql } from 'drizzle-orm';

import { AchievementLevelEnum } from './achievement-level.enum.js';
import { AchievementProcessorDto } from './achievement-processor.dto.js';
import {
  ACHIEVEMENT_PROCESSOR_QUEUE,
  WORKOUT_CREATED_EVENT,
} from './app.constants.js';
import { WorkoutInputDto } from './workout-input.dto.js';
import { Injectable } from '@stlmpp/di';

@Injectable()
export class AppHandler implements EventarcHandler<typeof WorkoutInputDto> {
  constructor(
    private readonly drizzle: Drizzle,
    private readonly pubSubService: PubSubService,
  ) {}

  private readonly logger = Logger.create(this);

  async handle(event: WorkoutInputDto): Promise<void> {
    Logger.setContext(`u${event.userId}-w${event.workoutId}`);
    this.logger.log('event', { event });
    const notExistsUsrAchievements = this.drizzle
      .select({ 1: sql`1` })
      .from(usr.achievement)
      .where(
        and(
          eq(usr.achievement.userId, event.userId),
          eq(usr.achievement.periodId, event.periodId),
          eq(usr.achievement.achAchievementId, ach.achievement.id),
          isNull(usr.achievement.inactivatedAt),
        ),
      );
    const achievements = await this.drizzle
      .selectDistinct({
        achievementId: ach.achievement.id,
      })
      .from(ach.achievement)
      .leftJoin(
        ach.achievementWorkoutType,
        and(
          eq(ach.achievementWorkoutType.achievementId, ach.achievement.id),
          isNull(ach.achievementWorkoutType.inactivatedAt),
        ),
      )
      .where(
        and(
          notExists(notExistsUsrAchievements),
          isNull(ach.achievement.inactivatedAt),
          not(eq(ach.achievement.levelId, AchievementLevelEnum.Platinum)),
          or(
            inArray(ach.achievement.workoutTypeCondition, [
              'any',
              'exclusiveAny',
            ]),
            and(
              inArray(ach.achievement.workoutTypeCondition, [
                'anyOf',
                'exclusiveAnyOf',
                'allOf',
              ]),
              eq(ach.achievementWorkoutType.workoutTypeId, event.workoutTypeId),
            ),
          ),
        ),
      );
    const achievementIds = achievements.map(
      (achievement) => achievement.achievementId,
    );
    this.logger.log('achievementIds', { achievementIds });
    const achievementProcessorDto: AchievementProcessorDto = {
      userId: event.userId,
      periodId: event.periodId,
      workoutDate: event.startedAt.toISOString(),
      workoutId: event.workoutId,
      achievementIds,
    };
    await this.pubSubService.publish(ACHIEVEMENT_PROCESSOR_QUEUE, {
      json: achievementProcessorDto,
    });
    this.logger.log('all achievements published!');
  }
}

export const appHandler = createEventarcHandler({
  handler: AppHandler,
  schema: () => WorkoutInputDto,
  eventType: WORKOUT_CREATED_EVENT,
  // https://cloud.google.com/eventarc/standard/docs/third-parties/create-channels
  // Only some regions are supported for eventarc triggers
  region: 'us-central1',
});
