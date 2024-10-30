import redisJobQueue from '@/lib/bull/redisJobQueues';

class QueueManager {
  // Get all print jobs for a user (Enqueue the get job to Bull)
  public static async getJobs(accountId: string): Promise<any[]> {
    const job = await redisJobQueue.add({ type: 'get', accountId });
    return job.finished(); // Wait for job completion and get the result
  }

  // Remove a specific job after it has been printed (Enqueue the remove job to Bull)
  public static async removeJob(
    accountId: string,
    jobToRemove: any,
    recordId: string
  ): Promise<void> {
    const job = await redisJobQueue.add({
      type: 'remove',
      accountId,
      jobData: jobToRemove,
      recordId,
    });
    await job.finished(); // Wait for job completion
  }

  // Add a new print job to the user's list of jobs (Enqueue the add job to Bull)
  public static async addJob(accountId: string, job: any): Promise<number> {
    const bullJob = await redisJobQueue.add({
      type: 'add',
      accountId,
      jobData: job,
    });
    const result = await bullJob.finished(); // Wait for job completion
    return result; // Get the result from the Bull job
  }
}

export default QueueManager;

