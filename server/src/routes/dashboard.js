import express from 'express';
import prisma from '../prisma/client.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const myTasks = await prisma.task.findMany({
      where: { assigneeId: userId },
      include: {
        project: { select: { name: true } }
      },
      orderBy: { dueDate: 'asc' }
    });

    const stats = {
      total: myTasks.length,
      done: myTasks.filter(t => t.status === 'DONE').length,
      inProgress: myTasks.filter(t => t.status === 'IN_PROGRESS').length,
      todo: myTasks.filter(t => t.status === 'TODO').length,
      overdue: myTasks.filter(t => t.status === 'OVERDUE' || (t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'DONE')).length
    };

    res.json({ stats, myTasks: myTasks.slice(0, 5) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
