import { redis } from './redis';
import { ChannelMessage } from './channels/types';

export async function enqueueForDebounce(msg: ChannelMessage, flushCallback: (msgs: ChannelMessage[]) => Promise<void>): Promise<void> {
  const key = `debounce:${msg.channel}:${msg.contactId}`;
  const lockKey = `${key}:lock`;
  const windowMs = Number(process.env.DEBOUNCE_WINDOW_MS || 5000);
  const maxBuf = Number(process.env.DEBOUNCE_MAX_BUFFER || 20);

  try {
    // 1. Add message to buffer and trim to max size
    await redis.multi()
      .rpush(key, JSON.stringify(msg))
      .ltrim(key, -maxBuf, -1)
      .pexpire(key, windowMs * 4)
      .exec();

    // 2. Sliding window lock: only the last message triggers the flush
    const token = crypto.randomUUID();
    await redis.set(lockKey, token, 'PX', windowMs);

    // 3. Schedule the flush
    setTimeout(async () => {
      const currentToken = await redis.get(lockKey);
      if (currentToken !== token) return; // Another message arrived, this flush is superseded

      await redis.del(lockKey);
      const buffered = await redis.lrange(key, 0, -1);
      await redis.del(key);

      if (buffered.length === 0) return;

      const messages = buffered.map(s => JSON.parse(s) as ChannelMessage);
      await flushCallback(messages);
    }, windowMs + 50);
  } catch (err) {
    console.error('Debounce error:', err);
    // Fallback: flush immediately if Redis fails
    await flushCallback([msg]);
  }
}
