const { supabaseAdmin } = require('../config/supabase');

function round2(n) {
  if (n == null || !Number.isFinite(n)) return null;
  return Math.round(n * 100) / 100;
}

function strOrNull(v) {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s === '' ? null : s;
}

function parseAge(val) {
  const n = parseInt(String(val ?? '').trim(), 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Accepts "170 cm", "1.7", "5'7", "5 ft 7 in" — returns cm or null */
function parseHeightCm(raw) {
  if (raw === undefined || raw === null || raw === '') return null;
  const s = String(raw).trim().toLowerCase();
  const cmMatch = s.match(/([\d.]+)\s*cm\b/);
  if (cmMatch) return round2(parseFloat(cmMatch[1]));

  const ftIn =
    s.match(/(\d+)\s*['′]\s*([\d.]+)/) ||
    s.match(/(\d+)\s*ft\s*([\d.]+)\s*in\b/) ||
    s.match(/(\d+)\s*ft\s*(\d+)\s*in\b/);
  if (ftIn) {
    const feet = parseFloat(ftIn[1]);
    const inches = parseFloat(ftIn[2]);
    if (Number.isFinite(feet) && Number.isFinite(inches)) {
      return round2((feet * 12 + inches) * 2.54);
    }
  }

  const n = parseFloat(s.replace(/[^\d.]/g, ''));
  if (!Number.isFinite(n) || n <= 0) return null;
  if (n < 3) return round2(n * 100);
  return round2(n);
}

/** Assumes kg unless "lb" / "lbs" */
function parseWeightKg(raw) {
  if (raw === undefined || raw === null || raw === '') return null;
  const s = String(raw).trim().toLowerCase();
  const lbMatch = s.match(/([\d.]+)\s*(lb|lbs|pound)s?\b/);
  if (lbMatch) return round2(parseFloat(lbMatch[1]) * 0.45359237);
  const kgMatch = s.match(/([\d.]+)\s*kg\b/);
  if (kgMatch) return round2(parseFloat(kgMatch[1]));
  const n = parseFloat(s.replace(/[^\d.]/g, ''));
  if (!Number.isFinite(n) || n <= 0) return null;
  return round2(n);
}

function equipmentToText(equipment) {
  if (!equipment || typeof equipment !== 'object') return null;
  const labels = { stove: 'stove', microwave: 'microwave', airFryer: 'air fryer' };
  const parts = Object.entries(equipment)
    .filter(([, on]) => on)
    .map(([k]) => labels[k] || k);
  return parts.length ? parts.join(', ') : null;
}

function mapBodyToRow(accountId, body) {
  const b = body || {};
  return {
    account_id: accountId,
    age: parseAge(b.age),
    sex: strOrNull(b.sex ?? b.sexGender),
    height_cm: parseHeightCm(b.height_cm ?? b.height),
    weight_kg: parseWeightKg(b.weight_kg ?? b.weight),
    goal: strOrNull(b.goal),
    activity_level: strOrNull(b.activity_level ?? b.activityLevel),
    budget: strOrNull(b.budget ?? b.foodBudget),
    cuisine_pref: strOrNull(b.cuisine_pref ?? b.preferredCuisine),
    cooking_time: strOrNull(b.cooking_time ?? b.maxCookingTime),
    cooking_skill: strOrNull(b.cooking_skill ?? b.cookingSkillLevel),
    available_equipment: strOrNull(b.available_equipment) ?? equipmentToText(b.kitchenEquipment),
    allergies: strOrNull(b.allergies),
    dislikes: strOrNull(b.dislikes ?? b.foodsDislike),
    medical_condition: strOrNull(b.medical_condition ?? b.medicalConditions),
    carb_goal: strOrNull(b.carb_goal ?? b.carbPreference),
    fat_goal: strOrNull(b.fat_goal ?? b.fatPreference),
    hydration_goal: Boolean(b.hydration_goal ?? b.includeWaterGoal),
    snack_pref: Boolean(b.snack_pref ?? b.includeSnacks),
    schedule: strOrNull(b.schedule ?? b.mealSchedule),
    grocery_list: Boolean(b.grocery_list ?? b.generateGroceryList),
    status: b.status !== undefined ? Boolean(b.status) : true,
  };
}

const SELECT_COLUMNS =
  'id, account_id, meal_plan_id, age, sex, height_cm, weight_kg, goal, activity_level, budget, cuisine_pref, cooking_time, cooking_skill, available_equipment, allergies, dislikes, medical_condition, carb_goal, fat_goal, hydration_goal, snack_pref, schedule, grocery_list, created_at, status';

async function deactivateActiveMealPlans(accountId) {
  const { error } = await supabaseAdmin
    .from('meal_plan')
    .update({ status: false })
    .eq('account_id', accountId)
    .eq('status', true);

  if (error) {
    throw error;
  }
}

async function getActiveMealPlan(accountId) {
  const { data, error } = await supabaseAdmin
    .from('meal_plan')
    .select(SELECT_COLUMNS)
    .eq('account_id', accountId)
    .eq('status', true)
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    throw error;
  }

  return data && data.length > 0 ? data[0] : null;
}

async function createMealPlan(accountId, body) {
  await deactivateActiveMealPlans(accountId);
  const row = mapBodyToRow(accountId, { ...body, status: true });

  const { data, error } = await supabaseAdmin.from('meal_plan').insert([row]).select(SELECT_COLUMNS).single();

  if (error) {
    throw error;
  }

  return data;
}

async function listMealPlans(accountId, limit = 20) {
  const { data, error } = await supabaseAdmin
    .from('meal_plan')
    .select(SELECT_COLUMNS)
    .eq('account_id', accountId)
    .order('created_at', { ascending: false })
    .limit(Math.min(Number(limit) || 20, 100));

  if (error) {
    throw error;
  }

  return data || [];
}

module.exports = {
  createMealPlan,
  listMealPlans,
  getActiveMealPlan,
  deactivateActiveMealPlans,
};
