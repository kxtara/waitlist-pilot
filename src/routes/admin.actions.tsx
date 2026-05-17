import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { UserPlus, UserMinus, Mail, Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/actions")({
  component: ActionsPage,
});

type FieldDef = {
  name: string;
  label: string;
  type: "email" | "text" | "textarea";
  required?: boolean;
  placeholder?: string;
};

function ActionsPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Manual System Overrides</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Direct operations for adding, removing, and contacting subscribers.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ActionForm
          icon={UserPlus}
          tone="success"
          title="Add Subscriber"
          description="Inserts or reactivates an entry explicitly."
          endpoint="/admin/users/add"
          method="POST"
          submitLabel="Enforce Subscription"
          fields={[
            { name: "email", label: "Email Address", type: "email", required: true, placeholder: "target@domain.com" },
          ]}
        />
        <ActionForm
          icon={UserMinus}
          tone="destructive"
          title="Revoke Subscription"
          description="Sets target waitlist entry to an unsubscribed state."
          endpoint="/admin/users/unsubscribe"
          method="PATCH"
          submitLabel="Enforce Unsubscribe"
          fields={[
            { name: "email", label: "Email Address", type: "email", required: true, placeholder: "target@domain.com" },
          ]}
        />
      </div>

      <ActionForm
        icon={Mail}
        tone="primary"
        title="Dispatch Custom Email"
        description="Updates 'lastContactedAt' and queues an SMTP delivery."
        endpoint="/admin/users/custom-email"
        method="POST"
        submitLabel="Transmit Email Notification"
        wide
        fields={[
          { name: "email", label: "Recipient Email", type: "email", required: true, placeholder: "recipient@domain.com" },
          { name: "title", label: "Header Banner Title", type: "text", required: true },
          { name: "subject", label: "Subject Line", type: "text", required: true },
          { name: "content", label: "Message Content Body", type: "textarea", required: true },
        ]}
      />
    </div>
  );
}

function ActionForm({
  icon: Icon,
  tone,
  title,
  description,
  endpoint,
  method,
  submitLabel,
  fields,
  wide,
}: {
  icon: any;
  tone: "success" | "destructive" | "primary";
  title: string;
  description: string;
  endpoint: string;
  method: string;
  submitLabel: string;
  fields: FieldDef[];
  wide?: boolean;
}) {
  const initial = Object.fromEntries(fields.map((f) => [f.name, ""]));
  const [values, setValues] = useState<Record<string, string>>(initial);

  const mutation = useMutation({
    mutationFn: (body: Record<string, string>) =>
      apiFetch(endpoint, { method, body: JSON.stringify(body) }),
    onSuccess: () => {
      toast.success(`${title}: success`);
      setValues(initial);
    },
    onError: (e: any) => toast.error(e.message || "Action failed"),
  });

  const toneClass =
    tone === "success"
      ? "bg-success/10 text-success"
      : tone === "destructive"
        ? "bg-destructive/10 text-destructive"
        : "bg-primary/10 text-primary";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate(values);
      }}
      className={`rounded-xl border bg-card p-6 shadow-elegant ${wide ? "md:col-span-2" : ""}`}
    >
      <div className="flex items-start gap-3 mb-5">
        <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${toneClass}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        </div>
      </div>

      <div className="space-y-4">
        {fields.map((f) => (
          <div className="space-y-2" key={f.name}>
            <Label htmlFor={`${endpoint}-${f.name}`}>{f.label}</Label>
            {f.type === "textarea" ? (
              <Textarea
                id={`${endpoint}-${f.name}`}
                required={f.required}
                placeholder={f.placeholder}
                rows={5}
                value={values[f.name]}
                onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
              />
            ) : (
              <Input
                id={`${endpoint}-${f.name}`}
                type={f.type}
                required={f.required}
                placeholder={f.placeholder}
                value={values[f.name]}
                onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
              />
            )}
          </div>
        ))}
      </div>

      <Button
        type="submit"
        className="w-full mt-5"
        disabled={mutation.isPending}
        variant={tone === "destructive" ? "destructive" : "default"}
      >
        {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : submitLabel}
      </Button>
    </form>
  );
}
