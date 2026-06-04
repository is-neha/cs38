const express = require('express');
const mongoose = require('mongoose');
const Groq = require('groq-sdk');
const OAQ = require('../models/OAQ');
const FAQ = require('../models/FAQ');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { auth } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

const router = express.Router();
const groqApiKey = process.env.GROQ_API_KEY;

async function awardPoints(userId, points) {
  if (!userId) return;
  try {
    await User.findByIdAndUpdate(userId, { $inc: { points } });
  } catch {
    // Ignore points update failures so they don't crash request handlers
  }
}

/* ── AI importance scorer ── */
async function scoreImportance(questionText) {
  if (!groqApiKey || !questionText) return 50;
  try {
    const groq = new Groq({ apiKey: groqApiKey });
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are a scoring engine. Rate this question 0-100 based on: specificity (is it detailed?), effort (does it show research?), usefulness (would it help many people?), and clarity (is it well-formed?). Low-effort/gibberish = 0-20. Simple factual lookups = 21-40. Moderate well-formed = 41-60. Specific/detailed = 61-80. Highly valuable/insightful = 81-100. Return ONLY a single integer.' },
        { role: 'user', content: questionText },
      ],
      temperature: 0.1,
      max_tokens: 10,
    });
    const raw = completion.choices?.[0]?.message?.content?.trim();
    const match = raw?.match(/\d+/);
    const score = match ? parseInt(match[0], 10) : NaN;
    return isNaN(score) ? 50 : Math.max(0, Math.min(100, score));
  } catch {
    return 50;
  }
}

