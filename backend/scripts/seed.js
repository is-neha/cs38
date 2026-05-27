const mongoose = require('mongoose');
const FAQ = require('../models/FAQ');

const seedData = [
  {
    category: 'Getting Started',
    icon: '🚀',
    questions: [
      { q: 'How do I create an account?', a: "Click the 'Sign Up' button on the top right corner. Fill in your email, create a password, and verify your email address. You'll be up and running in under 2 minutes!" },
      { q: 'Is the platform free to use?', a: 'Yes! We offer a generous free tier with core features. For advanced features like team collaboration, analytics, and priority support, check out our Pro and Enterprise plans.' },
      { q: 'Can I change my username later?', a: 'Absolutely. Go to Settings > Profile and click the edit icon next to your username. Changes are reflected immediately across the platform.' },
    ],
  },
  {
    category: 'Account & Billing',
    icon: '💳',
    questions: [
      { q: 'How do I update my payment method?', a: 'Navigate to Settings > Billing > Payment Methods. You can add, remove, or update cards. We use encrypted tokenization so your card details are never stored on our servers.' },
      { q: 'Can I get a refund?', a: 'We offer a 30-day money-back guarantee for all paid plans. Contact our support team with your account details and reason for cancellation to initiate the refund process.' },
      { q: 'How do I cancel my subscription?', a: "Go to Settings > Billing > Subscription and click 'Cancel'. Your access will continue until the end of the current billing period. No questions asked." },
    ],
  },
  {
    category: 'Features & Usage',
    icon: '⚡',
    questions: [
      { q: 'How do I integrate with third-party tools?', a: 'We support Zapier, Make, and direct API integrations. Go to Settings > Integrations to connect your favorite tools. Detailed docs are available in our Developer Hub.' },
      { q: 'Is there a mobile app?', a: 'Yes! Download our native iOS and Android apps from the App Store and Google Play. They sync seamlessly with your web account for on-the-go access.' },
      { q: 'Can I export my data?', a: 'You can export your data in CSV, JSON, or PDF format. Go to Settings > Data & Privacy > Export Data. We\'ll prepare a download link within minutes.' },
    ],
  },
  {
    category: 'Security & Privacy',
    icon: '🔒',
    questions: [
      { q: 'How is my data protected?', a: 'We use AES-256 encryption at rest and TLS 1.3 in transit. All data is stored in SOC 2 compliant data centers. Regular penetration tests and audits ensure top-tier security.' },
      { q: 'Do you sell my personal data?', a: 'Never. Your data is yours. We never sell, rent, or share personal information with third parties for marketing purposes. Read our Privacy Policy for full transparency.' },
      { q: 'Can I delete my account permanently?', a: 'Yes. Go to Settings > Data & Privacy > Delete Account. After confirmation, all your data is permanently erased within 48 hours. This action is irreversible.' },
    ],
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/faq-app');
    await FAQ.deleteMany({});
    await FAQ.insertMany(seedData);
    console.log('Database seeded successfully');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
