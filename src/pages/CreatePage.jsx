import CreatePollForm from "@/components/polls/CreatePollForm";

export default function CreatePage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-bold font-headline tracking-tight mb-8">
        Create a New Poll
      </h1>
      <CreatePollForm />
    </div>
  );
}
