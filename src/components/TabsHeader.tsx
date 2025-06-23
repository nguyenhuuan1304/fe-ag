import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import TransactionTable from "./TransactionTable";

export function TabsHeader() {
  return (
    <div className="flex w-full flex-col gap-6">
      <Tabs defaultValue="unsubmitted" className="gap-6">
        <TabsList className="flex gap-2">
          <TabsTrigger value="unsubmitted">Báo cáo chưa bổ sung</TabsTrigger>
          <TabsTrigger value="submitted">Đã bổ sung</TabsTrigger>
          <TabsTrigger value="overdue">Báo cáo quá hạn</TabsTrigger>
        </TabsList>
        <TabsContent value="unsubmitted">
          <TransactionTable status="Chưa bổ sung" />
        </TabsContent>
        <TabsContent value="submitted">
          <TransactionTable status="Đã bổ sung" />
        </TabsContent>
        <TabsContent value="overdue">
          <TransactionTable status="Quá hạn" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
