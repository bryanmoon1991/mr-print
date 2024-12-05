import Header from '@/components/getting-started/header';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import MrPrintLogo from '@/components/getting-started/mr-print-logo';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default async function Index() {
  return (
    <div className='flex-1 w-full flex flex-col gap-6 items-center'>
      <nav className='w-full flex justify-center border-b border-b-foreground/10 h-16 px-2 md:px-0'>
        <div className='w-full max-w-screen-lg flex justify-between items-center p-3 text-sm'>
          <Link href='/'>
            <MrPrintLogo />
          </Link>

          <Link href='/dashboard'>Dashboard</Link>
        </div>
      </nav>

      <div className='flex-1 flex flex-col gap-2 max-w-4xl px-3 w-full'>
        <Header />
        <main>
          <div className='w-full flex gap-2 justify-between'>
            <div className='flex flex-col w-[30%] text-center'>
              <Image
                src='/images/printer.png'
                alt='printer'
                width={400}
                height={400}
              />
              <h1 className='mt-4 text-xl font-bold w-full'>
                Wireless Thermal Printing
              </h1>
              <p className='text-lg w-full'>
                Choose from our list of compatible printers and get set up with
                printing in minutes. With a thermal printer, you never have to
                change out ink and can even print images!
              </p>
            </div>

            <div className='flex flex-col w-[30%] text-center'>
              <Image
                src='/images/customize.png'
                alt='printer'
                width={400}
                height={400}
              />
              <h1 className='mt-4 text-xl font-bold w-full'>
                Custom Form Settings
              </h1>
              <p className='text-lg w-full'>
                Adjust your pricing on the fly, offer discounted pricing to
                members, and ensure you're getting the most value out of your
                kiln.
              </p>
            </div>

            <div className='flex flex-col w-[30%] text-center'>
              <Image
                src='/images/qrscan.png'
                alt='printer'
                width={400}
                height={400}
              />
              <h1 className='mt-4 text-xl font-bold w-full'>QR Code</h1>
              <p className='text-lg w-full'>
                Post your QR code in your studio and let members fill out the
                form on their own devices! No need to worry about lost paper
                forms or illegible handwriting.
              </p>
            </div>
          </div>

          {/* <div className='w-full p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent my-4' />

          <div
            className='relative bg-cover bg-top w-full h-[30rem]'
            style={{ backgroundImage: "url('/images/tableScreenshot.png')" }}
          >
            <div className='absolute inset-0 bg-gradient-to-b from-transparent via-white/60 to-white'></div>

            <div className='absolute bottom-10 inset-0 flex flex-col items-center justify-end text-left'>
              <h1 className='text-4xl font-bold w-full'>
                Manage your data
              </h1>
              <p className='mt-4 text-lg w-full'>
                Reprint, edit, and export your kiln requests through your
                dashboard
              </p>
            </div>
          </div> */}
        </main>
      </div>

      <footer className='w-full border-t border-t-foreground/10 p-8 flex justify-center gap-x-2 items-center text-sm'>
        <p className='text-sm'>© 2024 Mr.Print All rights reserved.</p>
      </footer>
    </div>
  );
}
