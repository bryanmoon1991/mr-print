import NextLogo from './next-logo';
import SupabaseLogo from './supabase-logo';
import BasejumpLogo from './mr-print-logo';

export default function Header() {
  return (
    <div className='flex flex-col gap-6 items-center'>
      <BasejumpLogo />
      <h1 className='sr-only'>Mr. Print Kiln Request Management System</h1>
      <p className='text-xl !leading-tight max-w-xl text-center'>
        the easiest way for artists studios to manage kiln requests{' '}
      </p>
      <div className='w-full p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent my-8' />
    </div>
  );
}
