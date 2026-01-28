'use client';

import { ChevronDown, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function FAQAccordion(): React.JSX.Element {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [faqs, setFaqs] = useState([
    {
      question: 'What is e-learning?',
      answer: 'E-learning is learning conducted via electronic media, typically on the internet.',
    },
    {
      question: 'What is an LMS?',
      answer:
        'A Learning Management System is a software application for the administration, documentation, tracking, reporting, and delivery of educational courses.',
    },
  ]);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const addFAQ = () => {
    setFaqs([...faqs, { question: 'New Question?', answer: 'Enter answer here...' }]);
  };

  const removeFAQ = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index));
  };

  const updateFAQ = (index: number, field: 'question' | 'answer', value: string) => {
    const newFaqs = [...faqs];
    newFaqs[index][field] = value;
    setFaqs(newFaqs);
  };

  return (
    <div className="bg-lxd-dark-page border border-lxd-dark-surface rounded-2xl shadow-lg p-8 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-lxd-text-light-heading">FAQ Section</h3>
        <Button
          type="button"
          onClick={addFAQ}
          size="sm"
          className="bg-lxd-success hover:bg-lxd-success/80 text-lxd-dark-page"
        >
          <Plus className="w-4 h-4 mr-1" aria-hidden="true" />
          Add FAQ
        </Button>
      </div>
      {faqs.map((faq, index) => (
        <div key={index} className="border-b border-lxd-dark-surface last:border-b-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => toggleFAQ(index)}
              aria-expanded={openIndex === index}
              className="flex-1 text-left py-5 flex justify-between items-center text-lg font-medium text-lxd-text-light-heading hover:text-lxd-blue transition-colors"
            >
              <input
                type="text"
                value={faq.question}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
                onChange={(e) => updateFAQ(index, 'question', e.target.value)}
                aria-label={`Edit question ${index + 1}`}
                className="bg-transparent outline-hidden focus:ring-2 focus:ring-lxd-blue rounded px-1 w-full"
              />
              <ChevronDown
                className={`w-5 h-5 transition-transform ${openIndex === index ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
            </button>
            <button
              type="button"
              onClick={() => removeFAQ(index)}
              aria-label={`Remove FAQ ${index + 1}`}
              className="text-lxd-text-light-muted hover:text-lxd-error p-2"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
          <div
            className={`overflow-hidden transition-all duration-300 ${
              openIndex === index ? 'max-h-96 pb-5' : 'max-h-0'
            }`}
          >
            <textarea
              value={faq.answer}
              onChange={(e) => updateFAQ(index, 'answer', e.target.value)}
              aria-label={`Edit answer ${index + 1}`}
              rows={3}
              className="w-full bg-transparent text-lxd-text-light-secondary leading-relaxed outline-hidden focus:ring-2 focus:ring-lxd-blue rounded px-1 resize-y"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default FAQAccordion;
