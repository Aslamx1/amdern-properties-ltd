import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { Page, PageHero } from "@/components/site/Page";
import {
  getStoredBlogPosts,
  BLOG_CATEGORIES,
  type BlogPost,
  type BlogCategory,
} from "@/lib/blog";
import {
  Search,
  Calendar,
  Clock,
  User,
  ArrowRight,
  Tag,
  Share2,
  X,
  BookOpen,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Work Blog & Property Guides — Amdern Properties SMC Limited" },
      {
        name: "description",
        content:
          "Official project milestones, building guides, land title verification procedures, and market updates from AMDERN PROPERTIES SMC LTD.",
      },
      { property: "og:title", content: "Work Blog & Guides — Amdern Properties SMC" },
      {
        property: "og:description",
        content:
          "Read official real estate project updates, land verification guides, and market trends across Uganda.",
      },
      { property: "og:image", content: "https://amdernpropertiessmclimited.com/og-image.png" },
      { property: "og:url", content: "https://amdernpropertiessmclimited.com/blog" },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "canonical", href: "https://amdernpropertiessmclimited.com/blog" },
    ],
  }),
  component: BlogPage,
});

function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activePost, setActivePost] = useState<BlogPost | null>(null);

  useEffect(() => {
    setPosts(getStoredBlogPosts().filter((p) => p.published));
  }, []);

  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      const matchCat = selectedCategory === "all" || p.category === selectedCategory;
      const matchSearch =
        !searchQuery ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [posts, selectedCategory, searchQuery]);

  const featuredPost = filteredPosts[0] || posts[0];
  const gridPosts = filteredPosts.length > 1 ? filteredPosts.slice(1) : filteredPosts;

  return (
    <Page>
      <PageHero
        eyebrow="AMDERN Insights & Updates"
        title="Work Blog & Real Estate Guides"
        subtitle="Follow our on-the-ground project inspections, construction developments, land title legal guides, and property market analyses across Uganda."
      />

      <div className="container-page py-8">
        {/* Search and Category Filters */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${
                selectedCategory === "all"
                  ? "bg-primary text-white"
                  : "bg-surface-1 text-foreground-muted hover:bg-surface-2 hover:text-foreground-strong"
              }`}
            >
              All Articles ({posts.length})
            </button>
            {BLOG_CATEGORIES.map((cat) => {
              const count = posts.filter((p) => p.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${
                    selectedCategory === cat.id
                      ? "bg-primary text-white"
                      : "bg-surface-1 text-foreground-muted hover:bg-surface-2 hover:text-foreground-strong"
                  }`}
                >
                  {cat.label} ({count})
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles or tags..."
              className="w-full rounded-full border border-border bg-card py-2 pl-9 pr-4 text-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Featured Post Card (if available) */}
        {featuredPost && selectedCategory === "all" && !searchQuery && (
          <div className="mb-12 overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:shadow-md">
            <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
              <div className="relative h-64 sm:h-80 lg:h-full min-h-[260px] bg-slate-100">
                <img
                  src={featuredPost.image}
                  alt={featuredPost.title}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "/placeholder.png";
                  }}
                />
                <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-primary/95 px-3 py-1 text-[11px] font-bold text-white shadow-md">
                  <Sparkles className="h-3.5 w-3.5" /> Featured Post
                </span>
              </div>
              <div className="flex flex-col justify-between p-6 sm:p-8">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-bold text-primary uppercase tracking-wider text-[10px]">
                      {BLOG_CATEGORIES.find((c) => c.id === featuredPost.category)?.label ||
                        featuredPost.category}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {featuredPost.publishedAt}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {featuredPost.readTime}
                    </span>
                  </div>

                  <h2 className="mt-3 text-xl sm:text-2xl font-extrabold text-foreground-strong leading-snug">
                    {featuredPost.title}
                  </h2>
                  <p className="mt-3 text-sm text-foreground-muted leading-relaxed">
                    {featuredPost.excerpt}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {featuredPost.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 rounded-md bg-surface-1 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground"
                      >
                        <Tag className="h-2.5 w-2.5" /> {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100 text-xs font-extrabold text-primary">
                      {featuredPost.author.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground-strong">
                        {featuredPost.author}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{featuredPost.authorRole}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActivePost(featuredPost)}
                    className="btn-base btn-primary hover:btn-primary-hover px-4 py-2 text-xs inline-flex items-center gap-1.5 rounded-full"
                  >
                    Read Article <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Blog Posts Grid */}
        {filteredPosts.length === 0 ? (
          <div className="py-16 text-center">
            <BookOpen className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <h3 className="text-lg font-bold text-foreground-strong">No articles found</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Try adjusting your search query or selecting a different category.
            </p>
            <button
              onClick={() => {
                setSelectedCategory("all");
                setSearchQuery("");
              }}
              className="btn-base btn-outline mt-4 text-xs"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div>
            <h3 className="mb-6 text-lg font-extrabold text-foreground-strong">
              {selectedCategory === "all" && !searchQuery
                ? "Recent Articles & Guides"
                : `Showing ${filteredPosts.length} article(s)`}
            </h3>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {(selectedCategory === "all" && !searchQuery ? gridPosts : filteredPosts).map(
                (post) => (
                  <article
                    key={post.id}
                    className="group flex flex-col justify-between overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
                  >
                    <div>
                      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                        <img
                          src={post.image}
                          alt={post.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = "/placeholder.png";
                          }}
                        />
                        <span className="absolute bottom-2 left-2 rounded-md bg-black/70 backdrop-blur-xs px-2.5 py-0.5 text-[10px] font-bold text-white">
                          {BLOG_CATEGORIES.find((c) => c.id === post.category)?.label ||
                            post.category}
                        </span>
                      </div>

                      <div className="p-5">
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> {post.publishedAt}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {post.readTime}
                          </span>
                        </div>

                        <h4 className="mt-2.5 text-base font-extrabold text-foreground-strong line-clamp-2 group-hover:text-primary transition-colors">
                          {post.title}
                        </h4>
                        <p className="mt-2 text-xs text-foreground-muted line-clamp-3 leading-relaxed">
                          {post.excerpt}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-1">
                          {post.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="rounded bg-surface-1 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-border p-4 bg-surface-1/40">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-100 text-[10px] font-bold text-primary">
                          {post.author.charAt(0)}
                        </div>
                        <span className="truncate text-xs font-semibold text-foreground-strong">
                          {post.author}
                        </span>
                      </div>
                      <button
                        onClick={() => setActivePost(post)}
                        className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1 shrink-0"
                      >
                        Read <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </article>
                ),
              )}
            </div>
          </div>
        )}

        {/* Newsletter / Inquiry Call to Action */}
        <section className="mt-16 rounded-2xl bg-slate-900 px-6 py-10 text-white sm:px-12 sm:py-14 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-emerald-300">
            <CheckCircle2 className="h-3.5 w-3.5" /> Professional Real Estate Advisory
          </span>
          <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold">
            Looking for expert guidance on your next property purchase?
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-xs sm:text-sm text-slate-300">
            AMDERN PROPERTIES SMC LIMITED offers complete land title searches, boundary surveying,
            and professional real estate representation across Uganda.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/contact" className="btn-base btn-primary hover:btn-primary-hover px-6 py-2.5 text-xs">
              Contact Our Advisors
            </Link>
            <Link to="/for-sale" className="btn-base bg-white/15 hover:bg-white/25 text-white border border-white/20 px-6 py-2.5 text-xs">
              Explore Available Properties
            </Link>
          </div>
        </section>
      </div>

      {/* Full Article Reader Modal */}
      {activePost && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={() => setActivePost(null)}
        >
          <div
            className="relative my-8 max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-card p-6 sm:p-8 shadow-2xl border border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActivePost(null)}
              aria-label="Close article"
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-surface-1 text-foreground hover:bg-surface-2 transition"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Modal Content */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="font-bold text-primary uppercase tracking-wider text-[11px]">
                  {BLOG_CATEGORIES.find((c) => c.id === activePost.category)?.label ||
                    activePost.category}
                </span>
                <span>•</span>
                <span>{activePost.publishedAt}</span>
                <span>•</span>
                <span>{activePost.readTime}</span>
              </div>

              <h1 className="text-xl sm:text-3xl font-extrabold text-foreground-strong leading-tight">
                {activePost.title}
              </h1>

              {/* Author Bar */}
              <div className="flex items-center gap-3 border-y border-border py-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 font-extrabold text-primary">
                  {activePost.author.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground-strong">{activePost.author}</p>
                  <p className="text-xs text-muted-foreground">{activePost.authorRole}</p>
                </div>
              </div>

              {/* Cover Image */}
              <div className="overflow-hidden rounded-xl bg-slate-100 max-h-[380px]">
                <img
                  src={activePost.image}
                  alt={activePost.title}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "/placeholder.png";
                  }}
                />
              </div>

              {/* Formatted Article Body */}
              <div className="prose prose-sm max-w-none text-foreground-strong leading-relaxed space-y-4 pt-2">
                {activePost.content.split("\n\n").map((para, idx) => {
                  if (para.startsWith("### ")) {
                    return (
                      <h3 key={idx} className="text-lg font-extrabold text-slate-900 mt-4 mb-2">
                        {para.replace("### ", "")}
                      </h3>
                    );
                  }
                  if (para.startsWith("- ") || para.startsWith("1. ") || para.startsWith("2. ") || para.startsWith("3. ")) {
                    return (
                      <div key={idx} className="pl-4 my-2 text-sm text-slate-700 leading-relaxed font-medium">
                        {para}
                      </div>
                    );
                  }
                  return (
                    <p key={idx} className="text-sm text-slate-700 leading-relaxed">
                      {para}
                    </p>
                  );
                })}
              </div>

              {/* Tags and Share */}
              <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4">
                <div className="flex flex-wrap gap-1.5">
                  {activePost.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md bg-surface-1 px-3 py-1 text-xs font-semibold text-muted-foreground"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`${activePost.title} — Read more at AMDERN PROPERTIES: ${typeof window !== "undefined" ? window.location.href : ""}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-base bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1.5"
                  >
                    Share on WhatsApp
                  </a>
                  <button
                    onClick={() => setActivePost(null)}
                    className="btn-base btn-outline text-xs px-4 py-1.5"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Page>
  );
}
