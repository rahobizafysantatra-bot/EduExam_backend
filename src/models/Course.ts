export interface Course {
  id: string;
  code: string;
  name: string;
  description: string | null;
}

export type CreateCourseDTO = Omit<Course, 'id'>;

export type UpdateCourseDTO = Partial<CreateCourseDTO>;