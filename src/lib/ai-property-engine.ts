import {
  LISTINGS,
  filterListings,
  formatUGX,
  formatUSD,
  formatPrice,
  type Listing,
} from "./listings";
import { SITE } from "./site";

export type GreetingType = "morning" | "afternoon" | "evening" | "night" | "general" | undefined;

export type ParsedIntent = {
  listing?: "sale" | "rent" | "shortlet" | "jv" | undefined;
  category?: "houses" | "flats" | "land" | "commercial" | "shortlets" | "offices" | undefined;
  location?: string | undefined;
  type?: string | undefined;
  minPrice?: number | undefined;
  maxPrice?: number | undefined;
  beds?: number | undefined;
  furnished?: boolean | undefined;
  serviced?: boolean | undefined;
  isAskingForAgent?: boolean | undefined;
  isAskingForRequestPost?: boolean | undefined;
  isLegalOrTitleQuestion?: boolean | undefined;
  isGreeting?: boolean | undefined;
  greetingType?: GreetingType;
  isGratitude?: boolean | undefined;
  isSmallTalk?: boolean | undefined;
  isUserFeelingStatus?: boolean | undefined;
  userFeeling?: "good" | "tired" | "stressed" | "excited" | undefined;
  isIdentityQuestion?: boolean | undefined;
  isBrowsing?: boolean | undefined;
  isAdviceQuestion?: boolean | undefined;
  isBudgetConcern?: boolean | undefined;
};

export type AiAssistantResponse = {
  text: string;
  properties?: Listing[] | undefined;
  showLeadCapture?: boolean | undefined;
  suggestedPrompts?: string[] | undefined;
};

