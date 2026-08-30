"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";

type Section = {
  heading: string;
  paragraphs: string[];
};

type Blog = {
  title: string;
  introduction: string;
  sections: Section[];
  conclusion: string;
};

export default function Home() {
  const [topic, setTopic] = useState("");
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [markdown, setMarkdown] = useState("");
  const [seoAnalysis, setSeoAnalysis] = useState<{
    score: number;
    titleLength: number;
    wordCount: number;
    headingCount: number;
    keyword: string;
    keywordCount: number;
    recommendations: string[];
  } | null>(null);

  const [suggestions, setSuggestions] = useState<{
    titles: string[];
    headings: string[];
    keywords: string[];
    ideas: string[];
  } | null>(null);

  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState("");

  async function generateBlog() {
    if (!topic.trim()) {
      setError("Please enter a blog topic.");
      return;
    }

    setLoading(true);
    setError("");
    setBlog(null);
    setCopied(false);
    setEditing(false);
    setSeoAnalysis(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: topic.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to generate the blog.");
      }

      if (!data.blog || !data.blog.title) {
        throw new Error("AI returned an invalid article.");
      }

      setBlog(data.blog);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function generateSuggestions() {
    if (!topic.trim()) {
      setSuggestionsError("Please enter a blog topic first.");
      return;
    }

    setSuggestionsLoading(true);
    setSuggestionsError("");
    setSuggestions(null);

    try {
      const response = await fetch("/api/suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: topic.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to generate content suggestions."
        );
      }

      if (!data.suggestions) {
        throw new Error("AI returned no suggestions.");
      }

      setSuggestions(data.suggestions);
    } catch (err) {
      setSuggestionsError(
        err instanceof Error
          ? err.message
          : "Unable to generate content suggestions."
      );
    } finally {
      setSuggestionsLoading(false);
    }
  }

  function clearSuggestions() {
    setSuggestions(null);
    setSuggestionsError("");
  }

  function analyzeSEO() {
    if (!blog) return;

    const title = blog.title.trim();
    const introduction = blog.introduction.trim();

    const fullText = [
      blog.title,
      blog.introduction,
      ...blog.sections.flatMap((section) => [
        section.heading,
        ...section.paragraphs,
      ]),
      blog.conclusion,
    ].join(" ");

    const words = fullText
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .split(/\s+/)
      .filter(Boolean);

    const wordCount = words.length;

    const headingCount =
      blog.sections.length + 1;

    const keyword =
      topic
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .trim();

    const keywordWords = keyword
      .split(/\s+/)
      .filter(Boolean);

    let keywordCount = 0;

    if (keywordWords.length > 0) {
      for (let i = 0; i <= words.length - keywordWords.length; i++) {
        const matches = keywordWords.every(
          (word, index) => words[i + index] === word
        );

        if (matches) {
          keywordCount++;
        }
      }
    }

    const titleLength = title.length;

    const recommendations: string[] = [];

    let score = 100;

    if (titleLength < 30) {
      score -= 10;
      recommendations.push(
        "Make the title more descriptive. Aim for around 30–60 characters."
      );
    }

    if (titleLength > 60) {
      score -= 10;
      recommendations.push(
        "Consider shortening the title to around 30–60 characters."
      );
    }

    if (introduction.length < 120) {
      score -= 10;
      recommendations.push(
        "Expand the introduction to provide a stronger search-result description."
      );
    }

    if (introduction.length > 160) {
      score -= 5;
      recommendations.push(
        "The introduction is long for a typical meta description. Consider keeping it near 150–160 characters."
      );
    }

    if (wordCount < 600) {
      score -= 15;
      recommendations.push(
        "Consider expanding the article with more useful information."
      );
    }

    if (wordCount >= 600 && wordCount <= 2000) {
      recommendations.push(
        "The article has a healthy amount of content for an informative blog."
      );
    }

    if (headingCount < 3) {
      score -= 10;
      recommendations.push(
        "Add more meaningful headings to improve content structure."
      );
    }

    if (keyword && keywordCount === 0) {
      score -= 15;
      recommendations.push(
        "Use the primary topic naturally within the article."
      );
    }

    if (keyword && keywordCount > 0) {
      recommendations.push(
        `The primary topic appears ${keywordCount} time${
          keywordCount === 1 ? "" : "s"
        } in the article.`
      );
    }

    if (score < 0) {
      score = 0;
    }

    setSeoAnalysis({
      score,
      titleLength,
      wordCount,
      headingCount,
      keyword,
      keywordCount,
      recommendations,
    });
  }

  function blogToMarkdown(currentBlog: Blog) {
    let text = `# ${currentBlog.title}\n\n`;
    text += `${currentBlog.introduction}\n\n`;

    currentBlog.sections.forEach((section) => {
      text += `## ${section.heading}\n\n`;

      section.paragraphs.forEach((paragraph) => {
        text += `${paragraph}\n\n`;
      });
    });

    text += `## Conclusion\n\n${currentBlog.conclusion}`;

    return text.trim();
  }

  function markdownToBlog(value: string): Blog {
    const lines = value.split("\n");
    const titleLine = lines.find((line) => line.startsWith("# "));

    const title = titleLine
      ? titleLine.replace(/^#\s+/, "").trim()
      : "Untitled Blog";

    const contentLines = lines.filter(
      (line, index) => index !== lines.indexOf(titleLine || "")
    );

    const sections: Section[] = [];
    let introduction = "";
    let conclusion = "";
    let currentHeading = "";
    let currentParagraphs: string[] = [];
    let currentParagraph = "";

    function saveParagraph() {
      if (currentParagraph.trim()) {
        currentParagraphs.push(currentParagraph.trim());
        currentParagraph = "";
      }
    }

    function saveSection() {
      saveParagraph();

      if (currentHeading && currentHeading.toLowerCase() !== "conclusion") {
        sections.push({
          heading: currentHeading,
          paragraphs: currentParagraphs,
        });
      }

      currentParagraphs = [];
    }

    let beforeFirstHeading = true;

    contentLines.forEach((line) => {
      if (line.startsWith("## ")) {
        if (beforeFirstHeading) {
          saveParagraph();
          introduction = currentParagraph.trim();
          currentParagraph = "";
          beforeFirstHeading = false;
        } else {
          saveSection();
        }

        currentHeading = line.replace(/^##\s+/, "").trim();
        return;
      }

      if (!line.trim()) {
        saveParagraph();
        return;
      }

      currentParagraph += `${line.trim()} `;
    });

    saveParagraph();

    if (currentHeading.toLowerCase() === "conclusion") {
      conclusion = currentParagraphs.join("\n\n");
    } else if (currentHeading) {
      saveSection();
    }

    if (!conclusion && sections.length > 0) {
      const lastSection = sections[sections.length - 1];

      if (lastSection.heading.toLowerCase() === "conclusion") {
        conclusion = lastSection.paragraphs.join("\n\n");
        sections.pop();
      }
    }

    return {
      title,
      introduction,
      sections,
      conclusion,
    };
  }

  function getBlogText() {
    if (!blog) return "";

    return blogToMarkdown(blog);
  }

  function getWordCount() {
    const text = editing ? markdown : getBlogText();

    if (!text.trim()) return 0;

    return text.trim().split(/\s+/).length;
  }

  async function copyBlog() {
    if (!blog) return;

    const text = editing ? markdown : getBlogText();

    await navigator.clipboard.writeText(text);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }

  function startEditing() {
    if (!blog) return;

    setMarkdown(blogToMarkdown(blog));
    setEditing(true);
  }

  function saveBlog() {
    if (!markdown.trim()) return;

    setBlog(markdownToBlog(markdown));
    setEditing(false);
  }

  function clearBlog() {
    setBlog(null);
    setMarkdown("");
    setError("");
    setCopied(false);
    setEditing(false);
  }

  function regenerateBlog() {
    generateBlog();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.ctrlKey && e.key === "Enter") {
      generateBlog();
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 text-slate-900">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10 text-center">
          <div className="mb-4 inline-flex rounded-full bg-indigo-100 px-4 py-2 text-sm font-medium text-indigo-700">
            AI Content Generator
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            AI-Powered Blog Platform
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
            Enter any topic and let artificial intelligence create a
            well-structured blog article for you.
          </p>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-bold">Generate a Blog</h2>

          <p className="mt-2 text-sm text-slate-600">
            Enter a topic and let AI create your blog post.
          </p>

          <label
            htmlFor="topic"
            className="mt-6 block text-sm font-medium text-slate-700"
          >
            Blog Topic
          </label>

          <textarea
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Example: How artificial intelligence is changing education"
            className="mt-2 min-h-32 w-full resize-y rounded-xl border border-slate-300 px-4 py-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />

          <div className="mt-2 text-right text-xs text-slate-500">
            Ctrl + Enter to generate
          </div>

          <button
            onClick={generateBlog}
            disabled={loading}
            className="mt-2 w-full rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Generating..." : "Generate with AI"}
          </button>

          <button
            onClick={generateSuggestions}
            disabled={suggestionsLoading}
            className="mt-3 w-full rounded-xl border border-indigo-200 bg-indigo-50 px-5 py-3.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {suggestionsLoading
              ? "Generating Suggestions..."
              : "Get AI Content Suggestions"}
          </button>

          {suggestionsError && (
            <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              {suggestionsError}
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}
        </section>

        {suggestions && (
          <section className="mt-6 rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm sm:p-8">
            <div className="text-xs font-medium uppercase tracking-wide text-indigo-600">
              AI Content Suggestions
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="mt-2 text-2xl font-bold">
                Content Ideas for Your Topic
              </h2>

              <button
                onClick={clearSuggestions}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                Clear
              </button>
            </div>

            <p className="mt-2 text-sm text-slate-600">
              Use these AI-generated ideas to plan and improve your blog.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-xl border border-slate-200 p-5">
                <h3 className="text-lg font-bold">Suggested Titles</h3>

                <ul className="mt-4 space-y-3">
                  {suggestions.titles.map((title, index) => (
                    <li
                      key={index}
                      className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-700"
                    >
                      {title}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-slate-200 p-5">
                <h3 className="text-lg font-bold">Suggested Headings</h3>

                <ul className="mt-4 space-y-3">
                  {suggestions.headings.map((heading, index) => (
                    <li
                      key={index}
                      className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-700"
                    >
                      {heading}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-slate-200 p-5">
                <h3 className="text-lg font-bold">SEO Keywords</h3>

                <div className="mt-4 flex flex-wrap gap-2">
                  {suggestions.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 p-5">
                <h3 className="text-lg font-bold">Content Ideas</h3>

                <ul className="mt-4 space-y-3">
                  {suggestions.ideas.map((idea, index) => (
                    <li
                      key={index}
                      className="rounded-lg bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700"
                    >
                      {idea}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        )}

        {blog && (
          <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-6 sm:p-8">
              <div className="text-xs font-medium uppercase tracking-wide text-indigo-600">
                AI Generated Content
              </div>

              <h2 className="mt-2 text-xl font-bold">Generated Blog</h2>

              <div className="mt-3 text-sm text-slate-600">
                {getWordCount()} words
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  onClick={editing ? saveBlog : startEditing}
                  className="rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
                >
                  {editing ? "Save Blog" : "Edit Blog"}
                </button>

                <button
                  onClick={regenerateBlog}
                  disabled={loading}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
                >
                  Regenerate
                </button>

                <button
                  onClick={copyBlog}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50"
                >
                  {copied ? "Copied!" : "Copy Blog"}
                </button>

                <button
                  onClick={clearBlog}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                >
                  Clear
                </button>

                <button
                  onClick={analyzeSEO}
                  className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100"
                >
                  SEO Analysis
                </button>
              </div>
            </div>

            {seoAnalysis && (
              <section className="border-b border-slate-200 bg-slate-50 p-6 sm:p-8">
                <div className="text-xs font-medium uppercase tracking-wide text-emerald-600">
                  SEO Optimization
                </div>

                <h3 className="mt-2 text-2xl font-bold">
                  SEO Analysis
                </h3>

                <p className="mt-2 text-sm text-slate-600">
                  Analyze your article structure and improve its search visibility.
                </p>

                <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="text-xs text-slate-500">
                      SEO Score
                    </div>

                    <div className="mt-2 text-3xl font-bold text-emerald-600">
                      {seoAnalysis.score}/100
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="text-xs text-slate-500">
                      Word Count
                    </div>

                    <div className="mt-2 text-3xl font-bold">
                      {seoAnalysis.wordCount}
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="text-xs text-slate-500">
                      Title Length
                    </div>

                    <div className="mt-2 text-3xl font-bold">
                      {seoAnalysis.titleLength}
                    </div>

                    <div className="mt-1 text-xs text-slate-500">
                      Recommended: 30–60
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="text-xs text-slate-500">
                      Headings
                    </div>

                    <div className="mt-2 text-3xl font-bold">
                      {seoAnalysis.headingCount}
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-white p-5">
                    <h4 className="font-bold">
                      Primary Keyword
                    </h4>

                    <div className="mt-3 rounded-lg bg-indigo-50 px-4 py-3 text-sm font-medium text-indigo-700">
                      {seoAnalysis.keyword || "No keyword detected"}
                    </div>

                    <p className="mt-3 text-sm text-slate-600">
                      Keyword appearances:{" "}
                      <strong>{seoAnalysis.keywordCount}</strong>
                    </p>
                  </div>
                </div>

                <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
                  <h4 className="font-bold">
                    SEO Recommendations
                  </h4>

                  <ul className="mt-4 space-y-3">
                    {seoAnalysis.recommendations.map(
                      (recommendation, index) => (
                        <li
                          key={index}
                          className="flex gap-3 rounded-lg bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700"
                        >
                          <span className="font-bold text-emerald-600">
                            ✓
                          </span>

                          <span>{recommendation}</span>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              </section>
            )}

            {editing ? (
              <div className="grid grid-cols-1 border-b border-slate-200 lg:grid-cols-2">
                <div className="border-b border-slate-200 lg:border-b-0 lg:border-r">
                  <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
                    <h3 className="font-semibold">Markdown Editor</h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Edit your article using Markdown.
                    </p>
                  </div>

                  <textarea
                    value={markdown}
                    onChange={(e) => setMarkdown(e.target.value)}
                    className="min-h-[700px] w-full resize-none border-0 px-6 py-6 font-mono text-sm leading-7 outline-none focus:ring-0"
                    spellCheck={false}
                  />
                </div>

                <div>
                  <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
                    <h3 className="font-semibold">Live Preview</h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Preview your formatted article.
                    </p>
                  </div>

                  <article className="prose prose-slate max-w-none p-6 sm:p-8">
                    <ReactMarkdown>{markdown}</ReactMarkdown>
                  </article>
                </div>
              </div>
            ) : (
              <article className="p-6 sm:p-8">
                <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
                  {blog.title}
                </h1>

                <p className="mt-6 text-base leading-8 text-slate-700">
                  {blog.introduction}
                </p>

                <div className="mt-8 space-y-8">
                  {blog.sections.map((section, index) => (
                    <section key={index}>
                      <h3 className="text-xl font-bold">
                        {section.heading}
                      </h3>

                      <div className="mt-3 space-y-4">
                        {section.paragraphs.map((paragraph, paragraphIndex) => (
                          <p
                            key={paragraphIndex}
                            className="text-base leading-8 text-slate-700"
                          >
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>

                <div className="mt-8 border-t border-slate-200 pt-8">
                  <h3 className="text-xl font-bold">Conclusion</h3>

                  <p className="mt-3 text-base leading-8 text-slate-700">
                    {blog.conclusion}
                  </p>
                </div>
              </article>
            )}

            <footer className="border-t border-slate-200 bg-slate-50 px-6 py-4 text-center text-xs text-slate-500 sm:px-8">
              Generated with AI
            </footer>
          </section>
        )}

        <footer className="mt-10 text-center">
          <p className="text-sm font-medium text-slate-600">
            AI-Powered Blog Platform
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Built with Next.js and AI
          </p>
        </footer>
      </div>
    </main>
  );
}