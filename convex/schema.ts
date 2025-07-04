import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Define the schema for the users table
  users: defineTable({
    name: v.string(),
    email: v.string(),
    image: v.optional(v.string()),
    clerkId: v.string(),
  }).index("by_clerk_id", ["clerkId"]),

  // Define the schema for the plans table
  plans: defineTable({
    userId: v.string(),
    name: v.string(),
    workoutPlan: v.object({
      schedule: v.array(v.string()), // e.g., ["Monday", "Wednesday", "Friday"]
      exercises: v.array(
        v.object({
          day: v.string(), // e.g., "Monday"
          routines: v.array(
            v.object({
              name: v.string(),
              sets: v.optional(v.number()),
              reps: v.optional(v.number()),
              duration: v.optional(v.string()),
              description: v.optional(v.string()),
              exercises: v.optional(v.array(v.string())), // e.g., ["Push-ups", "Squats"]
            })
          ),
        }),
      ),
    }),

    dietPlan: v.object({
      dailyCalories: v.number(),
      meals: v.array(v.object({
          name: v.string(), // e.g., "Breakfast"
          foods: v.array(v.string())
        })),
    }),

    isActive: v.boolean(), // Indicates if the plan is currently active

  })
    .index("by_user_id", ["userId"])
    .index("by_active", ["isActive"]),
})