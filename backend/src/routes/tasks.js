const express = require('express');
const router = express.Router();
const prisma = require('../config/db');
const { ensureAuth } = require('../middleware/auth');

router.get('/', ensureAuth, async (req, res) => {
  const { teamId, assignedTo, status, search } = req.query;
  
  let where = {};

  if (teamId) {
    const isMember = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId: req.user.id
        }
      }
    });

    const team = await prisma.team.findUnique({ where: { id: teamId } });

    if (!isMember && team?.createdBy !== req.user.id) {
      return res.status(403).json({ error: 'Access denied: not a member of this team' });
    }
    
    where.teamId = teamId;
  } else {
    const userTeams = await prisma.teamMember.findMany({
      where: { userId: req.user.id },
      select: { teamId: true }
    });
    
    const teamIds = userTeams.map(t => t.teamId);
    
    const createdTeams = await prisma.team.findMany({
      where: { createdBy: req.user.id },
      select: { id: true }
    });
    
    const allMyTeamIds = [...new Set([...teamIds, ...createdTeams.map(t => t.id)])];
    
    where.teamId = { in: allMyTeamIds };
  }

  if (assignedTo) where.assignedTo = assignedTo;
  if (status) where.status = status;
  if (search) {
    where.title = { contains: search, mode: 'insensitive' };
  }

  const tasks = await prisma.task.findMany({ where, include: { assignee: true, team: true } });
  res.json(tasks);
});

router.post('/', ensureAuth, async (req, res) => {
  const { title, description, teamId, assignedTo, priority, dueDate, status } = req.body;
  const task = await prisma.task.create({
    data: { 
      title, 
      description, 
      teamId, 
      assignedTo: assignedTo || null, 
      priority, 
      status: status || "Pending", 
      dueDate: dueDate ? new Date(dueDate) : null, 
      createdBy: req.user.id 
    }
  });
  res.status(201).json(task);
});

router.get('/:id', ensureAuth, async (req, res) => {
  const task = await prisma.task.findUnique({
    where: { id: req.params.id },
    include: { assignee: true, team: true, creator: true }
  });
  if (!task) return res.status(404).json({ message: 'Task not found' });
  res.json(task);
});

router.put('/:id', ensureAuth, async (req, res) => {
  const { status, title, description, priority, assignedTo } = req.body;
  
  const existingTask = await prisma.task.findUnique({
    where: { id: req.params.id }
  });

  if (!existingTask) return res.status(404).json({ message: 'Task not found' });

  // Only the creator or the assigned user can edit the task
  if (existingTask.createdBy !== req.user.id && existingTask.assignedTo !== req.user.id) {
    return res.status(403).json({ message: 'Only the assigned user or creator can edit this task' });
  }

  const task = await prisma.task.update({
    where: { id: req.params.id },
    data: { status, title, description, priority, assignedTo: assignedTo || null }
  });
  res.json(task);
});

router.delete('/:id', ensureAuth, async (req, res) => {
  const existingTask = await prisma.task.findUnique({
    where: { id: req.params.id }
  });

  if (!existingTask) return res.status(404).json({ message: 'Task not found' });

  // Only the creator can delete the task
  if (existingTask.createdBy !== req.user.id) {
    return res.status(403).json({ message: 'Only the task creator can delete this task' });
  }

  await prisma.task.delete({ where: { id: req.params.id } });
  res.json({ message: 'Task deleted' });
});

module.exports = router;
