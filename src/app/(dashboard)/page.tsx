import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataList } from "@/components/data-list";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";

import data from "@/data/data.json";

export default function Page() {
  return (
    <>
      <SiteHeader title="Overview" />
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SectionCards />
          <div className="px-4 lg:px-6">
            <ChartAreaInteractive />
          </div>
          <DataList
            data={data.map((item) => ({
              ...item,
              type: item.type as "expense" | "income",
              transactionTime: new Date(item.transactionTime),
            }))}
          />
        </div>
      </div>
    </>
  );
}
