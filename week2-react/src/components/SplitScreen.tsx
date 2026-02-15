import React, { useRef, useEffect, useState } from 'react';
import { useInView } from 'framer-motion';
import { cn } from '../lib/utils';

export interface SplitScreenItem {
  id: string;
  content: React.ReactNode;
  visual: React.ReactNode;
}

interface SplitScreenProps {
  items: SplitScreenItem[];
  className?: string;
}

export function SplitScreen({ items, className }: SplitScreenProps) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id);

  return (
    <div className={cn("relative flex flex-col md:flex-row gap-8", className)}>
      {/* Left: Scrollable Content */}
      <div className="w-full md:w-1/2 flex flex-col gap-[50vh] pb-[50vh]">
        {items.map((item) => (
          <ContentBlock 
            key={item.id} 
            id={item.id} 
            onInView={setActiveId}
          >
            {item.content}
          </ContentBlock>
        ))}
      </div>

      {/* Right: Sticky Visual */}
      <div className="hidden md:block md:w-1/2 sticky top-24 h-[calc(100vh-8rem)]">
        <div className="relative w-full h-full bg-slate-100 dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-inner">
          {items.map((item) => (
            <div
              key={item.id}
              className={cn(
                "absolute inset-0 w-full h-full transition-opacity duration-700 flex items-center justify-center p-6",
                activeId === item.id ? "opacity-100 z-10" : "opacity-0 z-0"
              )}
            >
              {item.visual}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Helper component to detect visibility
function ContentBlock({ id, children, onInView }: { id: string, children: React.ReactNode, onInView: (id: string) => void }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: "-50% 0px -50% 0px" });

  useEffect(() => {
    if (isInView) {
      onInView(id);
    }
  }, [isInView, id, onInView]);

  return (
    <div ref={ref} className="min-h-[50vh] flex items-center">
      <div className="prose dark:prose-invert prose-lg max-w-none">
        {children}
      </div>
    </div>
  );
}
