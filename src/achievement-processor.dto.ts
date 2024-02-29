import { WorkoutInputDto } from './workout-input.dto.js';

export interface AchievementProcessorDto {
  workout: WorkoutInputDto;
  achievementId: number;
}
