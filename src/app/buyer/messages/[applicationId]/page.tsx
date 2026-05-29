import { MessageThreadPage } from "@/components/messages/message-thread-page";

export default function BuyerMessageThreadPage() {
  return (
    <MessageThreadPage
      viewer="buyer"
      inboxPath="/buyer/messages"
      applicationDetailPath={(id) => `/buyer/applications/${id}`}
    />
  );
}
