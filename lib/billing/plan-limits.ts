import type { PlanLimits, UserPlan } from "../emovel-ai/types";

export const PLAN_LIMITS: Record<UserPlan, PlanLimits> = {
  free: {
    plan: "free",
    maxProjects: 1,
    monthlyAiGenerations: 20,
    canCopySections: true,
    canExportPdf: false,
    memory: {
      basic: true,
      advanced: false,
    },
  },
  pro: {
    plan: "pro",
    maxProjects: null,
    monthlyAiGenerations: null,
    canCopySections: true,
    canExportPdf: true,
    memory: {
      basic: true,
      advanced: true,
    },
  },
};

export function getPlanLimits(plan: UserPlan) {
  return PLAN_LIMITS[plan];
}

export function canUseAdvancedMemory(plan: UserPlan) {
  return PLAN_LIMITS[plan].memory.advanced;
}

export function canExportPdf(plan: UserPlan) {
  return PLAN_LIMITS[plan].canExportPdf;
}
