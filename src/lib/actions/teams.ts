'use server';

import { redirect } from 'next/navigation';
import { createClient } from '../supabase/server';
import QueueManager from '@/lib/redis/qclient';

type Cost = {
  pricing_category: string;
  rate_amount: number;
  enforce_minimum: boolean;
};

interface TeamMetadata {
  member_cost: number;
  non_member_cost: number;
  minimum_cost: number;
  costs: Cost[]; // <-- Make sure we declare costs here
  logo: {
    logo_url: string;
    filename: string;
  };
  firing_types: string[];
  opt_in: {
    required: boolean;
  };
  terms_and_conditions: string;
  // ... other properties
}

export async function createTeam(prevState: any, formData: FormData) {
  'use server';

  const name = formData.get('name') as string;
  const slug = formData.get('name') as string;
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
    slug: name,
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

  function getCosts(data: Record<string, any>): Cost[] {
    // This will store partial Cost objects keyed by index
    const costsMap: Record<number, Partial<Cost>> = {};

    Object.keys(data).forEach((key) => {
      if (key.startsWith('pricing_category-')) {
        // Extract the index from the field name, e.g. 'pricing_category-2' => 2
        const index = parseInt(key.replace('pricing_category-', ''), 10);
        if (!costsMap[index]) costsMap[index] = {};
        costsMap[index].pricing_category = data[key];
      }

      if (key.startsWith('rate_amount-')) {
        const index = parseInt(key.replace('rate_amount-', ''), 10);
        if (!costsMap[index]) costsMap[index] = {};
        costsMap[index].rate_amount = parseFloat(data[key]) || 0;
      }

      if (key.startsWith('enforce_minimum-')) {
        const index = parseInt(key.replace('enforce_minimum-', ''), 10);
        if (!costsMap[index]) costsMap[index] = {};
        // If the checkbox is checked, the value can be `'on'` or `'true'`
        costsMap[index].enforce_minimum = data[key] === 'on';
      }
    });

    // Convert the partial objects in costsMap into a clean array of Cost objects
    const costs: Cost[] = Object.keys(costsMap).map((idx) => {
      const partial = costsMap[+idx];
      return {
        pricing_category: partial.pricing_category ?? '',
        rate_amount: partial.rate_amount ?? 0,
        enforce_minimum: partial.enforce_minimum ?? false,
      };
    });

    return costs;
  }

  const generic: TeamMetadata = {
    member_cost: 0.0,
    non_member_cost: 0.0,
    minimum_cost: 0.0,
    costs: [],
    logo: {
      logo_url: '',
      filename: '',
    },
    firing_types: [''],
    opt_in: { required: false },
    terms_and_conditions: '',
  };

  const member_cost = formData.get('member_cost') as string;
  const non_member_cost = formData.get('non_member_cost') as string;
  const minimum_cost = formData.get('minimum_cost') as string;
  const opt_in = formData.get('opt_in') === 'on' ? true : false;
  const terms_and_conditions = formData.get('terms_and_conditions') as string;
  const logo_url = formData.get('logo_url') as string;
  const filename = formData.get('filename') as string;

  const objectFromForm = Object.fromEntries(formData);

  generic.member_cost = +parseFloat(member_cost).toFixed(2);
  generic.non_member_cost = +parseFloat(non_member_cost).toFixed(2);
  generic.minimum_cost =
    +parseFloat(minimum_cost).toFixed(2) || generic.minimum_cost;
  generic.firing_types = getFiringTypes(objectFromForm);
  generic.costs = getCosts(objectFromForm);
  generic.opt_in.required = opt_in;
  generic.terms_and_conditions = terms_and_conditions;
  generic.logo = {
    logo_url,
    filename,
  };

  const accountId = formData.get('accountId') as string;
  const supabase = createClient();

  console.log('Submitting metadata update for: ', accountId, generic);

  const { data, error } = await supabase.rpc('update_account', {
    public_metadata: generic,
    account_id: accountId,
  });

  if (error) {
    console.error('Error updating account metadata:', error);
    return {
      message: error.message,
    };
  }
}

export async function addKilnRequest(prevState: any, formData: FormData) {
  'use server';

  const slug = formData.get('slug') as string;
  const accountId = formData.get('accountId') as string;
  const firstName = formData.get('first_name') as string;
  const lastName = formData.get('last_name') as string;
  const email = formData.get('email') as string;
  const optIn = formData.get('opt_in') as string;
  const length = formData.get('length') as string;
  const width = formData.get('width') as string;
  const height = formData.get('height') as string;
  const rounded_length = formData.get('rounded_length') as string;
  const rounded_width = formData.get('rounded_width') as string;
  const rounded_height = formData.get('rounded_height') as string;
  const quantity = formData.get('quantity') as string;
  const cost = formData.get('cost') as string;
  const firingType = formData.get('firing_type') as string;
  // const nonMember = formData.get('non_member') as string;
  const pricingCategory = formData.get('pricing_category') as string;
  const rateAmount = formData.get('rate_amount') as string;
  const photoUrl = formData.get('photo_url') as string;
  const supabase = createClient();

  const { data, error } = await supabase
    .from('kiln_requests')
    .insert([
      {
        account_id: accountId,
        first_name: firstName,
        last_name: lastName,
        email,
        opt_in: optIn,
        length,
        width,
        height,
        rounded_length,
        rounded_width,
        rounded_height,
        quantity,
        cost,
        firing_type: firingType,
        // non_member: nonMember,
        pricing_category: pricingCategory,
        rate_amount: rateAmount,
        photo_url: photoUrl,
      },
    ])
    .select();

  if (error) {
    return {
      message: error.message,
    };
  } else {
    const record = data[0];
    const result = await QueueManager.addJob(accountId, record);

    // Check if the job was successfully added to the Redis list
    if (result > 0) {
      console.log('Successfully added to redis queue: ', accountId, record);
    } else {
      console.error('Could not add to redis queue: ', accountId, record);
    }
    redirect(
      `/qrform/${slug}/after-form?accountId=${accountId}&recordId=${record.id}`
    );
  }
}

export async function updateKilnRequest(prevState: any, formData: FormData) {
  'use server';

  const id = formData.get('record_id') as string;
  const first_name = formData.get('first_name') as string;
  const last_name = formData.get('last_name') as string;
  const email = formData.get('email') as string;
  const length = formData.get('length') as string;
  const width = formData.get('width') as string;
  const height = formData.get('height') as string;
  const rounded_length = formData.get('rounded_length') as string;
  const rounded_width = formData.get('rounded_width') as string;
  const rounded_height = formData.get('rounded_height') as string;
  const quantity = formData.get('quantity') as string;
  const cost = formData.get('cost') as string;
  const firing_type = formData.get('firing_type') as string;
  // const nonMember = formData.get('non_member') as string;
  const pricing_category = formData.get('pricing_category') as string;
  const rate_amount = formData.get('rate_amount') as string;
  const supabase = createClient();

  const { data, error } = await supabase
    .from('kiln_requests')
    .update({
      first_name,
      last_name,
      email,
      length,
      width,
      height,
      rounded_length,
      rounded_width,
      rounded_height,
      quantity,
      cost,
      firing_type,
      pricing_category,
      rate_amount,
      // non_member: nonMember,
    })
    .eq('id', id)
    .select();

  if (error) {
    console.error('Error updating kiln request with ID: ', id, error);
    return {
      message: error.message,
    };
  } else {
    const record = data[0];
    console.log('Successfully updated kiln request with ID: ', id, record);
    return record;
  }
}
