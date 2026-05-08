// =============================================================================
// Vettofit AI Gut Health Checkup — Google Apps Script Backend
// =============================================================================
// This script acts as a webhook for the gut health checkup quiz.
// Deploy as a Google Apps Script web app to receive POST requests from the
// Shopify storefront. It logs submissions to a Google Sheet, syncs data to
// Klaviyo for email automation, and creates/updates Shopify customers with
// relevant tags and metafields.
//
// SETUP:
//   1. Replace all %%PLACEHOLDER%% values below with your real credentials.
//   2. Deploy → New deployment → Web app
//      - Execute as: Me
//      - Who has access: Anyone
//   3. Copy the web app URL and paste it into gut-checkup-app.js as the
//      WEBHOOK_URL value.
// =============================================================================

// ---------------------------------------------------------------------------
// Configuration — replace every %%…%% placeholder with your real values
// ---------------------------------------------------------------------------

/** Google Sheet ID (from the URL: docs.google.com/spreadsheets/d/THIS_PART/edit) */
var SPREADSHEET_ID = '%%YOUR_GOOGLE_SHEET_ID%%';

/** Name of the sheet tab where submissions are stored */
var SHEET_NAME = 'Gut Health Submissions';

/** Klaviyo private API key (Account → Settings → API Keys) */
var KLAVIYO_API_KEY = '%%YOUR_KLAVIYO_PRIVATE_API_KEY%%';

/** Shopify store domain (e.g. vettofit.myshopify.com) */
var SHOPIFY_STORE = '%%YOUR_STORE%%.myshopify.com';

/** Shopify Admin API access token (Settings → Apps → Develop apps) */
var SHOPIFY_ACCESS_TOKEN = '%%YOUR_ADMIN_API_TOKEN%%';

/** Shopify Admin API version */
var SHOPIFY_API_VERSION = '2024-01';

// ---------------------------------------------------------------------------
// Column headers — order must match the row values in appendToSheet()
// ---------------------------------------------------------------------------
var HEADERS = [
  'Submission Date',
  'Parent Name',
  'Parent Email',
  'Parent Phone',
  'Pet Name',
  'Breed',
  'Breed Sensitivity',
  'Gender',
  'Weight (kg)',
  'Weight Status',
  'Poop Frequency',
  'Vomiting',
  'Diarrhea',
  'Appetite',
  'Gas',
  'Grass Eating',
  'Skin Issues',
  'Joint Issues',
  'Autoimmune',
  'Diabetes',
  'Seizures',
  'Diet Type',
  'Treats Frequency',
  'Stress Level',
  'Antibiotics Recent',
  'Deworming Regular',
  'Exercise Level',
  'Water Intake',
  'Energy Level',
  'Gut Health Score',
  'Vet Visit Recommended',
  'Flagged Areas',
  'Recommended Products',
  'UTM Source',
  'UTM Medium',
  'UTM Campaign'
];

// =============================================================================
// doPost — main entry point for incoming quiz submissions
// =============================================================================

/**
 * Handles incoming POST requests from the quiz frontend.
 * Parses the JSON payload and routes data to the sheet, Klaviyo, and Shopify.
 *
 * @param {Object} e - The event object provided by Google Apps Script.
 * @returns {TextOutput} JSON response indicating success or failure.
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error('No POST data received.');
    }

    var data = JSON.parse(e.postData.contents);
    Logger.log('Received submission for: ' + (data.parent_email || 'unknown'));

    // 1. Log to Google Sheet
    appendToSheet(data);
    Logger.log('Sheet append complete.');

    // 2. Send to Klaviyo (profile + event)
    try {
      sendToKlaviyo(data);
      Logger.log('Klaviyo sync complete.');
    } catch (klaviyoErr) {
      Logger.log('Klaviyo error (non-fatal): ' + klaviyoErr.toString());
    }

    // 3. Create / update Shopify customer
    try {
      sendToShopify(data);
      Logger.log('Shopify sync complete.');
    } catch (shopifyErr) {
      Logger.log('Shopify error (non-fatal): ' + shopifyErr.toString());
    }

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    Logger.log('doPost error: ' + err.toString());
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// =============================================================================
// doGet — simple health-check endpoint
// =============================================================================

/**
 * Returns a status message so you can verify the web app is deployed and
 * reachable by visiting the URL in a browser.
 */
