"use client";

import { useFormState, useFormStatus } from "react-dom";
import { type ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "./alert";
import { AlertTriangle } from "lucide-react";

type Props = Omit<ComponentProps<typeof Button>, 'formAction'> & {
  pendingText?: string;
  formAction: (prevState: any, formData: FormData) => Promise<any>;
  errorMessage?: string;
  modalSubmit?: boolean
};

const initialState = {
  message: "",
};

export function SubmitButton({ children, modalSubmit, formAction, errorMessage, pendingText = "Submitting...", ...props }: Props) {
  const { pending, action } = useFormStatus();
  const [state, internalFormAction] = useFormState(formAction, initialState);


  const isPending = pending && action === internalFormAction;

  return (
    <div className="flex flex-col gap-y-4 w-full">
      {Boolean(errorMessage || state?.message) && (
        <Alert variant="destructive" className="w-full">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
          {errorMessage || state?.message}
          </AlertDescription>
        </Alert>
      )}
      <div className={!!modalSubmit ? 'text-right' : ''}>
        <Button {...props} type="submit" aria-disabled={pending} formAction={internalFormAction}>
          {isPending ? pendingText : children}
        </Button>
      </div>
    </div>
  );
}
