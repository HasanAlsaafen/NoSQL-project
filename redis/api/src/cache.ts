import { createClient } from 'redis'
import type { Request, Response, NextFunction } from 'express'

// create client (do not auto-connect here; caller should connect)
export const client = process.env.REDIS_URL ? createClient({ url: process.env.REDIS_URL }) : createClient()

client.on('error', (err) => {
  console.error('Redis client error:', err)
})

// Simple cache-aside helper
export async function cacheGetOrDb<T>(key: string, ttlSec: number, dbFn: () => Promise<T | null>): Promise<T | null> {
  try {
    if (!client.isOpen) {
      // Redis not connected: fallback to DB
      return await dbFn()
    }

    const raw = await client.get(key)
    if (raw) return JSON.parse(raw) as T

    // Attempt to get a lightweight lock to avoid stampede
    const lockKey = `${key}:lock`
    const lock = await client.set(lockKey, '1', { NX: true, PX: 3000 })
    if (!lock) {
      // Someone else is populating; wait a short time and retry
      await new Promise((r) => setTimeout(r, 50))
      const retry = await client.get(key)
      if (retry) return JSON.parse(retry) as T
    }

    try {
      const data = await dbFn()
      if (data != null) {
        await client.set(key, JSON.stringify(data), { EX: ttlSec })
      } else {
        // Negative cache to avoid repeated DB hits
        await client.set(key, JSON.stringify(null), { EX: Math.min(60, ttlSec) })
      }
      return data
    } finally {
      await client.del(lockKey)
    }
  } catch (err) {
    // On any Redis error, fallback to DB
    try {
      return await dbFn()
    } catch (dbErr) {
      throw dbErr
    }
  }
}

// Simple invalidate helper
export async function invalidateKey(key: string): Promise<void> {
  try {
    if (!client.isOpen) return
    await client.del(key)
  } catch (err) {
    // ignore invalidation errors (log)
    console.error('Failed to invalidate cache key', key, err)
  }
}

// Wrap a write handler so that after successful completion the cache key is invalidated.
// handler should be an async function that performs DB write and sends the response.
export function wrapWithInvalidation(
  handler: (req: Request, res: Response, next?: NextFunction) => Promise<any>,
  keyResolver: (req: Request, res: Response) => string
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await handler(req, res, next)
      // If handler succeeded, try invalidation (best-effort)
      const key = keyResolver(req, res)
      await invalidateKey(key)
    } catch (err) {
      next(err)
    }
  }
}
