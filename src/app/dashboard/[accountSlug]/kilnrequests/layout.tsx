import SettingsNavigation from '@/components/dashboard/settings-navigation';
import DashboardTitle from '@/components/dashboard/dashboard-title';
import { Separator } from '@/components/ui/separator';

export default function PrintJobsLayout({
  children,
  params: { accountSlug },
}: {
  children: React.ReactNode;
  params: { accountSlug: string };
}) {
  const items = [
    { name: 'Kiln Requests', href: `/dashboard/${accountSlug}/printjobs` },
  ];

  return (
    <div className='space-y-6 pb-16 md:block'>
      <DashboardTitle
        title='Kiln Requests'
        description='Manage your kiln requests.'
      />
      <div className='grow'>{children}</div>
    </div>
  );
}
