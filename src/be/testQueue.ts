import { getRedisClient } from "@/be/redis";

export interface TestNotification {
  id: string;
  donor_name: string;
  amount: number;
  message: string;
  paid_at: string;
  isTest: boolean;
}

const TEST_QUEUE_TTL_SECONDS = 60 * 60;

function testQueueKey(userId: string) {
  return `overlay:test:${userId}`;
}

export async function addTestNotification(userId: string, notification: TestNotification) {
  const redis = await getRedisClient();
  const key = testQueueKey(userId);
  await redis.rPush(key, JSON.stringify(notification));
  await redis.expire(key, TEST_QUEUE_TTL_SECONDS);
}

export async function getTestNotifications(userId: string): Promise<TestNotification[]> {
  const redis = await getRedisClient();
  const key = testQueueKey(userId);
  const notifications: TestNotification[] = [];

  while (true) {
    const raw = await redis.lPop(key);
    if (!raw) break;

    try {
      notifications.push(JSON.parse(raw) as TestNotification);
    } catch (error) {
      console.warn("[test-queue] invalid notification skipped", error);
    }
  }

  return notifications;
}
