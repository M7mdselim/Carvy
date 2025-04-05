/// <reference path="../../deno-types.d.ts" />

// @ts-ignore: Deno-specific imports
import "https://deno.land/x/xhr@0.1.0/mod.ts"
// @ts-ignore: Deno-specific imports
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-ignore: Deno-specific imports
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.0"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

// Create a Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || ""
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
const supabase = createClient(supabaseUrl, supabaseKey)

// Enhanced NLP for identifying intents from user messages
function identifyIntent(message: string, context: string[] = []): string {
  const lowerMessage = message.toLowerCase()

  // Check context for conversation flow
  const hasRecentProductQuestion = context.some(
    (msg) =>
      msg.toLowerCase().includes("product") || msg.toLowerCase().includes("part") || msg.toLowerCase().includes("item"),
  )

  // Identify navigation requests - improved detection
  if (
    lowerMessage.includes("navigate") ||
    lowerMessage.includes("go to") ||
    lowerMessage.includes("find") ||
    lowerMessage.includes("where is") ||
    lowerMessage.includes("how do i get to") ||
    lowerMessage.includes("show me") ||
    lowerMessage.includes("take me to") ||
    lowerMessage.includes("direct me to") ||
    lowerMessage.includes("i want to see")
  ) {
    // Check for specific navigation targets with improved specificity
    if (
      lowerMessage.includes("product") ||
      lowerMessage.includes("item") ||
      lowerMessage.includes("part") ||
      lowerMessage.includes("buy") ||
      lowerMessage.includes("purchase")
    ) {
      return "navigate_products"
    }
    if (lowerMessage.includes("categor")) {
      return "navigate_categories"
    }
    if (lowerMessage.includes("shop") || lowerMessage.includes("store") || lowerMessage.includes("dealer")) {
      return "navigate_shops"
    }
    if (
      lowerMessage.includes("car model") ||
      lowerMessage.includes("vehicle model") ||
      lowerMessage.includes("model") ||
      lowerMessage.includes("car type") ||
      lowerMessage.includes("make and model")
    ) {
      return "navigate_models"
    }
    if (
      lowerMessage.includes("contact") ||
      lowerMessage.includes("reach you") ||
      lowerMessage.includes("talk to human") ||
      lowerMessage.includes("talk to someone") ||
      lowerMessage.includes("speak with") ||
      lowerMessage.includes("human agent") ||
      lowerMessage.includes("real person") ||
      lowerMessage.includes("customer service") ||
      lowerMessage.includes("support team")
    ) {
      return "navigate_contact"
    }
    if (
      lowerMessage.includes("faq") ||
      lowerMessage.includes("frequently asked") ||
      lowerMessage.includes("question") ||
      lowerMessage.includes("help section")
    ) {
      return "navigate_faq"
    }
  }

  // Identify product search requests - new intent
  if (
    (lowerMessage.includes("search") || lowerMessage.includes("find") || lowerMessage.includes("looking for")) &&
    (lowerMessage.includes("product") || lowerMessage.includes("part") || lowerMessage.includes("item"))
  ) {
    return "product_search"
  }

  // Identify human agent requests
  if (
    lowerMessage.includes("human") ||
    lowerMessage.includes("agent") ||
    lowerMessage.includes("person") ||
    lowerMessage.includes("representative") ||
    lowerMessage.includes("customer service") ||
    lowerMessage.includes("talk to someone") ||
    lowerMessage.includes("speak to someone") ||
    lowerMessage.includes("live chat")
  ) {
    return "human_agent"
  }

  // Identify product requests - FIXED: More specific conditions to prevent false positives
  if (
    (lowerMessage.includes("do you have") && (lowerMessage.includes("product") || lowerMessage.includes("part"))) ||
    (lowerMessage.includes("looking for") && (lowerMessage.includes("product") || lowerMessage.includes("part"))) ||
    ((lowerMessage.includes("find") || lowerMessage.includes("search")) &&
      (lowerMessage.includes("product") || lowerMessage.includes("part"))) ||
    (lowerMessage.includes("request") && lowerMessage.includes("product")) ||
    (lowerMessage.includes("need") && (lowerMessage.includes("part") || lowerMessage.includes("parts"))) ||
    (lowerMessage.includes("available") && (lowerMessage.includes("part") || lowerMessage.includes("product")))
  ) {
    return "product_request"
  }

  // Don't use context to determine product request - this was causing false positives
  // Removed: hasRecentProductQuestion condition

  // Identify order-related questions
  if (
    lowerMessage.includes("order") ||
    lowerMessage.includes("purchase") ||
    lowerMessage.includes("buy") ||
    lowerMessage.includes("delivery") ||
    lowerMessage.includes("shipping") ||
    lowerMessage.includes("track") ||
    lowerMessage.includes("payment") ||
    lowerMessage.includes("checkout")
  ) {
    return "order_help"
  }

  // Identify car advice questions
  if (
    lowerMessage.includes("advice") ||
    lowerMessage.includes("recommend") ||
    lowerMessage.includes("suggest") ||
    lowerMessage.includes("which part") ||
    lowerMessage.includes("best part") ||
    lowerMessage.includes("compatible") ||
    lowerMessage.includes("fit my car")
  ) {
    return "car_advice"
  }

  // General automotive questions
  if (
    lowerMessage.includes("car") ||
    lowerMessage.includes("auto") ||
    lowerMessage.includes("vehicle") ||
    lowerMessage.includes("engine") ||
    lowerMessage.includes("transmission") ||
    lowerMessage.includes("brake") ||
    lowerMessage.includes("oil") ||
    lowerMessage.includes("tire") ||
    lowerMessage.includes("wheel") ||
    lowerMessage.includes("maintenance")
  ) {
    return "car_information"
  }

  // Warranty questions
  if (
    lowerMessage.includes("warranty") ||
    lowerMessage.includes("guarantee") ||
    lowerMessage.includes("return policy") ||
    lowerMessage.includes("coverage")
  ) {
    return "warranty"
  }

  // Complaint identification
  if (
    lowerMessage.includes("complaint") ||
    lowerMessage.includes("issue") ||
    lowerMessage.includes("problem") ||
    lowerMessage.includes("not working") ||
    lowerMessage.includes("defective") ||
    lowerMessage.includes("broken") ||
    lowerMessage.includes("disappointed") ||
    lowerMessage.includes("unhappy")
  ) {
    return "complaint"
  }

  // Suggestion identification
  if (
    lowerMessage.includes("suggest") ||
    lowerMessage.includes("suggestion") ||
    lowerMessage.includes("improve") ||
    lowerMessage.includes("enhancement") ||
    lowerMessage.includes("better if") ||
    lowerMessage.includes("would be nice")
  ) {
    return "suggestion"
  }

  // Default to question
  return "question"
}

