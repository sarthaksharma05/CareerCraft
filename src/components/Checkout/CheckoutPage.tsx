import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { 
  CreditCard, 
  Lock, 
  ArrowLeft, 
  Check, 
  Crown,
  Shield,
  AlertCircle,
  Loader,
  Star,
  Zap,
  Users,
  Building,
  MapPin,
  Mail,
  User
} from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { stripeService } from '../../lib/stripe';
import toast from 'react-hot-toast';

interface CheckoutFormData {
  email: string;
  fullName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvc: string;
  planId: string;
  billingCycle: 'monthly' | 'yearly';
}

const plans = [
  {
    id: 'creator_pro',
    name: 'Creator Pro',
    description: 'Perfect for serious content creators',
    monthlyPrice: 29,
    yearlyPrice: 290,
    features: [
      'Unlimited Smart Formating ',
      '60 voiceover minutes per month',
      'AI video creation (10 videos/month)',
      'Advanced trend analysis',
      'Priority support',
      'Premium templates',
      'Brand partnership access',
      'Advanced analytics dashboard'
    ],
    popular: true
  },
  {
    id: 'creator_studio',
    name: 'Creator Studio',
    description: 'For agencies and large teams',
    monthlyPrice: 99,
    yearlyPrice: 990,
    features: [
      'Everything in Creator Pro',
      'Unlimited AI video creation',
      'Unlimited voiceover minutes',
      'White-label solutions',
      'API access',
      'Dedicated account manager',
      'Custom integrations',
      'Advanced team collaboration'
    ],
    popular: false
  }
];

