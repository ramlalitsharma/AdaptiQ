/**
 * Meilisearch Advanced Search Service
 * Open-source, self-hostable search engine
 * Used by Stripe, OpenAI, etc.
 *
 * Features:
 * - Full-text search with typo tolerance
 * - Faceted search and filtering
 * - Ranking and sorting
 * - Instant search suggestions
 * - Customizable ranking rules
 */

import { MeiliSearch } from "meilisearch";

const MEILISEARCH_URL = process.env.MEILISEARCH_URL || "http://localhost:7700";
const MEILISEARCH_KEY = process.env.MEILISEARCH_KEY || "masterKey";

// Initialize Meilisearch client
const client = new MeiliSearch({
  host: MEILISEARCH_URL,
  apiKey: MEILISEARCH_KEY,
});

// Index names
const INDEXES = {
  COURSES: "courses",
  LESSONS: "lessons",
  BLOG_POSTS: "blog_posts",
  USERS: "users",
  DISCUSSIONS: "discussions",
};

interface CourseDocument {
  id: string;
  title: string;
  description: string;
  category: string;
  level: "beginner" | "intermediate" | "advanced";
  duration_minutes: number;
  price: number;
  rating: number;
  students_count: number;
  instructor_id: string;
  instructor_name: string;
  tags: string[];
  created_at: number;
  updated_at: number;
}

interface LessonDocument {
  id: string;
  course_id: string;
  title: string;
  content: string;
  order: number;
  duration_minutes: number;
  created_at: number;
}

interface BlogDocument {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author_id: string;
  author_name: string;
  category: string;
  tags: string[];
  view_count: number;
  created_at: number;
  published_at: number;
}

interface UserDocument {
  id: string;
  username: string;
  email: string;
  bio: string;
  avatar_url: string;
  role: "student" | "instructor" | "admin";
  courses_count: number;
  followers_count: number;
  created_at: number;
}

interface DiscussionDocument {
  id: string;
  course_id: string;
  title: string;
  content: string;
  author_id: string;
  author_name: string;
  replies_count: number;
  views_count: number;
  created_at: number;
}

/**
 * Initialize search indexes with custom settings
 */
export async function initializeIndexes() {
  try {
    // Initialize courses index
    const coursesIndex = client.index(INDEXES.COURSES);
    await coursesIndex.updateSettings({
      searchableAttributes: ["title", "description", "category", "tags", "instructor_name"],
      filterableAttributes: ["category", "level", "price", "rating", "students_count"],
      sortableAttributes: ["price", "rating", "students_count", "created_at"],
      rankingRules: [
        "sort",
        "words",
        "typo",
        "proximity",
        "exactness",
        "rating:desc",
        "students_count:desc",
      ],
      typoTolerance: {
        enabled: true,
        minWordSizeForTypos: {
          oneTypo: 5,
          twoTypos: 9,
        },
      },
      pagination: {
        maxTotalHits: 10000,
      },
    });

    // Initialize lessons index
    const lessonsIndex = client.index(INDEXES.LESSONS);
    await lessonsIndex.updateSettings({
      searchableAttributes: ["title", "content"],
      filterableAttributes: ["course_id"],
      sortableAttributes: ["order", "created_at"],
    });

    // Initialize blog index
    const blogIndex = client.index(INDEXES.BLOG_POSTS);
    await blogIndex.updateSettings({
      searchableAttributes: ["title", "content", "excerpt", "tags", "author_name"],
      filterableAttributes: ["category", "author_id"],
      sortableAttributes: ["view_count", "published_at"],
      rankingRules: [
        "sort",
        "words",
        "typo",
        "proximity",
        "exactness",
        "view_count:desc",
        "published_at:desc",
      ],
    });

    // Initialize users index
    const usersIndex = client.index(INDEXES.USERS);
    await usersIndex.updateSettings({
      searchableAttributes: ["username", "bio"],
      filterableAttributes: ["role"],
      sortableAttributes: ["followers_count", "courses_count"],
    });

    // Initialize discussions index
    const discussionsIndex = client.index(INDEXES.DISCUSSIONS);
    await discussionsIndex.updateSettings({
      searchableAttributes: ["title", "content", "author_name"],
      filterableAttributes: ["course_id"],
      sortableAttributes: ["replies_count", "views_count", "created_at"],
    });

    console.log("✓ Meilisearch indexes initialized");
  } catch (error) {
    console.error("Error initializing Meilisearch indexes:", error);
    throw error;
  }
}

