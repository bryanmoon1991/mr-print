export type KilnRequest = {
  id: string;
  account_id: string;
  first_name: string;
  last_name: string;
  email: string;
  opt_in: boolean | null;
  length: number;
  width: number;
  height: number;
  rounded_length: number;
  rounded_width: number;
  rounded_height: number;
  quantity: number;
  cost: string;
  firing_type: string;
  pricing_category: string;
  rate_amount: number;
  photo_url: string | null;
  printed: boolean;
  exported: boolean;
  updated_at: string;
  created_at: string;
  updated_by: string | null;
  created_by: string | null;
};

export type GroupedData = {
  [fullName: string]: {
    full_name: string;
    email: string | null;
    cost: number;
    total_quantity: number;
    date_range: { earliest: Date | null; latest: Date | null };
  };
};
