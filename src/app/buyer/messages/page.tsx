import { ConversationsInbox } from "@/components/messages/conversations-inbox";

export default function BuyerMessagesPage() {
  return <ConversationsInbox viewer="buyer" threadBasePath="/buyer/messages" />;
}