/**
 * Search courses with advanced filters
 */
export async function searchCourses(
  query: string,
  options?: {
    filter?: string;
    sort?: string[];
    limit?: number;
    offset?: number;
    facets?: string[];
  }
) {
  try {
    const index = client.index(INDEXES.COURSES);

    const result = await index.search(query, {
      filter: options?.filter,
      sort: options?.sort || ["rating:desc"],
      limit: options?.limit || 20,
      offset: options?.offset || 0,
      facets: options?.facets,
    });

    return result;
  } catch (error) {
    console.error("Error searching courses:", error);
    throw error;
  }
}

/**
 * Search all content types (global search)
 */
export async function globalSearch(query: string, limit = 50) {
  try {
    const [courses, lessons, blogs, users, discussions] = await Promise.all([
      client.index(INDEXES.COURSES).search(query, { limit: limit / 5 }),
      client.index(INDEXES.LESSONS).search(query, { limit: limit / 5 }),
      client.index(INDEXES.BLOG_POSTS).search(query, { limit: limit / 5 }),
      client.index(INDEXES.USERS).search(query, { limit: limit / 5 }),
      client.index(INDEXES.DISCUSSIONS).search(query, { limit: limit / 5 }),
    ]);

    return {
      courses: courses.hits,
      lessons: lessons.hits,
      blog_posts: blogs.hits,
      users: users.hits,
      discussions: discussions.hits,
      total: courses.estimatedTotalHits,
    };
  } catch (error) {
    console.error("Error in global search:", error);
    throw error;
  }
}

/**
 * Get search suggestions (autocomplete)
 */
export async function getSearchSuggestions(
  query: string,
  type: keyof typeof INDEXES = "COURSES"
) {
  try {
    const index = client.index(INDEXES[type]);
    const result = await index.search(query, {
      limit: 10,
      attributesToRetrieve: ["title", "id"],
    });

    return result.hits.map((hit: any) => ({
      id: hit.id,
      title: hit.title,
      type,
    }));
  } catch (error) {
    console.error("Error getting search suggestions:", error);
    throw error;
  }
}

/**
 * Add or update a course document
 */
export async function indexCourse(course: CourseDocument) {
  try {
    const index = client.index(INDEXES.COURSES);
    await index.addDocuments([course], { primaryKey: "id" });
    return course;
  } catch (error) {
    console.error("Error indexing course:", error);
    throw error;
  }
}

/**
 * Batch index courses
 */
export async function batchIndexCourses(courses: CourseDocument[]) {
  try {
    const index = client.index(INDEXES.COURSES);
    const task = await index.addDocuments(courses, { primaryKey: "id" });
    return task;
  } catch (error) {
    console.error("Error batch indexing courses:", error);
    throw error;
  }
}

/**
 * Delete a course from index
 */
export async function deleteCourseFromIndex(courseId: string) {
  try {
    const index = client.index(INDEXES.COURSES);
    await index.deleteDocument(courseId);
  } catch (error) {
    console.error("Error deleting course from index:", error);
    throw error;
  }
}

/**
 * Add or update a blog post
 */
export async function indexBlogPost(post: BlogDocument) {
  try {
    const index = client.index(INDEXES.BLOG_POSTS);
    await index.addDocuments([post], { primaryKey: "id" });
    return post;
  } catch (error) {
    console.error("Error indexing blog post:", error);
    throw error;
  }
}

/**
 * Search blog posts
 */
export async function searchBlogPosts(
  query: string,
  options?: {
    filter?: string;
    sort?: string[];
    limit?: number;
    offset?: number;
  }
) {
  try {
    const index = client.index(INDEXES.BLOG_POSTS);
    const result = await index.search(query, {
      filter: options?.filter,
      sort: options?.sort || ["published_at:desc"],
      limit: options?.limit || 20,
      offset: options?.offset || 0,
    });

    return result;
  } catch (error) {
    console.error("Error searching blog posts:", error);
    throw error;
  }
}

