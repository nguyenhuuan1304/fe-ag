import { useEffect, useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import CustomerTable from "./CustomerTable";
import TransactionTable from "./TransactionTable";

export function TabsHeader() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [value, setValue] = useState("");

  useEffect(() => {
    if (user?.role === "GDV_TTQT") {
      setValue("unsubmitted");
    } else {
      setValue("submitted");
    }
  }, [user?.role]);

  return (
    <div className="flex w-full flex-col gap-6">
      <Tabs value={value} onValueChange={setValue} className="gap-6">
        <TabsList className="flex gap-2">
          {["ADMIN", "GDV_TTQT", "KSV_TTQT"].includes(user?.role) && (
            <TabsTrigger value="unsubmitted">Báo cáo chưa bổ sung</TabsTrigger>
          )}
          <TabsTrigger value="submitted">Đã bổ sung</TabsTrigger>
          {["ADMIN", "GDV_TTQT", "KSV_TTQT"].includes(user?.role) && (
            <TabsTrigger value="overdue">Báo cáo quá hạn</TabsTrigger>
          )}
          {["ADMIN", "GDV_TTQT"].includes(user?.role) && (
            <>
              <TabsTrigger value="overdue">Báo cáo quá hạn</TabsTrigger>
              <TabsTrigger value="notSendMailList">
                Danh sách chưa gửi email
              </TabsTrigger>
              <TabsTrigger value="sentMailList">
                Danh sách đã gửi email
              </TabsTrigger>
            </>
          )}
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
        <TabsContent value="notSendMailList">
          <CustomerTable />
        </TabsContent>
        <TabsContent value="sentMailList">
          <CustomerTable isSendEmail={true} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