function doGet() {
  var output = {
    status: 'ok',
    service: 'Vettofit Gut Health Checkup Webhook',
    timestamp: new Date().toISOString()
  };
  return ContentService
    .createTextOutput(JSON.stringify(output))
    .setMimeType(ContentService.MimeType.JSON);
}

// =============================================================================
// Google Sheet operations
// =============================================================================

/**
 * Opens (or creates) the target sheet and appends a new row with the
 * submission data. Writes column headers if the sheet is empty.
 *
 * @param {Object} data - Parsed quiz submission payload.
 */
function appendToSheet(data) {
  var spreadsheet;

  // Try opening by ID first; fall back to the active spreadsheet if the
  // script is container-bound (i.e. created from within a Google Sheet).
  if (SPREADSHEET_ID && SPREADSHEET_ID !== '%%YOUR_GOOGLE_SHEET_ID%%') {
    spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  } else {
    spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  }

  if (!spreadsheet) {
    throw new Error('Could not open spreadsheet. Check SPREADSHEET_ID or bind the script to a sheet.');
  }

  // Get the sheet tab, or create it if missing
  var sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
    Logger.log('Created new sheet tab: ' + SHEET_NAME);
  }

  // Write headers if the first row is empty
  var firstCell = sheet.getRange('A1').getValue();
  if (!firstCell || firstCell === '') {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.getRange(1, 1, 1, HEADERS.length)
      .setFontWeight('bold')
      .setBackground('#f3f3f3');
    sheet.setFrozenRows(1);
    Logger.log('Wrote header row.');
  }

  // Build the row — order must match HEADERS
  var submissionDate = data.submission_date || new Date().toISOString();
  var row = [
    submissionDate,
    data.parent_name || '',
    data.parent_email || '',
    data.parent_phone || '',
    data.pet_name || '',
    data.breed || '',
    data.breed_sensitivity || '',
    data.gender || '',
    data.weight_kg || '',
    data.weight_status || '',
    data.poop_frequency || '',
    data.vomiting || '',
    data.diarrhea || '',
    data.appetite || '',
    data.gas || '',
    data.grass_eating || '',
    data.skin_issues || '',
    data.joint_issues || '',
    data.autoimmune || '',
    data.diabetes || '',
    data.seizures || '',
    data.diet_type || '',
    data.treats_frequency || '',
    data.stress_level || '',
    data.antibiotics_recent || '',
    data.deworming_regular || '',
    data.exercise_level || '',
    data.water_intake || '',
    data.energy_level || '',
    data.gut_health_score || '',
    data.vet_visit_recommended || '',
    formatJsonField(data.flagged_areas),
    formatJsonField(data.recommended_products),
    data.utm_source || '',
    data.utm_medium || '',
    data.utm_campaign || ''
  ];

  sheet.appendRow(row);

  // Format the date column (column A) for the new row
  var lastRow = sheet.getLastRow();
  sheet.getRange(lastRow, 1).setNumberFormat('yyyy-mm-dd hh:mm:ss');

  Logger.log('Appended row ' + lastRow + ' for ' + (data.parent_email || 'unknown'));
}

/**
 * Safely converts a value to a JSON string if it is an object/array, or
 * returns the original string.
 *
 * @param {*} value - The field value (may be a JSON string or an object).
 * @returns {string}
 */
function formatJsonField(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value);
  } catch (e) {
    return String(value);
  }
}

// =============================================================================
// Klaviyo integration
// =============================================================================

/**
 * Creates or updates a Klaviyo profile and then fires a "Gut Checkup Completed"
 * event so Klaviyo flows can trigger automated emails.
 *
 * @param {Object} data - Parsed quiz submission payload.
 */
function sendToKlaviyo(data) {
  if (!KLAVIYO_API_KEY || KLAVIYO_API_KEY === '%%YOUR_KLAVIYO_PRIVATE_API_KEY%%') {
    Logger.log('Klaviyo: skipped — API key not configured.');
    return;
  }

  var profileId = klaviyoUpsertProfile(data);
  if (profileId) {
    klaviyoCreateEvent(data, profileId);
  }
}

/**
 * Creates or updates a profile in Klaviyo via the Profiles API.
 * Returns the profile ID on success, or null on failure.
 *
 * @param {Object} data - Parsed quiz submission payload.
 * @returns {string|null} Klaviyo profile ID.
 */
