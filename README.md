# AI-Powered Blog Platform

An AI-powered web application that allows users to enter any topic and generate a well-structured blog article using Google's Gemini AI.

## Live Demo

https://ai-powered-blog-platform-live-j48l0ypl.vercel.app

## About the Project

The AI-Powered Blog Platform is designed to simplify blog creation.

Users can enter any topic, and the application generates an informative blog article with:

- A title
- Introduction
- Multiple sections
- Section headings
- Detailed paragraphs
- Conclusion
- Automatic word count

The application is designed to accept a wide range of topics rather than relying on a fixed list of predefined subjects.

## Features

### AI Blog Generation

Enter any topic and generate a complete blog article with AI.

### Structured Articles

Generated articles follow a consistent structure:

1. Title
2. Introduction
3. Multiple content sections
4. Conclusion

### Word Count

The application automatically displays the number of words in the generated article.

### Edit Blog

Users can edit the generated blog before using it.

### Regenerate

Users can generate another version of the blog for the same topic.

### Copy Blog

The complete generated blog can be copied to the clipboard.

### Clear

Users can clear the generated content and start again.

### Responsive Interface

The platform works across desktop and mobile screen sizes.

## How It Works

The application follows this flow:

```text
User enters a topic
        ↓
Next.js frontend
        ↓
Next.js API route
        ↓
Google Gemini API
        ↓
AI-generated structured response
        ↓
Blog displayed on the website


## Project Structure

ai-powered-blog-platform/
│
├── app/
│   ├── api/
│   │   └── generate/
│   │       └── route.ts
│   │
│   ├── page.tsx
│   ├── layout.tsx
│   └── globals.css
│
├── public/
│
├── package.json
├── tsconfig.json
├── next.config.ts
└── README.md