import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  getStoredBlogPosts,
  saveBlogPostLocal,
  deleteBlogPostLocal,
  BLOG_CATEGORIES,
  type BlogPost,
  type BlogCategory,
} from "@/lib/blog";
import { ALL_UPC_IMAGES } from "@/lib/verified-upc-images";
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle2,
  Calendar,
  Clock,
  User,
  Tag,
  Search,
  BookOpen,
  Sparkles,
  X,
  FileText,
} from "lucide-react";

export const Route = createFileRoute("/admin/blog")({
  component: AdminBlogPage,
});

function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState<BlogCategory>("work-updates");
  const [formExcerpt, setFormExcerpt] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formImage, setFormImage] = useState("/property-media/IMG-20260825-WA0018.jpg");
  const [formAuthor, setFormAuthor] = useState("Denis Mugisha");
  const [formAuthorRole, setFormAuthorRole] = useState("Managing Director, AMDERN Properties");
  const [formReadTime, setFormReadTime] = useState("4 min read");
  const [formTags, setFormTags] = useState("Site Update, Inspection, Milestone");
  const [formPublished, setFormPublished] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = () => {
    setPosts(getStoredBlogPosts());
  };

  const showFeedback = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  const handleOpenCreateModal = () => {
    setEditingPost(null);
    setFormTitle("");
    setFormCategory("work-updates");
    setFormExcerpt("");
    setFormContent("");
    setFormImage(ALL_UPC_IMAGES[0] || "/property-media/IMG-20260825-WA0018.jpg");
    setFormAuthor("Denis Mugisha");
    setFormAuthorRole("Managing Director, AMDERN Properties");
    setFormReadTime("4 min read");
    setFormTags("Work Update, Milestone, Real Estate");
    setFormPublished(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (post: BlogPost) => {
    setEditingPost(post);
    setFormTitle(post.title);
    setFormCategory(post.category);
    setFormExcerpt(post.excerpt);
    setFormContent(post.content);
    setFormImage(post.image);
    setFormAuthor(post.author);
    setFormAuthorRole(post.authorRole);
    setFormReadTime(post.readTime);
    setFormTags(post.tags.join(", "));
    setFormPublished(post.published);
    setIsModalOpen(true);
  };

  const handleSavePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const id = editingPost ? editingPost.id : `blog-${Date.now()}`;
    const slug = formTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const newPost: BlogPost = {
      id,
      title: formTitle.trim(),
      slug: editingPost?.slug || slug,
      excerpt: formExcerpt.trim(),
      content: formContent.trim(),
      category: formCategory,
      image: formImage || "/property-media/IMG-20260825-WA0018.jpg",
      author: formAuthor.trim() || "AMDERN Editorial",
      authorRole: formAuthorRole.trim() || "Real Estate Advisor",
      publishedAt: editingPost?.publishedAt || new Date().toISOString().split("T")[0]!,
      readTime: formReadTime.trim() || "4 min read",
      tags: formTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      published: formPublished,
    };

    saveBlogPostLocal(newPost);
    loadPosts();
    setIsModalOpen(false);
    showFeedback(editingPost ? "Blog post updated successfully!" : "New blog post published!");
  };

  const handleDeletePost = (id: string) => {
    if (window.confirm("Are you sure you want to delete this blog post?")) {
      deleteBlogPostLocal(id);
      loadPosts();
      showFeedback("Blog post deleted.");
    }
  };

  const handleTogglePublish = (post: BlogPost) => {
    const updated = { ...post, published: !post.published };
    saveBlogPostLocal(updated);
    loadPosts();
    showFeedback(updated.published ? "Post published to website!" : "Post moved to drafts.");
  };

  const filteredPosts = posts.filter((p) => {
    const matchCat = categoryFilter === "all" || p.category === categoryFilter;
    const matchSearch =
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.author.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 md:text-2xl">
            Work Blog & News Management
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Publish project milestone updates, construction news, land title guides, and market
            insights directly to the live website.
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="btn-base btn-primary hover:btn-primary-hover px-4 py-2.5 text-xs font-bold inline-flex items-center gap-2 rounded-xl shadow-sm"
        >
          <Plus className="h-4 w-4" /> Create New Post
        </button>
      </div>

      {/* Feedback Alert */}
      {feedbackMessage && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs font-bold text-emerald-800 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          {feedbackMessage}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl bg-white p-4 shadow-sm border border-slate-200">
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setCategoryFilter("all")}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
              categoryFilter === "all"
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All ({posts.length})
          </button>
          {BLOG_CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategoryFilter(c.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                categoryFilter === c.id
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {c.label} ({posts.filter((p) => p.category === c.id).length})
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search posts..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>
      </div>

      {/* Posts Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3.5 px-4">Article</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Author</th>
                <th className="py-3.5 px-4">Published Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPosts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <FileText className="mx-auto mb-2 h-8 w-8 text-slate-300" />
                    No blog posts found. Click &quot;Create New Post&quot; to publish one.
                  </td>
                </tr>
              ) : (
                filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={post.image}
                          alt=""
                          className="h-12 w-16 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-200"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = "/placeholder.png";
                          }}
                        />
                        <div className="min-w-0 max-w-sm">
                          <p className="font-extrabold text-slate-900 line-clamp-1">{post.title}</p>
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {post.excerpt}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex rounded-md bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-700">
                        {BLOG_CATEGORIES.find((c) => c.id === post.category)?.label || post.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{post.author}</td>
                    <td className="py-3 px-4 text-slate-500">{post.publishedAt}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleTogglePublish(post)}
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold transition ${
                          post.published
                            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                            : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                        }`}
                      >
                        {post.published ? (
                          <>
                            <Eye className="h-3 w-3" /> Published
                          </>
                        ) : (
                          <>
                            <EyeOff className="h-3 w-3" /> Draft
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(post)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 rounded-md hover:bg-slate-100"
                          title="Edit Post"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="p-1.5 text-red-500 hover:text-red-700 rounded-md hover:bg-red-50"
                          title="Delete Post"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative my-8 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h2 className="text-base font-extrabold text-slate-900 sm:text-lg">
                {editingPost ? "Edit Work Blog Post" : "Publish New Work Blog Post"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSavePost} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Article Title *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Sseguku Katale Executive Flat House Inspection & Handover"
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-xs font-medium focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as BlogCategory)}
                    className="w-full rounded-lg border border-slate-200 p-2.5 text-xs font-semibold focus:border-slate-900 focus:outline-none"
                  >
                    {BLOG_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Read Time
                  </label>
                  <input
                    type="text"
                    value={formReadTime}
                    onChange={(e) => setFormReadTime(e.target.value)}
                    placeholder="e.g. 4 min read"
                    className="w-full rounded-lg border border-slate-200 p-2.5 text-xs font-medium focus:border-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Featured Cover Photo URL *
                </label>
                <input
                  type="text"
                  required
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  placeholder="/property-media/..."
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-xs font-medium focus:border-slate-900 focus:outline-none"
                />
                <div className="mt-2 flex items-center gap-2 overflow-x-auto pb-1">
                  <span className="text-[10px] font-bold text-slate-400 shrink-0">Quick Pick:</span>
                  {ALL_UPC_IMAGES.slice(0, 7).map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt=""
                      onClick={() => setFormImage(img)}
                      className={`h-9 w-12 cursor-pointer rounded object-cover border-2 transition ${
                        formImage === img ? "border-red-600 ring-2 ring-red-200" : "border-transparent"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Author Name
                  </label>
                  <input
                    type="text"
                    value={formAuthor}
                    onChange={(e) => setFormAuthor(e.target.value)}
                    placeholder="e.g. Denis Mugisha"
                    className="w-full rounded-lg border border-slate-200 p-2.5 text-xs font-medium focus:border-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Author Role
                  </label>
                  <input
                    type="text"
                    value={formAuthorRole}
                    onChange={(e) => setFormAuthorRole(e.target.value)}
                    placeholder="e.g. Managing Director"
                    className="w-full rounded-lg border border-slate-200 p-2.5 text-xs font-medium focus:border-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Short Excerpt / Summary *
                </label>
                <textarea
                  rows={2}
                  required
                  value={formExcerpt}
                  onChange={(e) => setFormExcerpt(e.target.value)}
                  placeholder="Brief 1-2 sentence overview shown in the card preview..."
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-xs font-medium focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Article Body (Markdown supported) *
                </label>
                <textarea
                  rows={6}
                  required
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Write the full post content here. Use ### for subheadings, - for bullets..."
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-xs font-mono focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  placeholder="e.g. Sseguku, Inspection, Land Titles, Project"
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-xs font-medium focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 border-t border-slate-200 pt-4">
                <input
                  type="checkbox"
                  id="formPublished"
                  checked={formPublished}
                  onChange={(e) => setFormPublished(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
                />
                <label htmlFor="formPublished" className="text-xs font-bold text-slate-800">
                  Publish to website immediately
                </label>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-base btn-outline px-4 py-2 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-base btn-primary hover:btn-primary-hover px-5 py-2 text-xs font-bold"
                >
                  {editingPost ? "Save Changes" : "Publish Post"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