export function parsePropertyQuery(query: string): ParsedIntent {
  const q = query.toLowerCase().trim();
  const result: ParsedIntent = {};

  // 1. SPECIFIC TIME-OF-DAY GREETINGS (handles morng, mrng, aftn, evng, etc.)
  const morningRegex =
    /\b(good\s*(morning|mornin|morng|mrng|morn)|gmorning|gm|morning|mornin|morng|mrng)\b/i;
  const afternoonRegex = /\b(good\s*(afternoon|aftrnoon|aftn|arvo)|afternoon|aftrnoon|aftn|ga)\b/i;
  const eveningRegex = /\b(good\s*(evening|evng|eve)|evening|evng|eve|ge)\b/i;
  const nightRegex = /\b(good\s*(night|nite)|goodnight|goodnite|night|gn)\b/i;
  const generalGreetingRegex =
    /\b(hello|helo|hellow|hi|hii|hiii|hey|heyy|heya|hullo|howdy|yo|sup|wassup|what'?s\s*up|whats\s*up|oli\s*otya|gyebaleko|habari|hujambo|ki\s*kati|mambo|jambo|sipi|salut|bonjour|greetings|nice\s*to\s*meet\s*you)\b/i;

  if (morningRegex.test(q)) {
    result.isGreeting = true;
    result.greetingType = "morning";
  } else if (afternoonRegex.test(q)) {
    result.isGreeting = true;
    result.greetingType = "afternoon";
  } else if (eveningRegex.test(q)) {
    result.isGreeting = true;
    result.greetingType = "evening";
  } else if (nightRegex.test(q)) {
    result.isGreeting = true;
    result.greetingType = "night";
  } else if (generalGreetingRegex.test(q)) {
    result.isGreeting = true;
    result.greetingType = "general";
  }

  // 2. USER STATUS & FEELINGS ("I am fine", "I'm good", "stressed", "excited")
  if (
    /\b(i'?m\s*(good|fine|okay|ok|doing\s*well|great|alright|blessed|doing\s*good))\b/i.test(q) ||
    /\b(doing\s*good|all\s*good|not\s*bad|pretty\s*good|very\s*well)\b/i.test(q)
  ) {
    result.isUserFeelingStatus = true;
    result.userFeeling = "good";
  } else if (/\b(tired|exhausted|rough\s*day|stressed|overwhelmed|headache)\b/i.test(q)) {
    result.isUserFeelingStatus = true;
    result.userFeeling = "tired";
  } else if (/\b(excited|happy|thrilled|looking\s*forward)\b/i.test(q)) {
    result.isUserFeelingStatus = true;
    result.userFeeling = "excited";
  }

  // 3. GRATITUDE & COURTESIES
  if (
    /\b(thank\s*you|thanks|thank\s*u|thx|webale|asante|appreciated|much\s*appreciated|grateful|you\s*are\s*the\s*best)\b/i.test(
      q,
    )
  ) {
    result.isGratitude = true;
  }

  // 4. SMALL TALK / "HOW ARE YOU" / "HOW IS YOUR DAY"
  if (
    q.includes("how are you") ||
    q.includes("how r u") ||
    q.includes("how is your day") ||
    q.includes("how's your day") ||
    q.includes("how was your day") ||
    q.includes("how are you doing") ||
    q.includes("how you doing") ||
    q.includes("how do you do") ||
    q.includes("how is everything") ||
    q.includes("how is it going") ||
    q.includes("how's it going") ||
    q.includes("how's life") ||
    q.includes("how are things")
  ) {
    result.isSmallTalk = true;
  }

  // 5. IDENTITY & WHO ARE YOU
  if (
    q.includes("who are you") ||
    q.includes("what is your name") ||
    q.includes("what can you do") ||
    q.includes("what do you do") ||
    q.includes("tell me about yourself") ||
    q.includes("are you human") ||
    q.includes("are you real") ||
    q.includes("are you a robot") ||
    q.includes("are you an ai") ||
    q.includes("who am i talking to")
  ) {
    result.isIdentityQuestion = true;
  }

  // 6. CASUAL BROWSING / "JUST LOOKING"
  if (
    q.includes("just looking") ||
    q.includes("just browsing") ||
    q.includes("just checking") ||
    q.includes("window shopping") ||
    q.includes("not ready yet") ||
    q.includes("not sure what i want") ||
    q.includes("looking around")
  ) {
    result.isBrowsing = true;
  }

  // 7. ADVICE / RECOMMENDATIONS / FIRST TIME BUYERS
  if (
    q.includes("where should i live") ||
    q.includes("where should i buy") ||
    q.includes("best place to live") ||
    q.includes("best neighborhood") ||
    q.includes("best area") ||
    q.includes("where to invest") ||
    q.includes("recommend a place") ||
    q.includes("give me advice") ||
    q.includes("where do i start") ||
    q.includes("first time buyer") ||
    q.includes("don't know where to start") ||
    q.includes("i need advice") ||
    q.includes("help me choose")
  ) {
    result.isAdviceQuestion = true;
  }

  // 8. BUDGET CONCERNS / NEGOTIATIONS / INSTALLMENTS
  if (
    q.includes("too expensive") ||
    q.includes("too costly") ||
    q.includes("cheaper") ||
    q.includes("affordable") ||
    q.includes("low budget") ||
    q.includes("can i negotiate") ||
    q.includes("discount") ||
    q.includes("installments") ||
    q.includes("payment plan") ||
    q.includes("monthly payment")
  ) {
    result.isBudgetConcern = true;
  }

  // 9. INTENT
  if (q.includes("rent") || q.includes("to let") || q.includes("lease")) {
    result.listing = "rent";
  } else if (
    q.includes("shortlet") ||
    q.includes("short let") ||
    q.includes("daily") ||
    q.includes("airbnb")
  ) {
    result.listing = "shortlet";
  } else if (q.includes("joint venture") || q.includes("jv")) {
    result.listing = "jv";
  } else if (q.includes("buy") || q.includes("for sale") || q.includes("purchase")) {
    result.listing = "sale";
  }

  // 10. CATEGORY
  if (
    q.includes("house") ||
    q.includes("bungalow") ||
    q.includes("duplex") ||
    q.includes("townhouse") ||
    q.includes("mansion") ||
    q.includes("villa") ||
    q.includes("home")
  ) {
    result.category = "houses";
  } else if (
    q.includes("flat") ||
    q.includes("apartment") ||
    q.includes("condo") ||
    q.includes("studio") ||
    q.includes("condominium")
  ) {
    result.category = "flats";
  } else if (
    q.includes("land") ||
    q.includes("plot") ||
    q.includes("acre") ||
    q.includes("decimal") ||
    q.includes("farm") ||
    q.includes("estate")
  ) {
    result.category = "land";
  } else if (
    q.includes("office") ||
    q.includes("shop") ||
    q.includes("warehouse") ||
    q.includes("commercial") ||
    q.includes("hotel") ||
    q.includes("arcade") ||
    q.includes("plaza")
  ) {
    result.category = "commercial";
  }

  // 11. COMMON UGANDAN LOCATIONS
  const ugandanLocations = [
    "naalya",
    "kira",
    "kololo",
    "nakasero",
    "naguru",
    "muyenga",
    "munyonyo",
    "ntinda",
    "kyanja",
    "najjera",
    "bukoto",
    "bugolobi",
    "kisaasi",
    "lubowa",
    "entebbe",
    "matugga",
    "nansana",
    "gayaza",
    "kasangati",
    "mukono",
    "namanve",
    "namataba",
    "wakiso",
    "kampala",
    "jinja",
    "mbarara",
    "gulu",
    "soroti",
    "fort portal",
    "hoima",
    "arua",
    "mityana",
    "buwama",
    "kakiri",
    "kayunga",
    "banda",
    "kikuubo",
    "kigo",
    "garuga",
    "rubaga",
    "makindye",
    "kawempe",
  ];

  for (const loc of ugandanLocations) {
    if (q.includes(loc)) {
      result.location = loc.charAt(0).toUpperCase() + loc.slice(1);
      break;
    }
  }

  // 12. Bedrooms
  const bedMatch = q.match(/(\d+)\s*(?:bed|bedroom|bhk|bdrm)/i);
  if (bedMatch && bedMatch[1]) {
    result.beds = parseInt(bedMatch[1], 10);
  }

  // 13. Budget detection
  const billionMatch = q.match(/(?:ush|ugx|shs|sh)?\s*(\d+(?:\.\d+)?)\s*(?:b|billion)/i);
  if (billionMatch && billionMatch[1]) {
    result.maxPrice = parseFloat(billionMatch[1]) * 1_000_000_000;
  } else {
    const millionMatch = q.match(/(?:ush|ugx|shs|sh)?\s*(\d+(?:\.\d+)?)\s*(?:m|million|mils)/i);
    if (millionMatch && millionMatch[1]) {
      result.maxPrice = parseFloat(millionMatch[1]) * 1_000_000;
    } else {
      const usdMatch = q.match(/\$\s*(\d+(?:,\d+)?(?:\.\d+)?)\s*(?:k|thousand)?/i);
      if (usdMatch && usdMatch[1]) {
        let usdVal = parseFloat(usdMatch[1].replace(/,/g, ""));
        if (q.includes("k") || q.includes("thousand")) usdVal *= 1000;
        result.maxPrice = usdVal * 3750;
      }
    }
  }

  // 14. Furnished / Serviced
  if (q.includes("furnished")) result.furnished = true;
  if (q.includes("serviced")) result.serviced = true;

  // 15. Agent contact requests
  if (
    q.includes("call") ||
    q.includes("phone") ||
    q.includes("agent") ||
    q.includes("whatsapp") ||
    q.includes("contact") ||
    q.includes("talk to a person") ||
    q.includes("talk to someone") ||
    q.includes("speak to")
  ) {
    result.isAskingForAgent = true;
  }

  // 16. Property sourcing request
  if (
    q.includes("request") ||
    q.includes("post a request") ||
    q.includes("custom search") ||
    q.includes("find for me")
  ) {
    result.isAskingForRequestPost = true;
  }

  // 17. Land title / Legal / Due diligence
  if (
    q.includes("title") ||
    q.includes("kibanja") ||
    q.includes("mailo") ||
    q.includes("freehold") ||
    q.includes("leasehold") ||
    q.includes("scam") ||
    q.includes("stamp duty") ||
    q.includes("lawyer") ||
    q.includes("surveyor")
  ) {
    result.isLegalOrTitleQuestion = true;
  }

  return result;
}

export function generateAssistantResponse(
  query: string,
  currentCurrency: string = "UGX",
): AiAssistantResponse {
  const intent = parsePropertyQuery(query);
  const q = query.toLowerCase().trim();

  const hasSpecificPropertyCriteria =
    Boolean(intent.location) ||
    Boolean(intent.category) ||
    Boolean(intent.listing) ||
    Boolean(intent.maxPrice) ||
    Boolean(intent.beds) ||
    Boolean(intent.type);

  // =========================================================================
  // 1. DEDICATED TIME-OF-DAY GREETINGS (MORNING, AFTERNOON, EVENING, NIGHT)
  // =========================================================================
  if (intent.greetingType === "morning" && !hasSpecificPropertyCriteria) {
    return {
      text: `Good morning! ☀️ I hope you had a restful night and that your day is off to a bright and energetic start!\n\nI'm doing really well this morning, thank you for checking in! How are you feeling today?\n\nI'm your personal property companion at **AMDERN PROPERTIES SMC LTD**. Whether you are thinking about finding a lovely family home in Wakiso, looking for a convenient rental apartment in Kampala, or scouting titled land, I'm right here with you.\n\nWhat kind of property thoughts or plans are on your mind this morning?`,
      suggestedPrompts: [
        "Houses for Sale in Naalya",
        "Apartments for Rent in Kololo",
        "Titled Land in Kira",
        "How do I verify a land title in Uganda?",
      ],
    };
  }

  if (intent.greetingType === "afternoon" && !hasSpecificPropertyCriteria) {
    return {
      text: `Good afternoon! 🌤️ I hope you are having a productive, smooth, and pleasant day so far!\n\nI'm doing wonderfully and feeling great, thank you for greeting me! How is your afternoon going?\n\nWhether you'd like to take a break and browse dream homes, check neighborhood rental prices, or ask questions about buying land safely in Uganda, I'm right here to chat.\n\nWhat would you like to explore this afternoon?`,
      suggestedPrompts: [
        "Family Houses in Wakiso under 600M",
        "Furnished Rentals in Kampala",
        "Land in Mukono with Freehold Title",
        "Talk to an AMDERN Agent",
      ],
    };
  }

  if (intent.greetingType === "evening" && !hasSpecificPropertyCriteria) {
    return {
      text: `Good evening! 🌙 I hope you've had a fruitful day and that you're getting some well-deserved time to relax tonight!\n\nI'm doing very well, thank you so much for saying hello! How was your day?\n\nThe evening is always a peaceful time to sit back, browse beautiful homes, and dream about your next move. Tell me, what kind of property ideas are on your mind this evening?`,
      suggestedPrompts: [
        "Houses for Sale in Kira & Naalya",
        "Flats for Rent in Kololo & Nakasero",
        "Plots of Land in Mukono & Matugga",
        "Guide on Kampala Neighborhoods",
      ],
    };
  }

  if (intent.greetingType === "night" && !hasSpecificPropertyCriteria) {
    return {
      text: `Good night! ⭐️ Wishing you a peaceful, restful sleep and sweet dreams.\n\nWhenever you're ready tomorrow, I'll be right here to help you search for properties, check prices, or answer any real estate questions with **AMDERN PROPERTIES SMC LTD**. Have a wonderful night!`,
      suggestedPrompts: [
        "Good morning!",
        "Houses for Sale in Naalya",
        "Apartments for Rent in Kololo",
      ],
    };
  }

  if (intent.greetingType === "general" && !hasSpecificPropertyCriteria) {
    return {
      text: `Hello and a warm welcome! 😊 It is truly wonderful to connect with you today.\n\nI'm doing really well and feeling very cheerful, thank you for greeting me! How are you doing today?\n\nThink of me as a caring friend and personal property advisor here at **AMDERN PROPERTIES SMC LTD**. We have verified properties all across Kampala, Wakiso, Entebbe, and across Uganda.\n\nTell me, what brings you by today — are you searching for a home for your family, an apartment to rent, or just exploring the market?`,
      suggestedPrompts: [
        "Houses for Sale in Naalya",
        "Apartments for Rent in Kololo",
        "Land with Titles in Kira",
        "How do I verify a land title in Uganda?",
      ],
    };
  }

  // =========================================================================
  // 2. USER FEELINGS & STATUS REPLIES
  // =========================================================================
  if (intent.isUserFeelingStatus && !hasSpecificPropertyCriteria) {
    if (intent.userFeeling === "good") {
      return {
        text: `That is wonderful to hear! 😊 I'm really glad you're feeling good and having a positive day.\n\nHaving a good day makes planning for your dream home or investment so much easier! Tell me, what kind of property thoughts or plans have been on your mind lately?\n\nAre you looking for a new home for yourself or your family, searching for an apartment to rent, or perhaps looking to invest in titled land in Uganda?`,
        suggestedPrompts: [
          "Looking for a family home",
          "Looking for an apartment to rent",
          "Looking for titled land to buy",
          "Tell me about good areas to live",
        ],
      };
    }
    if (intent.userFeeling === "tired") {
      return {
        text: `I'm really sorry to hear you're feeling tired! Taking care of yourself comes first. 😊\n\nNo need to stress over property searching today — sit back, relax, and let me do all the work for you. Tell me simply what you'd love to find, and I'll pull together the best verified options from **AMDERN PROPERTIES SMC LTD** for you to view whenever you feel ready.\n\nWhat area or style of home has been on your mind?`,
        suggestedPrompts: [
          "Show me quiet family homes",
          "Show peaceful lakeside homes in Entebbe",
          "Save properties for later",
        ],
      };
    }
    if (intent.userFeeling === "excited") {
      return {
        text: `That excitement is contagious! 🎉 Finding a new property or starting a real estate journey in Uganda is one of the most fulfilling milestones in life!\n\nI'm so thrilled to be on this journey with you. Tell me, what are you picturing? A modern family bungalow with a big garden, a luxury high-rise apartment with city views, or prime titled land to build your dream project?`,
        suggestedPrompts: [
          "Modern Bungalows in Kira & Naalya",
          "Luxury Condos in Kololo & Nakasero",
          "Titled Plots in Mukono & Wakiso",
        ],
      };
    }
  }

  // =========================================================================
  // 3. SMALL TALK & "HOW ARE YOU"
  // =========================================================================
  if (intent.isSmallTalk && !hasSpecificPropertyCriteria) {
    return {
      text: `I'm doing wonderfully, thank you so much for asking with such care! 😊 It truly brightens my day when visitors take a moment to ask.\n\nHow are you feeling today? How has your week been going?\n\nWhenever you're ready, I'm right here to chat about anything you need — from dream homes in Naalya and Kira, to luxury apartments in Kololo, or titled land plots in Uganda. What would you like to talk about?`,
      suggestedPrompts: [
        "Houses in Wakiso under 600M",
        "Furnished Rentals in Kampala",
        "Land in Mukono with Freehold Title",
        "Talk to an AMDERN Agent",
      ],
    };
  }

  // =========================================================================
  // 4. GRATITUDE & POLITE COURTESIES
  // =========================================================================
  if (intent.isGratitude && !hasSpecificPropertyCriteria) {
    return {
      text: `You are very welcome! 😊 It is truly my pleasure to assist you.\n\nReal estate decisions are a major milestone, so take all the time you need. I'm always right here whenever you want to compare prices, verify land requirements, or look at more homes.\n\nWould you like me to connect you with one of our property specialists at **AMDERN PROPERTIES SMC LTD** for a one-on-one viewing, or is there any other question I can answer for you?`,
      suggestedPrompts: [
        "Talk to an AMDERN Agent",
        "View Houses for Sale",
        "View Apartments for Rent",
        "Post a Property Request",
      ],
    };
  }

  // =========================================================================
  // 5. IDENTITY, ROLE & ABOUT AMDERN
  // =========================================================================
  if (intent.isIdentityQuestion && !hasSpecificPropertyCriteria) {
    return {
      text: `I am the **Amdern Property Assistant**, your conversational AI advisor created for **AMDERN PROPERTIES SMC LTD**.\n\nI was designed to think, converse, and guide you just like an experienced, caring Ugandan real estate consultant. Here is how we can collaborate:\n\n1. **Personalized Search**: Tell me what you want in plain words (e.g. *"I need a 4-bedroom house with a big compound in Kira under 800M"*).\n2. **Ugandan Land Guidance**: Ask me about Mailo, Freehold, Leasehold titles, or Kibanja customary ownership.\n3. **Market Price Estimates**: Get realistic pricing for rent or purchase across Kampala and Wakiso neighborhoods.\n4. **Arranging Site Inspections**: Connect you directly with our field agents on WhatsApp or via call for physical tours.\n\nWhat would you like to start with today?`,
      suggestedPrompts: [
        "Show me popular houses for sale",
        "Tell me about land title safety",
        "How to post a property request",
        "Contact AMDERN office",
      ],
    };
  }

  // =========================================================================
  // 6. CASUAL BROWSING / "JUST LOOKING"
  // =========================================================================
  if (intent.isBrowsing && !hasSpecificPropertyCriteria) {
    return {
      text: `Take all the time you need! 😊 Window shopping and exploring is the best way to get a realistic feel for current neighborhood prices.\n\nRight now, we have high demand for:\n- **Residential Homes**: Family houses in Naalya, Kira, and Kyanja.\n- **Modern Apartments**: Executive flats in Kololo, Nakasero, and Bugolobi.\n- **Titled Land Plots**: Secure plots in Mukono, Kira, and Matugga.\n\nWould you like me to show you a quick selection of our top featured listings, or do you have a specific neighborhood you are curious about?`,
      suggestedPrompts: [
        "Show Featured Houses for Sale",
        "Show Flats for Rent",
        "Show Land & Plots",
        "Guide on Kampala Neighborhoods",
      ],
    };
  }

  // =========================================================================
  // 7. NEIGHBORHOOD ADVICE & FIRST TIME BUYERS
  // =========================================================================
  if (intent.isAdviceQuestion && !hasSpecificPropertyCriteria) {
    return {
      text: `### 🏡 Ugandan Neighborhood & Property Guide\n\nChoosing where to live or invest in Uganda is all about your family, lifestyle, and budget. Here is how our team at **AMDERN PROPERTIES SMC LTD** breaks it down:\n\n1. **Family-Friendly & High Growth (Wakiso Suburbs)**:\n   - *Naalya, Kira, Kyanja, Najjera, Namugongo*\n   - Excellent for family living with schools, shopping centers, and good road access.\n\n2. **Upscale & Diplomatic (Kampala Prime)**:\n   - *Kololo, Nakasero, Naguru, Muyenga*\n   - Top-tier security, embassies, and luxury executive residences.\n\n3. **Value, Peace & Spacious Compounds (Emerging Growth)**:\n   - *Matugga, Gayaza Road, Mukono, Bulindo, Kakiri*\n   - Perfect for building on large 50-decimal plots or spacious standalone family bungalows at reasonable prices.\n\n4. **Waterfront Living & Serenity**:\n   - *Entebbe, Munyonyo, Kigo, Garuga*\n   - Fresh breezes from Lake Victoria with quick expressway access.\n\nWhich of these sounds closest to what you have in mind?`,
      suggestedPrompts: [
        "Houses in Naalya & Kira",
        "Apartments in Kololo & Nakasero",
        "Plots in Mukono & Matugga",
        "Properties in Entebbe",
      ],
    };
  }

  // =========================================================================
  // 8. BUDGET CONCERNS, NEGOTIATIONS & INSTALLMENTS
  // =========================================================================
  if (intent.isBudgetConcern && !hasSpecificPropertyCriteria) {
    return {
      text: `I completely understand! Getting true value for your hard-earned money and finding flexible terms is very important. 😊\n\nHere are a few smart options we provide at AMDERN:\n1. **Flexible Payment Milestones**: Many of our verified property developers and private landlords welcome structured installment plans across 3 to 12 months.\n2. **High-Value Suburbs**: Exploring areas like Kira, Gayaza, Matugga, or Mukono allows you to get 2x more space and land for the same budget compared to inner-city Kampala.\n3. **Custom Sourcing**: You can tell us your exact budget ceiling, and our agents will find suitable properties that match.\n\nWhat budget range feels most comfortable for you?`,
      suggestedPrompts: [
        "Houses under 400 Million USh",
        "Flats for Rent under 1.5 Million USh",
        "Titled Land under 80 Million USh",
        "Post a Custom Budget Request",
      ],
    };
  }

  // =========================================================================
  // 9. CONTACT / AGENT INQUIRIES
  // =========================================================================
  if (intent.isAskingForAgent || q.includes("who is amdern") || q.includes("amdern properties")) {
    return {
      text: `**AMDERN PROPERTIES SMC LTD** is your trusted, officially registered real estate partner in Uganda.\n\nOur team is ready to assist you right now across any of these channels:\n\n- 📞 **Direct Phone Calls**: [${SITE.phone}](tel:${SITE.phone.replace(/\s/g, "")}) or [${SITE.phone2}](tel:${SITE.phone2.replace(/\s/g, "")})\n- 💬 **WhatsApp Direct**: [+256 702 104 499](https://wa.me/256702104499)\n- ✉️ **Official Email**: [${SITE.email}](mailto:${SITE.email})\n- 📍 **Head Office**: ${SITE.address}\n\nWould you like to speak directly with an agent about a specific property or book an on-site viewing tour?`,
      suggestedPrompts: [
        "Message on WhatsApp Now",
        "Houses for Sale in Naalya",
        "Apartments for Rent in Kololo",
        "Post a Property Request",
      ],
    };
  }

  // =========================================================================
  // 10. LEGAL / LAND TITLE DUE DILIGENCE ADVICE
  // =========================================================================
  if (intent.isLegalOrTitleQuestion) {
    return {
      text: `### 📋 Ugandan Real Estate & Land Title Due Diligence Guide\n\nWhen buying or leasing land in Uganda, AMDERN PROPERTIES SMC LTD recommends following these mandatory verification steps:\n\n1. **Land Tenure Verification**:\n   - **Mailo Title**: Historic Buganda land tenure with permanent ownership (ensure no conflicting Kibanja occupants).\n   - **Freehold Title**: Unconditional permanent ownership registered with the Ministry of Lands.\n   - **Leasehold Title**: Typically 49 to 99-year leases from local government or the Buganda Land Board.\n   - **Kibanja (Customary Occupancy)**: Requires verified boundary consensus from local LC1 leaders and registered Mailo landlord consent.\n\n2. **Official Title Search**:\n   - Conduct a search report at the relevant Ministry of Lands Zonal Office (MZO) to verify genuine title numbers, registered proprietor, caveats, mortgages, and encumbrances.\n\n3. **Physical Boundary Survey**:\n   - Retain a licensed surveyor to open boundaries, confirm deed plan dimensions, and cross-check deed coordinates on ground.\n\n4. **Statutory Taxes & Legal Costs**:\n   - Budget **1% Stamp Duty** on government valuation + standard legal review fees.\n\nWould you like our legal and valuation team at **AMDERN PROPERTIES SMC LTD** to assist you with title verification or site viewing?`,
      suggestedPrompts: [
        "Talk to AMDERN Legal Team",
        "Properties with Verified Titles",
        "Post a Property Request",
        "View Land for Sale",
      ],
    };
  }

  // =========================================================================
  // 11. REQUEST POSTING INTENT
  // =========================================================================
  if (intent.isAskingForRequestPost) {
    return {
      text: `### 📝 Post a Custom Property Request with AMDERN PROPERTIES SMC LTD\n\nTell us your exact specifications (preferred area, budget, property type, and bedroom count) and our acquisition team will scout verified on-market and off-market options for you across Uganda.`,
      showLeadCapture: true,
      suggestedPrompts: ["Call an Agent Now", "Browse Available Houses", "Browse Land & Plots"],
    };
  }

  // =========================================================================
  // 12. PROPERTY SEARCH MATCHING (With Warm Conversational Tone)
  // =========================================================================
  const filters = {
    listing: intent.listing,
    category: intent.category,
    location: intent.location,
    max: intent.maxPrice,
    beds: intent.beds,
    furnishing: intent.furnished ? "furnished" : intent.serviced ? "serviced" : undefined,
    q: !intent.location && !intent.category && !intent.listing ? query : undefined,
  };

  const matched = filterListings(filters);

  if (matched.length > 0) {
    const topMatches = matched.slice(0, 4);
    const listingLabel =
      intent.listing === "rent"
        ? "for rent"
        : intent.listing === "shortlet"
          ? "shortlet"
          : "for sale";
    const locLabel = intent.location ? ` in **${intent.location}**` : " in Uganda";
    const catLabel = intent.category ? ` ${intent.category}` : " properties";

    let greetingPrefix = "";
    if (intent.greetingType === "morning") {
      greetingPrefix = "Good morning! It's so great to speak with you. ☀️ ";
    } else if (intent.greetingType === "afternoon") {
      greetingPrefix = "Good afternoon! Pleasant to hear from you. 🌤️ ";
    } else if (intent.greetingType === "evening") {
      greetingPrefix = "Good evening! Wonderful to connect with you. 🌙 ";
    } else if (intent.isGreeting) {
      greetingPrefix = "Hello! Great to hear from you. 😊 ";
    }

    return {
      text: `${greetingPrefix}I found **${matched.length} verified${catLabel} ${listingLabel}${locLabel}** from AMDERN PROPERTIES SMC LTD matching what you described.\n\nTake a look at the options below — you can view full details, save your favorites with the heart icon, or message us directly on WhatsApp to arrange a site visit!`,
      properties: topMatches,
      showLeadCapture: matched.length <= 2,
      suggestedPrompts: [
        "Filter by lower budget",
        "View furnished options",
        "Talk to an agent on WhatsApp",
        "Post a property request",
      ],
    };
  }

  // =========================================================================
  // 13. NO DIRECT MATCH FOUND -> Conversational & Helpful Lead Capture Prompt
  // =========================================================================
  const locText = intent.location ? ` in ${intent.location}` : "";
  const catText = intent.category ? ` ${intent.category}` : " properties";

  return {
    text: `I searched through our current catalog, but we don't have an exact active listing right now for${catText}${locText}${intent.maxPrice ? ` under ${formatUGX(intent.maxPrice)}` : ""}.\n\n**Would you like our property sourcing team at AMDERN PROPERTIES SMC LTD to find this for you?**\n\nWe work closely with verified property owners and developers across Kampala, Wakiso, Mukono, and Entebbe, and we frequently source customized properties on request. You can fill in your details below or message us directly!`,
    showLeadCapture: true,
    suggestedPrompts: [
      "Houses for Sale in Naalya",
      "Flats for Rent in Kololo",
      "Land for Sale in Kira",
      "Call AMDERN Office (+256 702 104 499)",
    ],
  };
}