/**
 * Add or update a user
 */
export async function indexUser(user: UserDocument) {
  try {
    const index = client.index(INDEXES.USERS);
    await index.addDocuments([user], { primaryKey: "id" });
    return user;
  } catch (error) {
    console.error("Error indexing user:", error);
    throw error;
  }
}

/**
 * Search users
 */
export async function searchUsers(
  query: string,
  options?: {
    filter?: string;
    limit?: number;
    offset?: number;
  }
) {
  try {
    const index = client.index(INDEXES.USERS);
    const result = await index.search(query, {
      filter: options?.filter,
      limit: options?.limit || 20,
      offset: options?.offset || 0,
    });

    return result;
  } catch (error) {
    console.error("Error searching users:", error);
    throw error;
  }
}

/**
 * Add or update a discussion
 */
export async function indexDiscussion(discussion: DiscussionDocument) {
  try {
    const index = client.index(INDEXES.DISCUSSIONS);
    await index.addDocuments([discussion], { primaryKey: "id" });
    return discussion;
  } catch (error) {
    console.error("Error indexing discussion:", error);
    throw error;
  }
}

/**
 * Search discussions
 */
export async function searchDiscussions(
  query: string,
  courseId?: string,
  options?: {
    limit?: number;
    offset?: number;
  }
) {
  try {
    const index = client.index(INDEXES.DISCUSSIONS);
    const filter = courseId ? `course_id = "${courseId}"` : undefined;

    const result = await index.search(query, {
      filter,
      sort: ["replies_count:desc"],
      limit: options?.limit || 20,
      offset: options?.offset || 0,
    });

    return result;
  } catch (error) {
    console.error("Error searching discussions:", error);
    throw error;
  }
}

/**
 * Get trending courses (popular searches)
 */
export async function getTrendingCourses(limit = 10) {
  try {
    const index = client.index(INDEXES.COURSES);
    const result = await index.search("", {
      sort: ["students_count:desc", "rating:desc"],
      limit,
    });

    return result.hits;
  } catch (error) {
    console.error("Error getting trending courses:", error);
    throw error;
  }
}

/**
 * Get featured content
 */
export async function getFeaturedContent(limit = 5) {
  try {
    const [courses, blogs] = await Promise.all([
      client.index(INDEXES.COURSES).search("", {
        sort: ["rating:desc", "students_count:desc"],
        limit,
      }),
      client.index(INDEXES.BLOG_POSTS).search("", {
        sort: ["view_count:desc"],
        limit,
      }),
    ]);

    return {
      featured_courses: courses.hits,
      featured_blogs: blogs.hits,
    };
  } catch (error) {
    console.error("Error getting featured content:", error);
    throw error;
  }
}

/**
 * Clear all indexes (use with caution)
 */
export async function clearAllIndexes() {
  try {
    await Promise.all(
      Object.values(INDEXES).map((index) => client.index(index).deleteAllDocuments())
    );
    console.log("✓ All indexes cleared");
  } catch (error) {
    console.error("Error clearing indexes:", error);
    throw error;
  }
}

/**
 * Get search stats
 */
export async function getSearchStats() {
  try {
    const stats = await Promise.all(
      Object.entries(INDEXES).map(async ([name, index]) => ({
        index: name,
        stats: await client.index(index).getStats(),
      }))
    );

    return stats;
  } catch (error) {
    console.error("Error getting search stats:", error);
    throw error;
  }
}

export default {
  initializeIndexes,
  searchCourses,
  globalSearch,
  getSearchSuggestions,
  indexCourse,
  batchIndexCourses,
  deleteCourseFromIndex,
  indexBlogPost,
  searchBlogPosts,
  indexUser,
  searchUsers,
  indexDiscussion,
  searchDiscussions,
  getTrendingCourses,
  getFeaturedContent,
  clearAllIndexes,
  getSearchStats,
};
