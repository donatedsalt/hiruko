import { httpRouter } from "convex/server";
import { Webhook } from "svix";

import { httpAction } from "@/convex/_generated/server";
import { internal } from "@/convex/_generated/api";

const http = httpRouter();

http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const secret = process.env.CLERK_WEBHOOK_SECRET;
    if (!secret) {
      return new Response("CLERK_WEBHOOK_SECRET not configured", {
        status: 500,
      });
    }

    const svixId = request.headers.get("svix-id");
    const svixTimestamp = request.headers.get("svix-timestamp");
    const svixSignature = request.headers.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
      return new Response("Missing svix headers", { status: 400 });
    }

    const payload = await request.text();

    let event: { type: string; data: { id: string } };
    try {
      event = new Webhook(secret).verify(payload, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      }) as { type: string; data: { id: string } };
    } catch {
      return new Response("Invalid signature", { status: 401 });
    }

    if (event.type === "user.created") {
      await ctx.runMutation(internal.users.mutations.initializeUser, {
        userId: event.data.id,
      });
    }

    return new Response(null, { status: 200 });
  }),
});

export default http;
