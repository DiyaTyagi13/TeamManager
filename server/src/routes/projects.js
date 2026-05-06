import express from 'express';
import prisma from '../prisma/client.js';
import { authMiddleware } from '../middleware/auth.js';
import { roleMiddleware } from '../middleware/role.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } }
        ]
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: { include: { user: { select: { id: true, name: true } } } },
        _count: { select: { tasks: true } }
      }
    });
    res.json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post(
  '/',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  [body('name').notEmpty().withMessage('Name is required')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { name, description } = req.body;
      const project = await prisma.project.create({
        data: {
          name,
          description,
          ownerId: req.user.id,
          members: {
            create: {
              userId: req.user.id,
              role: 'ADMIN'
            }
          }
        }
      });
      res.status(201).json(project);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: { include: { user: { select: { id: true, name: true, email: true, role: true } } } },
        tasks: {
          include: {
            assignee: { select: { id: true, name: true } },
            creator: { select: { id: true, name: true } }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!project) return res.status(404).json({ error: 'Project not found' });

    const isMember = project.members.some(m => m.userId === req.user.id);
    if (!isMember && project.ownerId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post(
  '/:id/members',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  [body('userId').notEmpty().withMessage('User ID is required')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { id } = req.params;
      const { userId, role } = req.body;

      const project = await prisma.project.findUnique({ where: { id } });
      if (!project) return res.status(404).json({ error: 'Project not found' });
      if (project.ownerId !== req.user.id) return res.status(403).json({ error: 'Only project owner can add members' });

      const newMember = await prisma.projectMember.create({
        data: {
          projectId: id,
          userId,
          role: role || 'MEMBER'
        }
      });
      res.status(201).json(newMember);
    } catch (error) {
      console.error(error);
      if (error.code === 'P2002') return res.status(400).json({ error: 'User is already a member' });
      res.status(500).json({ error: 'Server error' });
    }
  }
);

export default router;
