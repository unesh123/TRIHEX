"use client";

import { Printer, Download, Clock, BookOpen, User, Share2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Guide } from "@/lib/guides/guide-registry";

interface GuideArticleProps {
  guide: Guide;
}

export function GuideArticle({ guide }: GuideArticleProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <article className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Back Link - Hidden on print */}
      <div className="mb-6 print:hidden">
        <Link
          href="/guides"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Knowledge Guides
        </Link>
      </div>

      {/* Guide Header */}
      <header className="border-b border-white/10 pb-8 mb-8 print:border-slate-300 print:pb-4">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono print:text-blue-700 print:border-blue-300">
            {guide.category} GUIDE
          </span>

          {/* Print / Save to PDF Button */}
          <button
            type="button"
            onClick={handlePrint}
            className="print:hidden inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-white/10 hover:bg-slate-800 text-slate-200 text-xs font-semibold transition shadow-sm"
          >
            <Printer className="w-3.5 h-3.5 text-blue-400" />
            Print / Save as PDF
          </button>
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white mb-3 print:text-black leading-tight">
          {guide.title}
        </h1>

        <p className="text-base text-slate-300 print:text-slate-700 leading-relaxed mb-6 font-medium">
          {guide.subtitle}
        </p>

        {/* Metadata Strip */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 print:text-slate-600">
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-blue-400" />
            <span>
              By <strong>{guide.author}</strong> ({guide.authorRole})
            </span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{guide.readingTimeMinutes} min read</span>
          </div>
          <span>•</span>
          <span>Published: {guide.publishedAt}</span>
        </div>
      </header>

      {/* Table of Contents - Hidden on print */}
      <nav className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 mb-10 print:hidden">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          <BookOpen className="w-3.5 h-3.5 text-blue-400" /> In This Guide
        </div>
        <ul className="space-y-2 text-xs sm:text-sm">
          {guide.sections.map((sec) => (
            <li key={sec.id}>
              <a
                href={`#${sec.id}`}
                className="text-slate-300 hover:text-blue-400 transition hover:underline"
              >
                {sec.heading}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Main Content Sections */}
      <div className="space-y-10 text-slate-200 print:text-slate-900 leading-relaxed">
        {guide.sections.map((sec) => (
          <section key={sec.id} id={sec.id} className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white print:text-black pt-2 border-t border-white/5 print:border-slate-200">
              {sec.heading}
            </h2>
            <div className="text-sm sm:text-base leading-relaxed whitespace-pre-line text-slate-300 print:text-slate-800">
              {sec.body}
            </div>

            {sec.codeSnippet && (
              <div className="rounded-xl border border-white/10 bg-slate-950 p-4 font-mono text-xs overflow-x-auto text-blue-300 print:bg-slate-100 print:text-black">
                <pre>{sec.codeSnippet.code}</pre>
              </div>
            )}
          </section>
        ))}
      </div>

      {/* Citations & References */}
      {guide.citations.length > 0 && (
        <footer className="mt-12 pt-8 border-t border-white/10 print:border-slate-300">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 print:text-slate-700 mb-3">
            References & Legal Citations
          </h3>
          <ul className="space-y-2 text-xs text-slate-400 print:text-slate-600">
            {guide.citations.map((c) => (
              <li key={c.id} className="flex items-start gap-2">
                <span className="font-mono text-slate-500">[{c.id}]</span>
                <div>
                  <strong className="text-slate-300 print:text-slate-900">{c.title}</strong> — {c.source} ({c.year})
                  {c.url && (
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noreferrer"
                      className="ml-2 text-blue-400 hover:underline print:hidden"
                    >
                      Source Link
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </footer>
      )}
    </article>
  );
}
