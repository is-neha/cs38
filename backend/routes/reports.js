const express = require('express');
const Report = require('../models/Report');
const OAQ = require('../models/OAQ');
const { auth } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

const router = express.Router();

/* ── Submit a report ── */
router.post('/', auth, async (req, res) => {
  try {
    const { targetType, targetId, oaqId, reason } = req.body;
    if (!targetType || !targetId || !oaqId || !reason || !reason.trim()) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (!['question', 'answer'].includes(targetType)) {
      return res.status(400).json({ error: 'Invalid target type' });
    }

    const oaq = await OAQ.findById(oaqId);
    if (!oaq) return res.status(404).json({ error: 'OAQ not found' });

    if (targetType === 'answer') {
      const answer = oaq.answers.id(targetId);
      if (!answer) return res.status(404).json({ error: 'Answer not found' });
    }

    const alreadyReported = await Report.findOne({
      reportedBy: req.user._id,
      targetType,
      targetId,
      status: 'pending',
    });
    if (alreadyReported) {
      return res.status(400).json({ error: 'You already reported this' });
    }

    const report = await Report.create({
      reportedBy: req.user._id,
      targetType,
      targetId,
      oaqId,
      reason: reason.trim(),
    });

    res.status(201).json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── Admin: list reports ── */
router.get('/', auth, admin, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const reports = await Report.find(filter)
      .populate('reportedBy', 'name email')
      .populate('resolvedBy', 'name')
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── Admin: resolve / dismiss ── */
router.put('/:id/resolve', auth, admin, async (req, res) => {
  try {
    const { action } = req.body;
    if (!['resolved', 'dismissed'].includes(action)) {
      return res.status(400).json({ error: 'Action must be resolved or dismissed' });
    }
    const report = await Report.findByIdAndUpdate(req.params.id, {
      status: action,
      resolvedBy: req.user._id,
      resolvedAt: new Date(),
    }, { new: true })
      .populate('reportedBy', 'name email')
      .populate('resolvedBy', 'name');
    if (!report) return res.status(404).json({ error: 'Report not found' });
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── Admin: delete reported content (question or answer) ── */
router.delete('/:id/content', auth, admin, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ error: 'Report not found' });

    const oaq = await OAQ.findById(report.oaqId);
    if (!oaq) return res.status(404).json({ error: 'OAQ not found' });

    if (report.targetType === 'question') {
      await OAQ.findByIdAndDelete(report.oaqId);
    } else {
      oaq.answers.pull(report.targetId);
      await oaq.save();
    }

    report.status = 'resolved';
    report.resolvedBy = req.user._id;
    report.resolvedAt = new Date();
    await report.save();

    res.json({ message: 'Content removed and report resolved' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
