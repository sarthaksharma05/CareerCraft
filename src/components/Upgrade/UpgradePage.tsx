import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Crown, Zap, Star } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export function UpgradePage() {
  const [isAnnual, setIsAnnual] = useState(false);
  const navigate = useNavigate();

  const plans = [
    {
      name: 'Starter',
      description: 'Perfect for new creators getting started',
      price: { monthly: 0, annual: 0 },
      features: [
        '5 AI content generations per month',
        '2 voiceover minutes per month',
        'Basic trend insights',
        'Community support',
        'Standard templates'
      ],
      cta: 'Get Started Free',
      popular: false,
      gradient: 'from-gray-500 to-gray-600'
    },
    {
      name: 'Creator',
      description: 'For serious creators ready to scale',
      price: { monthly: 29, annual: 290 },
      features: [
        'Unlimited AI content generation',
        '60 voiceover minutes per month',
        'Advanced trend analysis',
        'Priority support',
        'Premium templates',
        'Brand partnership access',
        'Analytics dashboard',
        'Custom voice training'
      ],
      cta: 'Start Free Trial',
      popular: true,
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      name: 'Pro',
      description: 'For teams and agencies',
      price: { monthly: 99, annual: 990 },
      features: [
        'Everything in Creator',
        'Unlimited voiceover minutes',
        'White-label solutions',
        'API access',
        'Dedicated account manager',
        'Custom integrations',
        'Advanced analytics',
        'Team collaboration tools',
        'Priority feature requests'
      ],
      cta: 'Contact Sales',
      popular: false,
      gradient: 'from-blue-500 to-cyan-500'
    }
  ];

  return (
    <div className="min-h-screen w-full bg-white py-16 px-4 flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="max-w-4xl w-full mx-auto text-center mb-12"
      >
        <h1 className="text-5xl font-extrabold mb-4 text-black">
          Simple, <span className="text-gray-700">Transparent Pricing</span>
        </h1>
        <p className="text-lg text-gray-700 mb-6">
          Choose the perfect plan for your creative journey. Start free and scale as you grow.
        </p>
        {/* Toggle */}
        <div className="flex items-center justify-center gap-4 mb-2">
          <span className="text-black font-medium">Monthly</span>
          <button
            className={`w-14 h-8 rounded-full bg-gray-200 flex items-center px-1 transition-all duration-300 ${isAnnual ? 'justify-end' : 'justify-start'}`}
            onClick={() => setIsAnnual(!isAnnual)}
          >
            <span className="w-6 h-6 bg-white rounded-full shadow-md border border-gray-300" />
          </button>
          <span className="text-black font-medium">Annual <span className="ml-2 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs">Save 20%</span></span>
        </div>
      </motion.div>
      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full">
        {plans.map((plan, idx) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * idx, duration: 0.7 }}
            className={`relative rounded-2xl p-8 shadow-xl border border-gray-200 bg-white ${plan.popular ? 'ring-2 ring-black' : ''}`}
          >
            {plan.popular && (
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-black text-white text-xs font-semibold shadow-lg z-10">
                <Star className="inline-block w-4 h-4 mr-1 -mt-1" /> Most Popular
              </div>
            )}
            <h2 className="text-2xl font-bold mb-2 text-black drop-shadow-none">{plan.name}</h2>
            <p className="text-gray-700 mb-4 min-h-[48px]">{plan.description}</p>
            <div className="flex items-end justify-center mb-6">
              <span className="text-4xl font-extrabold text-black">${isAnnual ? plan.price.annual : plan.price.monthly}</span>
              <span className="ml-2 text-gray-500">/month</span>
            </div>
            <button
              className={`w-full py-3 rounded-lg font-semibold text-lg mt-2 mb-6 bg-black text-white shadow-md hover:bg-gray-900 transition-all`}
              onClick={() => {
                if (plan.price.monthly === 0) {
                  // Free plan, just redirect to dashboard
                  navigate('/app/dashboard');
                } else {
                  navigate(`/payment?plan=${plan.name.toLowerCase()}&billing=${isAnnual ? 'annual' : 'monthly'}`);
                }
              }}
            >
              {plan.cta}
            </button>
            <ul className="text-left space-y-3 mb-4">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center text-gray-800">
                  <Check className="w-5 h-5 mr-2 text-green-600" /> {feature}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </div>
  );
}