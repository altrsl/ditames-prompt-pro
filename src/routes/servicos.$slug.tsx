import { createFileRoute, notFound } from "@tanstack/react-router";
import { ServiceTemplate } from "@/components/site/ServiceTemplate";
import { getServiceBySlug } from "@/lib/services";

export const Route = createFileRoute("/servicos/$slug")({
  loader: ({ params }) => {
    const service = getServiceBySlug(params.slug);
    if (!service) throw notFound();
    return { service };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.service.title} — Ditames Ambiental` },
          { name: "description", content: loaderData.service.short },
          { property: "og:title", content: `${loaderData.service.title} — Ditames` },
          { property: "og:description", content: loaderData.service.short },
        ]
      : [{ title: "Serviço — Ditames" }],
  }),
  component: ServicoPage,
  notFoundComponent: () => (
    <div className="pt-40 pb-20 container-x text-center">
      <h1 className="font-display text-4xl uppercase text-ink">Serviço não encontrado</h1>
    </div>
  ),
});

function ServicoPage() {
  const { service } = Route.useLoaderData();
  return <ServiceTemplate service={service} />;
}
