import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const syncUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    clerkId: v.string(),
    image: v.optional(v.string()),
  },

  handler: async (ctx, args) => {
    // Your mutation logic here
    const existingUser = await ctx.db.query("users")
    .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
    .first(); //grab the first user with the same clerkId

    if (existingUser) return;

    // If the user does not exist, insert a new user (save to database)
    return await ctx.db.insert("users", args)
  },
});