import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, MessageSquare, Phone, MapPin, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { GradientButton } from '@/components/ui/gradient-button';
import emailjs from 'emailjs-com';
import { Listbox } from '@headlessui/react';
import { Check, ChevronDown } from 'lucide-react';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export function ContactPage() {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset, setValue, trigger } = useForm<ContactFormData>();

  const subjectOptions = [
    { value: '', label: 'Select a subject' },
    { value: 'general', label: 'General Inquiry' },
    { value: 'support', label: 'Technical Support' },
    { value: 'billing', label: 'Billing Question' },
    { value: 'partnership', label: 'Partnership' },
    { value: 'feedback', label: 'Feedback' },
  ];
  const [selectedSubject, setSelectedSubject] = useState(subjectOptions[0]);

  const onSubmit = async (data: ContactFormData) => {
    setLoading(true);
    try {
      await emailjs.send(
        'service_o0hwi3p', // Service ID
        'template_fbfq11m', // Template ID
        {
          from_name: data.name,
          from_email: data.email,
          subject: data.subject,
          message: data.message,
        },
        'N4rzXv18Cf-F9r1yK' // Public Key
      );
      toast.success("Message sent successfully! We'll get back to you soon.");
      reset();
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email Us',
      description: 'Send us an email and we\'ll respond within 24 hours',
      contact: 'copilotcreator@gmail.com',
      action: 'mailto:copilotcreator@gmail.com'
    },
    {
      icon: MessageSquare,
      title: 'Live Chat',
      description: 'Chat with our support team in real-time',
      contact: 'Available 9 AM - 6 PM PST',
      action: '#'
    },
    {
      icon: Phone,
      title: 'Call Us',
      description: 'Speak directly with our team',
      contact: (
        <>
          <a href="tel:+919424476949" className="hover:underline text-purple-200 block">+91 9424476949</a>
          <a href="tel:+919897102513" className="hover:underline text-purple-200 block mt-1">+91 9897102513</a>
        </>
      ),
      action: undefined
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      description: 'Come say hello at our office',
      contact: 'Madhya Pradesh, India',
      action: '#'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0c12] via-[#181b23] to-[#e3e3e3]">
      {/* Header */}
      <header className="relative z-50 bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link 
            to="/" 
            className="flex items-center space-x-2 text-white hover:text-purple-200 transition-colors w-fit"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Get in
              <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                {' '}Touch
              </span>
            </h1>
            <p className="text-xl text-purple-200 max-w-3xl mx-auto leading-relaxed">
              Have questions about CreatorCopilot? Want to share feedback? We'd love to hear from you. 
              Our team is here to help you succeed.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => (
              <motion.a
                key={index}
                href={info.action}
                className="bg-gradient-to-r from-purple-900/30 to-purple-400/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all group block"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <info.icon className="h-8 w-8 text-purple-400 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-semibold text-white mb-2">{info.title}</h3>
                <p className="text-purple-200 text-sm mb-3">{info.description}</p>
                <div className="text-purple-300 font-medium">{info.contact}</div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
                <h2 className="text-3xl font-bold text-white mb-6">Send us a Message</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div>
                    <label className="block text-white font-medium mb-2">Name</label>
                    <input
                      {...register('name', { required: 'Name is required' })}
                      type="text"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-md transition-all"
                      placeholder="Your full name"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Email</label>
                    <input
                      {...register('email', { 
                        required: 'Email is required',
                        pattern: {
                          value: /^\S+@\S+$/i,
                          message: 'Invalid email address'
                        }
                      })}
                      type="email"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-md transition-all"
                      placeholder="your@email.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Subject</label>
                    <Listbox value={selectedSubject} onChange={value => {
                      setSelectedSubject(value);
                      setValue('subject', value.value, { shouldValidate: true });
                      trigger('subject');
                    }}>
                      {({ open }) => (
                        <div className="relative">
                          <Listbox.Button className="w-full px-4 py-3 bg-[#181b23] border border-purple-500 rounded-xl text-white text-left focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all pr-10 flex items-center justify-between">
                            <span>{selectedSubject.label}</span>
                            <ChevronDown className="w-5 h-5 text-purple-300 absolute right-3 pointer-events-none" />
                          </Listbox.Button>
                          <Listbox.Options className="absolute z-10 mt-2 w-full bg-[#181b23] border border-purple-500 rounded-xl shadow-lg max-h-60 overflow-auto focus:outline-none">
                            {subjectOptions.map((option) => (
                              <Listbox.Option
                                key={option.value}
                                value={option}
                                className={({ active, selected }) =>
                                  `cursor-pointer select-none relative px-4 py-3 text-white ${
                                    active ? 'bg-purple-900/40' : ''
                                  } ${selected ? 'font-semibold text-purple-400' : ''}`
                                }
                              >
                                {({ selected }) => (
                                  <>
                                    <span>{option.label}</span>
                                    {selected ? (
                                      <Check className="w-4 h-4 text-purple-400 absolute right-3 top-1/2 -translate-y-1/2" />
                                    ) : null}
                                  </>
                                )}
                              </Listbox.Option>
                            ))}
                          </Listbox.Options>
                        </div>
                      )}
                    </Listbox>
                    <input type="hidden" {...register('subject', { required: 'Subject is required' })} value={selectedSubject.value} />
                    {errors.subject && (
                      <p className="mt-1 text-sm text-red-400">{errors.subject.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Message</label>
                    <textarea
                      {...register('message', { required: 'Message is required' })}
                      rows={5}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-md transition-all resize-none"
                      placeholder="Tell us how we can help you..."
                    />
                    {errors.message && (
                      <p className="mt-1 text-sm text-red-400">{errors.message.message}</p>
                    )}
                  </div>

                  <GradientButton
                    type="submit"
                    variant="default"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="mr-2 h-5 w-5" />
                        Send Message
                      </>
                    )}
                  </GradientButton>
                </form>
              </div>
            </motion.div>

            {/* Info */}
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div>
                <h3 className="text-2xl font-bold text-white mb-4">Let's Start a Conversation</h3>
                <p className="text-purple-200 leading-relaxed mb-6">
                  Whether you're a creator looking to transform your content strategy, a brand interested in partnerships, 
                  or someone who wants to join our mission, we're excited to hear from you.
                </p>
                <p className="text-purple-200 leading-relaxed">
                  Our team typically responds within 24 hours, and we're committed to providing you with the support 
                  and information you need to succeed.
                </p>
              </div>

              <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <h4 className="text-xl font-semibold text-white mb-4">Quick Response Times</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-purple-200">General Inquiries</span>
                    <span className="text-white font-medium">{'< 24 hours'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-200">Technical Support</span>
                    <span className="text-white font-medium">{'< 12 hours'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-200">Urgent Issues</span>
                    <span className="text-white font-medium">{'< 4 hours'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <h4 className="text-xl font-semibold text-white mb-4">Office Hours</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-purple-200">Monday - Friday</span>
                    <span className="text-white">9 AM - 6 PM PST</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-200">Saturday</span>
                    <span className="text-white">10 AM - 4 PM PST</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-200">Sunday</span>
                    <span className="text-white">Closed</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-md rounded-3xl p-12 border border-white/20"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-purple-200 mb-8">
              Don't wait to transform your content creation process. Join thousands of creators 
              who are already using CreatorCopilot to scale their success.
            </p>
            <Link
              to="/"
              className="inline-flex items-center bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl"
            >
              Start Your Free Trial
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}