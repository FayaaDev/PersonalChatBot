/**
 * Example integration of the ChatWidget into a React application.
 */

import React from 'react';
import { ChatWidget } from './components/ChatWidget';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Jane Doe</h1>
        <p>Product-minded engineer building practical tools for healthcare teams.</p>
      </header>

      <main>
        <section>
          <h2>Selected Work</h2>
          <p>Highlight your projects, writing, and contact details here.</p>
        </section>
      </main>

      <ChatWidget
        apiBaseUrl="http://localhost:8000/api"
        position="bottom-right"
        theme="light"
        assistantName="Jane's Site Assistant"
        assistantSubtitle="Knows the portfolio, bio, and current projects"
        assistantAvatar="JD"
        welcomeMessage="Hi, I can answer questions about Jane's background, work, writing, and contact details."
        placeholder="Ask about experience, projects, or how to get in touch..."
        footerText="Answers are generated from the documents loaded into the backend knowledge folder."
        quickActions={[
          { label: 'Experience', prompt: 'What experience should I know about first?' },
          { label: 'Projects', prompt: 'Which projects best represent this work?' },
          { label: 'Contact', prompt: 'How can I contact Jane?' },
        ]}
      />
    </div>
  );
}

export default App;
