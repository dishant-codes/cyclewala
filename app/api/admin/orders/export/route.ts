import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { isAuthorized } from "@/lib/admin-auth";
import { getOrders } from "@/lib/orders";

/* Admin-only Excel export of every saved order. Text is written as plain
   string cells (never formulas), so customer-typed values like "=1+1" stay
   inert when opened in Excel. */
export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orders = await getOrders();
  const wb = new ExcelJS.Workbook();
  wb.creator = "Cycle Wala";

  const sheet = wb.addWorksheet("Orders");
  sheet.columns = [
    { header: "Order ID", key: "id", width: 16 },
    { header: "Date", key: "date", width: 20 },
    { header: "Status", key: "status", width: 12 },
    { header: "Customer", key: "name", width: 22 },
    { header: "Phone", key: "phone", width: 16 },
    { header: "Address", key: "address", width: 40 },
    { header: "Note", key: "note", width: 28 },
    { header: "Items", key: "items", width: 44 },
    { header: "Total (₹)", key: "total", width: 12 },
  ];

  const lines = wb.addWorksheet("Items");
  lines.columns = [
    { header: "Order ID", key: "id", width: 16 },
    { header: "Customer", key: "name", width: 22 },
    { header: "Brand", key: "brand", width: 14 },
    { header: "Model", key: "model", width: 18 },
    { header: "Qty", key: "qty", width: 6 },
    { header: "Unit price (₹)", key: "price", width: 14 },
    { header: "Line total (₹)", key: "line", width: 14 },
  ];

  for (const o of orders) {
    sheet.addRow({
      id: o.id,
      date: new Date(o.createdAt).toLocaleString("en-IN"),
      status: o.status,
      name: o.customer.name,
      phone: o.customer.phone,
      address: o.customer.address,
      note: o.customer.note ?? "",
      items: o.items.map((i) => `${i.brand} ${i.model} x${i.qty}`).join(", "),
      total: o.total,
    });
    for (const i of o.items) {
      lines.addRow({
        id: o.id,
        name: o.customer.name,
        brand: i.brand,
        model: i.model,
        qty: i.qty,
        price: i.price ?? "",
        line: i.price === null ? "" : i.price * i.qty,
      });
    }
  }

  for (const ws of [sheet, lines]) {
    ws.getRow(1).font = { bold: true };
    ws.views = [{ state: "frozen", ySplit: 1 }];
  }
  sheet.getColumn("phone").numFmt = "@";

  const buffer = await wb.xlsx.writeBuffer();
  const stamp = new Date().toISOString().slice(0, 10);

  return new Response(buffer as ArrayBuffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="cyclewala-orders-${stamp}.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
}
