import { motion } from "framer-motion";

export default function ChatBubble({ message, isUser, timestamp }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`chat ${isUser ? "chat-end" : "chat-start"}`}
    >
      <div className={`chat-bubble ${isUser ? "chat-bubble-primary" : "chat-bubble-neutral"} text-sm max-w-[80%]`}>
        {message.model && (
          <span className="badge badge-sm badge-ghost mb-1 block w-fit">
            {message.model === "Llama 3" ? "🦙" : "💎"} {message.model}
          </span>
        )}
        <p className="whitespace-pre-wrap">{message.text}</p>
        {message.explanation && (
          <p className="text-xs opacity-70 mt-1 italic">{message.explanation}</p>
        )}
        {message.confidence != null && (
          <p className="text-xs opacity-50 mt-1">
            Confidence: {Math.round(message.confidence * 100)}%
          </p>
        )}
      </div>
      {timestamp && (
        <div className="chat-footer opacity-50 text-xs">{timestamp}</div>
      )}
    </motion.div>
  );
}