export function CheckoutPage() {
  const { profile, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(plans[0]);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [redirectingToStripe, setRedirectingToStripe] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<CheckoutFormData>({
    defaultValues: {
      email: profile?.email || '',
      fullName: profile?.full_name || '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States',
      cardNumber: '',
      cardExpiry: '',
      cardCvc: '',
      planId: searchParams.get('plan') || 'creator_pro',
      billingCycle: (searchParams.get('cycle') as 'monthly' | 'yearly') || 'monthly',
    }
  });

  useEffect(() => {
    const planId = searchParams.get('plan') || 'creator_pro';
    const cycle = (searchParams.get('cycle') as 'monthly' | 'yearly') || 'monthly';
    
    const plan = plans.find(p => p.id === planId) || plans[0];
    setSelectedPlan(plan);
    setBillingCycle(cycle);
    setValue('planId', plan.id);
    setValue('billingCycle', cycle);
  }, [searchParams, setValue]);

  const getCurrentPrice = () => {
    return billingCycle === 'yearly' ? selectedPlan.yearlyPrice : selectedPlan.monthlyPrice;
  };

  const getSavings = () => {
    const monthlyTotal = selectedPlan.monthlyPrice * 12;
    const yearlyPrice = selectedPlan.yearlyPrice;
    return monthlyTotal - yearlyPrice;
  };

  const onSubmit = async (data: CheckoutFormData) => {
    setLoading(true);
    setProcessingPayment(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update user profile to Pro status
      await updateProfile({
        subscription_tier: selectedPlan.id === 'creator_pro' ? 'pro' : 'studio',
        subscription_status: 'active',
        is_pro: true,
        subscription_start_date: new Date().toISOString(),
        subscription_end_date: new Date(Date.now() + (billingCycle === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString(),
        billing_cycle: billingCycle,
        last_payment_date: new Date().toISOString(),
        next_payment_date: new Date(Date.now() + (billingCycle === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString()
      });
      
      setPaymentSuccess(true);
      toast.success(`You're now a ${selectedPlan.id === 'creator_pro' ? 'Pro' : 'Studio'} member!`);
      
      // Redirect to dashboard after successful payment
      setTimeout(() => {
        navigate('/app/dashboard');
      }, 2000);
      
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Payment failed. Please try again.');
      setProcessingPayment(false);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="relative z-50 bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link 
              to="/app/upgrade" 
              className="flex items-center space-x-2 text-white hover:text-purple-200 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Plans</span>
            </Link>
            
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">CareerCraft Checkout</span>
            </div>
          </div>
        </div>
      </header>

      <motion.div
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Order Summary */}
          <motion.div 
            className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 h-fit"
            variants={itemVariants}
          >
            <h2 className="text-2xl font-bold text-white mb-6">Order Summary</h2>
            
            {/* Selected Plan */}
            <div className="bg-white/10 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                    <Crown className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{selectedPlan.name}</h3>
                    <p className="text-purple-200 text-sm">{selectedPlan.description}</p>
                  </div>
                </div>
                {selectedPlan.popular && (
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-black px-3 py-1 rounded-full text-xs font-bold">
                    POPULAR
                  </div>
                )}
              </div>
              
              {/* Billing Cycle Toggle */}
              <div className="flex items-center justify-center space-x-4 mb-6">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    billingCycle === 'monthly'
                      ? 'bg-white text-purple-600'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle('yearly')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all relative ${
                    billingCycle === 'yearly'
                      ? 'bg-white text-purple-600'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  Yearly
                  <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    Save ${getSavings()}
                  </span>
                </button>
              </div>

              {/* Features */}
              <div className="space-y-2 mb-6">
                {selectedPlan.features.slice(0, 4).map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-400" />
                    <span className="text-purple-200 text-sm">{feature}</span>
                  </div>
                ))}
                {selectedPlan.features.length > 4 && (
                  <p className="text-purple-300 text-sm">
                    +{selectedPlan.features.length - 4} more features
                  </p>
                )}
              </div>
            </div>

            {/* Pricing Breakdown */}
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-purple-200">
                  {selectedPlan.name} ({billingCycle})
                </span>
                <span className="text-white font-semibold">
                  ${getCurrentPrice()}.00
                </span>
              </div>
              
              {billingCycle === 'yearly' && (
                <div className="flex justify-between text-green-400">
                  <span>Annual Savings</span>
                  <span>-${getSavings()}.00</span>
                </div>
              )}
              
              <div className="border-t border-white/20 pt-4">
                <div className="flex justify-between text-xl font-bold text-white">
                  <span>Total</span>
                  <span>${getCurrentPrice()}.00</span>
                </div>
                <p className="text-purple-200 text-sm mt-1">
                  Billed {billingCycle}
                </p>
              </div>
            </div>

            {/* Security Badge */}
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-green-400" />
                <div>
                  <p className="text-white font-medium text-sm">Secure Checkout</p>
                  <p className="text-purple-200 text-xs">
                    256-bit SSL encryption • PCI DSS compliant
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Checkout Form */}
          <motion.div 
            className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20"
            variants={itemVariants}
          >
            {paymentSuccess ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">Payment Successful!</h2>
                <p className="text-purple-200 mb-8">
                  Thank you for upgrading to {selectedPlan.name}! You now have access to all premium features.
                </p>
                <motion.button
                  onClick={() => navigate('/app/dashboard')}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Go to Dashboard
                </motion.button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Complete Your Purchase</h2>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <h3 className="text-lg font-semibold text-white">Contact Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white font-medium mb-2">
                          Full Name *
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-300" />
                          <input
                            {...register('fullName', { 
                              required: 'Full name is required'
                            })}
                            type="text"
                            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
                            placeholder="John Doe"
                          />
                        </div>
                        {errors.fullName && (
                          <p className="mt-1 text-sm text-red-400">{errors.fullName.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-white font-medium mb-2">
                          Email Address *
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-300" />
                          <input
                            {...register('email', { 
                              required: 'Email is required',
                              pattern: {
                                value: /^\S+@\S+$/i,
                                message: 'Invalid email address'
                              }
                            })}
                            type="email"
                            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
                            placeholder="your@email.com"
                          />
                        </div>
                        {errors.email && (
                          <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
                        )}
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold text-white pt-4">Billing Address</h3>
                    
                    <div>
                      <label className="block text-white font-medium mb-2">
                        Street Address *
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-300" />
                        <input
                          {...register('address', { 
                            required: 'Address is required'
                          })}
                          type="text"
                          className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
                          placeholder="123 Main St"
                        />
                      </div>
                      {errors.address && (
                        <p className="mt-1 text-sm text-red-400">{errors.address.message}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white font-medium mb-2">
                          City *
                        </label>
                        <input
                          {...register('city', { 
                            required: 'City is required'
                          })}
                          type="text"
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
                          placeholder="New York"
                        />
                        {errors.city && (
                          <p className="mt-1 text-sm text-red-400">{errors.city.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-white font-medium mb-2">
                          State/Province *
                        </label>
                        <input
                          {...register('state', { 
                            required: 'State is required'
                          })}
                          type="text"
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
                          placeholder="NY"
                        />
                        {errors.state && (
                          <p className="mt-1 text-sm text-red-400">{errors.state.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white font-medium mb-2">
                          ZIP/Postal Code *
                        </label>
                        <input
                          {...register('zipCode', { 
                            required: 'ZIP code is required'
                          })}
                          type="text"
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
                          placeholder="10001"
                        />
                        {errors.zipCode && (
                          <p className="mt-1 text-sm text-red-400">{errors.zipCode.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-white font-medium mb-2">
                          Country *
                        </label>
                        <select
                          {...register('country', { 
                            required: 'Country is required'
                          })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
                        >
                          <option value="United States">United States</option>
                          <option value="Canada">Canada</option>
                          <option value="United Kingdom">United Kingdom</option>
                          <option value="Australia">Australia</option>
                          <option value="Germany">Germany</option>
                          <option value="France">France</option>
                          <option value="Japan">Japan</option>
                          <option value="India">India</option>
                          <option value="Brazil">Brazil</option>
                        </select>
                        {errors.country && (
                          <p className="mt-1 text-sm text-red-400">{errors.country.message}</p>
                        )}
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold text-white pt-4">Payment Information</h3>
                    
                    <div>
                      <label className="block text-white font-medium mb-2">
                        Card Number *
                      </label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-300" />
                        <input
                          {...register('cardNumber', { 
                            required: 'Card number is required',
                            pattern: {
                              value: /^[0-9]{16}$/,
                              message: 'Please enter a valid 16-digit card number'
                            }
                          })}
                          type="text"
                          className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
                          placeholder="4242 4242 4242 4242"
                          maxLength={16}
                        />
                      </div>
                      {errors.cardNumber && (
                        <p className="mt-1 text-sm text-red-400">{errors.cardNumber.message}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white font-medium mb-2">
                          Expiration Date *
                        </label>
                        <input
                          {...register('cardExpiry', { 
                            required: 'Expiration date is required',
                            pattern: {
                              value: /^(0[1-9]|1[0-2])\/([0-9]{2})$/,
                              message: 'Please enter a valid date (MM/YY)'
                            }
                          })}
                          type="text"
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
                          placeholder="MM/YY"
                        />
                        {errors.cardExpiry && (
                          <p className="mt-1 text-sm text-red-400">{errors.cardExpiry.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-white font-medium mb-2">
                          CVC *
                        </label>
                        <input
                          {...register('cardCvc', { 
                            required: 'CVC is required',
                            pattern: {
                              value: /^[0-9]{3,4}$/,
                              message: 'Please enter a valid CVC'
                            }
                          })}
                          type="text"
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
                          placeholder="123"
                          maxLength={4}
                        />
                        {errors.cardCvc && (
                          <p className="mt-1 text-sm text-red-400">{errors.cardCvc.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-4 mt-6">
                      <div className="flex items-start space-x-3">
                        <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5" />
                        <div>
                          <p className="text-blue-200 text-sm">
                            This is a demo checkout. No actual payment will be processed.
                            Your subscription will begin immediately after clicking "Complete Purchase".
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between pt-6">
                      <Link
                        to="/app/upgrade"
                        className="flex items-center space-x-2 bg-white/10 text-white px-6 py-3 rounded-lg font-medium hover:bg-white/20 transition-all"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Back</span>
                      </Link>
                      
                      <button
                        type="submit"
                        disabled={loading || processingPayment}
                        className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        {processingPayment ? (
                          <>
                            <Loader className="h-5 w-5 animate-spin" />
                            <span>Processing Payment...</span>
                          </>
                        ) : (
                          <>
                            <Lock className="h-4 w-4" />
                            <span>Complete Purchase</span>
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                </form>
              </>
            )}

            {/* Security Footer */}
            <div className="mt-8 pt-6 border-t border-white/20">
              <div className="flex items-center justify-center space-x-6 text-purple-200 text-sm">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>SSL Secured</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Lock className="h-4 w-4" />
                  <span>PCI Compliant</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4" />
                  <span>Trusted by 100K+ creators</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}