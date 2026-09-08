import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Send, Search, Mail, User, ArrowLeft } from "lucide-react";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/messages")({
  component: AdminMessages,
});

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  subject: string | null;
  body: string;
  read: boolean;
  read_at: string | null;
  created_at: string;
  related_listing_id?: string;
  related_agent_id?: string;
  sender_email?: string;
  recipient_email?: string;
}

interface Conversation {
  userId: string;
  userEmail: string | null;
  userName: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  listingId?: string;
}

function AdminMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("");

  const loadConversations = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to load messages:", error);
        return;
      }

      const msgs = (data || []) as Message[];
      setMessages(msgs);

      const convoMap = new Map<string, Conversation>();
      for (const msg of msgs) {
        const otherId = msg.sender_id === user.id ? msg.recipient_id : msg.sender_id;
        const otherEmail = msg.sender_id === user.id ? msg.recipient_email : msg.sender_email;
        if (!convoMap.has(otherId)) {
          convoMap.set(otherId, {
            userId: otherId,
            userEmail: otherEmail || null,
            userName: otherEmail?.split("@")[0] || "User",
            lastMessage: msg.body,
            lastMessageAt: msg.created_at,
            unreadCount: 0,
            listingId: msg.related_listing_id,
          });
        }
        const convo = convoMap.get(otherId)!;
        convo.lastMessage = msg.body;
        convo.lastMessageAt = msg.created_at;
        if (msg.recipient_id === user.id && !msg.read) {
          convo.unreadCount++;
        }
      }

      const sorted = Array.from(convoMap.values()).sort(
        (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime(),
      );
      setConversations(sorted);
    } catch (e) {
      console.error("Load error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    const channel = supabase
      .channel("admin-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        async (payload) => {
          const newMsg = payload.new as Message;
          const { data: { user } } = await supabase.auth.getUser();
          if (user && (newMsg.sender_id === user.id || newMsg.recipient_id === user.id)) {
            setMessages((prev) => [newMsg, ...prev]);
            if (newMsg.recipient_id === user.id) {
              setConversations((prev) => {
                const existing = prev.find((c) => c.userId === newMsg.sender_id);
                if (existing) {
                  return prev.map((c) =>
                    c.userId === newMsg.sender_id
                      ? {
                          ...c,
                          lastMessage: newMsg.body,
                          lastMessageAt: newMsg.created_at,
                          unreadCount: c.unreadCount + 1,
                        }
                      : c,
                  ).sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
                }
                return [
                  {
                    userId: newMsg.sender_id,
                    userEmail: newMsg.sender_email || null,
                    userName: newMsg.sender_email?.split("@")[0] || "User",
                    lastMessage: newMsg.body,
                    lastMessageAt: newMsg.created_at,
                    unreadCount: 1,
                    listingId: newMsg.related_listing_id,
                  },
                  ...prev,
                ].sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
    setSending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("messages").insert({
        sender_id: user.id,
        recipient_id: selectedConversation,
        subject: subject || "Message from Amdern Properties Admin",
        body: newMessage,
        read: false,
      });

      if (error) {
        console.error("Failed to send message:", error);
        return;
      }

      setNewMessage("");
      setSubject("");
      await loadConversations();
    } catch (e) {
      console.error("Send error:", e);
    } finally {
      setSending(false);
    }
  };

  const selectedMessages = messages.filter(
    (m) =>
      (m.sender_id === selectedConversation || m.recipient_id === selectedConversation) &&
      (m.related_listing_id === undefined ||
        messages.find((c) => c.id === selectedConversation)?.related_listing_id === m.related_listing_id),
  ).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  const filteredConversations = conversations.filter((c) =>
    c.userEmail?.toLowerCase().includes(search.toLowerCase()) ||
    c.userName.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-slate-500">Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Messages</h1>
        <p className="mt-1 text-sm text-slate-600">
          Send and receive messages with agents and property seekers.
        </p>
      </div>

      <Tabs defaultValue="inbox">
        <TabsList>
          <TabsTrigger value="inbox">Inbox</TabsTrigger>
          <TabsTrigger value="sent">Sent</TabsTrigger>
        </TabsList>
        <TabsContent value="inbox" className="mt-4">
          <Card className="overflow-hidden">
            {selectedConversation ? (
              <div className="flex h-[500px]">
                <div className="flex-1 flex flex-col">
                  <div className="border-b border-slate-200 px-4 py-3 flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setSelectedConversation(null)}
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {conversations.find((c) => c.userId === selectedConversation)?.userEmail ||
                          "User"}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {conversations.find((c) => c.userId === selectedConversation)?.lastMessageAt}
                      </p>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {selectedMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender_id === selectedConversation ? "justify-start" : "justify-end"}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg px-4 py-2.5 ${
                            msg.sender_id === selectedConversation
                              ? "bg-slate-100 text-slate-900"
                              : "bg-red-600 text-white"
                          }`}
                        >
                          {msg.subject && (
                            <p className="text-xs font-bold mb-1">{msg.subject}</p>
                          )}
                          <p className="text-sm">{msg.body}</p>
                          <p
                            className={`text-[10px] mt-1 ${
                              msg.sender_id === selectedConversation ? "text-slate-400" : "text-white/70"
                            }`}
                          >
                            {new Date(msg.created_at).toLocaleString("en-UG", {
                              dateStyle: "short",
                              timeStyle: "short",
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-slate-200 p-3">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                        className="text-sm"
                      />
                      <Button
                        onClick={sendMessage}
                        disabled={sending || !newMessage.trim()}
                        className="btn-base btn-primary hover:btn-primary-hover"
                      >
                        {sending ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredConversations.length === 0 ? (
                  <div className="p-8 text-center">
                    <Mail className="mx-auto h-10 w-10 text-slate-300 mb-2" />
                    <p className="text-sm font-semibold text-slate-900">No conversations</p>
                    <p className="text-xs text-slate-500 mt-1">Messages from agents and users will appear here</p>
                  </div>
                ) : (
                  filteredConversations.map((c) => (
                    <div
                      key={c.userId}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors"
                      onClick={() => setSelectedConversation(c.userId)}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
                        {c.userName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-slate-900 truncate">
                            {c.userEmail || c.userName}
                          </p>
                          {c.unreadCount > 0 && (
                            <Badge className="bg-red-100 text-red-700 text-[10px]">
                              {c.unreadCount}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 truncate">{c.lastMessage}</p>
                      </div>
                      <p className="text-[11px] text-slate-400 shrink-0">
                        {new Date(c.lastMessageAt).toLocaleDateString("en-UG", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}
          </Card>
        </TabsContent>
        <TabsContent value="sent" className="mt-4">
          <Card className="p-8 text-center">
            <Mail className="mx-auto h-10 w-10 text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-900">Sent messages</p>
            <p className="text-xs text-slate-500 mt-1">Messages you send will appear here</p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
