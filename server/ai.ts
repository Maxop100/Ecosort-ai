import { GoogleGenAI, Type } from '@google/genai';
import { WasteCategory, WasteRule, UpcycleIdea } from '../src/types';

let genAIClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (genAIClient) return genAIClient;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not set in environment.');
    return null;
  }
  genAIClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
  return genAIClient;
}

export interface AiClassificationOutput {
  category: WasteCategory;
  confidence: number;
  reasoning: string;
  identifiedItem?: string;
}

/**
 * Prompt Template 1: AI Waste Classification
 */
export async function classifyWasteItem(
  inputType: 'image' | 'text',
  inputData: string
): Promise<AiClassificationOutput> {
  const client = getGeminiClient();

  const systemInstruction = `You are a waste classification assistant. Given the item description or image, classify it into exactly one category: recyclable, organic, e-waste, hazardous, or general-waste. Respond in JSON: { "category": "", "confidence": 0-1, "reasoning": "" }. Be concise and avoid assumptions not supported by the input.`;

  if (client) {
    try {
      let contents: any;

      if (inputType === 'image') {
        // Parse base64 data URL
        const matches = inputData.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          const mimeType = matches[1];
          const base64Data = matches[2];
          contents = {
            parts: [
              {
                inlineData: {
                  mimeType,
                  data: base64Data
                }
              },
              {
                text: 'Classify this item for waste segregation. Identify the primary material, condition (clean, soiled, electronics, chemical), and assign to: recyclable, organic, e-waste, hazardous, or general-waste.'
              }
            ]
          };
        } else {
          // If plain base64 without prefix
          contents = {
            parts: [
              {
                inlineData: {
                  mimeType: 'image/jpeg',
                  data: inputData
                }
              },
              {
                text: 'Classify this item for waste segregation. Identify the primary material and assign category.'
              }
            ]
          };
        }
      } else {
        // Text input
        contents = `Item description: "${inputData}". Classify this item according to municipal waste segregation standards.`;
      }

      const response = await client.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              category: {
                type: Type.STRING,
                description: 'Must be one of: recyclable, organic, e-waste, hazardous, general-waste'
              },
              confidence: {
                type: Type.NUMBER,
                description: 'Confidence level from 0.0 to 1.0'
              },
              reasoning: {
                type: Type.STRING,
                description: 'Short concise explanation of why this item belongs in this category'
              },
              identifiedItem: {
                type: Type.STRING,
                description: 'Short 2-4 word name of the detected object'
              }
            },
            required: ['category', 'confidence', 'reasoning']
          }
        }
      });

      const responseText = response.text?.trim() || '{}';
      const parsed = JSON.parse(responseText);

      // Normalize category (e.g. general-waste -> general)
      let normalizedCategory: WasteCategory = 'general';
      const rawCat = (parsed.category || '').toLowerCase().trim();
      if (rawCat.includes('recycl')) normalizedCategory = 'recyclable';
      else if (rawCat.includes('organ') || rawCat.includes('compost')) normalizedCategory = 'organic';
      else if (rawCat.includes('e-waste') || rawCat.includes('electronic')) normalizedCategory = 'e-waste';
      else if (rawCat.includes('hazard') || rawCat.includes('toxic')) normalizedCategory = 'hazardous';
      else normalizedCategory = 'general';

      return {
        category: normalizedCategory,
        confidence: typeof parsed.confidence === 'number' ? Math.min(Math.max(parsed.confidence, 0.1), 0.99) : 0.88,
        reasoning: parsed.reasoning || 'Item properties correspond with municipal sorting guidelines.',
        identifiedItem: parsed.identifiedItem || (inputType === 'text' ? inputData : 'Scanned item')
      };
    } catch (err) {
      console.error('Gemini classification error, falling back to heuristic:', err);
    }
  }

  // Heuristic municipal rule-based fallback if offline or during network timeouts
  return heuristicClassification(inputType, inputData);
}

/**
 * Prompt Template 2: RAG Disposal Guidance
 */
