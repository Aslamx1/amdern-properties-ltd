import { createFileRoute, Link } from "@tanstack/react-router";
import { Page, PageHero } from "@/components/site/Page";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Target, Users, Building2, Phone, Mail, MessageCircle, Check, Home, Key, Search, Shield, Briefcase, Wrench, Factory, Truck } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Amdern Properties SMC Limited — CEO & Founder" },
      {
        name: "description",
        content:
          "Learn about the CEO and Founder of Amdern Properties SMC Limited, Uganda's premier real estate and property marketplace.",
      },
      { property: "og:title", content: "About Amdern Properties SMC Limited — CEO & Founder" },
      {
        property: "og:description",
        content: "Meet the leader behind Uganda's fastest-growing property platform.",
      },
      { property: "og:image", content: "https://amdernpropertiessmclimited.com/og-image.png" },
      { property: "og:url", content: "https://amdernpropertiessmclimited.com/about" },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "canonical", href: "https://amdernpropertiessmclimited.com/about" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <Page>
      <PageHero
        eyebrow="About Us"
        title="Meet the CEO & Founder"
        subtitle="The vision behind Amdern Properties SMC Limited — Uganda's premier real estate and property marketplace."
      />

      <div className="container-page py-12">
        {/* CEO SECTION - Full width, prominent */}
        <div className="mb-16">
          <Card className="overflow-hidden border border-slate-200 bg-[radial-gradient(circle_at_top,_#fff_0%,_#f8fafc_38%,_#eef2f7_100%)] shadow-[0_30px_80px_-30px_rgba(15,23,42,0.35)]">
            <div className="px-6 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
              <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-center lg:justify-center">
                {/* CEO Photo - premium profile framing */}
                <div className="relative w-full max-w-[200px] shrink-0 sm:max-w-[220px] lg:max-w-[200px]">
                  <img
                    src="/ceo-photo.jpg"
                    alt="Lubega Abdul Hamid"
                    className="h-[220px] w-full rounded-[1.2rem] object-cover object-center shadow-[0_12px_24px_rgba(15,23,42,0.18)] sm:h-[240px] lg:h-[220px]"
                  />
                </div>

                {/* CEO Info */}
                <div className="flex-1 text-center lg:text-left">
                  <Badge className="mb-4 border-0 bg-gradient-to-r from-red-500 to-red-600 px-4 py-1.5 text-xs font-bold tracking-[0.12em] text-white uppercase shadow-md">
                    Founder & CEO
                  </Badge>
                  <h2 className="mb-3 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
                    Lubega Abdul Hamid
                  </h2>
                  <p className="mb-3 text-base font-medium text-slate-700 sm:text-lg">
                    Founder & Director, AMDERN PROPERTIES SMC LTD
                  </p>
                  <p className="mb-8 text-lg text-slate-500">Kampala, Uganda</p>
                  <div className="flex flex-wrap justify-center gap-3 lg:justify-start">
                    <a href="tel:+256702104499" className="btn-base bg-white text-slate-900 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 text-xs py-3 px-5 font-bold">
                      <Phone className="h-4 w-4 mr-1.5" /> Call
                    </a>
                    <a href="https://wa.me/256702104499" target="_blank" rel="noopener noreferrer" className="btn-base bg-emerald-500 text-white hover:bg-emerald-600 text-xs py-3 px-5 font-bold shadow-md shadow-emerald-500/20">
                      <MessageCircle className="h-4 w-4 mr-1.5" /> WhatsApp
                    </a>
                    <a href="mailto:amdernsmcpropertiesltd@gmail.com" className="btn-base bg-slate-100 text-slate-800 ring-1 ring-slate-200 hover:bg-slate-200 text-xs py-3 px-5 font-bold">
                      <Mail className="h-4 w-4 mr-1.5" /> Email
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* MAIN CONTENT GRID */}
        <div className="grid gap-8 lg:grid-cols-2 mb-16">
          {/* LEFT COLUMN */}
          <div className="space-y-6">
            {/* About the Founder */}
            <Card className="p-8">
              <h3 className="text-xl font-bold text-slate-900 mb-4">About the Founder</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Lubega Abdul Hamid is the founder and visionary leader of AMDERN PROPERTIES SMC LTD. Guided by a strong commitment to transparency, legal integrity, and client-focused service, he established the company to provide a safe, accessible, and dependable path to property ownership across Uganda.
              </p>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                Under his leadership, AMDERN PROPERTIES SMC LTD has grown into a trusted real estate agency specializing in verified residential homes, commercial holdings, and titled land plots. With a deep understanding of local market dynamics and strict legal compliance, Abdul Hamid ensures every client receives professional guidance, clear documentation, and complete peace of mind.
              </p>
              <div className="bg-red-50 border-l-4 border-red-600 p-5 rounded-r-lg">
                <p className="text-sm text-slate-700 italic mb-2">
                  "Real estate is not just about transactions; it is about securing livelihoods, building communities, and establishing lasting legacies."
                </p>
                <p className="text-xs text-slate-500 font-semibold">— Lubega Abdul Hamid</p>
              </div>
            </Card>

            {/* Established */}
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Established in 2012</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    AMDERN PROPERTIES SMC LTD is a fully licensed and compliant real estate agency operating in Uganda. Over a decade of industry expertise backs our commitment to securing wealth, creating homes, and building lasting legacies. Operating as a registered Single Member Private Limited Company (SMC LTD), AMDERN PROPERTIES stands as a beacon of reliability, legal transparency, and modern real estate solutions.
                  </p>
                </div>
              </div>
            </Card>

            {/* Compliance */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-3">Corporate Legitimacy & Regulatory Compliance</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                To ensure absolute peace of mind for buyers, sellers, and corporate investors, AMDERN PROPERTIES SMC LTD operates under full regulatory compliance with Ugandan governing bodies:
              </p>
              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <Check className="h-4 w-4" />
                  </div>
                  <div>
                    <strong>URSB Registered:</strong> Officially incorporated with the Uganda Registration Services Bureau (URSB) and issued a formal Certificate of Incorporation as a Single Member Company.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <Check className="h-4 w-4" />
                  </div>
                  <div>
                    <strong>URA Compliant:</strong> Fully registered with the Uganda Revenue Authority (URA), holding an active Tax Identification Number (TIN) for compliant tax reporting and transparent financial transactions.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <Check className="h-4 w-4" />
                  </div>
                  <div>
                    <strong>Licensed Trading Operations:</strong> Certified with an official Trading License issued by local municipal authorities (Kampala Capital City Authority / District Local Government), authorizing full real estate brokerage and management operations across Uganda.
                  </div>
                </li>
              </ul>
            </Card>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            {/* What Defines Us */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">What Defines AMDERN PROPERTIES SMC LTD</h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1">Uncompromised Legal Security</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Every plot of land, family residential home, and commercial asset listed undergoes rigorous title searches (Private Mailo, Freehold, Leasehold) and boundary verification before reaching the client.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                    <Target className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1">Technology-Driven Discovery</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Property seekers, investors, and members of the Ugandan Diaspora can seamlessly browse listings, track property inquiries, filter by exact budget in UGX or USD, and submit custom property requests online.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1">Client-Centric Transparency</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Whether working with first-time buyers or corporate investors, AMDERN PROPERTIES delivers direct, transparent, and honest advisory.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Services */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Core Capabilities & Services</h3>
              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
                    <Home className="h-4 w-4" />
                  </div>
                  <div>
                    <strong>Residential & Land Sales:</strong> Curated listings of titled land plots, standalone family houses, executive townhouses, and estate developments.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div>
                    <strong>Commercial & Investment Advisory:</strong> Sourcing strategically located land holdings, warehouse facilities, and multi-unit residential flats designed for high rental yields.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                    <Key className="h-4 w-4" />
                  </div>
                  <div>
                    <strong>Rental & Property Management:</strong> End-to-end property management services connecting landlords with verified tenants, overseeing facility maintenance, and managing rent collections.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                    <Search className="h-4 w-4" />
                  </div>
                  <div>
                    <strong>Custom Property Matchmaking:</strong> A dedicated request-posting service where clients specify their budget, location preferences, and property specifications.
                  </div>
                </li>
              </ul>
            </Card>

            {/* Promise */}
            <Card className="p-6 bg-gradient-to-br from-red-600 to-red-800 border-0 text-white">
              <h3 className="text-lg font-bold mb-2">The AMDERN Promise</h3>
              <p className="text-sm italic text-white/90">
                "Your property journey should be marked by clarity, confidence, and peace of mind."
              </p>
            </Card>
          </div>
        </div>

        {/* BUSINESS OBJECTS / URSB SECTION */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <Badge className="bg-red-100 text-red-700 mb-3 text-xs font-bold px-3 py-1">URSB Memorandum</Badge>
            <h3 className="text-2xl font-bold text-slate-900">Approved Business Objects</h3>
            <p className="text-sm text-slate-600 mt-2 max-w-2xl mx-auto">
              As registered with the Uganda Registration Services Bureau, AMDERN PROPERTIES SMC LTD is authorized to operate across the following business sectors:
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Real Estate & Property Trading */}
            <Card className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600">
                  <Home className="h-5 w-5" />
                </div>
                <h4 className="text-base font-bold text-slate-900">Real Estate & Property Trading</h4>
              </div>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span>Operating as licensed real estate agents</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span>Buying & selling land and buildings</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span>Land title processing and transfer between buyers and sellers</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span>Estate development: sale of plots, houses, commercial buildings, condominiums, land allocation</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span>Residential allocation: constructing buildings for rent or business operations</span>
                </li>
              </ul>
            </Card>

            {/* Building, Construction & Engineering */}
            <Card className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                  <Wrench className="h-5 w-5" />
                </div>
                <h4 className="text-base font-bold text-slate-900">Building, Construction & Engineering Services</h4>
              </div>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span>Construction & civil works: residential, commercial, offices, roads, bridges, dams, tunnels</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span>Building design & finishing: stone laying, compound designing, roofing, general finishing</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span>Architectural, landscape, interior design, and engineering support services</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span>Equipment & utilities installation: engineering, fitting, and installing all types of equipment and appliances</span>
                </li>
              </ul>
            </Card>

            {/* Construction Materials & Heavy Machinery */}
            <Card className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <Factory className="h-5 w-5" />
                </div>
                <h4 className="text-base font-bold text-slate-900">Construction Materials & Heavy Machinery</h4>
              </div>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span>Trading construction materials: tools, paints, equipment, building decorations, craftsman tools</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span>Heavy machinery dealing and supply</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span>Quarrying & mining: rock blasting, stone quarrying, mining, ore smelting</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span>Mineral processing and transportation</span>
                </li>
              </ul>
            </Card>

            {/* Commercial, Industrial & Service Operations */}
            <Card className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                  <Briefcase className="h-5 w-5" />
                </div>
                <h4 className="text-base font-bold text-slate-900">Commercial, Industrial & Service Operations</h4>
              </div>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span>Automobile & service stations: oil fuel stations, repair/maintenance, anti-rust spraying</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span>Constructing petrol stations</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span>Manufacturing & textiles: production and management of factories for quality textiles, apparel, and garment manufacturing</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span>General import, export & trade: merchandise, household utilities, cars, tractors, heavy machinery</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>

        {/* VALUES GRID */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-slate-900 text-center mb-8">Our Core Values</h3>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="p-6 text-center hover:shadow-md transition-shadow">
              <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-xl bg-red-100 text-red-600 mb-4">
                <Target className="h-7 w-7" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-2">Our Mission</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                To provide a seamless, verified, and accessible property marketplace for all Ugandans.
              </p>
            </Card>
            <Card className="p-6 text-center hover:shadow-md transition-shadow">
              <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-xl bg-blue-100 text-blue-600 mb-4">
                <Award className="h-7 w-7" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-2">Our Values</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Transparency, integrity, and customer-first service in every transaction.
              </p>
            </Card>
            <Card className="p-6 text-center hover:shadow-md transition-shadow">
              <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 mb-4">
                <Users className="h-7 w-7" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-2">Our Team</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                A dedicated team of real estate professionals, tech experts, and customer support specialists.
              </p>
            </Card>
            <Card className="p-6 text-center hover:shadow-md transition-shadow">
              <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-xl bg-purple-100 text-purple-600 mb-4">
                <Building2 className="h-7 w-7" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-2">Our Presence</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Headquartered in Kampala with agents and listings across all regions of Uganda.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </Page>
  );
}
