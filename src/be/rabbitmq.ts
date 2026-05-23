import amqplib from "amqplib";

let connection: Awaited<ReturnType<typeof amqplib.connect>> | null = null;
let channel: Awaited<ReturnType<Awaited<ReturnType<typeof amqplib.connect>>["createChannel"]>> | null = null;

const RABBITMQ_URL = process.env.RABBITMQ_URL ?? "";
if (!RABBITMQ_URL) {
  throw new Error("RABBITMQ_URL is required");
}

export const QUEUES = {
  DONATION_CREATED: "donation.created",
  DONATION_PAID: "donation.paid",
  OVERLAY_NOTIFICATION: "overlay.notification",
};

export async function getChannel() {
  if (channel) return channel;

  connection = await amqplib.connect(RABBITMQ_URL);
  channel = await connection.createChannel();

  // Assert all queues
  for (const queue of Object.values(QUEUES)) {
    await channel.assertQueue(queue, { durable: true });
  }

  connection.on("close", () => {
    connection = null;
    channel = null;
  });

  return channel;
}

export async function publishMessage(queue: string, message: object): Promise<void> {
  const ch = await getChannel();
  ch.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
    persistent: true,
  });
}

export async function consumeMessage(
  queue: string,
  handler: (msg: object) => Promise<void>
): Promise<void> {
  const ch = await getChannel();
  await ch.consume(queue, async (msg) => {
    if (msg) {
      try {
        const data = JSON.parse(msg.content.toString());
        await handler(data);
        ch.ack(msg);
      } catch (err) {
        console.error(`Error processing message from ${queue}:`, err);
        ch.nack(msg, false, true);
      }
    }
  });
}
