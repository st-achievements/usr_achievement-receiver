import { z } from 'zod';

const DatetimeSchema = z
  .string()
  .trim()
  .datetime()
  .transform((value) => new Date(value));

export const WorkoutInputDto = z.object({
  workoutId: z.number(),
  externalId: z.string(),
  startedAt: DatetimeSchema,
  endedAt: DatetimeSchema,
  duration: z.number(),
  distance: z.number().optional(),
  workoutTypeId: z.number(),
  workoutTypeName: z.string(),
  workoutName: z.string().optional(),
  energyBurned: z.number(),
  userId: z.number(),
  periodId: z.number(),
});

export type WorkoutInputDto = z.infer<typeof WorkoutInputDto>;
