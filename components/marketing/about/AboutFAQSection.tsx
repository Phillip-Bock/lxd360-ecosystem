'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { useState } from 'react';

/* =============================================================================
   COMPONENT PROPS
============================================================================= */
interface FAQItem {
  _key?: string;
  question: string;
  answer: string;
}

interface AboutFAQSectionProps {
  badge?: string;
  headline?: string;
  description?: string;
  faqs?: FAQItem[];
}

/* =============================================================================
   DEFAULT VALUES
============================================================================= */
const DEFAULT_FAQS: FAQItem[] = [
  {
    question: 'How do I get started with your platform?',
    answer:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat. Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet.',
  },
  {
    question: 'What are the system requirements?',
    answer:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat. Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet.',
  },
  {
    question: 'How often do you release updates?',
    answer:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat. Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet.',
  },
  {
    question: 'What should I do if I encounter an issue?',
    answer:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat. Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet.',
  },
  {
    question: 'What subscription plans are available?',
    answer:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat. Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet.',
  },
];

const DEFAULTS = {
  badge: 'FAQ',
  headline: 'Frequently Asked\nQuestions',
  description:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Find answers to common questions about our platform.',
};

/* =============================================================================
   FLOATING BADGE COMPONENT
============================================================================= */
function FloatingBadge({ text }: { text: string }): React.JSX.Element {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="flex justify-center mb-8"
    >
      <span
        className="px-6 py-2 text-sm font-semibold text-brand-primary rounded-[10px] inline-block"
        style={{
          background: 'var(--brand-primary)',
          boxShadow: '0 4px 20px rgba(85, 2, 120, 0.4), 0 8px 40px rgba(85, 2, 120, 0.2)',
        }}
      >
        {text}
      </span>
    </motion.div>
  );
}

/* =============================================================================
   ACCORDION ITEM COMPONENT
============================================================================= */
interface AccordionItemProps {
  faq: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}

function AccordionItem({ faq, isOpen, onToggle, index }: AccordionItemProps): React.JSX.Element {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group"
    >
      <motion.div
        className={`
          relative rounded-[10px] border overflow-hidden transition-all duration-300
          ${
            isOpen
              ? 'bg-linear-to-br from-blue-500/5 to-purple-500/5 border-brand-primary/30 dark:border-brand-primary/40'
              : 'bg-lxd-light-card/50 dark:bg-lxd-dark-page/30 border-lxd-light-border dark:border-lxd-dark-border hover:border-brand-primary/30'
          }
        `}
        style={{
          boxShadow: isOpen ? '0 8px 30px rgba(85, 2, 120, 0.15)' : 'none',
        }}
      >
        {/* Question Header */}
        <motion.button
          onClick={onToggle}
          className="w-full flex items-center gap-4 p-6 text-left"
          whileHover={{ x: 5 }}
          transition={{ duration: 0.2 }}
        >
          {/* Question Icon */}
          <motion.div
            animate={isOpen ? { rotate: 360, scale: 1.1 } : { rotate: 0, scale: 1 }}
            transition={{ duration: 0.5 }}
            className={`
              shrink-0 w-10 h-10 rounded-[10px] flex items-center justify-center
              ${
                isOpen
                  ? 'bg-linear-to-br from-blue-500 to-purple-600'
                  : 'bg-lxd-light-card dark:bg-lxd-dark-card group-hover:bg-linear-to-br group-hover:from-blue-500/50 group-hover:to-purple-600/50'
              }
            `}
            style={isOpen ? { boxShadow: '0 4px 15px rgba(85, 2, 120, 0.3)' } : {}}
          >
            <HelpCircle
              className={`w-5 h-5 ${isOpen ? 'text-brand-primary' : 'text-lxd-text-dark-body dark:text-lxd-text-light-muted'}`}
            />
          </motion.div>

          {/* Question Text */}
          <span
            className={`
            grow text-lg font-semibold transition-colors duration-300
            ${
              isOpen
                ? 'text-transparent bg-clip-text bg-linear-to-r from-blue-500 to-purple-500'
                : 'text-lxd-text-dark-heading dark:text-brand-primary group-hover:text-brand-blue dark:group-hover:text-brand-cyan'
            }
          `}
          >
            {faq.question}
          </span>

          {/* Chevron Icon */}
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="shrink-0"
          >
            <ChevronDown
              className={`
              w-6 h-6 transition-colors duration-300
              ${isOpen ? 'text-brand-blue' : 'text-lxd-text-light-muted group-hover:text-brand-blue'}
            `}
            />
          </motion.div>
        </motion.button>

        {/* Answer Content */}
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <motion.div
                initial={{ y: -10 }}
                animate={{ y: 0 }}
                exit={{ y: -10 }}
                transition={{ duration: 0.2 }}
                className="px-6 pb-6 pt-0"
              >
                {/* Divider */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="h-px bg-linear-to-r from-blue-500/30 via-purple-500/30 to-transparent mb-4 origin-left"
                />

                {/* Answer Text */}
                <p className="text-lxd-text-dark-body dark:text-lxd-text-light-muted leading-relaxed pl-14">
                  {faq.answer}
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

/* =============================================================================
   MAIN COMPONENT
============================================================================= */
export function AboutFAQSection({
  badge,
  headline,
  description,
  faqs,
}: AboutFAQSectionProps): React.JSX.Element {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const displayFaqs = faqs?.length ? faqs : DEFAULT_FAQS;
  const headlineText = headline || DEFAULTS.headline;
  const headlineParts = headlineText.split('\n');

  const handleToggle = (index: number): void => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-purple-50/20 to-transparent dark:via-purple-950/10" />

        {/* Decorative Elements */}
        <motion.div
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-20 right-10 w-64 h-64 rounded-full bg-brand-primary/10 blur-3xl"
        />
        <motion.div
          animate={{
            y: [0, 20, 0],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity, delay: 2 }}
          className="absolute bottom-20 left-10 w-80 h-80 rounded-full bg-brand-secondary/10 blur-3xl"
        />
      </div>

      <div className="relative container mx-auto px-4">
        {/* Floating Badge */}
        <FloatingBadge text={badge || DEFAULTS.badge} />

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            <span className="text-lxd-text-dark-heading dark:text-brand-primary">
              {headlineParts[0]}
            </span>
            {headlineParts[1] && (
              <>
                <br />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-500 to-purple-500">
                  {headlineParts[1]}
                </span>
              </>
            )}
          </h2>
          <p className="text-lg text-lxd-text-dark-body dark:text-lxd-text-light-muted max-w-2xl mx-auto">
            {description || DEFAULTS.description}
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto space-y-4">
          {displayFaqs.map((faq, index) => (
            <AccordionItem
              key={faq._key || index}
              faq={faq}
              isOpen={openIndex === index}
              onToggle={() => handleToggle(index)}
              index={index}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center mt-12"
        >
          <p className="text-lxd-text-dark-body dark:text-lxd-text-light-muted mb-4">
            Still have questions?
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="px-8 py-3 bg-linear-to-r from-blue-500 to-purple-600 text-brand-primary font-semibold rounded-[10px] inline-flex items-center gap-2"
            style={{
              boxShadow: '0 4px 20px rgba(85, 2, 120, 0.3)',
            }}
          >
            Contact Support
            <motion.span
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              &rarr;
            </motion.span>
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
