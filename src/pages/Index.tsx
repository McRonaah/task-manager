import React from "react";

const Index = () => {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="text-center max-w-xl">
        <h1 className="text-5xl font-bold mb-6 text-primary">
          Welcome to Your Task Management System
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          Streamline your workflow, track tasks, and boost productivity—all in one place.
        </p>
        <div className="flex justify-center gap-4">
          <a
            href="/dashboard"
            className="px-6 py-3 bg-primary text-white font-semibold rounded-xl shadow hover:bg-primary/90 transition"
          >
            Go to Dashboard
          </a>
          <a
            href="/about"
            className="px-6 py-3 border border-primary text-primary font-semibold rounded-xl hover:bg-primary/5 transition"
          >
            Learn More
          </a>
        </div>
      </div>
    </main>
  );
};

export default Index;