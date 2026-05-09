import React from 'react';

/**
 * Google sign-in control. Icon assets match viewport density:
 * — default: icons8-google-48.svg
 * — md: icons8-google-96.svg
 * — lg+: icons8-google-144.svg
 */
const LoginWithGoogle = ({
  className = '',
  disabled = false,
  onClick,
  ...rest
}) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    className={[
      'group flex h-12 md:h-[3.25rem] lg:h-14 w-full items-center cursor-pointer justify-center gap-3 rounded-xl px-4',
      'border border-border bg-surface text-charcoal shadow-sm',
      'font-semibold uppercase tracking-widest text-[10px] md:text-[11px]',
      'transition-colors duration-200 ease-out',
      'hover:border-accent hover:bg-surface-raised hover:shadow-md',
      'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/10 focus-visible:border-accent',
      'active:scale-[0.995] disabled:pointer-events-none disabled:opacity-50',
      className,
    ]
      .filter(Boolean)
      .join(' ')}
    {...rest}
  >
    <span className="inline-flex shrink-0 items-center justify-center" aria-hidden>
      <img
        src="/icons8-google-48.svg"
        alt=""
        className="size-[22px] md:hidden"
        width={22}
        height={22}
        decoding="async"
      />
      <img
        src="/icons8-google-96.svg"
        alt=""
        className="hidden size-[26px] md:block lg:hidden"
        width={26}
        height={26}
        decoding="async"
      />
      <img
        src="/icons8-google-144.svg"
        alt=""
        className="hidden size-[30px] lg:block"
        width={30}
        height={30}
        decoding="async"
      />
    </span>
    <span className="text-text-muted transition-colors duration-200 group-hover:text-charcoal">
      Continue with Google
    </span>
  </button>
);

export default LoginWithGoogle;
