const { supabaseAdmin } = require('../config/supabase');
const { searchRecipes } = require('./recipes');

// Schema provided shows the canonical table name is `meal_plan`.
// Keep `meal_plans` as fallback for older/newer deployments.
const MEAL_PLAN_TABLE_PRIMARY = 'meal_plan';
const MEAL_PLAN_TABLE_FALLBACK = 'meal_plans';

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
  const rawResponse = b.response ?? b.mealPlanResponse ?? b.meal_plan_response ?? null;
  const normalizedResponse = (() => {
    if (rawResponse === undefined || rawResponse === null) return null;
    if (typeof rawResponse === 'string') return rawResponse;
    try {
      return JSON.stringify(rawResponse);
    } catch {
      return String(rawResponse);
    }
  })();

  return {
    account_id: accountId,
    profile_id: strOrNull(b.profileId ?? b.profile_id),
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
    response: normalizedResponse,
  };
}

function mealPlanEquipmentText(equipment) {
  if (!equipment || typeof equipment !== 'object') return 'none';
  const labels = { stove: 'stove', microwave: 'microwave', airFryer: 'air fryer' };
  const parts = Object.entries(equipment)
    .filter(([, enabled]) => Boolean(enabled))
    .map(([key]) => labels[key] || key);
  return parts.length ? parts.join(', ') : 'none';
}

function hasValue(v) {
  return !(v === undefined || v === null || String(v).trim() === '');
}

function isLikelyJumbledToken(token) {
  const clean = String(token || '').toLowerCase().replace(/[^a-z]/g, '');
  if (clean.length < 4) return false;

  const vowelCount = (clean.match(/[aeiou]/g) || []).length;
  const vowelRatio = vowelCount / clean.length;

  // Examples caught: "akjndsja", "xqtrplmn", "zxcvbnm"
  if (vowelCount === 0) return true;
  if (clean.length >= 7 && vowelRatio < 0.2) return true;
  return false;
}

function hasLikelyJumbledText(value) {
  const text = String(value || '').trim();
  if (!text) return false;
  const tokens = text.split(/[\s,;/|]+/).filter(Boolean);
  if (tokens.length === 0) return false;
  return tokens.some((token) => isLikelyJumbledToken(token));
}

