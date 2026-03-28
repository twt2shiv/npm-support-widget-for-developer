/**
 * React App — ChatWidget v3 Integration
 *
 * Only 2 env vars needed:
 *   REACT_APP_CHAT_API_KEY=demo1234
 *   REACT_APP_CHAT_WIDGET_ID=demo
 *
 * All widget config (status, chatType, colors, features) is loaded
 * from chatData.json at https://window.mscorpres.com/TEST/chatData.json
 *
 * The theme prop below is OPTIONAL — it overrides remote config colors.
 */
import React from 'react';
import { ChatWidget } from 'react-chat-widget-extension';

export default function App() {
  return (
    <div>
      <main style={{ padding: 40 }}>
        <h1>My Application</h1>
        <p>The chat drawer slides in from the right.</p>
      </main>

      <ChatWidget
        theme={{
          // Optional overrides — leave blank to use chatData.json values
          // primaryColor:    '#2563EB',
          // buttonLabel:     'Support',
          // buttonPosition:  'bottom-right',
        }}
      />
    </div>
  );
}
