/**
 * Shapes returned by the backend for `/muscles`, `/exercises`, and
 * `/lifting-histories*` endpoints.
 *
 * Mirrors `backend/src/{muscles,exercises,lifting-histories}/entities/*.entity.ts`
 * (only the fields actually serialized in API responses — entities also
 * declare `deletedAt`/relations not relevant to clients).
 */

export type Muscle = {
  id: number;
  name: string;
};

export type Exercise = {
  id: number;
  name: string;
  description: string;
  muscle: Muscle;
};

/**
 * A logged set for an exercise. `date` is serialized as an ISO date
 * string (`YYYY-MM-DD`) by the backend's `@Column('date')`.
 */
export type LiftingHistory = {
  id: number;
  weight: number;
  date: string;
  repeatNumber: number;
  exercise: Exercise;
};