// Extract product name from a request (if any)
function extractProductName(message: string): string | null {
  const productPhrases = [
    /looking for (.*?)( for| that| to|$)/i,
    /need (.*?)( for| that| to|$)/i,
    /want to (buy|find|get) (.*?)( for| that| to|$)/i,
    /do you (have|sell) (.*?)( for| that| to|\?|$)/i,
    /requesting (.*?)( for| that| to|$)/i,
    /any (.*?) available/i,
    /searching for (.*?)( for| that| to|$)/i,
    /find (.*?)( for| that| to|$)/i,
    /search for (.*?)( for| that| to|$)/i,
  ]

  for (const regex of productPhrases) {
    const match = message.match(regex)
    if (match && (match[1] || match[2])) {
      return match[1] || match[2].trim()
    }
  }

  return null
}

// Extract car model information if present
function extractCarModel(message: string): string | null {
  const carModelPhrases = [
    /for (?:my |a )?(.*?)(car|vehicle)/i,
    /(?:my|a) (.*?) (?:car|vehicle|model)/i,
    /(?:compatible with|works with|fits) (.*?)( car| model|\?|$)/i,
  ]

  for (const regex of carModelPhrases) {
    const match = message.match(regex)
    if (match && match[1]) {
      return match[1].trim()
    }
  }

  return null
}

// Extract category information if present
function extractCategory(message: string): string | null {
  const categoryPhrases = [
    /in (?:the )?(.*?) category/i,
    /(?:from|under) (?:the )?(.*?) category/i,
    /(?:category|section) (?:called|named) (.*?)( for| that| to|\?|$)/i,
    /(?:looking in|search in) (?:the )?(.*?) (?:category|section)/i,
  ]

  for (const regex of categoryPhrases) {
    const match = message.match(regex)
    if (match && match[1]) {
      return match[1].trim()
    }
  }

  return null
}

// Make responses more brief and simple

