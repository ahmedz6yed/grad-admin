import { useGoogleLogin as useGoogleOAuth } from '@react-oauth/google';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useGoogleLogin } from '../../hooks/useAuthMutations';

/**
 * Self-contained "Continue with Google" button.
 *
 * Uses @react-oauth/google's useGoogleLogin hook for a reliable custom UI experience.
 *
 * Flow:
 *  1. User clicks our styled button → useGoogleLogin hook triggers the OAuth popup
 *  2. Google returns an access_token (implicit flow)
 *  3. We POST that token to /user/google via the useGoogleLogin mutation
 *  4. Mutation handles auth state + navigation
 */
const LoginWithGoogle = ({ className = '', ...rest }) => {
  const { mutate: googleLoginMutate, isPending } = useGoogleLogin();

  const login = useGoogleOAuth({
    onSuccess: (tokenResponse) => {
      console.log('Google Success:', tokenResponse);
      const token = tokenResponse?.access_token;
      if (!token) {
        toast.error('Google sign-in failed: no token received.');
        return;
      }
      googleLoginMutate(token);
    },
    onError: (error) => {
      console.error('Google Error:', error);
      // Only show error if it's not a user cancellation
      if (error?.error !== 'popup_closed_by_user') {
        toast.error('Google sign-in failed. Please try again.');
      }
    },
  });

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => login()}
      aria-label="Continue with Google"
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
      {isPending ? (
        <Loader2 className="size-5 animate-spin text-accent" aria-hidden />
      ) : (
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
      )}
      <span className="text-text-muted transition-colors duration-200 group-hover:text-charcoal">
        {isPending ? 'Signing in…' : 'Continue with Google'}
      </span>
    </button>
  );
};

export default LoginWithGoogle;
