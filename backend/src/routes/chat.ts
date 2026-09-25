import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, type AuthedRequest } from '../middleware/auth.js';
import { aiClient, AiServiceError } from '../services/aiClient.js';
import { ApiError } from '../middleware/errorHandler.js';

export const chatRouter = Router();

const chatSchema = z.object({
  message: z.string().min(1).max(4000),
  conversationId: z.string().optional(),
});

chatRouter.post('/', requireAuth, async (req: AuthedRequest, res, next) => {
  const parsed = chatSchema.safeParse(req.body);
  if (!parsed.success) {
    return next(new ApiError(400, parsed.error.issues.map((i) => i.message).join(', ')));
  }

  try {
    const result = await aiClient.chat({
      message: parsed.data.message,
      conversationId: parsed.data.conversationId,
      userId: req.userId ?? 'anonymous',
    });
    res.json(result);
  } catch (err) {
    if (err instanceof AiServiceError) {
      return res.status(503).json({
        error: 'AURA AI reasoning is temporarily unavailable. Your saved tasks and calendar are still accessible.',
      });
    }
    next(err);
  }
});
