import Bull from 'bull';
import RedisSingleton from '@/lib/redis/client';

const redisJobQueue = new Bull('redisJobQueue', process.env.NEXT_PUBLIC_REDIS_URL!)
// const redisJobQueue = new Bull('redisJobQueue', {
//   redis: {
//     host: process.env.REDIS_HOST, // Replace with your Redis configuration
//     port: process.env.REDIS_PORT,
//     password: process.env.REDIS_PASSWORD, // Optional
//   },
// });

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
