import Redis from 'ioredis';

class RedisSingleton {
  private static instance: Redis | null = null;

  // Private constructor to prevent direct instantiation
  private constructor() {}

  // Get the Redis instance or create it if not already created
  public static getInstance(): Redis {
    if (!RedisSingleton.instance) {
      RedisSingleton.instance = new Redis(process.env.NEXT_PUBLIC_REDIS_URL!); // Initialize with Redis URL
    }
    return RedisSingleton.instance;
  }

  // Get all print jobs for a user
  public static async getJobs(userId: string): Promise<any[]> {
    const redis = RedisSingleton.getInstance();
    const jobs = await redis.lrange(`print_jobs:${userId}`, 0, -1); // Get all jobs from the list
    return jobs.map((job) => JSON.parse(job)); // Parse each job from JSON
  }

  // Remove a specific job after it has been printed (optional, based on job ID or matching condition)
  public static async removeJob(
    userId: string,
    jobToRemove: any
  ): Promise<void> {
    const redis = RedisSingleton.getInstance();
    await redis.lrem(`print_jobs:${userId}`, 1, JSON.stringify(jobToRemove)); // Remove one instance of the job from the list
  }

  //   Add a new print job to the user's list of jobs
  public static async addJob(userId: string, job: any): Promise<number> {
    const redis = RedisSingleton.getInstance();
    const result = await redis.rpush(`print_jobs:${userId}`, JSON.stringify(job)); // Add job to the end of the list
	return result
  }

  // Clear all jobs for a user (after all jobs are printed, for example)
  //   public static async clearJobs(userId: string): Promise<void> {
  //     const redis = RedisSingleton.getInstance();
  //     await redis.del(`print_jobs:${userId}`);  // Delete the entire list
  //   }
}

export default RedisSingleton;
