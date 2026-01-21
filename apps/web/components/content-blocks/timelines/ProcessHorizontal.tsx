'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function ProcessHorizontal(): React.JSX.Element {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState([
    { image: '/step-1-planning.jpg', title: 'Step 1: Planning' },
    { image: '/step-2-design.jpg', title: 'Step 2: Design' },
    { image: '/step-3-development.jpg', title: 'Step 3: Development' },
  ]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  const updateTitle = (index: number, newTitle: string) => {
    setSlides((prev) => {
      const newSlides = [...prev];
      newSlides[index] = { ...newSlides[index], title: newTitle };
      return newSlides;
    });
  };

  return (
    <div className="bg-lxd-dark-page border border-lxd-dark-surface rounded-xl p-8 mb-6">
      <div className="flex items-center gap-4">
        <Button
          onClick={prevSlide}
          variant="ghost"
          size="icon"
          className="text-lxd-blue hover:text-lxd-blue hover:bg-lxd-blue/10"
        >
          <ChevronLeft className="w-8 h-8" />
        </Button>
        <div className="flex-1 text-center">
          <div className="relative w-full aspect-video rounded-lg border border-lxd-dark-surface mb-4 overflow-hidden">
            <Image
              src={slides[currentSlide].image || '/placeholder.svg'}
              alt={slides[currentSlide].title}
              fill
              className="object-cover rounded-lg"
            />
          </div>
          <h4
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => updateTitle(currentSlide, e.currentTarget.textContent || '')}
            className="text-lg font-semibold text-lxd-text-light-heading outline-hidden focus:ring-2 focus:ring-lxd-blue rounded px-2"
          >
            {slides[currentSlide].title}
          </h4>
          <div className="flex justify-center gap-2 mt-4">
            {slides.map((_, index) => (
              <button
                type="button"
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-colors ${index === currentSlide ? 'bg-lxd-blue' : 'bg-lxd-dark-surface'}`}
              />
            ))}
          </div>
        </div>
        <Button
          onClick={nextSlide}
          variant="ghost"
          size="icon"
          className="text-lxd-blue hover:text-lxd-blue hover:bg-lxd-blue/10"
        >
          <ChevronRight className="w-8 h-8" />
        </Button>
      </div>
    </div>
  );
}
