const express = require('express');
const router = express.Router();
const prisma = require('../config/db');
const { ensureAuth } = require('../middleware/auth');

router.get('/', ensureAuth, async (req, res) => {
  const teams = await prisma.team.findMany({
    where: { OR: [{ createdBy: req.user.id }, { members: { some: { userId: req.user.id } } }] },
    include: { members: { include: { user: true } } }
  });
  res.json(teams);
});

router.post('/', ensureAuth, async (req, res) => {
  const { name, description } = req.body;
  const team = await prisma.team.create({
    data: { name, description, createdBy: req.user.id, members: { create: { userId: req.user.id } } }
  });
  res.status(201).json(team);
});

router.delete('/:id', ensureAuth, async (req, res) => {
  const team = await prisma.team.findUnique({ where: { id: req.params.id } });
  if (team.createdBy !== req.user.id) return res.status(403).json({ message: 'Only creator can delete' });
  await prisma.team.delete({ where: { id: req.params.id } });
  res.json({ message: 'Team deleted' });
});

router.get('/:id', ensureAuth, async (req, res) => {
  const team = await prisma.team.findUnique({
    where: { id: req.params.id },
    include: { members: { include: { user: true } } }
  });
  if (!team) return res.status(404).json({ message: 'Team not found' });
  res.json(team);
});

router.put('/:id', ensureAuth, async (req, res) => {
  const { name, description } = req.body;
  const team = await prisma.team.findUnique({ where: { id: req.params.id } });
  if (!team) return res.status(404).json({ message: 'Team not found' });
  if (team.createdBy !== req.user.id) return res.status(403).json({ message: 'Only creator can edit' });

  const updatedTeam = await prisma.team.update({
    where: { id: req.params.id },
    data: { name, description }
  });
  res.json(updatedTeam);
});

router.post('/:id/members', ensureAuth, async (req, res) => {
  const { userId } = req.body;
  const teamId = req.params.id;

  const existingMember = await prisma.teamMember.findFirst({
    where: { teamId, userId }
  });

  if (existingMember) {
    return res.status(400).json({ message: 'User is already a member of this team' });
  }

  const member = await prisma.teamMember.create({
    data: { teamId, userId }
  });

  res.status(201).json(member);
});

router.get('/:id/members', ensureAuth, async (req, res) => {
  const members = await prisma.teamMember.findMany({
    where: { teamId: req.params.id },
    include: { user: true }
  });
  res.json(members);
});

router.delete('/:id/members/:userId', ensureAuth, async (req, res) => {
  const team = await prisma.team.findUnique({ where: { id: req.params.id } });
  if (!team) return res.status(404).json({ message: 'Team not found' });
  if (team.createdBy !== req.user.id) return res.status(403).json({ message: 'Only creator can remove members' });

  await prisma.teamMember.deleteMany({
    where: { teamId: req.params.id, userId: req.params.userId }
  });
  res.json({ message: 'Member removed' });
});

module.exports = router;