// Update the generateProfessionalResponse function to be more concise
function generateProfessionalResponse(feedbackType: string, productName: string | null, carModel: string | null): string {
  const productPhrase = productName ? `"${productName}"` : "this item";
  const carModelPhrase = carModel ? `for your ${carModel}` : "";
  
  // Simplified response templates
  const productRequestResponses = [
    `Thanks for asking about ${productPhrase}${carModelPhrase}. I'll check availability for you. Could you share your contact details for follow-up?`,
    `I'll look into ${productPhrase}${carModelPhrase} for you. Please provide your contact info so we can get back to you with details.`,
    `Got your request for ${productPhrase}${carModelPhrase}. Can we get your contact info to provide you with the details?`
  ];
  
  const complaintResponses = [
    "Sorry for the trouble. We'll address this right away. Would you like a callback from our support team?",
    "Thanks for letting us know. We'll fix this issue promptly. Can we contact you to follow up?",
    "We apologize for the inconvenience. Please provide your contact details so we can resolve this for you."
  ];
  
  const suggestionResponses = [
    "Thanks for your suggestion! We'll pass this to our product team for consideration.",
    "We appreciate your feedback. Your suggestion will help us improve our services.",
    "Thanks for the input! We're always looking to improve based on customer suggestions."
  ];
  
  const questionResponses = [
    "Here's what you need to know:",
    "I can help with that. Here's the information:",
    "Great question. Here's the answer:"
  ];
  
  // Select a random response from the appropriate category
  let responses;
  switch (feedbackType) {
    case 'product_request':
      responses = productRequestResponses;
      break;
    case 'complaint':
      responses = complaintResponses;
      break;
    case 'suggestion':
      responses = suggestionResponses;
      break;
    default:
      responses = questionResponses;
  }
  
  const randomIndex = Math.floor(Math.random() * responses.length);
  return responses[randomIndex];
}

// Update the generateNavigationResponse function to be more concise
function generateNavigationResponse(intent: string): string {
  switch (intent) {
    case 'navigate_products':
      return "You can find our products in the 'Products' section. Would you like me to recommend something specific?";
    
    case 'navigate_categories':
      return "We have categories for Engine, Transmission, Brakes, Suspension, Electrical, and Maintenance. Which are you interested in?";
    
    case 'navigate_shops':
      return "Check out our 'Shops' section for authorized retailers. Need a recommendation based on your location?";
    
    case 'navigate_models':
      return "You can filter parts by make, model, and year. What vehicle do you have?";
    
    case 'navigate_contact':
      return "You can reach us at +201155003537 (9am-9pm), email zabtteg@gmail.com, or use live chat. How can we help?";
    
    case 'navigate_faq':
      return "Our FAQ covers ordering, payment, shipping, returns, and warranties. What specific info do you need?";
    
    case 'human_agent':
      return "Our team is available at +201155003537 (9am-5pm) or email zabtteg@gmail.com. Would you like us to contact you?";
    
    case 'order_help':
      return "Our checkout process is simple and secure with multiple payment options. What specific help do you need with your order?";
    
    case 'car_advice':
      return "I can help find the right parts for your vehicle. What's your car's make, model, and year?";
    
    case 'car_information':
      return "What specific automotive information are you looking for? I can help with maintenance, repairs, or part recommendations.";
    
    case 'warranty':
      return "Our products include warranties from 12 months to lifetime. We also offer a 30-day satisfaction guarantee. Need details on a specific product?";
    
    case 'product_search':
      return "What specific part are you looking for? Any details on compatibility or specifications will help me find the right match.";
    
    default:
      return "Hi! I'm your Zabtt Automotive Parts assistant. How can I help you today?";
  }
}

