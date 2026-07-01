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

  const whereClause: any = { organisatieId };
  if (statusFilter !== "alle") {
    whereClause.status = statusFilter.toUpperCase();
  }

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
    alle: blogPosts.length,
    concept: statusCounts.find((s) => s.status === "CONCEPT")?._count.status ?? 0,
    gepubliceerd: statusCounts.find((s) => s.status === "GEPUBLICEERD")?._count.status ?? 0,
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Blog beheer"
        description="Schrijf en beheer blogposts met AI-gestuunde SEO optimalisatie"
        action={
          <Link
            href="/admin/blog/nieuw"
            className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-xl font-medium text-sm hover:bg-brand-600 transition-colors"
          >
            <Plus size={16} />
            Nieuwe post
          </Link>
        }
      />

      <div className="flex items-center gap-2 border-b border-warm-200">
        <button className={`px-3 py-2 rounded-t-lg text-sm font-medium transition-colors ${
          statusFilter === "alle" ? "bg-white border border-b-0 border-warm-200 text-brand-700" : "text-warm-600 hover:text-warm-900"
        }`}>
          Alle <Badge variant="default" className="ml-1">{counts.alle}</Badge>
        </button>
        <button className={`px-3 py-2 rounded-t-lg text-sm font-medium transition-colors ${
          statusFilter === "concept" ? "bg-white border border-b-0 border-warm-200 text-brand-700" : "text-warm-600 hover:text-warm-900"
        }`}>
          Concept <Badge variant="warning" className="ml-1">{counts.concept}</Badge>
        </button>
        <button className={`px-3 py-2 rounded-t-lg text-sm font-medium transition-colors ${
          statusFilter === "gepubliceerd" ? "bg-white border border-b-0 border-warm-200 text-brand-700" : "text-warm-600 hover:text-warm-900"
        }`}>
          Gepubliceerd <Badge variant="success" className="ml-1">{counts.gepubliceerd}</Badge>
        </button>
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/admin/blog?tag=${tag.slug}`}
              className="px-3 py-1 rounded-full text-xs font-medium transition-colors"
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
            <Link href="/admin/blog/nieuw" className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-xl font-medium text-sm hover:bg-brand-600 transition-colors">
              <Plus size={16} />
              Nieuwe blog post
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {blogPosts.map((post) => (
            <Card key={post.id} className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{post.titel}</h3>
                <p className="text-sm text-warm-600 mt-1">/{post.slug}</p>
                {post.seoDescription && (
                  <p className="text-sm text-warm-500 mt-2 line-clamp-2">{post.seoDescription}</p>
                )}
                <div className="flex items-center gap-4 mt-3 text-xs">
                  <span className="text-warm-500">
                    {new Date(post.createdAt).toLocaleDateString("nl-NL")}
                  </span>
                  <span className="text-warm-500 flex items-center gap-1">
                    <BarChart3 size={12} />
                    {post.pageviews} views
                  </span>
                  {post.focusKeyword && (
                    <Badge variant="info">{post.focusKeyword}</Badge>
                  )}
                </div>
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {post.tags.map((pt) => (
                      <Badge key={pt.tagId} variant="default" className="text-[10px]">
                        {pt.tag.naam}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={post.status === "GEPUBLICEERD" ? "success" : "warning"}>
                  {post.status}
                </Badge>
                <Link
                  href={`/admin/blog/${post.id}/edit`}
                  className="p-2 rounded-lg hover:bg-warm-100 transition-colors"
                >
                  <Edit size={16} className="text-warm-600" />
                </Link>
                <Link
                  href={`/blog/${post.slug}`}
                  target="_blank"
                  className="p-2 rounded-lg hover:bg-warm-100 transition-colors"
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
