
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Create a Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Enhanced NLP for identifying intents from user messages
function identifyIntent(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  // Identify navigation requests - improved detection
  if (
    lowerMessage.includes('navigate') || 
    lowerMessage.includes('go to') || 
    lowerMessage.includes('find') ||
    lowerMessage.includes('where is') ||
    lowerMessage.includes('how do i get to') ||
    lowerMessage.includes('show me') ||
    lowerMessage.includes('take me to') ||
    lowerMessage.includes('direct me to') ||
    lowerMessage.includes('i want to see')
  ) {
    // Check for specific navigation targets with improved specificity
    if (
      lowerMessage.includes('product') || 
      lowerMessage.includes('item') ||
      lowerMessage.includes('part') ||
      lowerMessage.includes('buy') ||
      lowerMessage.includes('purchase')
    ) {
      return 'navigate_products';
    }
    
    if (
      lowerMessage.includes('categor')
    ) {
      return 'navigate_categories';
    }
    
    if (
      lowerMessage.includes('shop') ||
      lowerMessage.includes('store') ||
      lowerMessage.includes('dealer')
    ) {
      return 'navigate_shops';
    }
    
    if (
      lowerMessage.includes('car model') ||
      lowerMessage.includes('vehicle model') ||
      lowerMessage.includes('model') ||
      lowerMessage.includes('car type') ||
      lowerMessage.includes('make and model')
    ) {
      return 'navigate_models';
    }
    
    if (
      lowerMessage.includes('contact') ||
      lowerMessage.includes('reach you') ||
      lowerMessage.includes('talk to human') ||
      lowerMessage.includes('talk to someone') ||
      lowerMessage.includes('speak with') ||
      lowerMessage.includes('human agent') ||
      lowerMessage.includes('real person') ||
      lowerMessage.includes('customer service') ||
      lowerMessage.includes('support team')
    ) {
      return 'navigate_contact';
    }
    
    if (
      lowerMessage.includes('faq') ||
      lowerMessage.includes('frequently asked') ||
      lowerMessage.includes('question') ||
      lowerMessage.includes('help section')
    ) {
      return 'navigate_faq';
    }
  }
  
  // Identify product search requests - new intent
  if (
    (lowerMessage.includes('search') || lowerMessage.includes('find') || lowerMessage.includes('looking for')) && 
    (lowerMessage.includes('product') || lowerMessage.includes('part') || lowerMessage.includes('item'))
  ) {
    return 'product_search';
  }
  
  // Identify human agent requests
  if (
    lowerMessage.includes('human') ||
    lowerMessage.includes('agent') ||
    lowerMessage.includes('person') ||
    lowerMessage.includes('representative') ||
    lowerMessage.includes('customer service') ||
    lowerMessage.includes('talk to someone') ||
    lowerMessage.includes('speak to someone') ||
    lowerMessage.includes('live chat')
  ) {
    return 'human_agent';
  }
  
  // Identify product requests
  if (
    lowerMessage.includes('do you have') || 
    lowerMessage.includes('looking for') || 
    lowerMessage.includes('find') || 
    lowerMessage.includes('search') ||
    lowerMessage.includes('request') && lowerMessage.includes('product') ||
    lowerMessage.includes('need') && (lowerMessage.includes('part') || lowerMessage.includes('parts')) ||
    lowerMessage.includes('available') && (lowerMessage.includes('part') || lowerMessage.includes('product'))
  ) {
    return 'product_request';
  }
  
  // Identify order-related questions
  if (
    lowerMessage.includes('order') || 
    lowerMessage.includes('purchase') || 
    lowerMessage.includes('buy') || 
    lowerMessage.includes('delivery') ||
    lowerMessage.includes('shipping') ||
    lowerMessage.includes('track') ||
    lowerMessage.includes('payment') ||
    lowerMessage.includes('checkout')
  ) {
    return 'order_help';
  }

  // Identify car advice questions
  if (
    lowerMessage.includes('advice') || 
    lowerMessage.includes('recommend') || 
    lowerMessage.includes('suggest') || 
    lowerMessage.includes('which part') ||
    lowerMessage.includes('best part') ||
    lowerMessage.includes('compatible') ||
    lowerMessage.includes('fit my car')
  ) {
    return 'car_advice';
  }
  
  // General automotive questions
  if (
    lowerMessage.includes('car') ||
    lowerMessage.includes('auto') ||
    lowerMessage.includes('vehicle') ||
    lowerMessage.includes('engine') ||
    lowerMessage.includes('transmission') ||
    lowerMessage.includes('brake') ||
    lowerMessage.includes('oil') ||
    lowerMessage.includes('tire') ||
    lowerMessage.includes('wheel') ||
    lowerMessage.includes('maintenance')
  ) {
    return 'car_information';
  }
  
  // Warranty questions
  if (
    lowerMessage.includes('warranty') ||
    lowerMessage.includes('guarantee') ||
    lowerMessage.includes('return policy') ||
    lowerMessage.includes('coverage')
  ) {
    return 'warranty';
  }
  
  // Default to question
  return 'question';
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
  ];
  
  for (const regex of productPhrases) {
    const match = message.match(regex);
    if (match && (match[1] || match[2])) {
      return match[1] || match[2].trim();
    }
  }
  
  return null;
}

