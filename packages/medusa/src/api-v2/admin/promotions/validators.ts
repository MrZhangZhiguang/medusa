import {
  ApplicationMethodAllocation,
  ApplicationMethodTargetType,
  ApplicationMethodType,
  CampaignBudgetType,
  PromotionRuleOperator,
  PromotionType,
} from "@medusajs/utils"
import { z } from "zod"
import {
  createFindParams,
  createOperatorMap,
  createSelectParams,
} from "../../utils/validators"

export type AdminGetPromotionParamsType = z.infer<
  typeof AdminGetPromotionParams
>
export const AdminGetPromotionParams = createSelectParams()

export type AdminGetPromotionsParamsType = z.infer<
  typeof AdminGetPromotionsParams
>
export const AdminGetPromotionsParams = createFindParams({
  limit: 50,
  offset: 0,
})
  .merge(
    z.object({
      q: z.string().optional(),
      code: z.union([z.string(), z.array(z.string())]).optional(),
      campaign_id: z.union([z.string(), z.array(z.string())]).optional(),
      created_at: createOperatorMap().optional(),
      updated_at: createOperatorMap().optional(),
      deleted_at: createOperatorMap().optional(),
      $and: z.lazy(() => AdminGetPromotionsParams.array()).optional(),
      $or: z.lazy(() => AdminGetPromotionsParams.array()).optional(),
    })
  )
  .strict()

export type AdminGetPromotionRuleParamsType = z.infer<
  typeof AdminGetPromotionRuleParams
>
export const AdminGetPromotionRuleParams = createSelectParams()

export type AdminGetPromotionRuleTypeParamsType = z.infer<
  typeof AdminGetPromotionRuleTypeParams
>
export const AdminGetPromotionRuleTypeParams = createSelectParams()

export type AdminGetPromotionsRuleValueParamsType = z.infer<
  typeof AdminGetPromotionsRuleValueParams
>
export const AdminGetPromotionsRuleValueParams = createFindParams({
  limit: 100,
  offset: 0,
}).merge(
  z.object({
    q: z.string().optional(),
  })
)

export type AdminCreatePromotionRuleType = z.infer<
  typeof AdminCreatePromotionRule
>
export const AdminCreatePromotionRule = z
  .object({
    operator: z.nativeEnum(PromotionRuleOperator),
    description: z.string().optional(),
    attribute: z.string(),
    values: z.array(z.string()),
  })
  .strict()

export type AdminUpdatePromotionRuleType = z.infer<
  typeof AdminUpdatePromotionRule
>
export const AdminUpdatePromotionRule = z
  .object({
    id: z.string(),
    operator: z.nativeEnum(PromotionRuleOperator).optional(),
    description: z.string().optional(),
    attribute: z.string().optional(),
    values: z.array(z.string()).optional(),
  })
  .strict()

export type AdminCreateApplicationMethodType = z.infer<
  typeof AdminCreateApplicationMethod
>
export const AdminCreateApplicationMethod = z
  .object({
    description: z.string().optional(),
    value: z.number(),
    max_quantity: z.number().optional(),
    type: z.nativeEnum(ApplicationMethodType),
    target_type: z.nativeEnum(ApplicationMethodTargetType),
    allocation: z.nativeEnum(ApplicationMethodAllocation).optional(),
    target_rules: z.array(AdminCreatePromotionRule).optional(),

    buy_rules: z.array(AdminCreatePromotionRule).optional(),
    apply_to_quantity: z.number().optional(),
    buy_rules_min_quantity: z.number().optional(),
  })
  .strict()

export type AdminUpdateApplicationMethodType = z.infer<
  typeof AdminUpdateApplicationMethod
>
export const AdminUpdateApplicationMethod = z
  .object({
    description: z.string().optional(),
    value: z.string().optional(),
    max_quantity: z.number().optional(),
    type: z.nativeEnum(ApplicationMethodType).optional(),
    target_type: z.nativeEnum(ApplicationMethodTargetType).optional(),
    allocation: z.nativeEnum(ApplicationMethodAllocation).optional(),
    target_rules: z.array(AdminCreatePromotionRule).optional(),
    buy_rules: z.array(AdminCreatePromotionRule).optional(),
    apply_to_quantity: z.number().optional(),
    buy_rules_min_quantity: z.number().optional(),
  })
  .strict()

const promoRefinement = (promo) => {
  if (promo.campaign && promo.campaign_id) {
    return false
  }

  if (promo.type === PromotionType.BUYGET) {
    const appMethod = promo.application_method
    return (
      (appMethod?.buy_rules?.length ?? 0) > 0 &&
      appMethod?.apply_to_quantity !== undefined &&
      appMethod?.buy_rules_min_quantity !== undefined
    )
  }

  return true
}

// Ideally we don't allow for creation of campaigns through promotions, it should be the other way around.
const CreateCampaignBudget = z.object({
  type: z.nativeEnum(CampaignBudgetType),
  limit: z.number(),
})

export type AdminCreateCampaignType = z.infer<typeof AdminCreateCampaign>
export const AdminCreateCampaign = z.object({
  name: z.string(),
  campaign_identifier: z.string(),
  description: z.string().optional(),
  currency: z.string().optional(),
  budget: CreateCampaignBudget.optional(),
  starts_at: z.coerce.date().optional(),
  ends_at: z.coerce.date().optional(),
})

export type AdminCreatePromotionType = z.infer<typeof AdminCreatePromotion>
export const AdminCreatePromotion = z
  .object({
    code: z.string(),
    is_automatic: z.boolean().optional(),
    type: z.nativeEnum(PromotionType),
    campaign_id: z.string().optional().nullable(),
    campaign: AdminCreateCampaign.optional(),
    application_method: AdminCreateApplicationMethod,
    rules: z.array(AdminCreatePromotionRule).optional(),
  })
  .strict()
  // In the case of a buyget promotion, we require at least one buy rule and quantities
  .refine(promoRefinement, {
    message:
      "Buyget promotions require at least one buy rule and quantities to be defined",
  })

export type AdminUpdatePromotionType = z.infer<typeof AdminUpdatePromotion>
export const AdminUpdatePromotion = z
  .object({
    code: z.string().optional(),
    is_automatic: z.boolean().optional(),
    type: z.nativeEnum(PromotionType).optional(),
    campaign_id: z.string().optional().nullable(),
    campaign: AdminCreateCampaign.optional(),
    application_method: AdminUpdateApplicationMethod.optional(),
    rules: z.array(AdminCreatePromotionRule).optional(),
  })
  .strict()
  // In the case of a buyget promotion, we require at least one buy rule and quantities
  .refine(promoRefinement, {
    message:
      "Buyget promotions require at least one buy rule and quantities to be defined",
  })
