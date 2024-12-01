import Link from 'next/link';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { SubmitButton } from '@/components/ui/submit-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Login({
  searchParams,
}: {
  searchParams: { message: string; returnUrl?: string };
}) {
  const signIn = async (_prevState: any, formData: FormData) => {
    'use server';

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return redirect(
        `/login?message=Could not authenticate user&returnUrl=${searchParams.returnUrl}`
      );
    }

    return redirect(searchParams.returnUrl || '/dashboard');
  };

  const signUp = async (_prevState: any, formData: FormData) => {
    'use server';

    const origin =
      process.env.NODE_ENV === 'production'
        ? process.env.NEXT_PUBLIC_URL
        : headers().get('origin');

    const minLength = 6;
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (password.length < minLength) {
      return redirect(
        `/login?message=Password must be at least 6 characters long&returnUrl=${searchParams.returnUrl}`
      );
    }

    if (!regex.test(password)) {
      return redirect(
        `/login?message=Password must include at least one uppercase letter, one lowercase letter, one number, and one special character&returnUrl=${searchParams.returnUrl}`
      );
    }

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback?returnUrl=${searchParams.returnUrl}`,
      },
    });

    if (error) {
      return redirect(
        `/login?message=Could not authenticate user&returnUrl=${searchParams.returnUrl}`
      );
    }

    return redirect(
      `/login?message=Check email to continue sign in process&returnUrl=${searchParams.returnUrl}`
    );
  };

  return (
    <div className='flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2'>
      <Link
        href='/'
        className='absolute left-8 top-8 py-2 px-4 rounded-md no-underline text-foreground bg-btn-background hover:bg-btn-background-hover flex items-center group text-sm'
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='24'
          height='24'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
          className='mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1'
        >
          <polyline points='15 18 9 12 15 6' />
        </svg>{' '}
        Back
      </Link>

      <form className='animate-in flex-1 flex flex-col w-full justify-center gap-2 text-foreground'>
        <Label className='text-md' htmlFor='email'>
          Email
        </Label>
        <Input name='email' placeholder='you@example.com' required />
        <Label className='text-md' htmlFor='email'>
          Password
        </Label>
        <Input
          type='password'
          name='password'
          placeholder='••••••••'
          required
        />
        <div className='flex flex-col gap-2'>
          <SubmitButton
            className='w-full'
            formAction={signIn}
            pendingText='Signing In...'
          >
            Sign In
          </SubmitButton>
          <SubmitButton
            className='w-full'
            formAction={signUp}
            variant='outline'
            pendingText='Signing Up...'
          >
            Sign Up
          </SubmitButton>
        </div>
        {searchParams?.message && (
          <p className='mt-4 p-4 bg-foreground/10 text-foreground text-center'>
            {searchParams.message}
          </p>
        )}
      </form>
    </div>
  );
}
