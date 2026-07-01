import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { FileText, Plus, Edit, Eye, BarChart3 } from "lucide-react";
import { Card, PageHeader, Badge, EmptyState } from "@/components/ui";
import Link from "next/link";

export default async function BlogDashboard({
  searchParams,
}: {
  searchParams: { status?: string; tag?: string };
}) {
  const session = await auth();
  const organisatieId = session!.user.organisatieId!;

  const statusFilter = searchParams.status ?? "alle";

  const whereClause = {
    organisatieId,
    ...(statusFilter !== "alle" ? { status: statusFilter.toUpperCase() } : {}),
  };

  const [blogPosts, tags] = await Promise.all([
    prisma.blogPost.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { tags: { include: { tag: true } } },
    }),
    prisma.blogTag.findMany({
      where: { organisatieId },
      orderBy: { naam: "asc" },
    }),
  ]);

  const statusCounts = await prisma.blogPost.groupBy({
    by: ["status"],
    where: { organisatieId },
    _count: { status: true },
  });

  const counts = {
    alle: statusCounts.reduce((s, c) => s + c._count.status, 0),
    concept: statusCounts.find((s) => s.status === "CONCEPT")?._count.status ?? 0,
    gepubliceerd: statusCounts.find((s) => s.status === "GEPUBLICEERD")?._count.status ?? 0,
  };

  const tabItems = [
    { key: "alle", label: "Alle", count: counts.alle },
    { key: "concept", label: "Concept", count: counts.concept, variant: "warning" as const },
    { key: "gepubliceerd", label: "Gepubliceerd", count: counts.gepubliceerd, variant: "success" as const },
  ];

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Blog beheer"
        description="Schrijf en beheer blogposts met AI-gestuunde SEO optimalisatie"
        action={
          <Link
            href="/admin/blog/nieuw"
            className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-xl font-semibold text-sm hover:bg-brand-600 transition-colors"
          >
            <Plus size={16} />
            Nieuwe post
          </Link>
        }
      />

      <div className="flex items-center gap-2 border-b border-warm-200">
        {tabItems.map((tab) => {
          const isActive = statusFilter === tab.key;
          return (
            <Link
              key={tab.key}
              href={`/admin/blog${tab.key !== "alle" ? `?status=${tab.key}` : ""}`}
              className={`flex items-center gap-2 px-3 py-2 rounded-t-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-white border border-b-0 border-warm-200 text-brand-700"
                  : "text-warm-600 hover:text-warm-900"
              }`}
            >
              {tab.label}
              <Badge variant={isActive ? (tab.variant ?? "info") : "default"}>
                {tab.count}
              </Badge>
            </Link>
          );
        })}
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/admin/blog?tag=${tag.slug}`}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                searchParams.tag === tag.slug ? "ring-2 ring-brand-500" : ""
              }`}
              style={{
                backgroundColor: tag.kleur ? `${tag.kleur}20` : "#f3f4f6",
                color: tag.kleur ?? "#374151",
              }}
            >
              #{tag.naam}
            </Link>
          ))}
        </div>
      )}

      {blogPosts.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Geen blog posts gevonden"
          description="Begin met schrijven van je eerste blogpost"
          action={
            <Link
              href="/admin/blog/nieuw"
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-xl font-semibold text-sm hover:bg-brand-600 transition-colors"
            >
              <Plus size={16} />
              Nieuwe blog post
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {blogPosts.map((post) => (
            <Card key={post.id} className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900">{post.titel}</h3>
                <p className="text-sm text-warm-600 mt-0.5 font-mono text-xs">/{post.slug}</p>
                {post.seoDescription && (
                  <p className="text-sm text-warm-500 mt-1.5 line-clamp-2">{post.seoDescription}</p>
                )}
                <div className="flex items-center gap-4 mt-2 text-xs">
                  <span className="text-warm-500">
                    {new Date(post.createdAt).toLocaleDateString("nl-NL")}
                  </span>
                  <span className="text-warm-500 flex items-center gap-1">
                    <BarChart3 size={12} />
                    {post.pageviews} views
                  </span>
                  {post.focusKeyword && <Badge variant="info">{post.focusKeyword}</Badge>}
                </div>
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {post.tags.map((pt) => (
                      <Badge key={pt.tagId} variant="default">
                        {pt.tag.naam}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <Badge variant={post.status === "GEPUBLICEERD" ? "success" : "warning"}>
                  {post.status === "GEPUBLICEERD" ? "Gepubliceerd" : "Concept"}
                </Badge>
                <Link
                  href={`/admin/blog/${post.id}/edit`}
                  className="p-2 rounded-lg hover:bg-warm-100 transition-colors"
                  title="Bewerken"
                >
                  <Edit size={16} className="text-warm-600" />
                </Link>
                <Link
                  href={`/blog/${post.slug}`}
                  target="_blank"
                  className="p-2 rounded-lg hover:bg-warm-100 transition-colors"
                  title="Bekijken"
                >
                  <Eye size={16} className="text-warm-600" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
