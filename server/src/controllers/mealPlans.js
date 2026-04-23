const { supabaseAdmin } = require('../config/supabase');
const { searchRecipes } = require('./recipes');

// Schema provided shows the canonical table name is `meal_plan`.
// Keep `meal_plans` as fallback for older/newer deployments.
const MEAL_PLAN_TABLE_PRIMARY = 'meal_plan';
const MEAL_PLAN_TABLE_FALLBACK = 'meal_plans';
const APPROPRIATE_INPUT_ERROR = 'Inputs must be appropriate.';

const ALLOWED_MEAL_PLAN_FIELDS = new Set([
  'age', 'sex', 'sexGender', 'height', 'height_cm', 'weight', 'weight_kg',
  'goal', 'activityLevel', 'activity_level', 'foodBudget', 'budget',
  'preferredCuisine', 'cuisine_pref', 'maxCookingTime', 'cooking_time',
  'cookingSkillLevel', 'cooking_skill', 'carbPreference', 'carb_goal',
  'fatPreference', 'fat_goal', 'kitchenEquipment', 'available_equipment',
  'allergies', 'foodsDislike', 'dislikes', 'medicalConditions', 'medical_condition',
  'mealSchedule', 'schedule', 'includeWaterGoal', 'hydration_goal',
  'includeSnacks', 'snack_pref', 'generateGroceryList', 'grocery_list',
  'profileId', 'profile_id', 'status', 'response', 'mealPlanResponse', 'meal_plan_response',
  // accepted by route-level callers
  'profiles',
]);

const ALLOWED_KITCHEN_EQUIPMENT_FIELDS = new Set(['stove', 'microwave', 'airFryer', 'oven']);

