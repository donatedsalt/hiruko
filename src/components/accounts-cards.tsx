import { IAccount } from "@/types/account";

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import {
  IconCirclePlus,
  IconCirclePlus2,
  IconCirclePlusFilled,
} from "@tabler/icons-react";

export function AccountsCards() {
  return (
    <div className="flex gap-4 px-4 overflow-auto lg:px-6">
      <AccountsCard name={"Cash"} balance={1256} transactionsCount={50} />
      <AccountsCard
        name={"Easypaisa"}
        balance={2059.56}
        transactionsCount={6}
      />
      <AccountsCard name={"NayaPay"} balance={200} transactionsCount={3} />
      <AccountsCard name={"Bank"} balance={15600.69} transactionsCount={12} />

      <Card className="flex flex-col items-center justify-center gap-3 p-6 bg-transparent border-dashed shadow-xs shrink-0">
        <CardHeader className="@container-normal">
          <CardTitle className="flex flex-col items-center text-2xl font-semibold text-muted-foreground">
            <IconCirclePlusFilled />
            <span className="break-keep">Add Account</span>
          </CardTitle>
        </CardHeader>
        <CardFooter className="text-sm text-muted-foreground">
          Click to add a new account
        </CardFooter>
      </Card>
    </div>
  );
}

function AccountsCard({
  name,
  balance,
  transactionsCount,
}: Omit<IAccount, "userId">) {
  return (
    <Card className="justify-center gap-3 p-6 shadow-xs shrink-0 from-primary/5 to-card dark:bg-card bg-gradient-to-t">
      <CardHeader className="@container-normal">
        <CardTitle className="text-2xl font-semibold text-muted-foreground">
          {name}
        </CardTitle>
        <CardDescription className="text-3xl font-semibold text-foreground tabular-nums">
          {balance.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
          })}
        </CardDescription>
      </CardHeader>
      <CardFooter className="text-sm">
        <p className="text-muted-foreground">
          {transactionsCount} Transactions
        </p>
      </CardFooter>
    </Card>
  );
}