function klaviyoUpsertProfile(data) {
  var url = 'https://a.klaviyo.com/api/profiles/';

  // Split parent_name into first/last
  var nameParts = (data.parent_name || '').trim().split(/\s+/);
  var firstName = nameParts[0] || '';
  var lastName = nameParts.slice(1).join(' ') || '';

  var payload = {
    data: {
      type: 'profile',
      attributes: {
        email: data.parent_email,
        first_name: firstName,
        last_name: lastName,
        phone_number: data.parent_phone || undefined,
        properties: {
          pet_name: data.pet_name || '',
          breed: data.breed || '',
          breed_sensitivity: data.breed_sensitivity || '',
          gender: data.gender || '',
          weight_kg: data.weight_kg || '',
          weight_status: data.weight_status || '',
          diet_type: data.diet_type || '',
          gut_health_score: data.gut_health_score || '',
          vet_visit_recommended: data.vet_visit_recommended || false,
          flagged_areas: data.flagged_areas || '',
          recommended_products: data.recommended_products || '',
          last_checkup_date: data.submission_date || new Date().toISOString(),
          utm_source: data.utm_source || '',
          utm_medium: data.utm_medium || '',
          utm_campaign: data.utm_campaign || ''
        }
      }
    }
  };

  var options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Authorization': 'Klaviyo-API-Key ' + KLAVIYO_API_KEY,
      'revision': '2024-02-15'
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  var response = UrlFetchApp.fetch(url, options);
  var code = response.getResponseCode();
  var body = response.getContentText();

  Logger.log('Klaviyo profile response (' + code + '): ' + body.substring(0, 500));

  if (code === 201 || code === 200) {
    var parsed = JSON.parse(body);
    return parsed.data && parsed.data.id ? parsed.data.id : null;
  }

  // 409 means the profile already exists — extract the ID from the error body
  if (code === 409) {
    try {
      var errorBody = JSON.parse(body);
      // The duplicate profile ID is in errors[0].meta.duplicate_profile_id
      if (errorBody.errors && errorBody.errors[0] && errorBody.errors[0].meta) {
        var duplicateId = errorBody.errors[0].meta.duplicate_profile_id;
        if (duplicateId) {
          Logger.log('Klaviyo: profile already exists, ID = ' + duplicateId);
          // Update existing profile with PATCH
          klaviyoUpdateProfile(duplicateId, payload);
          return duplicateId;
        }
      }
    } catch (parseErr) {
      Logger.log('Klaviyo 409 parse error: ' + parseErr.toString());
    }
  }

  Logger.log('Klaviyo profile creation failed with code ' + code);
  return null;
}

/**
 * Updates an existing Klaviyo profile via PATCH.
 *
 * @param {string} profileId - The Klaviyo profile ID.
 * @param {Object} originalPayload - The payload used for the initial create attempt.
 */
