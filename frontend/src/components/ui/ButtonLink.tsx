import { TLinkProps } from '@/router/config';
import { Link as RouterLink } from '@tanstack/react-router';
import { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

type ExtraProps = {
  children: ReactNode;
  className?: string;
  'aria-label': string;
};

export const ButtonLink = <TLinkOptions extends string = '.'>({
  children,
  className,
  ...props
}: TLinkProps<TLinkOptions> & ExtraProps) => (
  <RouterLink
    className={twMerge(
      'inline-flex h-9 w-9 items-center justify-center rounded-md bg-white p-2 text-blue-600 transition hover:bg-blue-100',
      className
    )}
    {...props}
  >
    <div className="h-full w-full">{children as ReactNode}</div>
  </RouterLink>
);
