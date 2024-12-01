import Bull from 'bull';
import RedisSingleton from '@/lib/redis/client';

const redisJobQueue = new Bull('redisJobQueue', process.env.NEXT_PUBLIC_REDIS_URL!)

const CLEAN_INTERVAL = 60 * 60 * 1000; // 1 hour
const MAX_JOB_AGE = 48 * 60 * 60 * 1000; // 48 hours

const cleanQueue = async () => {
  try {
    // Clean completed jobs older than MAX_JOB_AGE
    await redisJobQueue.clean(MAX_JOB_AGE, 'completed');
    console.log('Cleaned completed jobs');

    // Clean failed jobs older than MAX_JOB_AGE
    await redisJobQueue.clean(MAX_JOB_AGE, 'failed');
    console.log('Cleaned failed jobs');
  } catch (error) {
    console.error('Error cleaning queue:', error);
  }
};

// Schedule the cleaning task
setInterval(cleanQueue, CLEAN_INTERVAL);

// Process the jobs in the queue for adding, removing, or updating jobs in Redis
redisJobQueue.process(async (job) => {
  const { type, accountId, jobData, recordId } = job.data;

  switch (type) {
    case 'add':
      return await RedisSingleton.addJob(accountId, jobData);
    
    case 'remove':
      return await RedisSingleton.removeJob(accountId, jobData, recordId);
    
    case 'get':
      return await RedisSingleton.getJobs(accountId);
    
    default:
      throw new Error('Unknown job type');
  }
});

export default redisJobQueue;