export async function generateRagDisposalGuidance(
  category: WasteCategory,
  retrievedRule: WasteRule,
  itemDescription: string
): Promise<string> {
  const client = getGeminiClient();

  const retrievedRuleText = `${retrievedRule.itemKeyword}: ${retrievedRule.disposalInstruction}${
    retrievedRule.specialNotes ? ` (${retrievedRule.specialNotes})` : ''
  }`;

  const prompt = `You are a disposal guidance assistant. Given the item category "${category}" and the retrieved municipal rule: "${retrievedRuleText}", write a short, clear, 2-3 sentence instruction telling the user exactly how to dispose of this item. Do not invent rules not present in the retrieved text. Target item: ${itemDescription}.`;

  if (client) {
    try {
      const response = await client.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          temperature: 0.2
        }
      });
      const text = response.text?.trim();
      if (text && text.length > 10) {
        return text;
      }
    } catch (err) {
      console.error('Gemini RAG generation error, using retrieved rule directly:', err);
    }
  }

  // Direct rule return if model is unavailable
  return retrievedRule.disposalInstruction;
}

/**
 * Fast offline/fallback heuristic
 */
function heuristicClassification(
  inputType: 'image' | 'text',
  inputData: string
): AiClassificationOutput {
  const query = (inputType === 'text' ? inputData : 'general household item').toLowerCase();

  if (query.match(/battery|lithium|fluorescent|cfl|mercury|paint|chemical|poison|solvent|pesticide|medicine|needle|syringe/)) {
    return {
      category: 'hazardous',
      confidence: 0.94,
      reasoning: 'Item contains chemical, heavy metal, or biomedical hazards requiring designated hazardous waste disposal.',
      identifiedItem: inputType === 'text' ? inputData : 'Hazardous Material'
    };
  }
  if (query.match(/phone|cable|wire|laptop|charger|circuit|screen|electronics|mouse|keyboard|earphone|headphone|gadget/)) {
    return {
      category: 'e-waste',
      confidence: 0.92,
      reasoning: 'Electronic hardware containing circuit boards, copper wiring, and precious metals requiring WEEE recovery.',
      identifiedItem: inputType === 'text' ? inputData : 'Electronic Device'
    };
  }
  if (query.match(/food|banana|apple|peel|vegetable|fruit|coffee|tea bag|bread|scrap|meat|bone|rice|leftover|egg shell/)) {
    return {
      category: 'organic',
      confidence: 0.96,
      reasoning: 'Biodegradable organic matter suitable for composting and methane reduction.',
      identifiedItem: inputType === 'text' ? inputData : 'Organic Biomass'
    };
  }
  if (query.match(/can|aluminum|tin|bottle|cardboard|paper|newspaper|jar|glass|carton|magazine|metal/)) {
    return {
      category: 'recyclable',
      confidence: 0.91,
      reasoning: 'Clean recyclable rigid packaging (aluminum, clean paper, PET, or glass) suitable for reprocessing.',
      identifiedItem: inputType === 'text' ? inputData : 'Recyclable Material'
    };
  }

  return {
    category: 'general',
    confidence: 0.85,
    reasoning: 'Composite or non-recyclable household waste destined for municipal landfill or energy recovery.',
    identifiedItem: inputType === 'text' ? inputData : 'Household Waste'
  };
}

/**
 * Prompt Template 3: AI Upcycling & Circular Economy Reuse Generator
 */
