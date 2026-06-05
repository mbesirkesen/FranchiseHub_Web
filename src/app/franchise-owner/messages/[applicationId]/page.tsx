import { MessageThreadPage } from "@/components/messages/message-thread-page";

export default function FranchiseOwnerMessageThreadPage() {
  return (
    <MessageThreadPage
      viewer="franchise_owner"
      inboxPath="/franchise-owner/messages"
      applicationDetailBasePath="/franchise-owner/applications"
    />
  );
}