/* ── List OAQs ── */
router.get('/', async (req, res) => {
  try {
    const { status, hasAnswers } = req.query;
    const filter = {};
    if (status && ['open', 'approved', 'promoted', 'rejected'].includes(status)) {
      filter.status = status;
    } else if (!status) {
      filter.status = { $ne: 'rejected' };
    }
    if (hasAnswers === 'false') {
      filter['answers.0'] = { $exists: false };
    }
    if (hasAnswers === 'true') {
      filter['answers.0'] = { $exists: true };
    }
    let oaqs = await OAQ.find(filter)
      .populate('submittedBy', 'name')
      .populate('answers.submittedBy', 'name');

    const now = new Date();
    const twentyFourH = 24 * 60 * 60 * 1000;

    oaqs = oaqs.map(o => {
      const isUnanswered = o.status === 'open' && (!o.answers || o.answers.length === 0);
      const isStale = isUnanswered && (now - new Date(o.createdAt)) > twentyFourH;
      return { ...o.toJSON(), isStale };
    });

    oaqs.sort((a, b) =>
      ((b.importanceScore ?? 0) - (a.importanceScore ?? 0)) ||
      (new Date(b.createdAt) - new Date(a.createdAt))
    );

    res.json(oaqs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── Increment OAQ view ── */
router.post('/:id/view', async (req, res) => {
  try {
    const userId = req.user?._id || req.body.userId;
    if (userId && !mongoose.Types.ObjectId.isValid(userId)) {
      return res.json({ views: 0 });
    }
    let views;
    if (userId) {
      const oaq = await OAQ.findById(req.params.id);
      if (oaq) {
        oaq.viewedBy = oaq.viewedBy || [];
        if (!oaq.viewedBy.some(id => id.toString() === userId)) {
          oaq.viewedBy.push(userId);
          if (oaq.viewedBy.length > 100) oaq.viewedBy.shift();
          oaq.views = (oaq.views || 0) + 1;
          await oaq.save();
        }
        views = oaq.views || 0;
      }
    } else {
      const updated = await OAQ.findByIdAndUpdate(
        req.params.id,
        { $inc: { views: 1 } },
        { returnDocument: 'after', projection: { views: 1 } },
      );
      views = updated?.views || 0;
    }
    res.json({ views });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── Get single OAQ ── */
router.get('/:id', async (req, res) => {
  try {
    const oaq = await OAQ.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { returnDocument: 'after' },
    )
      .populate('submittedBy', 'name')
      .populate('answers.submittedBy', 'name');
    if (!oaq) return res.status(404).json({ error: 'Not found' });
    res.json(oaq);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── Submit OAQ (with AI duplicate check against ALL existing questions) ── */
router.post('/', auth, async (req, res) => {
  try {
    const { question, description, category } = req.body;
    if (!question || !question.trim()) {
      return res.status(400).json({ error: 'Question is required' });
    }

    /* Fetch all FAQ + OAQ questions for AI comparison */
    const [allFaqs, allOaqs] = await Promise.all([
      FAQ.find().lean(),
      OAQ.find({ status: { $ne: 'rejected' } }).select('question _id').lean(),
    ]);

    const existingQuestions = [
      ...allFaqs.flatMap(c =>
        (c.questions || []).map(q => ({
          text: q.q,
          source: 'FAQ',
          category: c.category,
          catId: c._id,
        }))
      ),
      ...allOaqs.map(o => ({
        text: o.question,
        source: 'OAQ',
        id: o._id,
      })),
    ];

    if (groqApiKey && existingQuestions.length > 0) {
      const groq = new Groq({ apiKey: groqApiKey });

      const existingFormatted = existingQuestions
        .map((item, i) => `[${i}] ${item.text}`)
        .join('\n');

      const prompt = `You are a duplicate question detector. Below is a list of existing questions. Determine if any of them ask the same thing as the new question.

Rules:
- Two questions are duplicates if a user asking one would be fully satisfied by the answer to the other.
- If the new question is a subset of an existing question (asks about one part), it IS a duplicate.
- Ignore typos, extra/missing words, and grammatical differences.
- Treat paraphrases as duplicates.
- If none match, return isDuplicate: false.
- If one matches, return its index from the list.

Existing questions:
${existingFormatted}

New question: "${question.trim()}"

Reply with ONLY a JSON object:
{
  "isDuplicate": true/false,
  "matchIndex": null or number,
  "reason": "brief explanation"
}`;

      const completion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.1,
        response_format: { type: 'json_object' },
      });
      const result = JSON.parse(completion.choices[0]?.message?.content || '{}');
      if (result.isDuplicate && result.matchIndex !== null && result.matchIndex !== undefined) {
        const dup = existingQuestions[result.matchIndex];
        if (!dup) {
          /* fall through if index is out of bounds */
        } else {
          const topDupes = [dup];
          /* Notify original asker if duplicate is an OAQ */
          if (dup.source === 'OAQ' && dup.id) {
            const originalOaq = await OAQ.findById(dup.id).populate('submittedBy', 'name');
            if (originalOaq && originalOaq.submittedBy &&
                originalOaq.submittedBy._id.toString() !== req.user._id.toString()) {
              await Notification.create({
                user: originalOaq.submittedBy._id,
                type: 'related',
                message: `${req.user.name} asked a similar question: "${question.trim().slice(0, 60)}${question.trim().length > 60 ? '…' : ''}"`,
                link: '/community',
              });
            }
          }
          return res.status(409).json({ duplicates: topDupes, aiReason: result.reason || '' });
        }
      }
    }

    const oaq = await OAQ.create({
      question: question.trim(),
      description: description?.trim() || '',
      category: category?.trim() || '',
      submittedBy: req.user._id,
    });
    /* Score importance via AI (non-blocking) */
    scoreImportance(question.trim()).then(score => {
      OAQ.findByIdAndUpdate(oaq._id, { importanceScore: score }).catch(() => {});
    });
    await oaq.populate('submittedBy', 'name');
    awardPoints(req.user._id, 5);

    /* ── Similarity-frequency auto-promote ── */
    const q = question.toLowerCase().trim();
    const words = q.split(/\s+/).filter(w => w.length > 2);
    const similarOpen = await OAQ.find({
      _id: { $ne: oaq._id },
      question: { $regex: new RegExp(words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'i') },
      status: { $in: ['open', 'approved'] },
      answers: { $exists: true, $not: { $size: 0 } },
    }).lean({ virtuals: true });

    let scored = similarOpen
      .map(o => ({
        ...o,
        _score: score(o.question),
      }))
      .filter(o => o._score > 0.4)
      .sort((a, b) => b._score - a._score);

    if (scored.length >= 1 && groqApiKey) {
      /* Validate similarity with Groq AI before promoting */
      const groq = new Groq({ apiKey: groqApiKey });
      for (const candidate of scored) {
        const completion = await groq.chat.completions.create({
          messages: [{
            role: 'user',
            content: `Are these two questions asking about the same topic? Consider them the same if one asks what the other asks, even with different wording or minor typos.
Question 1: "${candidate.question}"
Question 2: "${question.trim()}"
Reply ONLY with JSON: { "sameTopic": true/false }`,
          }],
          model: 'llama-3.3-70b-versatile',
          temperature: 0.1,
          response_format: { type: 'json_object' },
        });
        const result = JSON.parse(completion.choices[0]?.message?.content || '{}');
        if (result.sameTopic) {
          scored = [candidate];
          break;
        }
      }
      if (scored.length > 1) scored = [];
    }

    if (scored.length >= 1) {
      const best = scored[0];
      const bestAnswer = best.answers.find(a => a.accepted) ||
        [...best.answers].sort((a, b) => ((b.votedUpBy?.length || 0) - (b.votedDownBy?.length || 0)) - ((a.votedUpBy?.length || 0) - (a.votedDownBy?.length || 0)))[0];
      if (bestAnswer) {
        const catName = best.category || 'Community Questions';
        let targetCat = await FAQ.findOne({ category: catName });
        if (!targetCat) {
          targetCat = await FAQ.create({ category: catName, icon: '🌐', questions: [] });
        }
        targetCat.questions.push({ q: best.question, a: bestAnswer.text, source: 'community', resolved: true });
        await targetCat.save();

        await OAQ.findByIdAndUpdate(best._id, { status: 'promoted', $inc: { promotedCount: 1 } });
        if (best.submittedBy) awardPoints(best.submittedBy, 50);

        if (best.submittedBy) {
          await Notification.create({
            user: best.submittedBy,
            type: 'promoted',
            message: `Your question was promoted to FAQ (similar questions trend): "${best.question.slice(0, 60)}${best.question.length > 60 ? '…' : ''}"`,
            link: '/faq',
          });
        }

        await Notification.create({
          user: oaq.submittedBy._id,
          type: 'related',
          message: `A similar question was promoted to FAQ: "${best.question.slice(0, 60)}${best.question.length > 60 ? '…' : ''}"`,
          link: '/faq',
        });
      }
    }

    res.status(201).json(oaq);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── Submit answer ── */
router.post('/:id/answers', auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ error: 'Answer text is required' });

    const oaq = await OAQ.findById(req.params.id);
    if (!oaq) return res.status(404).json({ error: 'OAQ not found' });
    if (oaq.status === 'promoted' || oaq.status === 'rejected') {
      return res.status(400).json({ error: 'Cannot answer a promoted or rejected question' });
    }
    if (oaq.status === 'approved' && req.user.role !== 'admin') {
      return res.status(400).json({ error: 'This question is closed for new answers' });
    }
    if (oaq.submittedBy.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: 'You cannot answer your own question' });
    }

    oaq.answers.push({ text: text.trim(), submittedBy: req.user._id, answeredByAdmin: req.user.role === 'admin' });
    await oaq.save();
    awardPoints(req.user._id, 10);

    if (oaq.submittedBy.toString() !== req.user._id.toString()) {
      await Notification.create({
        user: oaq.submittedBy,
        type: 'answer',
        message: `${req.user.name} answered your question: "${oaq.question.slice(0, 60)}${oaq.question.length > 60 ? '…' : ''}"`,
        link: '/community',
      });
    }

    /* Notify other answerers about the follow-up */
    const answererIds = [...new Set(
      oaq.answers
        .filter(a => a.submittedBy.toString() !== req.user._id.toString())
        .map(a => a.submittedBy.toString())
    )];
    for (const answererId of answererIds) {
      if (answererId !== oaq.submittedBy.toString()) {
        await Notification.create({
          user: answererId,
          type: 'follow_up',
          message: `${req.user.name} added a follow-up answer to "${oaq.question.slice(0, 60)}${oaq.question.length > 60 ? '…' : ''}"`,
          link: '/community',
        });
      }
    }

    const updated = await OAQ.findById(oaq._id)
      .populate('submittedBy', 'name')
      .populate('answers.submittedBy', 'name');

    res.status(201).json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── Vote on OAQ ── */
router.post('/:id/vote', auth, async (req, res) => {
  try {
    const { value } = req.body;
    if (![1, -1].includes(value)) return res.status(400).json({ error: 'Value must be 1 or -1' });

    const userId = req.user._id;
    const oaq = await OAQ.findById(req.params.id);
    if (!oaq) return res.status(404).json({ error: 'Not found' });

    const alreadyUp = oaq.votedUpBy.some(id => id.equals(userId));
    const alreadyDown = oaq.votedDownBy.some(id => id.equals(userId));

    if (value === 1) {
      if (alreadyUp) {
        oaq.votedUpBy.pull(userId);
      } else {
        if (alreadyDown) oaq.votedDownBy.pull(userId);
        oaq.votedUpBy.push(userId);
      }
    } else {
      if (alreadyDown) {
        oaq.votedDownBy.pull(userId);
      } else {
        if (alreadyUp) oaq.votedUpBy.pull(userId);
        oaq.votedDownBy.push(userId);
      }
    }

    await oaq.save();

    const wasUpvoted = value === 1 && !alreadyUp;
    const wasDownvoted = value === -1 && !alreadyDown;
    if (wasUpvoted && oaq.submittedBy.toString() !== userId.toString()) {
      awardPoints(oaq.submittedBy, 3);
    }
    if (wasDownvoted && oaq.submittedBy.toString() !== userId.toString()) {
      awardPoints(oaq.submittedBy, -2);
    }

    /* ── Auto-promote ── */
    const netVotes = (oaq.votedUpBy || []).length - (oaq.votedDownBy || []).length;
    if (netVotes >= 10 && oaq.status === 'approved') {
      const bestAnswer = oaq.answers.find(a => a.accepted) ||
        [...oaq.answers].sort((a, b) => ((b.votedUpBy?.length || 0) - (b.votedDownBy?.length || 0)) - ((a.votedUpBy?.length || 0) - (a.votedDownBy?.length || 0)))[0];
      const answerText = bestAnswer ? bestAnswer.text : oaq.question;

      const catName = oaq.category || 'Community Questions';
      let targetCat = await FAQ.findOne({ category: catName });
      if (!targetCat) {
        targetCat = await FAQ.create({ category: catName, icon: '🌐', questions: [] });
      }
      targetCat.questions.push({ q: oaq.question, a: answerText, source: 'community', resolved: true });
      await targetCat.save();

      oaq.status = 'promoted';
      oaq.promotedCount = (oaq.promotedCount || 0) + 1;
      await oaq.save();
      awardPoints(oaq.submittedBy, 50);

      await Notification.create({
        user: oaq.submittedBy,
        type: 'promoted',
        message: `Your question was auto-promoted to FAQ: "${oaq.question.slice(0, 60)}${oaq.question.length > 60 ? '…' : ''}"`,
        link: '/faq',
      });
    }

    const updated = await OAQ.findById(oaq._id)
      .populate('submittedBy', 'name')
      .populate('answers.submittedBy', 'name');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── Vote on Answer ── */
router.post('/:id/answers/:answerId/vote', auth, async (req, res) => {
  try {
    const { value } = req.body;
    if (![1, -1].includes(value)) return res.status(400).json({ error: 'Value must be 1 or -1' });

    const userId = req.user._id;
    const oaq = await OAQ.findById(req.params.id);
    if (!oaq) return res.status(404).json({ error: 'Not found' });

    const answer = oaq.answers.id(req.params.answerId);
    if (!answer) return res.status(404).json({ error: 'Answer not found' });

    const alreadyUp = answer.votedUpBy.some(id => id.equals(userId));
    const alreadyDown = answer.votedDownBy.some(id => id.equals(userId));

    if (value === 1) {
      if (alreadyUp) {
        answer.votedUpBy.pull(userId);
      } else {
        if (alreadyDown) answer.votedDownBy.pull(userId);
        answer.votedUpBy.push(userId);
      }
    } else {
      if (alreadyDown) {
        answer.votedDownBy.pull(userId);
      } else {
        if (alreadyUp) answer.votedUpBy.pull(userId);
        answer.votedDownBy.push(userId);
      }
    }

    await oaq.save();

    const answerUpvoted = value === 1 && !alreadyUp;
    const answerDownvoted = value === -1 && !alreadyDown;
    if (answerUpvoted && answer.submittedBy && answer.submittedBy.toString() !== userId.toString()) {
      awardPoints(answer.submittedBy, 3);
    }
    if (answerDownvoted && answer.submittedBy && answer.submittedBy.toString() !== userId.toString()) {
      awardPoints(answer.submittedBy, -2);
    }

    const updated = await OAQ.findById(oaq._id)
      .populate('submittedBy', 'name')
      .populate('answers.submittedBy', 'name');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── Admin: approve ── */
router.put('/:id/approve', auth, admin, async (req, res) => {
  try {
    const oaq = await OAQ.findByIdAndUpdate(req.params.id, { status: 'approved' }, { returnDocument: 'after' })
      .populate('submittedBy', 'name')
      .populate('answers.submittedBy', 'name');
    if (!oaq) return res.status(404).json({ error: 'Not found' });

    await Notification.create({
      user: oaq.submittedBy._id,
      type: 'approved',
      message: `Your question was approved: "${oaq.question.slice(0, 60)}${oaq.question.length > 60 ? '…' : ''}"`,
      link: '/community',
    });

    res.json(oaq);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── Admin: reject ── */
router.put('/:id/reject', auth, admin, async (req, res) => {
  try {
    const oaq = await OAQ.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { returnDocument: 'after' })
      .populate('submittedBy', 'name')
      .populate('answers.submittedBy', 'name');
    if (!oaq) return res.status(404).json({ error: 'Not found' });

    await Notification.create({
      user: oaq.submittedBy._id,
      type: 'system',
      message: `Your question was rejected: "${oaq.question.slice(0, 60)}${oaq.question.length > 60 ? '…' : ''}"`,
      link: '/community',
    });

    res.json(oaq);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── Admin: promote to FAQ ── */
router.put('/:id/promote', auth, admin, async (req, res) => {
  try {
    const oaq = await OAQ.findById(req.params.id).populate('submittedBy', 'name');
    if (!oaq) return res.status(404).json({ error: 'Not found' });

    const acceptedAnswer = oaq.answers.find(a => a.accepted);
    const bestAnswer = acceptedAnswer || oaq.answers.sort((a, b) => (b.votedUpBy.length - b.votedDownBy.length) - (a.votedUpBy.length - a.votedDownBy.length))[0];
    if (bestAnswer) bestAnswer.verifiedByAdmin = true;
    const answerText = bestAnswer ? bestAnswer.text : oaq.question;

    const catName = oaq.category || 'Community Questions';
    let targetCat = await FAQ.findOne({ category: catName });
    if (!targetCat) {
      targetCat = await FAQ.create({ category: catName, icon: '🌐', questions: [] });
    }

    targetCat.questions.push({
      q: oaq.question,
      a: answerText,
      source: 'community',
      resolved: true,
    });
    await targetCat.save();

    oaq.status = 'promoted';
    oaq.promotedCount = (oaq.promotedCount || 0) + 1;
    await oaq.save();
    awardPoints(oaq.submittedBy._id, 50);

    await Notification.create({
      user: oaq.submittedBy._id,
      type: 'promoted',
      message: `Your question was promoted to FAQ: "${oaq.question.slice(0, 60)}${oaq.question.length > 60 ? '…' : ''}"`,
      link: '/faq',
    });

    res.json({ message: 'Promoted to FAQ', oaq });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── Admin: edit answer ── */
router.put('/:id/answers/:answerId', auth, admin, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ error: 'Text is required' });

    const oaq = await OAQ.findOneAndUpdate(
      { _id: req.params.id, 'answers._id': req.params.answerId },
      { $set: { 'answers.$.text': text.trim() } },
      { returnDocument: 'after' },
    )
      .populate('submittedBy', 'name')
      .populate('answers.submittedBy', 'name');
    if (!oaq) return res.status(404).json({ error: 'Not found' });
    res.json(oaq);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── Admin: accept answer ── */
router.put('/:id/answers/:answerId/accept', auth, admin, async (req, res) => {
  try {
    const oaq = await OAQ.findById(req.params.id);
    if (!oaq) return res.status(404).json({ error: 'Not found' });

    const hasAdminAnswer = oaq.answers.some(a => a.answeredByAdmin);
    if (hasAdminAnswer) return res.status(400).json({ error: 'Cannot accept answers after admin has answered' });

    const answer = oaq.answers.id(req.params.answerId);
    if (!answer) return res.status(404).json({ error: 'Answer not found' });

    answer.accepted = !answer.accepted;
    await oaq.save();

    if (answer.accepted && answer.submittedBy) {
      awardPoints(answer.submittedBy, 25);
      await Notification.create({
        user: answer.submittedBy,
        type: 'accepted',
        message: `Your answer was accepted on: "${oaq.question.slice(0, 60)}${oaq.question.length > 60 ? '…' : ''}"`,
        link: '/community',
      });
    }

    const updated = await OAQ.findById(oaq._id)
      .populate('submittedBy', 'name')
      .populate('answers.submittedBy', 'name');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
