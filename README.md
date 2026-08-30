# AI-Powered Blog Platform

An AI-powered web platform that helps users generate, plan, edit, and optimize blog content using artificial intelligence.

The platform provides AI blog generation, content suggestions, a Markdown editor with live preview, word counting, and SEO analysis in a simple and responsive interface.

## Live Demo

https://ai-powered-blog-platform-live.vercel.app

## GitHub Repository

https://github.com/utkarsh-kumar18/ai-powered-blog-platform

## Features

### AI Blog Generation

Enter a topic and generate a complete blog article using Google's Gemini AI.

The generated article includes:

- Title
- Introduction
- Multiple sections
- Section paragraphs
- Conclusion

The generation process also performs topic-focused research before creating the final article.

### AI Content Suggestions

The platform can generate content planning suggestions for a selected topic.

It provides:

- Suggested blog titles
- Suggested section headings
- SEO keywords
- Content ideas

Users can clear the suggestions without affecting the generated blog.

### Markdown Editor

Generated blogs can be edited using a Markdown editor.

Users can:

- Edit the article
- Save changes
- View the updated content
- Switch between editing and previewing

### Live Preview

The platform provides a live Markdown preview so users can see how their article will look while editing.

### Word Count

The generated blog displays its current word count.

The word count updates based on the current article content.

### SEO Analysis

The platform includes a built-in SEO analyzer that evaluates the generated article.

It provides:

- SEO score
- Word count
- Title length
- Heading count
- Primary keyword detection
- Keyword usage count
- SEO recommendations

The SEO analysis is performed locally and does not require an additional AI API request.

### Blog Controls

Users can:

- Edit Blog
- Save Blog
- Regenerate the blog
- Copy the complete blog
- Clear the generated blog
- Clear AI content suggestions
- Run SEO Analysis

## Technology Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- React Markdown

### AI

- Google Gemini API
- `@google/genai`

### Deployment

- Vercel

### Version Control

- Git
- GitHub

## Project Structure

```text
ai-powered-blog-platform/
│
├── app/
│   ├── api/
│   │   ├── generate/
│   │   │   └── route.ts
│   │   │
│   │   └── suggestions/
│   │       └── route.ts
│   │
│   ├── page.tsx
│   └── ...
│
├── public/
│
├── .env.local
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
