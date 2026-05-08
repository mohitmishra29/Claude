(function () {
  'use strict';

  var html = htm.bind(React.createElement);
  var useState = React.useState;
  var useEffect = React.useEffect;
  var useRef = React.useRef;
  var useCallback = React.useCallback;
  var useMemo = React.useMemo;

  /* ================================================================
     CONFIGURATION
     ================================================================ */
  var WEBHOOK_URL = '%%GOOGLE_APPS_SCRIPT_URL%%';
  var LOGO_URL = 'https://www.vettofit.com/cdn/shop/files/Straight_logo.png';

  var PRODUCTS = [
    { id: 'nutri-topper-100g', name: 'Vettofit Nutri-Topper 100g', price: 499, originalPrice: 549, url: 'https://www.vettofit.com/products/vettofit-nutri-topper-picky-eater-dog-food-topper-100g', image: 'https://www.vettofit.com/cdn/shop/files/Nutri-Topper-100g.png', benefits: ['Improves gut health', 'Boosts appetite', 'Aids digestion'], forIssues: ['appetite', 'gas', 'grass_eating', 'diet_type', 'treats_frequency', 'poop_frequency', 'diarrhea', 'vomiting', 'autoimmune', 'energy_level', 'deworming_regular'] },
    { id: 'nutri-topper-200g', name: 'Vettofit Nutri-Topper 200g', price: 854, originalPrice: 949, url: 'https://www.vettofit.com/products/dog-nutri-topper-india', image: 'https://www.vettofit.com/cdn/shop/files/Nutri-Topper-200g.png', benefits: ['Improves gut health', 'Boosts appetite', 'Better value pack'], forIssues: ['appetite', 'gas', 'grass_eating', 'diet_type', 'treats_frequency', 'poop_frequency', 'diarrhea', 'vomiting', 'autoimmune', 'energy_level', 'deworming_regular'] },
    { id: 'salmon-oil-200ml', name: 'Vettofit Salmon Oil 200ml', price: 584, originalPrice: 649, url: 'https://www.vettofit.com/products/dog-salmon-oil-skin-coat', image: 'https://www.vettofit.com/cdn/shop/files/Salmon-Oil-200ml.png', benefits: ['Healthy skin & coat', 'Joint support', 'Rich in Omega-3'], forIssues: ['skin_issues', 'joint_issues', 'energy_level'] }
  ];

  /* ================================================================
     BREED DATABASE — 125 breeds
     [name, weightMinKg, weightMaxKg, sensitivity (1=high,1.5=mod,2=low)]
     ================================================================ */
  var BREEDS = [
    ["German Shepherd",22,40,1],["Great Dane",50,79,1],["Boxer",25,32,1],["French Bulldog",8,14,1],["English Bulldog",18,25,1],["Shar Pei",18,25,1],["Irish Setter",24,32,1],["Weimaraner",25,40,1],["Doberman Pinscher",27,45,1],["Miniature Schnauzer",5,9,1],["Yorkshire Terrier",2,3.2,1],["West Highland White Terrier",6.8,10,1],["Basenji",9.5,11,1],["Chinese Crested",2.3,5.4,1],["Cavalier King Charles Spaniel",5.9,8.2,1],["Bull Terrier",22,38,1],["Akita",32,59,1],["Chow Chow",20,32,1],["Bullmastiff",41,59,1],["Scottish Terrier",8.5,10.5,1],
    ["Labrador Retriever",25,36,1.5],["Golden Retriever",25,34,1.5],["Beagle",9,11,1.5],["Rottweiler",36,60,1.5],["Siberian Husky",16,27,1.5],["Dalmatian",15,32,1.5],["Pug",6.3,8.1,1.5],["Shih Tzu",4,7.2,1.5],["Cocker Spaniel",12,16,1.5],["Poodle (Standard)",20,32,1.5],["Poodle (Miniature)",5,9,1.5],["Poodle (Toy)",2,4,1.5],["Border Collie",14,20,1.5],["Australian Shepherd",18,29,1.5],["Dachshund",7,14.5,1.5],["Dachshund (Miniature)",3.5,5,1.5],["Pomeranian",1.4,3.2,1.5],["Maltese",1.8,3.2,1.5],["Bichon Frise",3,5,1.5],["Lhasa Apso",5,8,1.5],["Samoyed",17,30,1.5],["Bernese Mountain Dog",35,55,1.5],["St. Bernard",54,82,1.5],["Newfoundland",45,70,1.5],["Alaskan Malamute",34,39,1.5],["Vizsla",18,27,1.5],["Whippet",6,14,1.5],["Greyhound",27,40,1.5],["Italian Greyhound",3.6,5,1.5],["Basset Hound",18,29,1.5],["Bloodhound",36,50,1.5],["Cane Corso",40,50,1.5],["Belgian Malinois",25,34,1.5],["Rhodesian Ridgeback",29,41,1.5],["Afghan Hound",23,27,1.5],["Airedale Terrier",18,29,1.5],["Cairn Terrier",6,8,1.5],["Boston Terrier",4.5,11,1.5],["Havanese",3,6,1.5],["Papillon",3.2,4.5,1.5],["Chihuahua",1.5,3,1.5],["Shetland Sheepdog",6.4,12.3,1.5],["Old English Sheepdog",27,45,1.5],["Rough Collie",18,29,1.5],["Pembroke Welsh Corgi",10,14,1.5],["Cardigan Welsh Corgi",11,17,1.5],["English Springer Spaniel",18,25,1.5],["Irish Wolfhound",48,54,1.5],["Scottish Deerhound",34,50,1.5],["Portuguese Water Dog",16,27,1.5],["Tibetan Mastiff",34,68,1.5],["Tibetan Terrier",8,14,1.5],["Giant Schnauzer",25,48,1.5],["Standard Schnauzer",14,23,1.5],["Brittany",14,18,1.5],["English Setter",20,36,1.5],["Gordon Setter",20,36,1.5],["Flat-Coated Retriever",27,36,1.5],["Chesapeake Bay Retriever",25,36,1.5],["German Shorthaired Pointer",20,32,1.5],["Pointer",20,34,1.5],["Keeshond",14,20,1.5],["Shiba Inu",8,11,1.5],["Norwegian Elkhound",20,23,1.5],["Brussels Griffon",3.5,6,1.5],["Soft Coated Wheaten Terrier",14,20,1.5],["Kerry Blue Terrier",15,18,1.5],["Bedlington Terrier",8,10,1.5],["Wire Fox Terrier",6,9,1.5],["American Cocker Spaniel",11,14,1.5],["Fox Terrier",6.8,8.6,1.5],["Australian Terrier",5.5,7,1.5],["English Toy Spaniel",3.6,6.3,1.5],["Finnish Spitz",7,13,1.5],["Nova Scotia Duck Tolling Retriever",17,23,1.5],
    ["Indie Dog (Indian Pariah)",15,25,2],["Mixed Breed",5,40,2],["Mudhol Hound",22,28,2],["Kombai",20,30,2],["Chippiparai",15,25,2],["Kanni",16,22,2],["Rampur Greyhound",22,30,2],["Bakharwal Dog",30,45,2],["Gaddi Kutta",28,40,2],["Rajapalayam",22,32,2],["Jack Russell Terrier",6,8,2],["Staffordshire Bull Terrier",11,17,2],["Australian Cattle Dog",15,22,2],["Rat Terrier",4.5,11,2],["American Pit Bull Terrier",14,27,2],["Catahoula Leopard Dog",18,43,2],["Plott Hound",18,25,2],["Treeing Walker Coonhound",20,32,2],["Black and Tan Coonhound",25,34,2],["American Foxhound",27,32,2],["Anatolian Shepherd Dog",36,68,2],["Kangal",40,65,2],["Central Asian Shepherd",40,80,2],["Canaan Dog",18,25,2],["Carolina Dog",13,20,2],["Parson Russell Terrier",6,8,2],["Feist",7,14,2],["Mountain Cur",14,27,2],["Blue Lacy",11,23,2],["Thai Ridgeback",16,34,2]
  ].map(function (b) { return { name: b[0], weightMin: b[1], weightMax: b[2], sensitivity: b[3] }; });

  /* ================================================================
     VET ADVICE — breed-specific (20+ detailed)
     ================================================================ */
  var VET_ADVICE = {
    "Labrador Retriever": "Labradors are notoriously food-driven, which means they'll eat almost anything — including things that upset their stomach. Focus on portion control and avoid fatty table scraps. Their breed is prone to food allergies, particularly to chicken and grains, so consider a limited-ingredient diet if you notice recurring digestive issues.",
    "Golden Retriever": "Golden Retrievers have moderate gut sensitivity and are prone to developing food sensitivities over time. Watch for signs like soft stools, gas, or ear infections — ears and gut health are closely connected. A high-quality protein diet with added probiotics works well for this breed.",
    "German Shepherd": "German Shepherds are one of the breeds most prone to digestive issues, including EPI (Exocrine Pancreatic Insufficiency) and IBD. Their sensitive gut requires a consistent, high-quality diet — avoid sudden food changes. If your GSD has chronic soft stools despite a good diet, please get a vet check for EPI as soon as possible.",
    "Indie Dog (Indian Pariah)": "Indie dogs have some of the most robust digestive systems among all breeds — a result of thousands of years of natural selection in the Indian subcontinent. However, sudden diet changes from home food to commercial diets can cause temporary upset. Transition slowly over 10-14 days and maintain a balanced diet with adequate fibre.",
    "Beagle": "Beagles are food-obsessed scavengers with moderate gut sensitivity. Their biggest gut health risk comes from eating things they shouldn't — keep garbage secured and monitor outdoor eating. They respond well to a consistent feeding schedule with measured portions to prevent obesity, which worsens gut issues.",
    "Pug": "Pugs are brachycephalic (flat-faced), meaning they swallow more air while eating, leading to excess gas and bloating. Use a slow-feeder bowl and feed 3-4 smaller meals daily. Pugs are also prone to obesity, which further stresses the digestive system — keep treats to a minimum.",
    "Shih Tzu": "Shih Tzus have moderate gut sensitivity and are prone to developing food allergies. Common allergens include chicken, wheat, and soy. Their small size means even minor digestive upset causes significant discomfort. A gentle, easily digestible diet with novel proteins like duck or lamb often works best.",
    "Rottweiler": "Rottweilers have large, powerful builds that require high-quality nutrition. They are prone to bloat (GDV), which is a life-threatening emergency. Feed 2-3 smaller meals instead of one large one, and avoid exercise for 30 minutes after eating. Adding digestive enzymes can support their gut health.",
    "Doberman Pinscher": "Dobermans have high gut sensitivity and are prone to IBD and food intolerances. They do best on a consistent, high-protein diet with limited ingredients. Watch for chronic loose stools, weight loss despite a good appetite, or intermittent vomiting — these warrant immediate veterinary attention.",
    "Dachshund": "Dachshunds are prone to obesity due to their body shape and love of food, which strains their digestive system and spine. Keep portions strictly measured and avoid high-fat treats. Their moderate gut sensitivity means they generally do well on a consistent, quality kibble with controlled portions.",
    "Pomeranian": "Pomeranians have delicate digestive systems for their tiny size. Small meals 3-4 times a day work better than 1-2 large ones. They are prone to hypoglycaemia if meals are skipped. Watch dental health too — poor oral hygiene directly affects gut bacteria balance in small breeds.",
    "Great Dane": "Great Danes are highly prone to bloat (GDV), which is a surgical emergency. Always feed 2-3 smaller meals, use a raised bowl, and never exercise your Dane right after eating. Their rapid growth also stresses the digestive system — a slow-growth, large-breed specific formula is essential during puppyhood.",
    "Siberian Husky": "Huskies evolved to thrive on less food than most breeds their size — overfeeding is their biggest gut health risk. They have moderate sensitivity and some Huskies develop zinc deficiency, which affects gut lining integrity. A balanced diet with adequate zinc and B-vitamins supports their unique metabolism.",
    "Boxer": "Boxers are among the most gut-sensitive breeds, with high rates of food allergies, colitis, and histiocytic ulcerative colitis — a breed-specific condition. They often respond well to a grain-free, novel-protein diet. If your Boxer has bloody diarrhoea or chronic soft stools, get a vet evaluation promptly.",
    "Cocker Spaniel": "Cocker Spaniels have moderate gut sensitivity and are prone to pancreatitis, especially when fed fatty foods or table scraps. Strictly avoid high-fat diets and treats. They are also prone to ear infections, which can be linked to underlying food allergies affecting gut health.",
    "French Bulldog": "Frenchies have one of the most sensitive digestive systems among popular breeds. Gas, bloating, and food allergies are extremely common. Many do well on hydrolysed protein diets or novel protein sources like duck or venison. Their flat face means they gulp air while eating — use a slow-feeder bowl.",
    "English Bulldog": "English Bulldogs share the French Bulldog's tendency for gas, bloating, and food sensitivities — often more severely. Their compressed airways cause excessive air swallowing. A limited-ingredient, easily digestible diet is essential. Consider a food allergy test to identify specific triggers.",
    "Dalmatian": "Dalmatians have a unique metabolism that cannot process purines well, leading to urinary issues and sometimes digestive complications. Avoid high-purine foods like organ meats and certain fish. A moderate-protein diet with excellent hydration is key for this breed's gut and urinary health.",
    "Rajapalayam": "Rajapalayams are a resilient Indian breed with naturally robust digestive systems. They thrive on a balanced home-cooked or raw diet rich in protein. Their main gut health concern is adapting to commercial foods if raised on home food — transition any diet changes over 10-14 days.",
    "Mudhol Hound": "Mudhol Hounds are athletic Indian sighthounds with excellent gut health genetics. They require a high-protein diet to support their active lifestyle. Keep meals regular and measured — their lean build means they should never carry excess weight, which strains the digestive system.",
    "Kombai": "Kombais are a hardy Indian breed with strong natural immunity and robust digestion. They do well on a protein-rich diet with home-cooked or raw food. Ensure regular deworming as working and outdoor dogs are more exposed to parasites that can affect gut health.",
    "Akita": "Akitas have high gut sensitivity and are prone to autoimmune conditions that can affect the digestive tract. A consistent, high-quality diet with limited ingredients is essential. Avoid feeding Akitas foods with artificial preservatives or colourings, as these can trigger inflammatory gut responses."
  };

  var VET_ADVICE_GENERIC = {
    1: "As a breed with high gut sensitivity, your dog requires consistent, high-quality nutrition with limited ingredients. Avoid sudden diet changes and watch for signs of food intolerance including loose stools, excessive gas, and skin reactions. Regular vet checkups are especially important.",
    1.5: "Your dog's breed has moderate gut sensitivity. A balanced, consistent diet with quality proteins supports digestive health well. Monitor for any food sensitivities and adjust diet accordingly. Regular probiotics and a gradual approach to diet changes will keep their gut healthy.",
    2: "Your dog's breed has naturally robust digestive health — a great genetic advantage! Maintain a balanced diet and avoid overfeeding. Even hardy breeds benefit from consistent meal times, gradual diet transitions, and regular deworming to keep their strong gut in top shape."
  };

  /* ================================================================
     QUESTIONS
     ================================================================ */
  var Q_DIGESTIVE = [
    { id: 'poop_frequency', title: "How are {name}'s poops?", opts: [["Regular & firm (1-2x daily)", 2], ["Slightly irregular or soft", 1], ["Frequent loose stools or constipation", 0]], flag: "Digestive irregularity" },
    { id: 'vomiting', title: "How often does {name} vomit?", opts: [["Rarely or never", 2], ["Occasionally (1-2 times/month)", 1], ["Frequently (weekly or more)", 0]], flag: "Frequent vomiting" },
    { id: 'diarrhea', title: "Does {name} experience diarrhoea?", opts: [["Rarely or never", 2], ["Occasionally", 1], ["Frequently or chronically", 0]], flag: "Chronic diarrhoea" },
    { id: 'appetite', title: "How is {name}'s appetite?", opts: [["Eats well and consistently", 2], ["Somewhat picky or inconsistent", 1], ["Very picky or often refuses food", 0]], flag: "Appetite concerns" },
    { id: 'gas', title: "Does {name} have gas or bloating?", opts: [["Rarely", 2], ["Sometimes", 1], ["Often or severe", 0]], flag: "Excessive gas/bloating" },
    { id: 'grass_eating', title: "Does {name} eat grass?", opts: [["Never or very rarely", 2], ["Sometimes", 1], ["Frequently or compulsively", 0]], flag: "Compulsive grass eating" }
  ];

  var Q_MEDICAL = [
    { id: 'skin_issues', title: "Any skin or coat issues?", opts: [["Healthy coat, no issues", 2], ["Mild itching or dull coat", 1], ["Chronic itching, hot spots, or hair loss", 0]], flag: "Skin & coat problems" },
    { id: 'joint_issues', title: "Any joint or mobility issues?", opts: [["No issues, moves freely", 2], ["Mild stiffness, especially after rest", 1], ["Difficulty moving, limping, or pain", 0]], flag: "Joint mobility issues" },
    { id: 'autoimmune', title: "Any autoimmune conditions?", opts: [["No known conditions", 2], ["Suspected or mild symptoms", 1], ["Diagnosed autoimmune condition", 0]], flag: "Autoimmune risk" },
    { id: 'diabetes', title: "Any signs of diabetes?", opts: [["No signs", 2], ["Pre-diabetic or suspected", 1], ["Diagnosed diabetes", 0]], flag: "Diabetes risk" },
    { id: 'seizures', title: "Any seizure history?", opts: [["None", 2], ["Rare episodes", 1], ["Regular episodes", 0]], flag: "Seizure risk" }
  ];

  var Q_LIFESTYLE = [
    { id: 'diet_type', title: "What does {name} primarily eat?", opts: [["Raw or fresh home-cooked food", 2], ["Premium commercial kibble", 1.5], ["Basic kibble or mostly table scraps", 0.5]], flag: "Poor diet quality" },
    { id: 'treats_frequency', title: "How often does {name} get treats?", opts: [["Rarely, or healthy treats only", 2], ["Moderate amount", 1], ["Very often or unhealthy treats", 0]], flag: "Excessive treats" },
    { id: 'stress_level', title: "What is {name}'s stress level?", opts: [["Calm and relaxed most of the time", 2], ["Sometimes anxious or restless", 1], ["Often stressed, anxious, or fearful", 0]], flag: "High stress levels" },
    { id: 'antibiotics_recent', title: "Any recent antibiotic use?", opts: [["No recent use (6+ months ago or never)", 2], ["Used in the last 6 months", 1], ["Currently on or very recently finished", 0]], flag: "Antibiotic gut impact" },
    { id: 'deworming_regular', title: "Is {name} regularly dewormed?", opts: [["Yes, on a regular schedule", 2], ["Irregularly or unsure", 1], ["Not dewormed or very overdue", 0]], flag: "Deworming gaps" },
    { id: 'exercise_level', title: "How much exercise does {name} get?", opts: [["Daily walks and active play", 2], ["Some activity, but not daily", 1], ["Mostly sedentary or indoors", 0]], flag: "Low activity levels" },
    { id: 'water_intake', title: "How is {name}'s water intake?", opts: [["Drinks well throughout the day", 2], ["Moderate, sometimes needs encouragement", 1], ["Drinks very little", 0]], flag: "Hydration concerns" },
    { id: 'energy_level', title: "What is {name}'s energy level?", opts: [["High energy, active and playful", 2], ["Moderate energy", 1], ["Low energy, often lethargic", 0]], flag: "Low energy/lethargy" }
  ];

  var QUESTION_GROUPS = [
    { id: 'digestive', title: 'Digestive Health', subtitle: "Let's check how {name}'s tummy is doing", questions: Q_DIGESTIVE },
    { id: 'medical', title: 'Medical History', subtitle: "Any existing health conditions for {name}?", questions: Q_MEDICAL },
    { id: 'lifestyle', title: 'Lifestyle & Diet', subtitle: "Tell us about {name}'s daily routine", questions: Q_LIFESTYLE }
  ];

  /* ================================================================
     HOME REMEDIES
     ================================================================ */
  var REMEDIES = {
    digestive: ["Add a tablespoon of plain pumpkin puree to meals — rich in fibre and soothes the gut", "Feed smaller, more frequent meals instead of one or two large ones", "Add a pinch of ginger powder to food to help reduce nausea and bloating"],
    appetite: ["Warm the food slightly to enhance its aroma and make it more appealing", "Try adding bone broth as a topper to increase palatability", "Ensure a quiet, stress-free environment during feeding time"],
    skin: ["Add coconut oil (1 tsp per 5kg body weight) to meals for skin health", "Bathe with an oatmeal-based shampoo to soothe itchy, irritated skin", "Ensure adequate Omega-3 fatty acids in the diet — fish oil is excellent"],
    joints: ["Keep your dog at a healthy weight to reduce stress on joints", "Provide gentle, low-impact exercise like swimming or short walks", "Turmeric paste (golden paste) has natural anti-inflammatory properties"],
    stress: ["Establish a consistent daily routine for meals, walks, and sleep", "Provide a quiet safe space your dog can retreat to when overwhelmed", "Calming supplements with L-theanine or chamomile can help anxious dogs"],
    immunity: ["Include antioxidant-rich foods like blueberries and sweet potato in the diet", "Keep vaccinations and deworming strictly on schedule", "Avoid unnecessary antibiotics — they disrupt the gut microbiome"],
    general: ["Always provide clean, fresh drinking water throughout the day", "Avoid sudden diet changes — transition foods gradually over 7-10 days", "A daily probiotic supplement helps maintain healthy gut bacteria"]
  };

  var FLAG_TO_REMEDY = {
    'Digestive irregularity': 'digestive', 'Frequent vomiting': 'digestive', 'Chronic diarrhoea': 'digestive',
    'Appetite concerns': 'appetite', 'Excessive gas/bloating': 'digestive', 'Compulsive grass eating': 'digestive',
    'Skin & coat problems': 'skin', 'Joint mobility issues': 'joints',
    'Autoimmune risk': 'immunity', 'Diabetes risk': 'immunity', 'Seizure risk': 'immunity',
    'Poor diet quality': 'general', 'Excessive treats': 'general',
    'High stress levels': 'stress', 'Antibiotic gut impact': 'immunity',
    'Deworming gaps': 'immunity', 'Low activity levels': 'general',
    'Hydration concerns': 'general', 'Low energy/lethargy': 'general'
  };

  /* ================================================================
     HELPER FUNCTIONS
     ================================================================ */
  function getWeightStatus(weightKg, breed) {
    if (!breed || !weightKg) return { status: 'healthy', score: 2 };
    var w = parseFloat(weightKg);
    var range = breed.weightMax - breed.weightMin;
    var tolerance = range * 0.2;
    if (w >= breed.weightMin && w <= breed.weightMax) return { status: 'healthy', score: 2 };
    if (w >= breed.weightMin - tolerance && w <= breed.weightMax + tolerance) return { status: w < breed.weightMin ? 'slightly underweight' : 'slightly overweight', score: 1 };
    return { status: w < breed.weightMin ? 'underweight' : 'overweight', score: 0 };
  }

  function getSensitivityLabel(s) {
    if (s <= 1) return 'high';
    if (s <= 1.5) return 'moderate';
    return 'low';
  }

  function calculateResults(answers, breed, weightKg) {
    var rawScore = 0;
    rawScore += breed ? breed.sensitivity : 1.5;
    var ws = getWeightStatus(weightKg, breed);
    rawScore += ws.score;

    var allQuestions = Q_DIGESTIVE.concat(Q_MEDICAL).concat(Q_LIFESTYLE);
    var flaggedAreas = [];
    var flaggedIds = [];

    allQuestions.forEach(function (q) {
      var val = answers[q.id];
      if (val !== undefined) {
        rawScore += val;
        if (val === 0) {
          flaggedAreas.push(q.flag);
          flaggedIds.push(q.id);
        }
      }
    });

    var score = Math.round((rawScore / 42) * 100) / 10;
    score = Math.min(10, Math.max(0, score));

    var bracket, bracketClass;
    if (score >= 7.5) { bracket = 'Excellent'; bracketClass = 'excellent'; }
    else if (score >= 5) { bracket = 'Good'; bracketClass = 'good'; }
    else if (score >= 3) { bracket = 'Needs Attention'; bracketClass = 'attention'; }
    else { bracket = 'Critical'; bracketClass = 'critical'; }

    var vetVisit = score < 5 ||
      answers.autoimmune === 0 || answers.diabetes === 0 || answers.seizures === 0 ||
      flaggedAreas.length >= 4;

    var matchedProducts = [];
    PRODUCTS.forEach(function (p) {
      var matched = p.forIssues.some(function (issue) { return flaggedIds.indexOf(issue) !== -1; });
      if (matched) matchedProducts.push(p);
    });
    if (matchedProducts.length === 0) matchedProducts.push(PRODUCTS[0]);

    var remedyCategories = {};
    flaggedAreas.forEach(function (flag) {
      var cat = FLAG_TO_REMEDY[flag] || 'general';
      remedyCategories[cat] = true;
    });
    if (Object.keys(remedyCategories).length === 0) remedyCategories.general = true;
    var remedyList = [];
    Object.keys(remedyCategories).forEach(function (cat) {
      (REMEDIES[cat] || []).forEach(function (r) {
        if (remedyList.indexOf(r) === -1) remedyList.push(r);
      });
    });
    remedyList = remedyList.slice(0, 5);

    var vetAdvice = VET_ADVICE[breed ? breed.name : ''] || VET_ADVICE_GENERIC[breed ? breed.sensitivity : 1.5];

    return {
      rawScore: rawScore,
      score: score,
      bracket: bracket,
      bracketClass: bracketClass,
      flaggedAreas: flaggedAreas,
      flaggedIds: flaggedIds,
      vetVisitRecommended: vetVisit,
      products: matchedProducts,
      remedies: remedyList,
      vetAdvice: vetAdvice,
      weightStatus: ws
    };
  }

  function getUtmParams() {
    var params = {};
    try {
      var sp = new URLSearchParams(window.location.search);
      params.utm_source = sp.get('utm_source') || '';
      params.utm_medium = sp.get('utm_medium') || '';
      params.utm_campaign = sp.get('utm_campaign') || '';
    } catch (e) { /* older browsers */ }
    return params;
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function submitData(formData, results, utmParams) {
    var payload = {
      parent_name: formData.parentName,
      parent_email: formData.parentEmail,
      parent_phone: formData.parentPhone,
      pet_name: formData.petName,
      breed: formData.breed ? formData.breed.name : '',
      breed_sensitivity: formData.breed ? getSensitivityLabel(formData.breed.sensitivity) : 'moderate',
      gender: formData.gender,
      weight_kg: parseFloat(formData.weightKg) || 0,
      weight_status: results.weightStatus.status,
      poop_frequency: formData.answers.poop_frequency || 0,
      vomiting: formData.answers.vomiting || 0,
      diarrhea: formData.answers.diarrhea || 0,
      appetite: formData.answers.appetite || 0,
      gas: formData.answers.gas || 0,
      grass_eating: formData.answers.grass_eating || 0,
      skin_issues: formData.answers.skin_issues || 0,
      joint_issues: formData.answers.joint_issues || 0,
      autoimmune: formData.answers.autoimmune || 0,
      diabetes: formData.answers.diabetes || 0,
      seizures: formData.answers.seizures || 0,
      diet_type: formData.answers.diet_type || 0,
      treats_frequency: formData.answers.treats_frequency || 0,
      stress_level: formData.answers.stress_level || 0,
      antibiotics_recent: formData.answers.antibiotics_recent || 0,
      deworming_regular: formData.answers.deworming_regular || 0,
      exercise_level: formData.answers.exercise_level || 0,
      water_intake: formData.answers.water_intake || 0,
      energy_level: formData.answers.energy_level || 0,
      gut_health_score: results.score,
      vet_visit_recommended: results.vetVisitRecommended,
      flagged_areas: JSON.stringify(results.flaggedAreas),
      recommended_products: JSON.stringify(results.products.map(function (p) { return p.id; })),
      submission_date: new Date().toISOString(),
      utm_source: utmParams.utm_source || '',
      utm_medium: utmParams.utm_medium || '',
      utm_campaign: utmParams.utm_campaign || ''
    };

    if (WEBHOOK_URL && WEBHOOK_URL.indexOf('%%') === -1) {
      try {
        fetch(WEBHOOK_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (e) { /* silent fail */ }
    }

    if (typeof fbq !== 'undefined') {
      try {
        fbq('trackCustom', 'GutCheckupComplete', {
          score: results.score,
          breed: payload.breed,
          vet_recommended: results.vetVisitRecommended,
          flagged_count: results.flaggedAreas.length
        });
      } catch (e) { /* silent */ }
    }
  }

  /* ================================================================
     COMPONENTS
     ================================================================ */

  function WelcomeScreen(props) {
    return html`<div className="ghc-step active">
      <div className="ghc-welcome">
        <img src=${LOGO_URL} alt="Vettofit" className="ghc-logo" />
        <h1 className="ghc-title">AI Gut Health Checkup for Dogs</h1>
        <p className="ghc-subtitle">Get a personalised gut health score and vet-backed advice for your furry friend in just 2 minutes</p>
        <div className="ghc-welcome-badges">
          <span className="ghc-badge">100% Free</span>
          <span className="ghc-badge">2 Minutes</span>
          <span className="ghc-badge">Vet-Backed</span>
        </div>
        <button className="ghc-btn ghc-btn-primary" onClick=${props.onStart}>Start Free Checkup</button>
      </div>
    </div>`;
  }

  function ParentInfoStep(props) {
    var fd = props.formData;
    var errors = props.errors;
    return html`<div className="ghc-step active">
      <h2 className="ghc-title">About You</h2>
      <p className="ghc-subtitle">We'll send your dog's personalised report to your email</p>

      <div className="ghc-form-group">
        <label className="ghc-label" htmlFor="ghc-parent-name">Your Name *</label>
        <input id="ghc-parent-name" className="ghc-input" type="text" placeholder="Enter your name" value=${fd.parentName} onInput=${function(e){props.onChange('parentName', e.target.value)}} />
        ${errors.parentName && html`<span className="ghc-error-text">${errors.parentName}</span>`}
      </div>

      <div className="ghc-form-group">
        <label className="ghc-label" htmlFor="ghc-email">Email Address *</label>
        <input id="ghc-email" className="ghc-input" type="email" placeholder="your@email.com" value=${fd.parentEmail} onInput=${function(e){props.onChange('parentEmail', e.target.value)}} />
        ${errors.parentEmail && html`<span className="ghc-error-text">${errors.parentEmail}</span>`}
      </div>

      <div className="ghc-form-group">
        <label className="ghc-label" htmlFor="ghc-phone">Phone Number (optional)</label>
        <div className="ghc-input-hint">Include country code, e.g. +91 98765 43210</div>
        <input id="ghc-phone" className="ghc-input" type="tel" placeholder="+91" value=${fd.parentPhone} onInput=${function(e){props.onChange('parentPhone', e.target.value)}} />
      </div>

      <div className="ghc-nav-buttons">
        <button className="ghc-btn ghc-btn-outline" onClick=${props.onBack}>Back</button>
        <button className="ghc-btn ghc-btn-primary" onClick=${props.onNext}>Next</button>
      </div>
    </div>`;
  }

  function DogInfoStep(props) {
    var fd = props.formData;
    var errors = props.errors;
    var breedRef = useRef(null);
    var dropdownRef = useRef(null);
    var _bq = useState('');
    var breedQuery = _bq[0]; var setBreedQuery = _bq[1];
    var _open = useState(false);
    var isOpen = _open[0]; var setIsOpen = _open[1];
    var _hl = useState(-1);
    var hlIndex = _hl[0]; var setHlIndex = _hl[1];

    var filtered = useMemo(function () {
      if (!breedQuery || breedQuery.length < 1) return [];
      var q = breedQuery.toLowerCase();
      return BREEDS.filter(function (b) { return b.name.toLowerCase().indexOf(q) !== -1; }).slice(0, 10);
    }, [breedQuery]);

    useEffect(function () {
      function handleClick(e) {
        if (dropdownRef.current && !dropdownRef.current.contains(e.target) &&
            breedRef.current && !breedRef.current.contains(e.target)) {
          setIsOpen(false);
        }
      }
      document.addEventListener('mousedown', handleClick);
      return function () { document.removeEventListener('mousedown', handleClick); };
    }, []);

    function selectBreed(b) {
      props.onChange('breed', b);
      setBreedQuery(b.name);
      setIsOpen(false);
      setHlIndex(-1);
    }

    function handleKeyDown(e) {
      if (!isOpen || filtered.length === 0) return;
      if (e.key === 'ArrowDown') { e.preventDefault(); setHlIndex(function (i) { return Math.min(i + 1, filtered.length - 1); }); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setHlIndex(function (i) { return Math.max(i - 1, 0); }); }
      else if (e.key === 'Enter' && hlIndex >= 0) { e.preventDefault(); selectBreed(filtered[hlIndex]); }
    }

    var genderOptions = [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
      { value: 'neutered_male', label: 'Neutered Male' },
      { value: 'spayed_female', label: 'Spayed Female' }
    ];

    var weightHint = fd.breed ? 'Healthy range for ' + fd.breed.name + ': ' + fd.breed.weightMin + ' - ' + fd.breed.weightMax + ' kg' : '';

    return html`<div className="ghc-step active">
      <h2 className="ghc-title">About Your Dog</h2>
      <p className="ghc-subtitle">Tell us a bit about your furry companion</p>

      <div className="ghc-form-group">
        <label className="ghc-label" htmlFor="ghc-pet-name">Dog's Name *</label>
        <input id="ghc-pet-name" className="ghc-input" type="text" placeholder="Enter your dog's name" value=${fd.petName} onInput=${function(e){props.onChange('petName', e.target.value)}} />
        ${errors.petName && html`<span className="ghc-error-text">${errors.petName}</span>`}
      </div>

      <div className="ghc-form-group ghc-breed-search">
        <label className="ghc-label" htmlFor="ghc-breed">Breed *</label>
        <input ref=${breedRef} id="ghc-breed" className="ghc-input" type="text" placeholder="Start typing breed name..." autoComplete="off" value=${breedQuery} onInput=${function(e){ setBreedQuery(e.target.value); props.onChange('breed', null); setIsOpen(true); setHlIndex(-1); }} onFocus=${function(){ if(breedQuery.length>=1) setIsOpen(true); }} onKeyDown=${handleKeyDown} />
        ${isOpen && filtered.length > 0 && html`
          <div className="ghc-breed-dropdown" ref=${dropdownRef} role="listbox">
            ${filtered.map(function(b, i) {
              return html`<div key=${b.name} role="option" className=${'ghc-breed-item' + (i === hlIndex ? ' highlighted' : '')} onClick=${function(){ selectBreed(b); }} onMouseEnter=${function(){ setHlIndex(i); }}>
                <span className="ghc-breed-item-name">${b.name}</span>
                <span className="ghc-breed-item-weight">${b.weightMin}-${b.weightMax} kg</span>
              </div>`;
            })}
          </div>
        `}
        ${errors.breed && html`<span className="ghc-error-text">${errors.breed}</span>`}
      </div>

      <div className="ghc-form-group">
        <label className="ghc-label">Gender *</label>
        <div className="ghc-question-group">
          ${genderOptions.map(function(g) {
            return html`<div key=${g.value} className=${'ghc-option' + (fd.gender === g.value ? ' selected' : '')} onClick=${function(){ props.onChange('gender', g.value); }}>
              <span className="ghc-option-text">${g.label}</span>
            </div>`;
          })}
        </div>
        ${errors.gender && html`<span className="ghc-error-text">${errors.gender}</span>`}
      </div>

      <div className="ghc-form-group">
        <label className="ghc-label" htmlFor="ghc-weight">Weight (kg) *</label>
        ${weightHint && html`<div className="ghc-input-hint">${weightHint}</div>`}
        <input id="ghc-weight" className="ghc-input" type="number" placeholder="e.g. 15" min="0.5" max="120" step="0.5" value=${fd.weightKg} onInput=${function(e){props.onChange('weightKg', e.target.value)}} />
        ${errors.weightKg && html`<span className="ghc-error-text">${errors.weightKg}</span>`}
      </div>

      <div className="ghc-nav-buttons">
        <button className="ghc-btn ghc-btn-outline" onClick=${props.onBack}>Back</button>
        <button className="ghc-btn ghc-btn-primary" onClick=${props.onNext}>Next</button>
      </div>
    </div>`;
  }

  function QuestionGroupStep(props) {
    var group = props.group;
    var answers = props.answers;
    var petName = props.petName || 'your dog';
    var errors = props.errors;

    function replName(text) { return text.replace(/\{name\}/g, petName); }

    return html`<div className="ghc-step active">
      <h2 className="ghc-title">${replName(group.title)}</h2>
      <p className="ghc-subtitle">${replName(group.subtitle)}</p>

      ${group.questions.map(function(q) {
        return html`<div key=${q.id} className="ghc-form-group">
          <label className="ghc-question-title">${replName(q.title)}</label>
          <div className="ghc-question-group">
            ${q.opts.map(function(opt, i) {
              var label = opt[0];
              var score = opt[1];
              var isSelected = answers[q.id] === score;
              return html`<div key=${i} className=${'ghc-option' + (isSelected ? ' selected' : '')} onClick=${function(){ props.onAnswer(q.id, score); }}>
                <span className="ghc-option-text">${label}</span>
              </div>`;
            })}
          </div>
          ${errors[q.id] && html`<span className="ghc-error-text">Please select an option</span>`}
        </div>`;
      })}

      <div className="ghc-nav-buttons">
        <button className="ghc-btn ghc-btn-outline" onClick=${props.onBack}>Back</button>
        <button className="ghc-btn ghc-btn-primary" onClick=${props.onNext}>Next</button>
      </div>
    </div>`;
  }

  function LoadingScreen(props) {
    var _dots = useState('');
    var dots = _dots[0]; var setDots = _dots[1];

    useEffect(function () {
      var interval = setInterval(function () {
        setDots(function (d) { return d.length >= 3 ? '' : d + '.'; });
      }, 500);
      var timer = setTimeout(function () { props.onComplete(); }, 2500);
      return function () { clearInterval(interval); clearTimeout(timer); };
    }, []);

    return html`<div className="ghc-step active">
      <div className="ghc-loading">
        <div className="ghc-spinner"></div>
        <p className="ghc-loading-text">Analysing ${props.petName || 'your dog'}'s gut health${dots}</p>
        <p className="ghc-subtitle">Crunching data from 21 health indicators</p>
      </div>
    </div>`;
  }

  function ResultsScreen(props) {
    var r = props.results;
    var fd = props.formData;
    var petName = fd.petName || 'Your dog';
    var breedName = fd.breed ? fd.breed.name : 'your dog\'s breed';
    var pct = (r.score / 10) * 100;

    var _copied = useState(false);
    var copied = _copied[0]; var setCopied = _copied[1];

    function copyLink() {
      try {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(function () { setCopied(false); }, 2000);
      } catch (e) { /* fallback */ }
    }

    return html`<div className="ghc-step active">
      <div className="ghc-results">
        <img src=${LOGO_URL} alt="Vettofit" className="ghc-logo" />
        <h2 className="ghc-title">${petName}'s Gut Health Report</h2>

        <!-- Score Section -->
        <div className="ghc-score-section">
          <div className=${'ghc-score-circle ' + r.bracketClass} style=${{ '--score-pct': pct + '%' }}>
            <span className="ghc-score-value">${r.score}</span>
            <span className="ghc-score-label">out of 10</span>
          </div>
          <div className=${'ghc-score-bracket ' + r.bracketClass}>${r.bracket}</div>
        </div>

        <!-- Summary -->
        <div className="ghc-summary">
          <p>${petName} (${breedName}) scored <strong>${r.score}/10</strong> on our gut health assessment.
          ${r.bracket === 'Excellent' ? ' Great news! ' + petName + "'s gut health looks fantastic. Keep up the good work with their current routine." :
            r.bracket === 'Good' ? ' ' + petName + "'s gut health is generally good, but there are a few areas that could benefit from attention." :
            r.bracket === 'Needs Attention' ? ' ' + petName + "'s gut health needs some care. We've identified several areas to improve below." :
            ' ' + petName + "'s gut health needs urgent attention. We strongly recommend consulting your veterinarian alongside the tips below."}</p>
        </div>

        <!-- Vet Visit Warning -->
        ${r.vetVisitRecommended && html`
          <div className="ghc-vet-warning">
            <strong>Vet Visit Recommended</strong>
            <p>Based on ${petName}'s results, we recommend scheduling a veterinary checkup. Some flagged areas may need professional evaluation.</p>
          </div>
        `}

        <!-- Flagged Areas -->
        ${r.flaggedAreas.length > 0 && html`
          <div className="ghc-flags">
            <h3 className="ghc-title">Flagged Areas</h3>
            ${r.flaggedAreas.map(function(flag) {
              return html`<div key=${flag} className="ghc-flag-item severe">
                <span className="ghc-flag-icon"></span>
                <span className="ghc-flag-text">${flag}</span>
              </div>`;
            })}
          </div>
        `}

        <!-- Dr. Vettofit Card -->
        <div className="ghc-vet-card">
          <div className="ghc-vet-header">
            <div className="ghc-vet-avatar">Dr</div>
            <div>
              <div className="ghc-vet-name">Dr. Vettofit Recommends</div>
              <div className="ghc-subtitle">Senior Veterinarian Insight for ${breedName}</div>
            </div>
          </div>
          <div className="ghc-vet-body">
            <p>${r.vetAdvice}</p>
          </div>
        </div>

        <!-- Home Remedies -->
        ${r.remedies.length > 0 && html`
          <div className="ghc-remedies">
            <h3 className="ghc-title">Home Remedies & Tips</h3>
            ${r.remedies.map(function(remedy, i) {
              return html`<div key=${i} className="ghc-remedy-item">
                <span className="ghc-flag-icon" style=${{ background: '#09D1C7' }}></span>
                <span>${remedy}</span>
              </div>`;
            })}
          </div>
        `}

        <!-- Product Recommendations -->
        <div className="ghc-products">
          <h3 className="ghc-title">Recommended for ${petName}</h3>
          <p className="ghc-subtitle">Vet-backed supplements to support ${petName}'s gut health</p>
          ${r.products.map(function(product) {
            return html`<div key=${product.id} className="ghc-product-card">
              <div className="ghc-product-image">
                <img src=${product.image} alt=${product.name} loading="lazy" />
              </div>
              <div className="ghc-product-info">
                <div className="ghc-product-name">${product.name}</div>
                <div>
                  <span className="ghc-product-price">Rs. ${product.price}</span>
                  <span className="ghc-product-original-price">Rs. ${product.originalPrice}</span>
                </div>
                <div className="ghc-product-benefits">
                  ${product.benefits.map(function(b, i) { return html`<span key=${i} className="ghc-badge">${b}</span>`; })}
                </div>
                <a href=${product.url} target="_blank" rel="noopener" className="ghc-btn ghc-btn-amber ghc-product-btn">Shop Now</a>
              </div>
            </div>`;
          })}
        </div>

        <!-- CTA Section -->
        <div className="ghc-cta-section">
          <button className="ghc-btn ghc-btn-outline" onClick=${props.onRetake}>Retake Assessment</button>
          <button className="ghc-btn ghc-btn-secondary" onClick=${copyLink}>${copied ? 'Link Copied!' : 'Share Results'}</button>
        </div>

        <!-- Footer -->
        <div className="ghc-footer">
          <p className="ghc-tagline">Care, not just a product.</p>
          <p className="ghc-hashtag">#CareWithVettofit</p>
        </div>
      </div>
    </div>`;
  }

  /* ================================================================
     MAIN APP COMPONENT
     ================================================================ */
  function GutHealthApp() {
    var _step = useState(0);
    var step = _step[0]; var setStep = _step[1];

    var _fd = useState({
      parentName: '', parentEmail: '', parentPhone: '',
      petName: '', breed: null, gender: '', weightKg: '',
      answers: {}
    });
    var formData = _fd[0]; var setFormData = _fd[1];

    var _errors = useState({});
    var errors = _errors[0]; var setErrors = _errors[1];

    var _results = useState(null);
    var results = _results[0]; var setResults = _results[1];

    var utmParams = useMemo(getUtmParams, []);

    function updateField(field, value) {
      setFormData(function (prev) {
        var next = Object.assign({}, prev);
        next[field] = value;
        return next;
      });
      setErrors(function (prev) {
        var next = Object.assign({}, prev);
        delete next[field];
        return next;
      });
    }

    function updateAnswer(qId, score) {
      setFormData(function (prev) {
        var next = Object.assign({}, prev);
        next.answers = Object.assign({}, prev.answers);
        next.answers[qId] = score;
        return next;
      });
      setErrors(function (prev) {
        var next = Object.assign({}, prev);
        delete next[qId];
        return next;
      });
    }

    function validateStep(s) {
      var errs = {};
      if (s === 1) {
        if (!formData.parentName.trim()) errs.parentName = 'Name is required';
        if (!formData.parentEmail.trim()) errs.parentEmail = 'Email is required';
        else if (!validateEmail(formData.parentEmail)) errs.parentEmail = 'Please enter a valid email';
      } else if (s === 2) {
        if (!formData.petName.trim()) errs.petName = "Your dog's name is required";
        if (!formData.breed) errs.breed = 'Please select a breed';
        if (!formData.gender) errs.gender = 'Please select gender';
        if (!formData.weightKg || parseFloat(formData.weightKg) <= 0) errs.weightKg = 'Please enter a valid weight';
      } else if (s >= 3 && s <= 5) {
        var group = QUESTION_GROUPS[s - 3];
        group.questions.forEach(function (q) {
          if (formData.answers[q.id] === undefined) errs[q.id] = true;
        });
      }
      setErrors(errs);
      return Object.keys(errs).length === 0;
    }

    function goNext() {
      if (!validateStep(step)) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (step === 5) {
        setStep(6);
      } else {
        setStep(step + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }

    function goBack() {
      if (step > 0) {
        setStep(step - 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }

    function handleLoadingComplete() {
      var res = calculateResults(formData.answers, formData.breed, formData.weightKg);
      setResults(res);
      submitData(formData, res, utmParams);
      setStep(7);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function handleRetake() {
      setStep(0);
      setFormData({ parentName: '', parentEmail: '', parentPhone: '', petName: '', breed: null, gender: '', weightKg: '', answers: {} });
      setResults(null);
      setErrors({});
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    var progressPct = step >= 1 && step <= 5 ? Math.round(((step - 1) / 5) * 100) + '%' : null;
    var stepLabel = step >= 1 && step <= 5 ? 'Step ' + step + ' of 5' : '';

    return html`<div className="ghc-app">
      ${progressPct !== null && html`
        <div className="ghc-progress">
          <div className="ghc-progress-bar">
            <div className="ghc-progress-fill" style=${{ width: progressPct }}></div>
          </div>
          <div className="ghc-progress-text">${stepLabel}</div>
        </div>
      `}

      ${step === 0 && html`<${WelcomeScreen} onStart=${function(){ setStep(1); window.scrollTo({top:0,behavior:'smooth'}); }} />`}
      ${step === 1 && html`<${ParentInfoStep} formData=${formData} errors=${errors} onChange=${updateField} onNext=${goNext} onBack=${goBack} />`}
      ${step === 2 && html`<${DogInfoStep} formData=${formData} errors=${errors} onChange=${updateField} onNext=${goNext} onBack=${goBack} />`}
      ${step === 3 && html`<${QuestionGroupStep} group=${QUESTION_GROUPS[0]} answers=${formData.answers} petName=${formData.petName} errors=${errors} onAnswer=${updateAnswer} onNext=${goNext} onBack=${goBack} />`}
      ${step === 4 && html`<${QuestionGroupStep} group=${QUESTION_GROUPS[1]} answers=${formData.answers} petName=${formData.petName} errors=${errors} onAnswer=${updateAnswer} onNext=${goNext} onBack=${goBack} />`}
      ${step === 5 && html`<${QuestionGroupStep} group=${QUESTION_GROUPS[2]} answers=${formData.answers} petName=${formData.petName} errors=${errors} onAnswer=${updateAnswer} onNext=${goNext} onBack=${goBack} />`}
      ${step === 6 && html`<${LoadingScreen} petName=${formData.petName} onComplete=${handleLoadingComplete} />`}
      ${step === 7 && results && html`<${ResultsScreen} results=${results} formData=${formData} onRetake=${handleRetake} />`}
    </div>`;
  }

  /* ================================================================
     MOUNT
     ================================================================ */
  var rootEl = document.getElementById('gut-health-checkup-root');
  if (rootEl) {
    var root = ReactDOM.createRoot(rootEl);
    root.render(html`<${GutHealthApp} />`);
  }

})();
