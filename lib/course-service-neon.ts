import { getNeonDb } from './neon';

export interface CourseSummary {
  id: string;
  title: string;
  slug: string;
  status: string;
  summary?: string;
  subject?: string;
  level?: string;
  updatedAt: string;
}

export const CourseServiceNeon = {
  /**
   * Get all courses from Neon (Summary for dashboard)
   */
  async getAllCourses(): Promise<CourseSummary[]> {
    const sql = getNeonDb();
    const courses = await sql`
            SELECT id, title, slug, status, summary, subject, level, thumbnail, 
                   updated_at as "updatedAt", created_at as "createdAt"
            FROM courses
            ORDER BY updated_at DESC
        `;
    return courses as any[];
  },

  /**
   * Create a new course in Neon
   */
  async createCourse(course: any) {
    const sql = getNeonDb();
    const [result] = await sql`
            INSERT INTO courses (
                author_id, category_id, title, slug, summary, description, 
                thumbnail, subject, level, language, tags, curriculum, 
                status, price, seo, metadata, resources
            ) VALUES (
                ${course.authorId}, ${course.categoryId}, ${course.title}, ${course.slug}, 
                ${course.summary}, ${course.description}, ${course.thumbnail}, 
                ${course.subject}, ${course.level}, ${course.language}, 
                ${course.tags || []}, ${JSON.stringify(course.curriculum || [])}, 
                ${course.status || 'draft'}, ${JSON.stringify(course.price || {})}, 
                ${JSON.stringify(course.seo || {})}, ${JSON.stringify(course.metadata || {})}, 
                ${JSON.stringify(course.resources || [])}
            )
            RETURNING *
        `;
    return result;
  },

  /**
   * Update an existing course in Neon
   */
  async updateCourse(id: string, course: any) {
    const sql = getNeonDb();
    const [result] = await sql`
            UPDATE courses SET
                category_id = ${course.categoryId},
                title = ${course.title},
                slug = ${course.slug},
                summary = ${course.summary},
                description = ${course.description},
                thumbnail = ${course.thumbnail},
                subject = ${course.subject},
                level = ${course.level},
                language = ${course.language},
                tags = ${course.tags || []},
                curriculum = ${JSON.stringify(course.curriculum || [])},
                status = ${course.status},
                price = ${JSON.stringify(course.price || {})},
                seo = ${JSON.stringify(course.seo || {})},
                metadata = ${JSON.stringify(course.metadata || {})},
                resources = ${JSON.stringify(course.resources || [])},
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ${id}
            RETURNING *
        `;
    return result;
  },

  /**
   * Get only published courses from Neon
   */
  async getPublishedCourses(): Promise<CourseSummary[]> {
    const sql = getNeonDb();
    const courses = await sql`
            SELECT id, title, slug, status, summary, subject, level, thumbnail, 
                   updated_at as "updatedAt", created_at as "createdAt"
            FROM courses
            WHERE status = 'published'
            ORDER BY updated_at DESC
        `;
    return courses as any[];
  },

  /**
   * Get a single course by slug
   */
  async getCourseBySlug(slug: string) {
    const sql = getNeonDb();
    const [course] = await sql`
            SELECT * FROM courses WHERE slug = ${slug}
        `;
    return course;
  },

  /**
   * Get a single course by ID
   */
  async getCourseById(id: string) {
    const sql = getNeonDb();
    const [course] = await sql`
            SELECT * FROM courses WHERE id = ${id}
        `;
    return course;
  },

  /**
   * Delete course from Neon
   */
  async deleteCourse(id: string) {
    const sql = getNeonDb();
    await sql`DELETE FROM courses WHERE id = ${id}`;
  }
};
