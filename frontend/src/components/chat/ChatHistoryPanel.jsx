
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MessageSquare, Calendar, Trash2, X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ChatHistoryPanel({ onLoadConversation, onClose, currentDataSourceId }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const queryClient = useQueryClient();

  const { data: chatHistory = [], isLoading } = useQuery({
    queryKey: ['chatHistory'],
    queryFn: () => base44.entities.ChatHistory.list('-last_message_at'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ChatHistory.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatHistory'] });
      setDeleteId(null);
    },
  });

  const filteredHistory = chatHistory.filter(chat => {
    const search = searchQuery.toLowerCase();
    return (
      chat.title?.toLowerCase().includes(search) ||
      chat.data_source_name?.toLowerCase().includes(search) ||
      chat.messages?.some(m => m.content?.toLowerCase().includes(search))
    );
  });

  const groupedHistory = filteredHistory.reduce((acc, chat) => {
    const date = new Date(chat.last_message_at || chat.created_date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    let group;
    if (date.toDateString() === today.toDateString()) {
      group = "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      group = "Yesterday";
    } else if (date > weekAgo) {
      group = "This Week";
    } else {
      group = "Older";
    }

    if (!acc[group]) acc[group] = [];
    acc[group].push(chat);
    return acc;
  }, {});

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: 0 }}
        exit={{ x: "-100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed left-0 top-[72px] md:top-[144px] bottom-0 w-full md:w-96 bg-card/95 backdrop-blur-xl border-r border-border shadow-2xl z-50 flex flex-col"
      >
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Chat History
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-11 rounded-full border-border bg-background shadow-sm hover:shadow-md transition-shadow"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <MessageSquare className="w-12 h-12 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                {searchQuery ? "No conversations found" : "No chat history yet"}
              </p>
            </div>
          ) : (
            <div className="p-3 space-y-4">
              {Object.entries(groupedHistory).map(([group, chats]) => (
                <div key={group}>
                  <h3 className="text-xs font-semibold text-muted-foreground mb-2 px-2">
                    {group}
                  </h3>
                  <div className="space-y-2">
                    {chats.map((chat) => (
                      <motion.div
                        key={chat.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="group relative"
                      >
                        <button
                          onClick={() => {
                            onLoadConversation(chat);
                            onClose();
                          }}
                          className="w-full text-left p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2 w-full">
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium truncate mb-1">
                                {chat.title}
                              </h4>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                                <span className="flex items-center gap-1">
                                  <MessageSquare className="w-3 h-3 flex-shrink-0" />
                                  <span className="truncate">{chat.message_count || 0}</span>
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3 flex-shrink-0" />
                                  <span className="truncate">{format(new Date(chat.last_message_at || chat.created_date), 'MMM d, h:mm a')}</span>
                                </span>
                              </div>
                              {chat.data_source_name && (
                                <p className="text-xs text-muted-foreground truncate">
                                  {chat.data_source_name}
                                </p>
                              )}
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteId(chat.id);
                              }}
                            >
                              <Trash2 className="w-3 h-3 text-destructive" />
                            </Button>
                          </div>
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </motion.div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this chat history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteMutation.mutate(deleteId)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
