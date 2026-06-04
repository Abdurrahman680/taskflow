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

  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) return res.status(404).json({ message: 'Team not found' });
  if (team.createdBy !== req.user.id) {
    return res.status(403).json({ message: 'Only the team creator can add members' });
  }

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

router.post('/:id/invite', ensureAuth, async (req, res) => {
  const { email } = req.body;
  const teamId = req.params.id;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) return res.status(404).json({ message: 'Team not found' });
  if (team.createdBy !== req.user.id) {
    return res.status(403).json({ message: 'Only the team creator can invite members' });
  }

  // Find user by email
  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    // Check if user is already a member
    const existingMember = await prisma.teamMember.findFirst({
      where: { teamId, userId: user.id }
    });

    if (existingMember) {
      return res.status(400).json({ message: 'User is already a member of this team' });
    }

    // Add them to the team and simulate email
    await prisma.teamMember.create({
      data: { teamId, userId: user.id }
    });

    console.log(`\n========================================`);
    console.log(`[SMTP STUB] Sending team invitation email:`);
    console.log(`To: ${email}`);
    console.log(`Subject: You have been added to team "${team.name}"`);
    console.log(`Message: Hi ${user.name || 'there'}, you have been added to the team "${team.name}" on TaskFlow by ${req.user.name}.`);
    console.log(`========================================\n`);

    return res.status(200).json({ 
      message: `User ${email} was found and successfully added to the team. Simulated invitation email sent!` 
    });
  } else {
    // User does not exist, simulate registration invite
    console.log(`\n========================================`);
    console.log(`[SMTP STUB] Sending external team invitation email:`);
    console.log(`To: ${email}`);
    console.log(`Subject: Invite to join team "${team.name}" on TaskFlow`);
    console.log(`Message: You have been invited to join the team "${team.name}" on TaskFlow by ${req.user.name}. Click here to register: http://localhost:5173/register?inviteTeam=${teamId}`);
    console.log(`========================================\n`);

    return res.status(200).json({ 
      message: `Invitation email simulated and sent to non-registered user ${email}. They will need to register first.` 
    });
  }
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
