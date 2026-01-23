<div align="center">
  <br />
      <img src="/public/whispr-chat.png" alt="Project Banner">
  <br />

  <h3 align="center">Whispr Chat: A community-based real-time chat system powered by Supabase</h3>
</div>

## 📋 <a name="table">Table of Contents</a>

1. 🤖 [Introduction](#introduction)
2. ⚙️ [Tech Stack](#tech-stack)
3. 🔋 [Features](#features)
4. 🤸 [Quick Start](#quick-start)
5. 🕸️ [Snippets (Code to Copy)](#snippets)

## <a name="introduction">🤖 Introduction</a>

Built with Next.js for the user interface and backend logic, Supabase for authentication, database, and real-time features, styled with TailwindCSS, Whispr Chat is a community-based real-time chat system designed to connect users through public and private rooms. The platform offers a sleek and modern experience for real-time communication with community features.

## <a name="tech-stack">⚙️ Tech Stack</a>

- Next.js
- Supabase (Authentication, Database, Real-time, Functions, Triggers)
- Tailwind CSS
- TypeScript
- shadcn/ui
- Real-time Subscriptions

## <a name="features">🔋 Features</a>

👉 **Authentication**: Sign Up and Sign In using Supabase authentication with secure user management.

👉 **Public Rooms**: Join public community rooms and participate in real-time conversations with other users.

👉 **Private Rooms**: Create and manage private rooms for exclusive conversations.

👉 **Real-time Messaging**: Experience instant message delivery and updates using Supabase real-time subscriptions.

👉 **Room Management**: Create, join, leave, and manage chat rooms with ease.

👉 **User Presence**: See who's online and active in rooms with real-time presence indicators.

👉 **Modern UI/UX**: A sleek and user-friendly interface designed for an excellent chat experience.

👉 **Responsive Design**: Fully responsive design that works seamlessly across desktop and mobile devices.

👉 **Community Features**: Discover and join public communities based on interests and topics.

and many more, including real-time database triggers and serverless functions

## <a name="quick-start">🤸 Quick Start</a>

Follow these steps to set up the project locally on your machine.

**Prerequisites**

- Node.js 18+ and npm
- Supabase account and project

**Installation**

Install the project dependencies using npm:

```bash
npm install
```

**Set Up Environment Variables**

Create a new file named `.env.local` in the root of your project and add the following content:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

**Set Up Supabase Database**

Run the Supabase migrations to set up the database schema:

```bash
supabase db push
```

**Running the Project**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the project.
