import React from 'react';

export default async function TeamAccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className='w-full p-8'>{children}</div>
    </>
  );
}
