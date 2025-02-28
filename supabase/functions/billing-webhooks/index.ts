/***
 * THESE FUNCTIONS ARE FOR TESTING PURPOSES ONLY.
 * TO SETUP ON YOUR OWN, HEAD TO https://usebasejump.com
 */

import {serve} from "https://deno.land/std@0.168.0/http/server.ts";
import {billingWebhooksWrapper, stripeWebhookHandler} from "https://raw.githubusercontent.com/bryanmoon1991/basejump-deno-packages/refs/heads/main/billing-functions/mod.ts";


import Stripe from "https://esm.sh/stripe@11.1.0?target=deno";

const stripeClient = new Stripe(Deno.env.get("STRIPE_API_KEY") as string, {
    // This is needed to use the Fetch API rather than relying on the Node http
    // package.
    apiVersion: "2022-11-15",
    httpClient: Stripe.createFetchHttpClient(),
});

const stripeResponse = stripeWebhookHandler({
    stripeClient,
    stripeWebhookSigningSecret: Deno.env.get("STRIPE_WEBHOOK_SIGNING_SECRET") as string,
});

const webhookEndpoint = billingWebhooksWrapper(stripeResponse);

serve(async (req) => {
    const response = await webhookEndpoint(req);
    return response;
});