function isFoodLikeFreeText(value) {
  const text = String(value || '').trim();
  if (!text) return true;

  // Keep this conservative: allow letters, spaces, commas, hyphens, apostrophes, periods, and parentheses.
  // Disallow digits and weird symbols so random strings get blocked early.
  if (text.length > 120) return false;
  if (/\d/.test(text)) return false;
  if (!/^[a-zA-Z\s,.'()\-]+$/.test(text)) return false;

  const tokens = text.split(/[\s,;/|]+/).filter(Boolean);
  if (tokens.length === 0) return false;
  if (tokens.some((t) => t.length > 30)) return false;
  return true;
}

function validateMealPlanBody(body = {}) {
  const errors = [];

  if (hasValue(body.age)) {
    const parsedAge = parseAge(body.age);
    if (parsedAge == null) {
      errors.push('Age must be a valid whole number.');
    } else if (parsedAge < 0 || parsedAge > 100) {
      errors.push('Age is invalid.');
    }
  }

  if (hasValue(body.height)) {
    const parsedHeight = parseHeightCm(body.height);
    if (parsedHeight == null) {
      errors.push('Height must be valid (example: "170 cm" or "5\'7").');
    } else if (parsedHeight < 50 || parsedHeight > 260) {
      errors.push('Height is invalid.');
    }
  }

  if (hasValue(body.weight)) {
    const parsedWeight = parseWeightKg(body.weight);
    if (parsedWeight == null) {
      errors.push('Weight must be valid (example: "70 kg" or "154 lbs").');
    } else if (parsedWeight < 25 || parsedWeight > 350) {
      errors.push('Weight must be between 25 kg and 350 kg.');
    }
  }

  if (hasValue(body.allergies) && hasLikelyJumbledText(body.allergies)) {
    errors.push('Allergies looks invalid. Please enter clear words (example: "Nuts, Dairy").');
  }
  if (hasValue(body.allergies) && !isFoodLikeFreeText(body.allergies)) {
    errors.push('Allergies must be real words only (letters/commas). Example: "Nuts, Dairy".');
  }

  if (hasValue(body.medicalConditions) && hasLikelyJumbledText(body.medicalConditions)) {
    errors.push('Medical conditions looks invalid. Please enter clear words (example: "Diabetes").');
  }
  if (hasValue(body.medicalConditions) && !isFoodLikeFreeText(body.medicalConditions)) {
    errors.push('Medical conditions must be real words only (letters/commas). Example: "Diabetes".');
  }

  if (hasValue(body.foodsDislike) && hasLikelyJumbledText(body.foodsDislike)) {
    errors.push('Foods to avoid looks invalid. Please enter clear words (example: "Onion, Ampalaya").');
  }
  if (hasValue(body.foodsDislike) && !isFoodLikeFreeText(body.foodsDislike)) {
    errors.push('Foods to avoid must be food words only (letters/commas). Example: "Onion, Ampalaya".');
  }

  if (errors.length > 0) {
    const error = new Error(`Invalid meal plan input: ${errors.join(' ')}`);
    error.statusCode = 400;
    throw error;
  }
}

function mealPlanPromptFromBody(body = {}) {
  // Intentionally plain: the full "chef chatbot + JSON schema" wrapper is handled by `searchRecipes`
  // so the prompt stays consistent with `recipes.js`.
  return [
    'Create a personalized one-day meal plan with exactly 3 meals: breakfast, lunch, and dinner.',
    'Return 3 recipes in this exact order: Breakfast first, Lunch second, Dinner third.',
    'User preferences:',
    `- Age: ${body.age || 'not specified'}`,
    `- Sex/Gender: ${body.sexGender || 'not specified'}`,
    `- Height: ${body.height || 'not specified'}`,
    `- Weight: ${body.weight || 'not specified'}`,
    `- Goal: ${body.goal || 'not specified'}`,
    `- Activity level: ${body.activityLevel || 'not specified'}`,
    `- Preferred cuisine: ${body.preferredCuisine || 'not specified'}`,
    `- Food budget: ${body.foodBudget || 'not specified'}`,
    `- Max cooking time: ${body.maxCookingTime || 'not specified'}`,
    `- Cooking skill level: ${body.cookingSkillLevel || 'not specified'}`,
    `- Carb preference: ${body.carbPreference || 'not specified'}`,
    `- Fat preference: ${body.fatPreference || 'not specified'}`,
    `- Kitchen equipment: ${mealPlanEquipmentText(body.kitchenEquipment)}`,
    `- Allergies: ${body.allergies || 'none'}`,
    `- Medical conditions: ${body.medicalConditions || 'none'}`,
    `- Foods to avoid: ${body.foodsDislike || 'none'}`,
    `- Meal schedule: ${body.mealSchedule || 'not specified'}`,
    'Keep each meal practical and realistic for a not very proficient cook.',
  ].join('\n');
}

async function generateAiMealPlan(body = {}, profiles = []) {
  validateMealPlanBody(body);
  const promptText = mealPlanPromptFromBody(body);
  return searchRecipes({
    profiles: Array.isArray(profiles) ? profiles : [],
    promptText,
    history: [{ role: 'user', content: promptText }],
    numOptions: 3,
    avoidTitles: [],
  });
}

const SELECT_COLUMNS_WITH_PROFILE =
  'id, account_id, profile_id, age, sex, height_cm, weight_kg, goal, activity_level, budget, cuisine_pref, cooking_time, cooking_skill, available_equipment, allergies, dislikes, medical_condition, carb_goal, fat_goal, hydration_goal, snack_pref, schedule, grocery_list, created_at, status, response';
const SELECT_COLUMNS_NO_PROFILE =
  'id, account_id, age, sex, height_cm, weight_kg, goal, activity_level, budget, cuisine_pref, cooking_time, cooking_skill, available_equipment, allergies, dislikes, medical_condition, carb_goal, fat_goal, hydration_goal, snack_pref, schedule, grocery_list, created_at, status, response';

function isMissingProfileIdError(error) {
  if (!error) return false;
  const message = String(error.message || '').toLowerCase();
  const details = String(error.details || '').toLowerCase();
  const code = String(error.code || '').toLowerCase();
  return code === '42703' || message.includes('profile_id') || details.includes('profile_id');
}

function applyMealPlanScope(query, profileId, includeProfileColumn = true) {
  if (!includeProfileColumn) {
    return query;
  }
  if (profileId === undefined || profileId === null || String(profileId).trim() === '') {
    return query;
  }
  return query.eq('profile_id', profileId);
}

function isMissingTableError(error) {
  if (!error) return false;
  const message = String(error.message || '').toLowerCase();
  const details = String(error.details || '').toLowerCase();
  const code = String(error.code || '').toLowerCase();
  return code === '42p01' || message.includes('does not exist') || details.includes('does not exist');
}

async function runWithMealPlanTable(op) {
  const primary = await op(MEAL_PLAN_TABLE_PRIMARY);
  if (!primary?.error) return primary;
  if (!isMissingTableError(primary.error)) return primary;
  return op(MEAL_PLAN_TABLE_FALLBACK);
}

async function deactivateActiveMealPlans(accountId, profileId = null) {
  const runDeactivate = async (tableName, includeProfileColumn) => {
    let query = supabaseAdmin
      .from(tableName)
      .update({ status: false })
      .eq('account_id', accountId)
      .eq('status', true);

    query = applyMealPlanScope(query, profileId, includeProfileColumn);
    return query;
  };

  const { error } = await runWithMealPlanTable((tableName) => runDeactivate(tableName, true));
  if (error) {
    if (isMissingProfileIdError(error)) {
      const fallback = await runWithMealPlanTable((tableName) => runDeactivate(tableName, false));
      if (fallback.error) throw fallback.error;
      return;
    }
    throw error;
  }
}

async function getActiveMealPlan(accountId, profileId = null) {
  const runQuery = async (tableName, includeProfileColumn) => {
    const selectColumns = includeProfileColumn ? SELECT_COLUMNS_WITH_PROFILE : SELECT_COLUMNS_NO_PROFILE;
    let query = supabaseAdmin
      .from(tableName)
      .select(selectColumns)
      .eq('account_id', accountId)
      .eq('status', true)
      .order('created_at', { ascending: false })
      .limit(1);

    query = applyMealPlanScope(query, profileId, includeProfileColumn);
    return query;
  };

  let { data, error } = await runWithMealPlanTable((tableName) => runQuery(tableName, true));
  if (error) {
    if (isMissingProfileIdError(error)) {
      const fallback = await runWithMealPlanTable((tableName) => runQuery(tableName, false));
      if (fallback.error) throw fallback.error;
      data = fallback.data;
      error = null;
    }
  }
  if (error) {
    throw error;
  }

  return data && data.length > 0 ? data[0] : null;
}

async function createMealPlan(accountId, body, profileId = null) {
  validateMealPlanBody(body);
  const makeInsertRow = (includeProfileColumn) => {
    const row = mapBodyToRow(accountId, { ...body, profileId, status: true });
    if (!includeProfileColumn) {
      delete row.profile_id;
    }
    return row;
  };

  const runInsert = async (tableName, includeProfileColumn) => {
    await deactivateActiveMealPlans(accountId, includeProfileColumn ? profileId : null);
    const selectColumns = includeProfileColumn ? SELECT_COLUMNS_WITH_PROFILE : SELECT_COLUMNS_NO_PROFILE;
    const row = makeInsertRow(includeProfileColumn);
    return supabaseAdmin.from(tableName).insert([row]).select(selectColumns).single();
  };

  let { data, error } = await runWithMealPlanTable((tableName) => runInsert(tableName, true));
  if (error && isMissingProfileIdError(error)) {
    const fallback = await runWithMealPlanTable((tableName) => runInsert(tableName, false));
    if (fallback.error) throw fallback.error;
    data = fallback.data;
    error = null;
  }
  if (error) {
    throw error;
  }

  return data;
}

async function listMealPlans(accountId, limit = 20, profileId = null) {
  const runQuery = async (tableName, includeProfileColumn) => {
    const selectColumns = includeProfileColumn ? SELECT_COLUMNS_WITH_PROFILE : SELECT_COLUMNS_NO_PROFILE;
    let query = supabaseAdmin
      .from(tableName)
      .select(selectColumns)
      .eq('account_id', accountId)
      .order('created_at', { ascending: false })
      .limit(Math.min(Number(limit) || 20, 100));

    query = applyMealPlanScope(query, profileId, includeProfileColumn);
    return query;
  };

  let { data, error } = await runWithMealPlanTable((tableName) => runQuery(tableName, true));
  if (error && isMissingProfileIdError(error)) {
    const fallback = await runWithMealPlanTable((tableName) => runQuery(tableName, false));
    if (fallback.error) throw fallback.error;
    data = fallback.data;
    error = null;
  }
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
  generateAiMealPlan,
};
