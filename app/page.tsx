"use client";

import { useState } from "react";

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

  async function generateBlog() {
    if (!topic.trim()) {
      setError("Please enter a blog topic.");
      return;
    }

    setLoading(true);
    setError("");
    setBlog(null);
    setCopied(false);

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

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.ctrlKey && e.key === "Enter") {
      generateBlog();
    }
  }

  function getBlogText() {
    if (!blog) return "";

    let text = `${blog.title}\n\n`;
    text += `${blog.introduction}\n\n`;

    blog.sections.forEach((section) => {
      text += `${section.heading}\n\n`;
      section.paragraphs.forEach((paragraph) => {
        text += `${paragraph}\n\n`;
      });
    });

    text += `Conclusion\n\n${blog.conclusion}`;

    return text;
  }

  function getWordCount() {
    if(!blog) return 0;

    const text = getBlogText().trim();

    if(!text) return 0;

    return text.split(/\s+/).length;
  }

  async function copyBlog() {
    if (!blog) return;

    await navigator.clipboard.writeText(getBlogText());
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }

  function clearBlog() {
    setBlog(null);
    setError("");
    setCopied(false);
  }

  function regenerateBlog() {
    generateBlog();
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 text-slate-900">
      <div className="mx-auto max-w-4xl">
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

          {error && (
            <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}
        </section>

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
                  onClick={() => setEditing(!editing)}
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
              </div>
            </div>

            <article className="p-6 sm:p-8">
              {editing ? (
                <div className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Title
                    </label>

                    <input
                      value={blog.title}
                      onChange={(e) =>
                        setBlog({
                          ...blog,
                          title: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 px-4 py-3 text-2xl font-bold outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Introduction
                    </label>

                    <textarea
                      value={blog.introduction}
                      onChange={(e) =>
                        setBlog({
                          ...blog,
                          introduction: e.target.value,
                        })
                      }
                      className="min-h-32 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"
                    />
                  </div>

                  {blog.sections.map((section, sectionIndex) => (
                    <div
                      key={sectionIndex}
                      className="rounded-xl border border-slate-200 p-4"
                    >
                      <label className="mb-2 block text-sm font-medium">
                        Section Heading
                      </label>

                      <input
                        value={section.heading}
                        onChange={(e) => {
                          const sections = [...blog.sections];
                          sections[sectionIndex] = {
                            ...sections[sectionIndex],
                            heading: e.target.value,
                          };

                          setBlog({
                            ...blog,
                            sections,
                          });
                        }}
                        className="w-full rounded-lg border border-slate-300 px-4 py-3 font-semibold outline-none focus:border-indigo-500"
                      />

                      {section.paragraphs.map((paragraph, paragraphIndex) => (
                        <textarea
                          key={paragraphIndex}
                          value={paragraph}
                          onChange={(e) => {
                            const sections = [...blog.sections];
                            const paragraphs = [
                              ...sections[sectionIndex].paragraphs,
                            ];

                            paragraphs[paragraphIndex] = e.target.value;

                            sections[sectionIndex] = {
                              ...sections[sectionIndex],
                              paragraphs,
                            };

                            setBlog({
                              ...blog,
                              sections,
                            });
                          }}
                          className="mt-3 min-h-28 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"
                        />
                      ))}
                    </div>
                  ))}

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Conclusion
                    </label>

                    <textarea
                      value={blog.conclusion}
                      onChange={(e) =>
                        setBlog({
                          ...blog,
                          conclusion: e.target.value,
                        })
                      }
                      className="min-h-32 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              ) : (
                <>
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
                </>
              )}
            </article>

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