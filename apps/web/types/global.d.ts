// CSS Module declarations
declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}

declare module '*.scss' {
  const content: Record<string, string>;
  export default content;
}

declare module '*.sass' {
  const content: Record<string, string>;
  export default content;
}

// Image imports
declare module '*.svg' {
  const content: React.FC<React.SVGProps<SVGSVGElement>>;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.jpeg' {
  const content: string;
  export default content;
}

declare module '*.gif' {
  const content: string;
  export default content;
}

declare module '*.webp' {
  const content: string;
  export default content;
}

// Third-party module declarations
declare module 'use-stick-to-bottom' {
  import { ReactNode, HTMLAttributes } from 'react';

  export interface StickToBottomProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    resize?: 'smooth' | 'instant';
    initial?: 'smooth' | 'instant';
  }

  export interface StickToBottomContentProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
  }

  export interface StickToBottomContextValue {
    isAtBottom: boolean;
    scrollToBottom: () => void;
  }

  export function StickToBottom(props: StickToBottomProps): JSX.Element;
  export namespace StickToBottom {
    function Content(props: StickToBottomContentProps): JSX.Element;
  }

  export function useStickToBottomContext(): StickToBottomContextValue;
}

declare module 'remark-breaks' {
  import { Plugin } from 'unified';
  const remarkBreaks: Plugin;
  export default remarkBreaks;
}