// Extract car model information if present
function extractCarModel(message: string): string | null {
  const carModelPhrases = [
    /for (?:my |a )?(.*?)(car|vehicle)/i,
    /(?:my|a) (.*?) (?:car|vehicle|model)/i,
    /(?:compatible with|works with|fits) (.*?)( car| model|\?|$)/i,
  ];
  
  for (const regex of carModelPhrases) {
    const match = message.match(regex);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  return null;
}

// Extract category information if present
function extractCategory(message: string): string | null {
  const categoryPhrases = [
    /in (?:the )?(.*?) category/i,
    /(?:from|under) (?:the )?(.*?) category/i,
    /(?:category|section) (?:called|named) (.*?)( for| that| to|\?|$)/i,
    /(?:looking in|search in) (?:the )?(.*?) (?:category|section)/i,
  ];
  
  for (const regex of categoryPhrases) {
    const match = message.match(regex);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  return null;
}

// Make responses more concise and conversational
function generateConversationalResponse(feedbackType: string, productName: string | null, carModel: string | null): string {
  const productPhrase = productName ? `"${productName}"` : "that item";
  const carModelPhrase = carModel ? `for your ${carModel}` : "";
  
  // More concise response templates
  const productRequestResponses = [
    `Thanks for asking about ${productPhrase}. Could you share your phone number so we can contact you when it's available?`,
    `I've noted your interest in ${productPhrase}. Please leave your contact details to be notified when available.`,
    `We'll check availability for ${productPhrase}. Leave your number so we can update you.`
  ];
  
  const complaintResponses = [
    "I'm sorry for the issue. Our team will address this right away. Would you like a callback?",
    "Your feedback is important. We'll look into this promptly. May we have your contact details?",
    "Thank you for letting us know. Someone from our team will reach out shortly."
  ];
  
  const suggestionResponses = [
    "Great suggestion! I've passed this to our team.",
    "Thanks for your feedback! We appreciate your ideas.",
    "Your suggestion has been noted. We value your input!"
  ];
  
  const questionResponses = [
    "Happy to help with that.",
    "I can assist with that.",
    "Here's what I can tell you:"
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

// Generate more concise navigation responses
function generateNavigationResponse(intent: string): string {
  switch (intent) {
    case 'navigate_products':
      return "Our products can be found in the 'Products' section. Would you like me to search for something specific?";
    
    case 'navigate_categories':
      return "We organize parts by categories like engine, brakes, and electrical. Which category interests you?";
    
    case 'navigate_shops':
      return "You can view our partner shops in the 'Shops' section. Each has ratings and specialties. Need a recommendation?";
    
    case 'navigate_models':
      return "Use our car model filter to find compatible parts. What make and model do you drive?";
    
    case 'navigate_contact':
      return "Contact our support team via the 'Contact' page. Available daily 9am-9pm at +201155003537 or zabtteg@gmail.com.";
    
    case 'navigate_faq':
      return "Check our FAQ section for answers about ordering, shipping, returns, and compatibility.";
    
    case 'human_agent':
      return "Our team is available 9am-5pm daily. Call +201155003537 or email zabtteg@gmail.com. What can they help with?";
    
    case 'order_help':
      return "Add products to cart and proceed to checkout. Track orders in your account. Shipping takes 2-3 business days. Questions about payment or returns?";
    
    case 'car_advice':
      return "I'd be happy to help find the right parts. What's your car's make, model, and year?";
    
    case 'car_information':
      return "I can help with maintenance needs and troubleshooting. What specific information do you need?";
      
    case 'warranty':
      return "All products include at least a 1-year warranty. Premium parts have up to 3-year coverage. Returns accepted within 30 days.";
    
    case 'product_search':
      return "What specific product are you looking for? Knowing the part number or car model would help narrow it down.";
    
    default:
      return "How can I help you today? I can assist with finding products, checking compatibility, or answering questions about our services.";
  }
}

// Generate concise responses for general questions
function generateGeneralResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  // Shipping/delivery questions
  if (lowerMessage.includes('shipping') || lowerMessage.includes('delivery') || lowerMessage.includes('arrive')) {
    return "Standard shipping: 3-5 days nationwide, 48 hours in major cities. Express options available at checkout. All shipments include tracking.";
  }
  
  // Return/refund questions
  if (lowerMessage.includes('return') || lowerMessage.includes('refund') || lowerMessage.includes('money back')) {
    return "14-day hassle-free returns for items in original condition. Refunds process in 5-7 days to your original payment method.";
  }
  
  // Payment questions
  if (lowerMessage.includes('payment') || lowerMessage.includes('pay') || lowerMessage.includes('cash')) {
    return "We accept credit/debit cards, mobile wallets (Fawry/Vodafone Cash), and cash on delivery in most areas.";
  }
  
  // Discount/coupon questions
  if (lowerMessage.includes('discount') || lowerMessage.includes('coupon') || lowerMessage.includes('promo') || lowerMessage.includes('offer')) {
    return "Current promotions are on our homepage. First-time customers get 10% off. Subscribe to our newsletter for exclusive discounts.";
  }
  
  // Compatibility questions
  if (lowerMessage.includes('compatible') || lowerMessage.includes('fit') || lowerMessage.includes('work with')) {
    return "Each product page shows compatible vehicles. Filter by your car's make/model/year to find matching parts. What vehicle do you have?";
  }
  
  // Installation questions
  if (lowerMessage.includes('install') || lowerMessage.includes('fit') || lowerMessage.includes('replace') || lowerMessage.includes('how to')) {
    return "We provide installation instructions with most parts. For complex installations, we can recommend nearby service centers.";
  }
  
  // Quality and brand questions
  if (lowerMessage.includes('quality') || lowerMessage.includes('brand') || lowerMessage.includes('best') || lowerMessage.includes('reliable')) {
    return "We stock quality parts from trusted brands like Bosch, DENSO, Continental, ACDelco and Motorcraft. Each listing includes quality ratings.";
  }
  
  // General greeting or hello
  if (lowerMessage.includes('hi') || lowerMessage.includes('hello') || lowerMessage.includes('hey') || lowerMessage === 'hi' || lowerMessage === 'hello') {
    return "Hello! How can I help with your car parts needs today?";
  }
  
  // Default response - more concise
  return "I'm your virtual assistant for car parts. How can I help you today?";
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userId, email, phoneNumber, productName: explicitProductName } = await req.json();
    
    // Basic NLP processing
    const feedbackType = identifyIntent(message);
    let productName = explicitProductName || extractProductName(message);
    const carModel = extractCarModel(message);
    const category = extractCategory(message);
    
    // Generate appropriate response based on feedback type
    let response = '';
    let saved = false;
    
    // Handle navigation intents
    if (feedbackType.startsWith('navigate_') || feedbackType === 'human_agent' || feedbackType === 'order_help' || 
        feedbackType === 'car_advice' || feedbackType === 'car_information' || feedbackType === 'warranty' || 
        feedbackType === 'product_search') {
      response = generateNavigationResponse(feedbackType);
    }
    // Store feedback in database for product requests, complaints and suggestions
    else if (feedbackType === 'product_request' || feedbackType === 'complaint' || feedbackType === 'suggestion') {
      // If it's a product request and we have an explicit product name or extracted one
      if (feedbackType === 'product_request' && (explicitProductName || productName)) {
        await supabase.from('chat_feedback').insert({
          user_id: userId || null,
          email: email || null,
          phone_number: phoneNumber || null,
          feedback_type: feedbackType,
          message: message,
          product_name: explicitProductName || productName,
          car_model: carModel,
          category: category || (feedbackType === 'product_request' ? 'auto_parts' : null),
        });
        
        response = generateConversationalResponse(feedbackType, explicitProductName || productName, carModel);
        saved = true;
      } 
      // If it's a product request but we don't have a product name
      else if (feedbackType === 'product_request' && !productName) {
        // We'll ask for the product name, but not save the request yet
        response = "Could you please specify the name of the product you're looking for?";
        saved = false;
      }
      // Handle other feedback types
      else {
        await supabase.from('chat_feedback').insert({
          user_id: userId || null,
          email: email || null,
          phone_number: phoneNumber || null,
          feedback_type: feedbackType,
          message: message,
          product_name: productName,
          car_model: carModel,
          category: category || (feedbackType === 'product_request' ? 'auto_parts' : null),
        });
        
        response = generateConversationalResponse(feedbackType, productName, carModel);
        saved = true;
      }
    } else {
      // Handle general questions
      response = generateGeneralResponse(message);
    }

    return new Response(JSON.stringify({ 
      response,
      feedbackType,
      productName,
      carModel,
      category,
      saved
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error processing chat message:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      response: "Sorry, I encountered a problem. Please try again or rephrase your question."
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
