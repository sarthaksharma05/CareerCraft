import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { RevenueCatService } from '../../lib/revenuecat';
import { Sparkles } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const revenueCat = new RevenueCatService();

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export function PaymentPage() {
  const query = useQuery();
  const plan = query.get('plan') || 'creator';
  const billing = query.get('billing') || 'monthly';
  const navigate = useNavigate();
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('India');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { updateProfile } = useAuth();

  const planDisplay = {
    creator: { name: 'Creator', price: 29, desc: 'For serious creators ready to scale' },
    pro: { name: 'Pro', price: 99, desc: 'For teams and agencies' },
    starter: { name: 'Starter', price: 0, desc: 'Perfect for new creators getting started' },
  };
  const selected = planDisplay[plan] || planDisplay.creator;
  const price = billing === 'annual' ? selected.price * 10 : selected.price;

  const handlePayment = async () => {
    setLoading(true);
    setError('');
    try {
      const paymentDetails = { cardNumber, expiryDate: expiry, cvv, name, email, country };
      await revenueCat.processPayment(paymentDetails, price);
      await updateProfile({
        is_pro: true,
        subscription_tier: plan === 'creator' ? 'pro' : plan,
        subscription_status: 'active',
        billing_cycle: billing,
      });
      setSuccess(true);
      setTimeout(() => navigate('/app/dashboard'), 500);
    } catch (err: any) {
      setError(err.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="flex w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden">
        {/* Left: Summary */}
        <div className="w-1/2 bg-zinc-900 text-white p-10 flex flex-col justify-between">
          <div>
            <div className="flex items-center mb-8">
              <Sparkles className="w-8 h-8 mr-3 text-white bg-clip-text text-transparent bg-gradient-to-br from-purple-400 to-pink-600" />
              <span className="font-bold text-lg">CreatorCopilot</span>
            </div>
            <div className="mb-8">
              <div className="text-lg">Subscribe to <span className="font-bold">{selected.name} Plan</span></div>
              <div className="text-4xl font-extrabold mt-2">${price}.00 <span className="text-base font-normal align-top">{billing === 'annual' ? 'per year' : 'per month'}</span></div>
              {billing === 'annual' && <div className="text-sm text-zinc-300">Save 20% with annual billing</div>}
            </div>
            <div className="mb-6">
              <div className="font-semibold mb-1">{selected.name} Plan</div>
              <div className="text-zinc-300 text-sm mb-2">{selected.desc}</div>
              <div className="text-zinc-300 text-xs">Billed {billing}</div>
            </div>
            <div className="border-t border-zinc-700 pt-4 mt-4">
              <div className="flex justify-between mb-2">
                <span>Subtotal</span>
                <span>${price}.00</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total due today</span>
                <span>${price}.00</span>
              </div>
            </div>
          </div>
          <div className="text-xs text-zinc-400 mt-8">By confirming your subscription, you allow CreatorCopilot to charge you for future payments in accordance with their terms. You can always cancel your subscription.</div>
        </div>
        {/* Right: Payment Form */}
        <div className="w-1/2 bg-white p-10 flex flex-col justify-center">
          <h2 className="text-2xl font-bold mb-6">Pay with card</h2>
          <form onSubmit={(e) => { e.preventDefault(); handlePayment(); }} className="space-y-4">
            <input
              type="email"
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <div>
              <label className="block font-semibold mb-1">Payment method</label>
              <input
                type="text"
                className="w-full border rounded-lg px-3 py-2 mb-2"
                placeholder="Card Number"
                value={cardNumber}
                onChange={e => setCardNumber(e.target.value)}
                required
                maxLength={19}
                inputMode="numeric"
              />
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  className="w-1/2 border rounded-lg px-3 py-2"
                  placeholder="MM/YY"
                  value={expiry}
                  onChange={e => setExpiry(e.target.value)}
                  required
                  maxLength={5}
                />
                <input
                  type="text"
                  className="w-1/2 border rounded-lg px-3 py-2"
                  placeholder="CVC"
                  value={cvv}
                  onChange={e => setCvv(e.target.value)}
                  required
                  maxLength={4}
                  inputMode="numeric"
                />
              </div>
              <input
                type="text"
                className="w-full border rounded-lg px-3 py-2 mb-2"
                placeholder="Cardholder name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
              <select
                className="w-full border rounded-lg px-3 py-2"
                value={country}
                onChange={e => setCountry(e.target.value)}
                required
              >
                <option value="India">India</option>
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Canada">Canada</option>
                <option value="Australia">Australia</option>
                <option value="Other">Other</option>
              </select>
            </div>
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <button
              type="submit"
              className="w-full py-3 rounded-lg font-semibold text-lg bg-black text-white shadow-md hover:bg-zinc-800 transition-all disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Processing...' : `Pay $${price}`}
            </button>
          </form>
          {success && <div className="text-green-600 text-center mt-4 font-semibold">Payment successful! Redirecting...</div>}
        </div>
      </div>
    </div>
  );
} 