// Knowledge base for common automotive questions
const automotiveKnowledgeBase: Record<string, string> = {
  // Brake system
  "brake pad replacement":
    "Brake pad replacement is recommended every 30,000-70,000 kilometers depending on driving conditions. Signs of wear include squealing noises, longer stopping distances, and vibration when braking. We offer ceramic, semi-metallic, and organic brake pad options to suit different driving styles and vehicle requirements.",

  "brake fluid":
    "Brake fluid should be replaced every 2 years or 40,000 kilometers. We recommend DOT 4 fluid for most modern vehicles as it offers superior heat resistance and moisture protection compared to DOT 3. Low brake fluid can indicate leaks or worn brake pads.",

  // Engine components
  "oil change":
    "Regular oil changes are crucial for engine longevity. For conventional oil, we recommend changes every 5,000-7,500 kilometers. Synthetic oil can last 10,000-15,000 kilometers. Our premium synthetic oils provide enhanced protection against wear, heat, and deposits.",

  "spark plugs":
    "Spark plugs should typically be replaced every 30,000-100,000 kilometers depending on the type. Premium iridium or platinum plugs offer longer service life and improved performance. Signs of failing spark plugs include rough idling, difficulty starting, and reduced fuel efficiency.",

  // Electrical system
  "battery replacement":
    "Car batteries typically last 3-5 years. Signs of failure include slow engine cranking, dimming headlights, and electrical issues. We offer maintenance-free batteries with extended warranties and free installation with purchase.",

  "alternator problems":
    "Alternator issues often manifest as dimming lights, battery warning lights, strange noises, or frequent battery drain. Our alternators come with built-in voltage regulators and are tested to meet or exceed OEM specifications.",

  // Suspension
  "shock absorbers":
    "Shock absorbers typically need replacement every 80,000-100,000 kilometers. Signs of wear include excessive bouncing, uneven tire wear, and vehicle swaying. We offer standard, heavy-duty, and performance options to suit different driving requirements.",

  struts:
    "Struts are integral components that affect both ride comfort and handling. They typically last 80,000-100,000 kilometers. Warning signs include knocking noises when driving over bumps, excessive nose-diving during braking, and uneven tire wear.",

  // Maintenance
  "air filter":
    "Engine air filters should be replaced every 15,000-30,000 kilometers. A clogged air filter can reduce fuel efficiency by up to 10%. Our premium filters offer superior dust and particle capture while maintaining optimal airflow.",

  "cabin filter":
    "Cabin air filters should be replaced every 15,000-25,000 kilometers or annually. They improve air quality inside the vehicle by filtering dust, pollen, and pollutants. Our activated carbon filters also reduce odors and harmful gases.",

  // Tires
  "tire rotation":
    "Tire rotation is recommended every 10,000 kilometers to ensure even wear and extend tire life. Front and rear tires often wear differently due to weight distribution and driving dynamics. Regular rotation can extend tire life by up to 20%.",

  "tire pressure":
    "Maintaining proper tire pressure improves safety, handling, and fuel efficiency. We recommend checking pressure monthly and before long trips. The correct pressure specifications can be found in your vehicle's owner manual or door jamb sticker.",
}

// Update the generateGeneralResponse function to be more concise
function generateGeneralResponse(message: string): string {
  const lowerMessage = message.toLowerCase()

  // Check knowledge base for specific topics
  for (const [keyword, response] of Object.entries(automotiveKnowledgeBase)) {
    if (lowerMessage.includes(keyword)) {
      return response
    }
  }

  // Shipping/delivery questions
  if (lowerMessage.includes('shipping') || lowerMessage.includes('delivery') || lowerMessage.includes('arrive')) {
    return "Standard delivery takes 3-5 business days, with expedited 48-hour options in major cities. All orders include tracking and delivery notifications.";
  }

  // Return/refund questions
  if (lowerMessage.includes('return') || lowerMessage.includes('refund') || lowerMessage.includes('money back')) {
    return "You can return items within 14 days in original condition. Refunds process in 5-7 days. We offer free return shipping for fitment issues.";
  }

  // Payment questions
  if (lowerMessage.includes('payment') || lowerMessage.includes('pay') || lowerMessage.includes('cash')) {
    return "We accept credit/debit cards, mobile payments (Fawry/Vodafone Cash), and cash on delivery in eligible areas.";
  }

  // Discount/coupon questions
  if (lowerMessage.includes('discount') || lowerMessage.includes('coupon') || lowerMessage.includes('promo') || lowerMessage.includes('offer')) {
    return "First-time customers get 10% off. Subscribe to our newsletter for exclusive promotions and join our loyalty program for ongoing benefits.";
  }

  // Compatibility questions
  if (lowerMessage.includes('compatible') || lowerMessage.includes('fit') || lowerMessage.includes('work with')) {
    return "You can filter parts by your vehicle's make, model, and year to ensure compatibility. Need help with a specific part?";
  }

  // Installation questions
  if (lowerMessage.includes('install') || lowerMessage.includes('fit') || lowerMessage.includes('replace') || lowerMessage.includes('how to')) {
    return "Most parts come with installation instructions. We can recommend service centers for complex installations or provide video tutorials.";
  }

  // Quality and brand questions
  if (lowerMessage.includes('quality') || lowerMessage.includes('brand') || lowerMessage.includes('best') || lowerMessage.includes('reliable')) {
    return "We carry trusted brands like Bosch, DENSO, Continental, ACDelco, and Motorcraft with quality ratings and reviews for each product.";
  }

  // General greeting or hello
  if (lowerMessage.includes('hi') || lowerMessage.includes('hello') || lowerMessage.includes('hey') || lowerMessage === 'hi' || lowerMessage === 'hello') {
    return "Hello! I'm your Zabtt Automotive Parts assistant. How can I help you today?";
  }

  // Default response - more professional
  return "I'm here to help with finding parts, checking compatibility, and answering questions about our products. What can I assist you with?";
}

