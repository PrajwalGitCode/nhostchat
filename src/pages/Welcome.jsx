import { useEffect, useState } from "react";
import { nhost } from "../nhost";
import { useNavigate } from "react-router-dom";

const OPENROUTER_KEY = import.meta.env.VITE_OPENROUTER_KEY; // put your OpenRouter key in .env

export default function Welcome() {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState("");
  const [chats, setChats] = useState(() => {
    const saved = localStorage.getItem("chats");
    if (saved) return JSON.parse(saved);
    return [
      {
        id: crypto.randomUUID(),
        title: "Chat 1",
        messages: [
          { id: crypto.randomUUID(), sender: "bot", text: "Hello! How can I help you today?" }
        ]
      }
    ];
  });

  const [selectedChatId, setSelectedChatId] = useState(() => {
    const saved = localStorage.getItem("selectedChatId");
    return saved ? JSON.parse(saved) : chats[0].id;
  });

  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Auth check
  useEffect(() => {
    const user = nhost.auth.getUser();
    if (!user) navigate("/signin");
    else setUserEmail(user.email);
  }, [navigate]);

  // Persist chats
  useEffect(() => {
    localStorage.setItem("chats", JSON.stringify(chats));
  }, [chats]);

  // Persist selected chat
  useEffect(() => {
    localStorage.setItem("selectedChatId", JSON.stringify(selectedChatId));
  }, [selectedChatId]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const chatIdx = chats.findIndex(c => c.id === selectedChatId);
    if (chatIdx === -1) return;

    const updatedChats = [...chats];

    // User message
    const userMsg = { id: crypto.randomUUID(), sender: "user", text: newMessage };
    updatedChats[chatIdx].messages.push(userMsg);
    setChats(updatedChats);
    setNewMessage("");
    setLoading(true);

    try {
      // Call Netlify function instead of OpenRouter directly
      const response = await fetch("/.netlify/functions/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: [
            { role: "system", content: "You are a helpful AI assistant." },
            ...updatedChats[chatIdx].messages.map(m => ({
              role: m.sender === "user" ? "user" : "assistant",
              content: m.text
            }))
          ]
        })
      });

      const data = await response.json();
      // Adapt to OpenRouter function response
      const botReply = data.choices?.[0]?.message?.content || "Sorry, I could not get a response.";

      updatedChats[chatIdx].messages.push({ id: crypto.randomUUID(), sender: "bot", text: botReply });
      setChats([...updatedChats]);
    } catch (err) {
      updatedChats[chatIdx].messages.push({ id: crypto.randomUUID(), sender: "bot", text: "Error contacting AI." });
      setChats([...updatedChats]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    const newId = crypto.randomUUID();
    const newChat = {
      id: newId,
      title: `Chat ${chats.length + 1}`,
      messages: [{ id: crypto.randomUUID(), sender: "bot", text: "Hello! How can I help you today?" }]
    };
    setChats([...chats, newChat]);
    setSelectedChatId(newId);
  };

  const handleSignOut = async () => {
    await nhost.auth.signOut();
    navigate("/signin");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">Chats</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {chats.map(chat => (
            <div
              key={chat.id}
              className={`p-2 rounded cursor-pointer mb-2 ${selectedChatId === chat.id ? "bg-blue-100" : "bg-gray-100"}`}
              onClick={() => setSelectedChatId(chat.id)}
            >
              {chat.title}
            </div>
          ))}
          <button onClick={handleNewChat} className="w-full bg-green-500 text-white py-2 rounded mt-2">
            + New Chat
          </button>
        </div>
        <div className="p-4 border-t">
          <button onClick={handleSignOut} className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600">
            Sign Out
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 bg-white shadow flex justify-between items-center">
          <h2 className="font-bold">Welcome, {userEmail}</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {chats.find(c => c.id === selectedChatId)?.messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`px-4 py-2 rounded-lg max-w-xs ${msg.sender === "user" ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-900"}`}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 bg-white border-t flex">
          <input
            type="text"
            placeholder="Type your message..."
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            className="flex-1 border rounded px-4 py-2 mr-2"
          />
          <button
            onClick={sendMessage}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
