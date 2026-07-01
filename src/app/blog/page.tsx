import { prisma } from "@/lib/prisma";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import { FileText } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | Welzijnsklik",
  description: "Verhalen, inzichten en updates over welzijn, vrijwilligerswerk en zorgtechnologie.",
};

export default async function BlogOverzicht() {
  const posts = await prisma.blogPost.findMany({
    where: { status: "GEPUBLICEERD" },
    orderBy: { gepubliceerdOp: "desc" },
  });

  return (
    <div style={{ fontFamily: "var(--font-outfit, Outfit, sans-serif)", color: "#191c1d" }}>
      <MarketingHeader />
      <main className="min-h-screen bg-neutral-50" style={{ paddingTop: 64 }}>
        <div className="max-w-3xl mx-auto px-4 py-16 space-y-10">
          <div className="text-center space-y-3">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Blog</h1>
            <p className="text-neutral-500 max-w-md mx-auto">
              Verhalen, inzichten en updates over welzijn, vrijwilligerswerk en zorgtechnologie.
            </p>
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-16 text-neutral-400">
              <FileText size={32} className="mx-auto mb-3" />
              Er zijn nog geen blogposts gepubliceerd.
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="block bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 hover:shadow-md transition-shadow"
                >
                  <h2 className="text-xl font-bold text-gray-900">{post.titel}</h2>
                  {post.samenvatting && (
                    <p className="text-neutral-500 mt-2 line-clamp-2">{post.samenvatting}</p>
                  )}
                  <p className="text-xs text-neutral-400 mt-3">
                    {post.gepubliceerdOp &&
                      new Date(post.gepubliceerdOp).toLocaleDateString("nl-NL", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
