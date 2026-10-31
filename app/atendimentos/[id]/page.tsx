"use client";

import { useParams } from "next/navigation";
import FormAtendimento from "@/components/FormAtendimento";

export default function EditarAtendimentoPage() {
  const params = useParams<{ id: string }>();
  return <FormAtendimento atendimentoId={params.id} />;
}