// Define request and response types for better type safety
interface ChatRequest {
  message: string
  userId?: string | null
  email?: string | null
  phoneNumber?: string | null
  productName?: string | null
  context?: string[]
}

interface ChatResponse {
  response: string
  feedbackType: string
  productName?: string | null
  carModel?: string | null
  category?: string | null
  saved: boolean
  error?: string
}

// Declare Deno if it's not already declared
declare const Deno: any

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    })
  }

  try {
    const {
      message,
      userId,
      email,
      phoneNumber,
      productName: explicitProductName,
      context = [],
    } = (await req.json()) as ChatRequest

    // Enhanced NLP processing with context awareness
    const feedbackType = identifyIntent(message, context)
    const productName = explicitProductName || extractProductName(message)
    const carModel = extractCarModel(message)
    const category = extractCategory(message)

    // Generate appropriate response based on feedback type
    let response = ""
    let saved = false

    // Handle navigation intents
    if (
      feedbackType.startsWith("navigate_") ||
      feedbackType === "human_agent" ||
      feedbackType === "order_help" ||
      feedbackType === "car_advice" ||
      feedbackType === "car_information" ||
      feedbackType === "warranty" ||
      feedbackType === "product_search"
    ) {
      response = generateNavigationResponse(feedbackType)
    } else if (feedbackType === "product_request" || feedbackType === "complaint" || feedbackType === "suggestion") {
      // If it's a product request and we have an explicit product name or extracted one
      if (feedbackType === "product_request" && (explicitProductName || productName)) {
        await supabase.from("chat_feedback").insert({
          user_id: userId || null,
          email: email || null,
          phone_number: phoneNumber || null,
          feedback_type: feedbackType,
          message: message,
          product_name: explicitProductName || productName,
          car_model: carModel,
          category: category || (feedbackType === "product_request" ? "auto_parts" : null),
        })
        response = generateProfessionalResponse(feedbackType, explicitProductName || productName, carModel)
        saved = true
      } else if (feedbackType === "product_request" && !productName) {
        // FIXED: Only ask for product name if it's clearly a product request
        // Check if the message is explicitly asking for a product
        const isExplicitProductRequest =
          message.toLowerCase().includes("looking for") ||
          message.toLowerCase().includes("need a part") ||
          message.toLowerCase().includes("find me a") ||
          message.toLowerCase().includes("do you have") ||
          message.toLowerCase().includes("searching for")

        if (isExplicitProductRequest) {
          response =
            "To better assist you with your inquiry, could you please specify the exact part or product you're looking for? This will help us provide you with accurate information regarding availability, compatibility, and pricing."
          saved = false
        } else {
          // If it's not clearly a product request, treat it as a general question
          response = generateGeneralResponse(message)
        }
      } else {
        await supabase.from("chat_feedback").insert({
          user_id: userId || null,
          email: email || null,
          phone_number: phoneNumber || null,
          feedback_type: feedbackType,
          message: message,
          product_name: productName,
          car_model: carModel,
          category: category || (feedbackType === "product_request" ? "auto_parts" : null),
        })
        response = generateProfessionalResponse(feedbackType, productName, carModel)
        saved = true
      }
    } else {
      // Handle general questions with more professional responses
      response = generateGeneralResponse(message)
    }

    const responseData: ChatResponse = {
      response,
      feedbackType,
      productName,
      carModel,
      category,
      saved,
    }

    return new Response(JSON.stringify(responseData), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    })
  } catch (error: any) {
    console.error("Error processing chat message:", error)
    return new Response(
      JSON.stringify({
        error: error.message,
        response:
          "I apologize, but I've encountered a technical issue while processing your request. Our system administrators have been notified. In the meantime, please try rephrasing your question or contact our customer support team directly at zabtteg@gmail.com.",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    )
  }
})
