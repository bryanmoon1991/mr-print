import { Input } from '@/components/ui/input';
import { SubmitButton } from '../ui/submit-button';
import { editTeamName } from '@/lib/actions/teams';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Label } from '../ui/label';
import { GetAccountResponse } from '@usebasejump/shared';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Terminal, MessageCircleWarningIcon } from 'lucide-react';

type Props = {
  account: GetAccountResponse;
};

export default function EditTeamName({ account }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Info</CardTitle>
        <CardDescription>
          Your team name and identifier are unique for your team
        </CardDescription>
      </CardHeader>
        <Alert className='max-w-[90%] mb-6 justify-self-center' variant='destructive'>
          <MessageCircleWarningIcon className='h-4 w-4' />
          <AlertTitle>Warning!</AlertTitle>
          <AlertDescription>
            Changing your team name will also changes the format of your QR
            Code!
          </AlertDescription>
        </Alert>
      <form className='animate-in flex-1 text-foreground'>
        <input type='hidden' name='accountId' value={account.account_id} />
        <CardContent className='flex flex-col gap-y-6'>
          <div className='flex flex-col gap-y-2'>
            <Label htmlFor='name'>Team Name</Label>
            <Input
              defaultValue={account.name}
              name='name'
              placeholder='My Team'
              required
            />
          </div>
        </CardContent>
        <CardFooter>
          <SubmitButton formAction={editTeamName} pendingText='Updating...'>
            Save
          </SubmitButton>
        </CardFooter>
      </form>
    </Card>
  );
}
