import { ConversationsInbox } from "@/components/messages/conversations-inbox";

export default function FranchiseOwnerMessagesPage() {
  return <ConversationsInbox viewer="franchise_owner" threadBasePath="/franchise-owner/messages" />;
}
