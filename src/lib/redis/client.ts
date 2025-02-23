import Redis from 'ioredis';
import { createAdminClient } from '../supabase/client';

interface Job {
  id: string;
  account_id: string;
  first_name: string;
  last_name: string;
  opt_in: boolean;
  length: number;
  width: number;
  height: number;
  quantity: number;
  cost: string;
  firing_type: string;
  non_member?: null | boolean;
  photo_url: string;
  printed: boolean;
  exported: boolean;
  updated_at: string;
  created_at: string;
  updated_by?: null | string;
  created_by?: null | string;
  rounded_length: number;
  rounded_width: number;
  rounded_height: number;
  email: string;
  pricing_category: string;
  rate_amount: number;
}


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
  public static async getJobs(accountId: string): Promise<any[]> {
    const redis = RedisSingleton.getInstance();
    const jobs = await redis.lrange(`print_jobs:${accountId}`, 0, -1); // Get all jobs from the list
    return jobs.map((job) => JSON.parse(job)); // Parse each job from JSON
  }

  // Remove a specific job after it has been printed (optional, based on job ID or matching condition)
  public static async removeJob(
    accountId: string,
    jobToRemove: Job,
    recordId: string
  ): Promise<void> {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('kiln_requests') // Replace with your table name
      .update({ printed: true }) // Update the 'printed' column to true
      .eq('id', recordId); // Match the record by its ID

    if (!error) {
      console.log('Record successfully marked as printed on Supabase: ', recordId);
      const redis = RedisSingleton.getInstance();
      await redis.lrem(
        `print_jobs:${accountId}`,
        1,
        JSON.stringify(jobToRemove)
      ); // Remove one instance of the job from the list
      console.log('Successfully removed from redis queue: ', accountId, jobToRemove);
    }
  }

  //   Add a new print job to the user's list of jobs
  public static async addJob(accountId: string, job: Job): Promise<number> {
    if (!job) {
      throw new Error("Cannot add a null or undefined job.");
    }
    const redis = RedisSingleton.getInstance();
    const result = await redis.rpush(
      `print_jobs:${accountId}`,
      JSON.stringify(job)
    ); // Add job to the end of the list
    console.log('Successfully added job to redis queue: ', accountId, job);
    return result;
  }

  public static async jobExists(
    accountId: string,
    newJob: Job
  ): Promise<boolean> {
    const existingJobs = await RedisSingleton.getJobs(accountId);

    return existingJobs.some(
      (job) => JSON.stringify(job) === JSON.stringify(newJob)
    );
  }
}

export default RedisSingleton;
