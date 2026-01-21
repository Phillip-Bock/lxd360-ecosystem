'use client';

import { Camera, Folder, Paperclip } from 'lucide-react';
import {
  FileTrigger as FileTriggerPrimitive,
  type FileTriggerProps as FileTriggerPrimitiveProps,
} from 'react-aria-components';
import { Button, type ButtonProps } from './button';
import { Loader } from './loader';

export interface FileTriggerProps extends FileTriggerPrimitiveProps {
  variant?: ButtonProps['variant'];
  size?: ButtonProps['size'];
  disabled?: boolean;
  isPending?: boolean;
  ref?: React.RefObject<HTMLInputElement>;
  className?: string;
}

export function FileTrigger({
  variant = 'outline',
  size = 'default',
  ref,
  className,
  disabled,
  isPending,
  defaultCamera,
  acceptDirectory,
  allowsMultiple,
  children,
  ...props
}: FileTriggerProps): React.JSX.Element {
  return (
    <FileTriggerPrimitive
      ref={ref}
      defaultCamera={defaultCamera}
      acceptDirectory={acceptDirectory}
      allowsMultiple={allowsMultiple}
      {...props}
    >
      <Button className={className} disabled={disabled} variant={variant} size={size}>
        {!isPending ? (
          defaultCamera ? (
            <Camera className="h-4 w-4" />
          ) : acceptDirectory ? (
            <Folder className="h-4 w-4" />
          ) : (
            <Paperclip className="h-4 w-4" />
          )
        ) : (
          <Loader />
        )}
        {children ? (
          children
        ) : (
          <>
            {allowsMultiple ? 'Browse files' : acceptDirectory ? 'Browse' : 'Browse a file'}
            ...
          </>
        )}
      </Button>
    </FileTriggerPrimitive>
  );
}
