import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

async function getPost(slug: string) {
  const post = await prisma.blogPost.findUnique({ where: { slug } });
  if (!post || post.status !== "GEPUBLICEERD") return null;
  return post;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};

  return {
    title: post.seoTitle || `${post.titel} | Welzijnsklik`,
    description: post.seoDescription || post.samenvatting || undefined,
    keywords: post.seoKeywords.length > 0 ? post.seoKeywords : undefined,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  await prisma.blogPost.update({
    where: { id: post.id },
    data: { pageviews: { increment: 1 } },
  });

  return (
    <div style={{ fontFamily: "var(--font-outfit, Outfit, sans-serif)", color: "#191c1d" }}>
      <MarketingHeader />
      <main className="min-h-screen bg-neutral-50" style={{ paddingTop: 64 }}>
        <article className="max-w-2xl mx-auto px-4 py-16">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 mb-6"
          >
            <ArrowLeft size={14} />
            Terug naar blog
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">{post.titel}</h1>
          {post.gepubliceerdOp && (
            <p className="text-sm text-neutral-400 mb-8">
              {new Date(post.gepubliceerdOp).toLocaleDateString("nl-NL", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          )}

          <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">{post.inhoud}</div>
        </article>
      </main>
      <MarketingFooter />
    </div>
  );
}
