import express from 'express';
import prisma from '../prisma/client.js';
import { authMiddleware } from '../middleware/auth.js';
import { roleMiddleware } from '../middleware/role.js';
import { body, validationResult } from 'express-validator';

const router = express.Router({ mergeParams: true });

router.get('/project/:projectId', authMiddleware, async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const member = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: req.user.id } }
    });
    if (!member) return res.status(403).json({ error: 'Forbidden' });

    const tasks = await prisma.task.findMany({
      where: { projectId },
      include: {
        assignee: { select: { id: true, name: true } },
        creator: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const now = new Date();
    const updatedTasks = tasks.map(task => {
      if (task.dueDate && new Date(task.dueDate) < now && task.status !== 'DONE' && task.status !== 'OVERDUE') {
        task.status = 'OVERDUE';
      }
      return task;
    });

    res.json(updatedTasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post(
  '/',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('projectId').notEmpty().withMessage('Project ID is required')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { title, description, priority, dueDate, projectId, assigneeId } = req.body;

      const project = await prisma.project.findUnique({ where: { id: projectId } });
      if (!project) return res.status(404).json({ error: 'Project not found' });
      if (project.ownerId !== req.user.id) return res.status(403).json({ error: 'Only project owner can create tasks' });

      const task = await prisma.task.create({
        data: {
          title,
          description,
          priority: priority || 'MEDIUM',
          dueDate: dueDate ? new Date(dueDate) : null,
          projectId,
          assigneeId,
          creatorId: req.user.id,
          status: 'TODO'
        },
        include: {
          assignee: { select: { id: true, name: true } }
        }
      });
      res.status(201).json(task);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

router.patch(
  '/:id/status',
  authMiddleware,
  [body('status').isIn(['TODO', 'IN_PROGRESS', 'DONE', 'OVERDUE']).withMessage('Invalid status')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { id } = req.params;
      const { status } = req.body;

      const task = await prisma.task.findUnique({ where: { id } });
      if (!task) return res.status(404).json({ error: 'Task not found' });

      if (task.assigneeId !== req.user.id && req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const updatedTask = await prisma.task.update({
        where: { id },
        data: { status }
      });
      res.json(updatedTask);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

router.delete('/:id', authMiddleware, roleMiddleware(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    
    const task = await prisma.task.findUnique({ where: { id }, include: { project: true } });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    if (task.project.ownerId !== req.user.id) return res.status(403).json({ error: 'Only project owner can delete tasks' });

    await prisma.task.delete({ where: { id } });
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
