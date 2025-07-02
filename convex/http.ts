import { httpRouter } from "convex/server"; // Import the Convex HTTP router
import {WebhookEvent} from "@clerk/nextjs/server"; // Import the Clerk WebhookEvent type
import { Webhook } from "svix"; // Import the svix library for handling webhooks
import { api } from "./_generated/api"; // Import the Convex API in _generated
import { httpAction } from "./_generated/server"; // Import the Convex HTTP action


const http = httpRouter(); // Create a new Convex HTTP router

http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => { //ctx for context
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error("CLERK_WEBHOOK_SECRET missing");
    }

    const svix_id = request.headers.get("svix-id");
    const svix_signature = request.headers.get("svix-signature");
    const svix_timestamp = request.headers.get("svix-timestamp");
    if (!svix_id || !svix_signature || !svix_timestamp) { //malicious user
      return new Response("Missing svix headers", {
        status: 400,
      });
    }

    const payload = await request.json(); // Get the request body as text
    const body = JSON.stringify(payload); // Convert the payload to a JSON string
    const webhook = new Webhook(webhookSecret);

    // verify the webhook event using svix
    let evt: WebhookEvent;
    try {
      evt = webhook.verify(body, {
        "svix-id": svix_id,
        "svix-signature": svix_signature,
        "svix-timestamp": svix_timestamp,
      }) as WebhookEvent; // Verify the webhook event
    } catch (error) {
      console.error("Webhook verification failed:", error);
      return new Response("Invalid webhook signature", {
        status: 400,
      });
    }

    const eventType = evt.type; // Get the event type from the webhook event

    if (eventType == "user.created") //if so, extract user data
    {
      const {id, first_name, last_name, image_url, email_addresses} = evt.data;

      const email = email_addresses[0].email_address;
      const name = `${first_name || ""} ${last_name || ""}`.trim();

      try {
        await ctx.runMutation(api.users.syncUser, { //mutation is to sync the user data with Convex
          email,
          name,
          image: image_url,
          clerkId: id,
        }) //_
      } catch (error) {
        console.error("Error syncing user:", error);
        return new Response("Error syncing user", {
          status: 500,
        });
      }
    };

    // todo: handle user.updated later

    return new Response("Webhook processed successfully", {
      status: 200,
    });

  })

})

export default http; // Export the HTTP router for use in the Convex server