function klaviyoUpdateProfile(profileId, originalPayload) {
  var url = 'https://a.klaviyo.com/api/profiles/' + profileId;

  // Re-use the same data but add the ID
  var payload = JSON.parse(JSON.stringify(originalPayload));
  payload.data.id = profileId;

  var options = {
    method: 'patch',
    contentType: 'application/json',
    headers: {
      'Authorization': 'Klaviyo-API-Key ' + KLAVIYO_API_KEY,
      'revision': '2024-02-15'
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  var response = UrlFetchApp.fetch(url, options);
  Logger.log('Klaviyo profile update (' + response.getResponseCode() + ')');
}

/**
 * Creates a "Gut Checkup Completed" event in Klaviyo, which can trigger
 * automated flows (e.g. results email, follow-ups, product recommendations).
 *
 * @param {Object} data - Parsed quiz submission payload.
 * @param {string} profileId - The Klaviyo profile ID.
 */
function klaviyoCreateEvent(data, profileId) {
  var url = 'https://a.klaviyo.com/api/events/';

  var payload = {
    data: {
      type: 'event',
      attributes: {
        metric: {
          data: {
            type: 'metric',
            attributes: {
              name: 'Gut Checkup Completed'
            }
          }
        },
        profile: {
          data: {
            type: 'profile',
            id: profileId
          }
        },
        properties: {
          pet_name: data.pet_name || '',
          breed: data.breed || '',
          breed_sensitivity: data.breed_sensitivity || '',
          gender: data.gender || '',
          weight_kg: data.weight_kg || '',
          weight_status: data.weight_status || '',
          poop_frequency: data.poop_frequency || '',
          vomiting: data.vomiting || '',
          diarrhea: data.diarrhea || '',
          appetite: data.appetite || '',
          gas: data.gas || '',
          grass_eating: data.grass_eating || '',
          skin_issues: data.skin_issues || '',
          joint_issues: data.joint_issues || '',
          autoimmune: data.autoimmune || '',
          diabetes: data.diabetes || '',
          seizures: data.seizures || '',
          diet_type: data.diet_type || '',
          treats_frequency: data.treats_frequency || '',
          stress_level: data.stress_level || '',
          antibiotics_recent: data.antibiotics_recent || '',
          deworming_regular: data.deworming_regular || '',
          exercise_level: data.exercise_level || '',
          water_intake: data.water_intake || '',
          energy_level: data.energy_level || '',
          gut_health_score: data.gut_health_score || '',
          vet_visit_recommended: data.vet_visit_recommended || false,
          flagged_areas: data.flagged_areas || '',
          recommended_products: data.recommended_products || '',
          submission_date: data.submission_date || new Date().toISOString(),
          utm_source: data.utm_source || '',
          utm_medium: data.utm_medium || '',
          utm_campaign: data.utm_campaign || ''
        },
        time: new Date().toISOString()
      }
    }
  };

  var options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Authorization': 'Klaviyo-API-Key ' + KLAVIYO_API_KEY,
      'revision': '2024-02-15'
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  var response = UrlFetchApp.fetch(url, options);
  var code = response.getResponseCode();
  Logger.log('Klaviyo event response (' + code + '): ' + response.getContentText().substring(0, 300));

  if (code !== 202 && code !== 201 && code !== 200) {
    Logger.log('Klaviyo event creation may have failed. Response code: ' + code);
  }
}

// =============================================================================
// Shopify customer integration
// =============================================================================

/**
 * Creates or updates a Shopify customer with tags and metafields derived from
 * the quiz submission data.
 *
 * @param {Object} data - Parsed quiz submission payload.
 */
function sendToShopify(data) {
  if (!SHOPIFY_ACCESS_TOKEN || SHOPIFY_ACCESS_TOKEN === '%%YOUR_ADMIN_API_TOKEN%%') {
    Logger.log('Shopify: skipped — access token not configured.');
    return;
  }

  if (!data.parent_email) {
    Logger.log('Shopify: skipped — no email provided.');
    return;
  }

  var existingCustomer = shopifySearchCustomer(data.parent_email);

  if (existingCustomer) {
    shopifyUpdateCustomer(existingCustomer, data);
  } else {
    shopifyCreateCustomer(data);
  }
}

/**
 * Searches Shopify for an existing customer by email address.
 *
 * @param {string} email - Customer email.
 * @returns {Object|null} The customer object if found, or null.
 */
function shopifySearchCustomer(email) {
  var baseUrl = 'https://' + SHOPIFY_STORE + '/admin/api/' + SHOPIFY_API_VERSION;
  var url = baseUrl + '/customers/search.json?query=email:' + encodeURIComponent(email);

  var options = {
    method: 'get',
    headers: {
      'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
      'Content-Type': 'application/json'
    },
    muteHttpExceptions: true
  };

  var response = UrlFetchApp.fetch(url, options);
  var code = response.getResponseCode();
  var body = response.getContentText();

  Logger.log('Shopify search response (' + code + '): ' + body.substring(0, 300));

  if (code === 200) {
    var parsed = JSON.parse(body);
    if (parsed.customers && parsed.customers.length > 0) {
      Logger.log('Shopify: found existing customer ID ' + parsed.customers[0].id);
      return parsed.customers[0];
    }
  }

  return null;
}

/**
 * Creates a new Shopify customer with tags and metafields from the quiz data.
 *
 * @param {Object} data - Parsed quiz submission payload.
 */
function shopifyCreateCustomer(data) {
  var baseUrl = 'https://' + SHOPIFY_STORE + '/admin/api/' + SHOPIFY_API_VERSION;
  var url = baseUrl + '/customers.json';

  var nameParts = (data.parent_name || '').trim().split(/\s+/);
  var firstName = nameParts[0] || '';
  var lastName = nameParts.slice(1).join(' ') || '';

  var tags = buildShopifyTags(data);
  var metafields = buildShopifyMetafields(data);

  var payload = {
    customer: {
      first_name: firstName,
      last_name: lastName,
      email: data.parent_email,
      phone: data.parent_phone || undefined,
      tags: tags.join(','),
      metafields: metafields,
      send_email_welcome: false
    }
  };

  var options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  var response = UrlFetchApp.fetch(url, options);
  var code = response.getResponseCode();
  Logger.log('Shopify create customer (' + code + '): ' + response.getContentText().substring(0, 300));

  if (code !== 201 && code !== 200) {
    throw new Error('Shopify customer creation failed with code ' + code + ': ' + response.getContentText().substring(0, 200));
  }

  Logger.log('Shopify: customer created successfully.');
}

/**
 * Updates an existing Shopify customer, merging new tags with any existing ones
 * and setting/updating metafields.
 *
 * @param {Object} existingCustomer - The existing Shopify customer object.
 * @param {Object} data - Parsed quiz submission payload.
 */
function shopifyUpdateCustomer(existingCustomer, data) {
  var baseUrl = 'https://' + SHOPIFY_STORE + '/admin/api/' + SHOPIFY_API_VERSION;
  var url = baseUrl + '/customers/' + existingCustomer.id + '.json';

  // Merge existing tags with new ones (avoid duplicates)
  var existingTags = (existingCustomer.tags || '').split(',').map(function(t) { return t.trim(); }).filter(Boolean);
  var newTags = buildShopifyTags(data);

  // Remove old score tags to replace with updated score
  existingTags = existingTags.filter(function(tag) {
    return tag.indexOf('score-') !== 0;
  });

  var mergedTagSet = {};
  existingTags.forEach(function(tag) { mergedTagSet[tag] = true; });
  newTags.forEach(function(tag) { mergedTagSet[tag] = true; });
  var mergedTags = Object.keys(mergedTagSet);

  var metafields = buildShopifyMetafields(data);

  var payload = {
    customer: {
      id: existingCustomer.id,
      tags: mergedTags.join(','),
      metafields: metafields
    }
  };

  var options = {
    method: 'put',
    contentType: 'application/json',
    headers: {
      'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  var response = UrlFetchApp.fetch(url, options);
  var code = response.getResponseCode();
  Logger.log('Shopify update customer (' + code + '): ' + response.getContentText().substring(0, 300));

  if (code !== 200) {
    throw new Error('Shopify customer update failed with code ' + code + ': ' + response.getContentText().substring(0, 200));
  }

  Logger.log('Shopify: customer updated successfully.');
}

/**
 * Builds the array of Shopify tags based on quiz submission data.
 *
 * @param {Object} data - Parsed quiz submission payload.
 * @returns {string[]} Array of tag strings.
 */
function buildShopifyTags(data) {
  var tags = ['gut-checkup'];

  // Score bracket tag
  var score = parseFloat(data.gut_health_score);
  if (!isNaN(score)) {
    if (score >= 80) {
      tags.push('score-excellent');
    } else if (score >= 60) {
      tags.push('score-good');
    } else if (score >= 40) {
      tags.push('score-attention');
    } else {
      tags.push('score-critical');
    }
  }

  // Vet recommended
  if (data.vet_visit_recommended === true || data.vet_visit_recommended === 'true') {
    tags.push('vet-recommended');
  }

  // High sensitivity breed
  if (data.breed_sensitivity && data.breed_sensitivity.toString().toLowerCase() === 'high') {
    tags.push('high-sensitivity-breed');
  }

  // Picky eater (appetite scored 0)
  if (data.appetite !== undefined && data.appetite !== null && parseInt(data.appetite, 10) === 0) {
    tags.push('picky-eater');
  }

  // Skin issues (scored 0)
  if (data.skin_issues !== undefined && data.skin_issues !== null && parseInt(data.skin_issues, 10) === 0) {
    tags.push('skin-issues');
  }

  // Joint issues (scored 0)
  if (data.joint_issues !== undefined && data.joint_issues !== null && parseInt(data.joint_issues, 10) === 0) {
    tags.push('joint-issues');
  }

  return tags;
}

/**
 * Builds the array of Shopify metafield objects for the gut_checkup namespace.
 *
 * @param {Object} data - Parsed quiz submission payload.
 * @returns {Object[]} Array of metafield definitions.
 */
function buildShopifyMetafields(data) {
  var metafields = [];

  // gut_score (number_decimal)
  if (data.gut_health_score !== undefined && data.gut_health_score !== '') {
    metafields.push({
      namespace: 'gut_checkup',
      key: 'gut_score',
      value: String(data.gut_health_score),
      type: 'number_decimal'
    });
  }

  // pet_name (single_line_text_field)
  if (data.pet_name) {
    metafields.push({
      namespace: 'gut_checkup',
      key: 'pet_name',
      value: String(data.pet_name),
      type: 'single_line_text_field'
    });
  }

  // breed (single_line_text_field)
  if (data.breed) {
    metafields.push({
      namespace: 'gut_checkup',
      key: 'breed',
      value: String(data.breed),
      type: 'single_line_text_field'
    });
  }

  // flagged_areas (json)
  if (data.flagged_areas) {
    var flaggedVal = typeof data.flagged_areas === 'string'
      ? data.flagged_areas
      : JSON.stringify(data.flagged_areas);
    metafields.push({
      namespace: 'gut_checkup',
      key: 'flagged_areas',
      value: flaggedVal,
      type: 'json'
    });
  }

  // last_checkup_date (date)
  var dateStr = data.submission_date || new Date().toISOString();
  // Shopify date type expects YYYY-MM-DD
  var dateOnly = dateStr.substring(0, 10);
  metafields.push({
    namespace: 'gut_checkup',
    key: 'last_checkup_date',
    value: dateOnly,
    type: 'date'
  });

  // vet_recommended (boolean)
  var vetRecommended = (data.vet_visit_recommended === true || data.vet_visit_recommended === 'true');
  metafields.push({
    namespace: 'gut_checkup',
    key: 'vet_recommended',
    value: vetRecommended ? 'true' : 'false',
    type: 'boolean'
  });

  // recommended_products (json)
  if (data.recommended_products) {
    var productsVal = typeof data.recommended_products === 'string'
      ? data.recommended_products
      : JSON.stringify(data.recommended_products);
    metafields.push({
      namespace: 'gut_checkup',
      key: 'recommended_products',
      value: productsVal,
      type: 'json'
    });
  }

  return metafields;
}

// =============================================================================
// Utility / testing helpers
// =============================================================================

/**
 * Manual test function — run this from the Apps Script editor to simulate a
 * quiz submission. Useful for verifying the Sheet, Klaviyo, and Shopify
 * integrations without needing to submit the actual quiz.
 */
function testDoPost() {
  var samplePayload = {
    parent_name: 'Jane Doe',
    parent_email: 'jane.doe@example.com',
    parent_phone: '+1234567890',
    pet_name: 'Buddy',
    breed: 'Golden Retriever',
    breed_sensitivity: 'high',
    gender: 'male',
    weight_kg: 32,
    weight_status: 'normal',
    poop_frequency: 2,
    vomiting: 1,
    diarrhea: 2,
    appetite: 0,
    gas: 1,
    grass_eating: 1,
    skin_issues: 0,
    joint_issues: 2,
    autoimmune: 2,
    diabetes: 2,
    seizures: 2,
    diet_type: 'kibble',
    treats_frequency: 'daily',
    stress_level: 1,
    antibiotics_recent: 'no',
    deworming_regular: 'yes',
    exercise_level: 2,
    water_intake: 2,
    energy_level: 1,
    gut_health_score: 54.5,
    vet_visit_recommended: true,
    flagged_areas: JSON.stringify(['digestion', 'skin', 'appetite']),
    recommended_products: JSON.stringify(['probiotic-chews', 'gut-health-supplement']),
    submission_date: new Date().toISOString(),
    utm_source: 'facebook',
    utm_medium: 'paid',
    utm_campaign: 'gut-health-may2026'
  };

  var mockEvent = {
    postData: {
      contents: JSON.stringify(samplePayload)
    }
  };

  var result = doPost(mockEvent);
  Logger.log('Test result: ' + result.getContent());
}
