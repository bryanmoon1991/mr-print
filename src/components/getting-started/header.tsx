import { RainbowButton } from "../ui/rainbow-button";
import { LucideArrowRight } from "lucide-react";
import Link from "next/link";

export default function Header() {
  return (
    <div className='flex flex-col gap-4 items-center'>
      <h1 className='sr-only'></h1>
      <h1 className='text-6xl font-semibold !leading-tight max-w-xl text-center'>
        Automate your Kiln Firing Workflow{' '}
      </h1>
      <p className='text-2xl font-light text-center'>
        Mr. Print enables wireless ticket printing, cloud based record keeping,
        and revenue tracking for your studio kilns. Streamline your workflow so
        you can save time and grow your business.
      </p>

      <Link href='/dashboard'>
      <RainbowButton>Get Started! <LucideArrowRight/></RainbowButton>
      </Link>
      <div className='w-full p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent my-4' />
    </div>
  );
}
