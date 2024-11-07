'use server';

import { redirect } from 'next/navigation';
import { createClient } from '../supabase/server';
import QueueManager from '@/lib/redis/qclient'

export async function createTeam(prevState: any, formData: FormData) {
  'use server';

  const name = formData.get('name') as string;
  const slug = formData.get('slug') as string;
  const supabase = createClient();

  const { data, error } = await supabase.rpc('create_account', {
    name,
    slug,
  });

  if (error) {
    return {
      message: error.message,
    };
  }

  redirect(`/dashboard/${data.slug}`);
}

export async function editTeamName(prevState: any, formData: FormData) {
  'use server';

  const name = formData.get('name') as string;
  const accountId = formData.get('accountId') as string;
  const supabase = createClient();

  const { error } = await supabase.rpc('update_account', {
    name,
    account_id: accountId,
  });

  if (error) {
    return {
      message: error.message,
    };
  }
}

export async function editTeamSlug(prevState: any, formData: FormData) {
  'use server';

  const slug = formData.get('slug') as string;
  const accountId = formData.get('accountId') as string;
  const supabase = createClient();

  const { data, error } = await supabase.rpc('update_account', {
    slug,
    account_id: accountId,
  });

  if (error) {
    return {
      message: error.message,
    };
  }

  redirect(`/dashboard/${data.slug}/settings`);
}

export async function editTeamMetadata(prevState: any, formData: FormData) {
  'use server';

  function getFiringTypes(data: Record<string, any>): string[] {
    const firingTypes: string[] = [];
    Object.keys(data).forEach((key) => {
      if (key.startsWith('firing_types')) {
        firingTypes.push(data[key]);
      }
    });

    return firingTypes;
  }

  // console.log('inSubmit', formData)

  const generic = {
    member_cost: 0.0,
    non_member_cost: 0.0,
    firing_types: [''],
    opt_in: { required: false },
    terms_and_conditions: '',
  };

  const member_cost = formData.get('member_cost') as string;
  const non_member_cost = formData.get('non_member_cost') as string;
  const opt_in = formData.get('opt_in') as string;
  const terms_and_conditions = formData.get('terms_and_conditions') as string;

  generic.member_cost = +parseFloat(member_cost).toFixed(2);
  generic.non_member_cost = +parseFloat(non_member_cost).toFixed(2);
  generic.firing_types = getFiringTypes(Object.fromEntries(formData));
  generic.opt_in.required = opt_in === 'true' ? true : false;
  generic.terms_and_conditions = terms_and_conditions;

  // console.log('inSubmit 2', generic)

  const accountId = formData.get('accountId') as string;
  const supabase = createClient();

  const { data, error } = await supabase.rpc('update_account', {
    public_metadata: generic,
    account_id: accountId,
  });

  if (error) {
    return {
      message: error.message,
    };
  }

  redirect(`/dashboard/${data.slug}/settings`);
}

export async function addKilnRequest(prevState: any, formData: FormData) {
  'use server';

  const slug = formData.get('slug') as string;
  const accountId = formData.get('accountId') as string;
  const firstName = formData.get('first_name') as string;
  const lastName = formData.get('last_name') as string;
  const optIn = formData.get('opt_in') as string;
  const length = formData.get('length') as string;
  const width = formData.get('width') as string;
  const height = formData.get('height') as string;
  const quantity = formData.get('quantity') as string;
  const cost = formData.get('cost') as string;
  const firingType = formData.get('firing_type') as string;
  const nonMember = formData.get('non_member') as string;
  const photoUrl = formData.get('photo_url') as string;
  const supabase = createClient();


  const { data, error } = await supabase
    .from('kiln_requests')
    .insert([
      {
        account_id: accountId,
        first_name: firstName,
        last_name: lastName,
        opt_in: optIn,
        length,
        width,
        height,
        quantity,
        cost,
        firing_type: firingType,
        non_member: nonMember,
        photo_url: photoUrl,
      },
    ])
    .select()


  if (error) {
    return {
      message: error.message,
    };
  } else {
    const record = data[0]
    const result = await QueueManager.addJob(accountId, record);

    // Check if the job was successfully added to the Redis list
    if (result > 0) {
      console.log('successfully added to redis')
    } else {
      console.log('could not add to redis')
    }
    // console.log('AFTER SUBMIT', data)
    redirect(`/qrform/${slug}/after-form?accountId=${accountId}&recordId=${record.id}`);
  }
}

export async function updateKilnRequest(prevState: any, formData: FormData) {
  'use server';

  const id = formData.get('record_id') as string;
  const firstName = formData.get('first_name') as string;
  const lastName = formData.get('last_name') as string;
  const length = formData.get('length') as string;
  const width = formData.get('width') as string;
  const height = formData.get('height') as string;
  const quantity = formData.get('quantity') as string;
  const cost = formData.get('cost') as string;
  const firingType = formData.get('firing_type') as string;
  const nonMember = formData.get('non_member') as string;
  const supabase = createClient();

  console.log('cost', cost)

  const { data, error } = await supabase
  .from('kiln_requests')
  .update({ 
    first_name: firstName,
    last_name: lastName,
    length,
    width,
    height,
    quantity,
    cost,
    firing_type: firingType,
    non_member: nonMember,
  })
  .eq('id', id)
  .select()

  if (error) {
    return {
      message: error.message,
    };
  } else {
    const record = data[0]
    return record
  }
}