export async function generateUpcycleIdeas(
  itemDescription: string,
  category: WasteCategory
): Promise<UpcycleIdea[]> {
  const client = getGeminiClient();

  const systemInstruction = `You are a creative circular economy engineer and DIY upcycling specialist. Given an item description and waste category, provide exactly 3 practical, realistic, and highly creative DIY upcycling or reuse project ideas that extend the lifecycle of this material before disposal. Return valid JSON adhering to the provided schema.`;

  if (client) {
    try {
      const response = await client.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Item: "${itemDescription}" (Category: ${category}). Generate 3 actionable household upcycling or repurposing ideas with step-by-step instructions.`,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            description: 'List of 3 upcycling project ideas',
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING, description: 'Catchy, creative project name' },
                difficulty: {
                  type: Type.STRING,
                  description: 'Must be Beginner, Intermediate, or Creative Pro'
                },
                timeEstimate: { type: Type.STRING, description: 'e.g. 15 mins, 30 mins, 1 hour' },
                toolsNeeded: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Common household tools or supplies needed'
                },
                instructions: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: '3 to 5 clear, concise step-by-step instructions'
                },
                co2SavingsEstimate: {
                  type: Type.STRING,
                  description: 'e.g. Prevents ~0.8 kg embodied CO2'
                },
                practicalUse: {
                  type: Type.STRING,
                  description: 'Short 1-sentence explanation of its daily utility'
                }
              },
              required: ['id', 'title', 'difficulty', 'timeEstimate', 'toolsNeeded', 'instructions', 'co2SavingsEstimate', 'practicalUse']
            }
          }
        }
      });

      const responseText = response.text?.trim();
      if (responseText) {
        const parsed = JSON.parse(responseText);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item: any, idx: number) => ({
            id: item.id || `upcycle-${idx + 1}-${Date.now()}`,
            title: item.title || 'Creative Household Repurpose',
            difficulty: ['Beginner', 'Intermediate', 'Creative Pro'].includes(item.difficulty)
              ? item.difficulty
              : 'Beginner',
            timeEstimate: item.timeEstimate || '20 mins',
            toolsNeeded: Array.isArray(item.toolsNeeded) && item.toolsNeeded.length ? item.toolsNeeded : ['Scissors', 'Household twine'],
            instructions: Array.isArray(item.instructions) && item.instructions.length ? item.instructions : ['Clean thoroughly', 'Repurpose for storage'],
            co2SavingsEstimate: item.co2SavingsEstimate || 'Diverts ~0.5 kg CO₂ from manufacturing replacement',
            practicalUse: item.practicalUse || 'Eliminates the need to purchase new household organizers.'
          }));
        }
      }
    } catch (err) {
      console.error('Gemini Upcycle generation error, using curated circular economy catalog:', err);
    }
  }

  // Curated heuristic circular economy fallback
  return getHeuristicUpcycleIdeas(itemDescription, category);
}

function getHeuristicUpcycleIdeas(itemDescription: string, category: WasteCategory): UpcycleIdea[] {
  const query = itemDescription.toLowerCase();

  // Glass / Jar / Bottle
  if (query.match(/glass|jar|bottle/)) {
    return [
      {
        id: 'glass-1',
        title: 'Self-Watering Hydroponic Herb Planter',
        difficulty: 'Beginner',
        timeEstimate: '15 mins',
        toolsNeeded: ['Clean glass container', 'Cotton twine', 'Potting soil', 'Herb seeds (basil or mint)'],
        instructions: [
          'Wash and remove labels using warm soapy water and baking soda.',
          'Thread cotton twine through the base to act as a capillary wick into water.',
          'Fill top with organic potting soil and sow herb seeds.',
          'Position on a sunny windowsill for fresh kitchen herbs with zero plastic pots.'
        ],
        co2SavingsEstimate: 'Saves ~1.4 kg CO₂ in commercial greenhouse packaging',
        practicalUse: 'Yields fresh organic kitchen herbs year-round with self-watering convenience.'
      },
      {
        id: 'glass-2',
        title: 'Minimalist Pantry Dry-Goods Decanter',
        difficulty: 'Beginner',
        timeEstimate: '10 mins',
        toolsNeeded: ['Paper tape or chalk marker', 'Warm water', 'Rubbing alcohol'],
        instructions: [
          'Soak container in warm water to strip adhesive glue cleanly.',
          'Sanitize the interior with rubbing alcohol or boiling water.',
          'Label with a minimalist chalk marker for lentils, chia seeds, or spices.'
        ],
        co2SavingsEstimate: 'Replaces single-use retail plastic packaging',
        practicalUse: 'Aesthetic airtight storage preserving food freshness.'
      },
      {
        id: 'glass-3',
        title: 'Ambient Solar Lantern or Candle Luminary',
        difficulty: 'Intermediate',
        timeEstimate: '20 mins',
        toolsNeeded: ['Fairy wire LED lights or beeswax candle', 'Natural twine', 'Sand or river pebbles'],
        instructions: [
          'Layer 1 inch of clean sand or pebbles at the bottom for weight stability.',
          'Wrap natural jute twine around the jar neck to form a rustic hanging loop.',
          'Insert warm micro-LED fairy lights or a reusable votive candle.'
        ],
        co2SavingsEstimate: 'Saves ~2.2 kg CO₂ vs purchasing mass-manufactured lighting fixtures',
        practicalUse: 'Cozy patio or bedside ambient lighting with zero grid electricity.'
      }
    ];
  }

  // Cardboard / Box / Paper
  if (query.match(/cardboard|box|paper|pizza|carton/)) {
    return [
      {
        id: 'cardboard-1',
        title: 'Biodegradable Seedling Nursery Pots',
        difficulty: 'Beginner',
        timeEstimate: '15 mins',
        toolsNeeded: ['Scissors', 'Water spray bottle', 'Potting soil', 'Seeds'],
        instructions: [
          'Cut unbleached cardboard into 3-inch strips and fold into open square cups.',
          'Fill with seed-starter soil mix and moisten lightly.',
          'Plant seeds directly; once sprouted, transplant the entire biodegradable cup directly into garden soil.'
        ],
        co2SavingsEstimate: 'Eliminates disposable plastic nursery seed trays',
        practicalUse: 'Zero root disturbance during garden transplanting as cardboard naturally composts.'
      },
      {
        id: 'cardboard-2',
        title: 'Custom Modular Desk Cable & Drawer Divider',
        difficulty: 'Intermediate',
        timeEstimate: '25 mins',
        toolsNeeded: ['Ruler', 'Utility knife', 'Pencil'],
        instructions: [
          'Measure the height and depth of your cluttered desk drawer.',
          'Score interlocking slots halfway through vertical and horizontal cardboard slats.',
          'Slot them together to form tailored compartments for pens, cords, and stationery.'
        ],
        co2SavingsEstimate: 'Diverts 0.7 kg CO₂ from plastic drawer organizers',
        practicalUse: 'Instantly organizes desk clutter with zero plastic purchases.'
      },
      {
        id: 'cardboard-3',
        title: 'Weed-Suppressing Permaculture Sheet Mulch',
        difficulty: 'Beginner',
        timeEstimate: '20 mins',
        toolsNeeded: ['Garden hose', 'Mulch or fallen dry leaves'],
        instructions: [
          'Remove plastic shipping tape from the plain corrugated cardboard.',
          'Lay flat over garden weed patches, overlapping edges by 6 inches.',
          'Soak thoroughly with water and cover with 3 inches of organic wood mulch.'
        ],
        co2SavingsEstimate: 'Prevents chemical herbicide synthesis (~3.5 kg CO₂)',
        practicalUse: 'Suppresses invasive weeds organically while feeding earthworms.'
      }
    ];
  }

  // Aluminum / Tin Can
  if (query.match(/can|aluminum|tin|metal/)) {
    return [
      {
        id: 'tin-1',
        title: 'Artisan Perforated Lantern / Desk Organizer',
        difficulty: 'Intermediate',
        timeEstimate: '30 mins',
        toolsNeeded: ['Hammer', 'Nail or awl', 'Sandpaper', 'Pencil'],
        instructions: [
          'Fill can with water and freeze solid so it retains its rigid cylindrical shape while punching.',
          'Draw a constellation or geometric pattern on paper and tape around the can.',
          'Use a hammer and nail to gently punch holes along your pattern.',
          'Melt ice, sand rim smooth, and place a candle or desk pens inside.'
        ],
        co2SavingsEstimate: 'Avoids 1.8 kg CO₂ embodied in new metal desk wares',
        practicalUse: 'Casts artistic shadow patterns as a luminary or stores pens.'
      },
      {
        id: 'tin-2',
        title: 'Magnetic Kitchen Herb & Spice Tins',
        difficulty: 'Beginner',
        timeEstimate: '15 mins',
        toolsNeeded: ['Small craft magnets', 'Strong glue (hot glue or epoxy)'],
        instructions: [
          'Clean and dry the metal tin completely.',
          'Affix 2 strong neodymium craft magnets to the bottom with glue.',
          'Snap onto the side of your refrigerator to store paperclips, rubber bands, or spices.'
        ],
        co2SavingsEstimate: 'Saves ~0.9 kg CO₂',
        practicalUse: 'Frees up kitchen counter space with vertical magnetic storage.'
      },
      {
        id: 'tin-3',
        title: 'Garden Plant Marker Tags',
        difficulty: 'Intermediate',
        timeEstimate: '20 mins',
        toolsNeeded: ['Kitchen shears', 'Work gloves', 'Ballpoint pen'],
        instructions: [
          'Carefully cut soft aluminum can metal into 1x5 inch pointed plant stakes.',
          'Press firmly with a ballpoint pen to permanently emboss vegetable names (e.g. "Roma Tomatoes").',
          'Stick into garden soil—weatherproof and will never fade in sunlight.'
        ],
        co2SavingsEstimate: 'Replaces non-recyclable plastic garden tags',
        practicalUse: 'Permanent, weatherproof garden labeling.'
      }
    ];
  }

  // Food scraps / Organics
  if (category === 'organic' || query.match(/banana|peel|coffee|food|apple|egg/)) {
    return [
      {
        id: 'organic-1',
        title: 'Rich Potassium & Nitrogen Plant Fertilizer Tea',
        difficulty: 'Beginner',
        timeEstimate: '5 mins',
        toolsNeeded: ['Glass pitcher or jar', 'Water', 'Strainer'],
        instructions: [
          'Place banana peels or used coffee grounds in a jar of clean water.',
          'Let steep for 24–48 hours to dissolve bio-available potassium and phosphorus.',
          'Strain and pour liquid over houseplants or tomatoes as a natural fertilizer.'
        ],
        co2SavingsEstimate: 'Replaces chemical synthetic fertilizers (~2.8 kg CO₂)',
        practicalUse: 'Supercharges houseplant growth and foliage vibrance naturally.'
      },
      {
        id: 'organic-2',
        title: 'Aromatic Citrus Vinegar Eco-Cleaning Spray',
        difficulty: 'Beginner',
        timeEstimate: '10 mins',
        toolsNeeded: ['Lemon or orange peels', 'White distilled vinegar', 'Glass jar', 'Spray bottle'],
        instructions: [
          'Stuff citrus rinds tightly into a glass jar.',
          'Cover fully with white distilled vinegar and seal for 2 weeks in a dark cabinet.',
          'Strain into a spray bottle diluted 1:1 with water for a grease-cutting all-purpose cleaner.'
        ],
        co2SavingsEstimate: 'Eliminates chemical aerosol bottles and petroleum detergents',
        practicalUse: 'Non-toxic, food-safe degreaser that smells naturally citrus fresh.'
      },
      {
        id: 'organic-3',
        title: 'Slow-Release Nitrogen Soil Aerator (Coffee Scrub / Compost)',
        difficulty: 'Beginner',
        timeEstimate: '5 mins',
        toolsNeeded: ['Damp coffee grounds', 'Garden trowel'],
        instructions: [
          'Mix spent coffee grounds directly into garden soil or indoor potting mixes.',
          'Coffee grounds improve moisture retention, aerate dense clay, and deter garden slugs.'
        ],
        co2SavingsEstimate: 'Prevents landfill anaerobic methane generation',
        practicalUse: 'Feeds earthworms and builds soil humus structure.'
      }
    ];
  }

  // General / Default
  return [
    {
      id: 'general-1',
      title: 'Multipurpose Workshop Hardware Organizer',
      difficulty: 'Beginner',
      timeEstimate: '15 mins',
      toolsNeeded: ['Scissors or utility knife', 'Permanent marker'],
      instructions: [
        'Sanitize the container and trim any rough or sharp plastic edges.',
        'Sort loose nails, screws, batteries, or craft buttons into labeled units.'
      ],
      co2SavingsEstimate: 'Diverts ~0.6 kg CO₂ from plastic organizer manufacturing',
      practicalUse: 'Keeps household hardware organized with zero expenditure.'
    },
    {
      id: 'general-2',
      title: 'Protective Packaging Cushioning & Void Fill',
      difficulty: 'Beginner',
      timeEstimate: '10 mins',
      toolsNeeded: ['Clean cardboard or clean packaging wrap'],
      instructions: [
        'Save clean packaging materials in a dedicated flat storage pouch.',
        'Reuse directly when shipping packages or storing fragile holiday ceramics.'
      ],
      co2SavingsEstimate: 'Prevents purchasing virgin polystyrene packing peanuts',
      practicalUse: 'Cushions delicate items safely during relocation or postal shipping.'
    },
    {
      id: 'general-3',
      title: 'Protective Floor Surface Pads for Furniture',
      difficulty: 'Intermediate',
      timeEstimate: '20 mins',
      toolsNeeded: ['Scissors', 'Double-sided tape or craft glue'],
      instructions: [
        'Cut dense packaging foam or corrugated cardboard into small discs.',
        'Adhere under heavy chair and table legs to prevent scratching hardwood floors.'
      ],
      co2SavingsEstimate: 'Saves ~0.4 kg CO₂',
      practicalUse: 'Protects floors from scuffs and dampens chair sliding noise.'
    }
  ];
}

