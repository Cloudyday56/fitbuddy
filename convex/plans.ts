//create a mutation to save the workout plan to the database

import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const createPlan = mutation ({
  args: {
    userId: v.string(),
    name: v.string(),
    workoutPlan: v.object({
      schedule: v.array(v.string()),
      exercises: v.array(
        v.object({
          day: v.string(),
          routines: v.array(
            v.object({
              name: v.string(),
              sets: v.number(),
              reps: v.number(),
            })
          ),
        })
      ),
    }),
    dietPlan: v.object({
      dailyCalories: v.number(),
      meals: v.array(
        v.object({
          name: v.string(),
          foods: v.array(v.string()),
        })
      ),
    }),
    isActive: v.boolean(),
  },

  //create new plan
  handler: async(ctx, args) => {
    //get all active plans of the user
    const activePlans = await ctx.db
      .query("plans")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
    // Deactivate all previous active plans for the user
    for (const plan of activePlans) {
      await ctx.db.patch(plan._id, { isActive: false }); //patch is to update the field
    }
    // Insert the new plan
    const planId = await ctx.db.insert("plans", args);

    return planId;
  }
})