const SQL_INJECTION_PATTERN = /(\b(select|insert|update|delete|drop|truncate|alter|create|union|exec|execute|grant|revoke)\b|--|\/\*|\*\/|;\s*$|\bor\s+1\s*=\s*1\b|\band\s+1\s*=\s*1\b)/i;
const INAPPROPRIATE_PATTERN = /(\b(rocks?|sand|pen|space chicken|moon rock cheese)\b|\b(how many moons|capital of france|meaning of life)\b|\b(bomb|gun|drug|naked|kidnap|kill|death|die|murder|suicide)\b|\b(build a house|fix a car|program a computer)\b|\b(kill my (wife|husband|child))\b)/i;
const RANDOM_SYMBOL_NOISE_PATTERN = /[^a-zA-Z0-9\s,.'()\-:/+$%]/;

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

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function validateAllowedFields(body = {}) {
  if (!isPlainObject(body)) return;

  const invalidKeys = Object.keys(body).filter((key) => !ALLOWED_MEAL_PLAN_FIELDS.has(key));
  if (invalidKeys.length > 0) {
    const error = new Error(`Invalid meal plan input: unsupported field(s): ${invalidKeys.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  if (body.kitchenEquipment !== undefined) {
    if (!isPlainObject(body.kitchenEquipment)) {
      const error = new Error('Invalid meal plan input: kitchenEquipment must be an object.');
      error.statusCode = 400;
      throw error;
    }
    const invalidEquipmentKeys = Object.keys(body.kitchenEquipment)
      .filter((key) => !ALLOWED_KITCHEN_EQUIPMENT_FIELDS.has(key));
    if (invalidEquipmentKeys.length > 0) {
      const error = new Error(`Invalid meal plan input: unsupported kitchenEquipment field(s): ${invalidEquipmentKeys.join(', ')}`);
      error.statusCode = 400;
      throw error;
    }
  }
}

function hasInappropriateOrInjectionContent(value) {
  if (!hasValue(value)) return false;
  const text = String(value).trim();
  return SQL_INJECTION_PATTERN.test(text) || INAPPROPRIATE_PATTERN.test(text);
}

function hasRandomCharacterNoise(value) {
  if (!hasValue(value)) return false;
  const text = String(value).trim();
  if (text.length > 180) return true;
  if (RANDOM_SYMBOL_NOISE_PATTERN.test(text)) return true;
  if (/([^\w\s])\1{2,}/.test(text)) return true;
  return false;
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
  validateAllowedFields(body);

  const errors = [];
  const strictTextFields = [
    body.goal,
    body.activityLevel ?? body.activity_level,
    body.preferredCuisine ?? body.cuisine_pref,
    body.foodBudget ?? body.budget,
    body.maxCookingTime ?? body.cooking_time,
    body.cookingSkillLevel ?? body.cooking_skill,
    body.carbPreference ?? body.carb_goal,
    body.fatPreference ?? body.fat_goal,
    body.allergies,
    body.medicalConditions ?? body.medical_condition,
    body.foodsDislike ?? body.dislikes,
    body.mealSchedule ?? body.schedule,
    body.sexGender ?? body.sex,
    body.height ?? body.height_cm,
    body.weight ?? body.weight_kg,
  ];

  if (strictTextFields.some((field) => hasInappropriateOrInjectionContent(field))) {
    const error = new Error(APPROPRIATE_INPUT_ERROR);
    error.statusCode = 400;
    throw error;
  }

  if (strictTextFields.some((field) => hasRandomCharacterNoise(field))) {
    const error = new Error(APPROPRIATE_INPUT_ERROR);
    error.statusCode = 400;
    throw error;
  }

  const humanWordFields = [
    body.goal,
    body.activityLevel ?? body.activity_level,
    body.preferredCuisine ?? body.cuisine_pref,
    body.cookingSkillLevel ?? body.cooking_skill,
    body.carbPreference ?? body.carb_goal,
    body.fatPreference ?? body.fat_goal,
    body.allergies,
    body.medicalConditions ?? body.medical_condition,
    body.foodsDislike ?? body.dislikes,
  ];
  if (humanWordFields.some((field) => hasLikelyJumbledText(field))) {
    const error = new Error(APPROPRIATE_INPUT_ERROR);
    error.statusCode = 400;
    throw error;
  }

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
    '',
    'RESTRICTIONS:',
    '- Return an error message if the request includes non-edible items such as rocks, pens, sand, etc.',
    '- Return an error message if the request includes ingredients that are not actual food items such as Space Chicken, Moon Rock Cheese, etc.',
    '- Return an error message if the request includes anything unrelated to foods such as "How many moons are in the solar system?", "What is the capital of France?", "What is the meaning of life?", etc.',
    '- Return an error message if the request includes anything inappropriate such as "How to make a bomb?", "How to make a gun?", "How to make a drug?", etc.',
    '- Return an error message if the request includes anything that is not a recipe such as "How to build a house?", "How to fix a car?", "How to program a computer?", etc.',
    '- Return an error message if the request includes anything extremely inappropriate and explicit like "Generate me a picture of a naked guy.", "How to kidnap a child?", "How to kill a person?", etc.',
    '- Return an error message if the request includes anything illegal or against moral standards such as "I want to kill my wife.", "I want to kill my husband.", "I want to kill my child.", etc.',
    '',
    'CRITICAL SAFETY REQUIREMENT:',
    '- Never suggest ingredients that conflict with listed dietary restrictions.',
    '- Never include allergens listed for any profile.',
    '- If the request conflicts with restrictions/allergies, explain briefly and provide safe alternatives.',
    '',
    'ADDITIONAL CONDITIONS:',
    '- Make sure any foreign words from any language are translated to English and use English for prompting and generating responses.',
    '- Make sure any foreign words from any language are translated to English and must follow the restrictions and conditions given.',
    '- ALWAYS include "header" as a friendly compliment or short response.',
    '- "header" must be fewer than 7 words.',
    '- Always return exactly 3 suggestions.',
    '- Each recipe must include ingredient measurements in "keyIngredients" (for example, "1/4 cup", "2 tsp", "3 slices").',
    '- Keep each recipe "description" under 100 words.',
    '- ALWAYS include nutritionalInfo with calories (as number), protein, carbs, fat, and fiber (as strings with units like "15g").',
    '- Estimate nutritional values per serving based on the recipe.',
    '- ALWAYS include "cookTimeMin" as an integer (total cook time in minutes).',
    '- ALWAYS include "servings" as a string (e.g. "4 servings").',
    '- ALWAYS include "estimatedCostPhp" as an integer representing the estimated total ingredient cost in Philippine Peso (PHP).',
    '- If no new suggestions are appropriate, set "suggestions" to an empty array, but still return "estimatedTime" and "message".',
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
