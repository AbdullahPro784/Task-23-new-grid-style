import AssetTable from "@/components/AssetTable";
import { db } from "@/lib/db";
import { Asset } from "@/components/data";

async function getAssets(): Promise<Asset[]> {
  const items: any[] = await db.item.findMany({
    orderBy: { createdAt: "desc" },
  });

  const mappedItems: Asset[] = items.map((item) => ({
    id: item.id,
    serial: item.serial,
    category: item.category,
    brand: item.brand,
    type: item.type,
    vehicle: item.vehicle,
    status: {
      state: item.statusState as any,
      level: item.statusLevel ?? undefined,
    },
    endDate: item.endDate ?? undefined,
  }));

  // Mock sub-rows for demonstration (Tree Grid)
  if (mappedItems.length > 0) {
    mappedItems[0].subRows = [
      {
        id: "sub-1",
        serial: "SALE-2024-001",
        category: "Sales Record",
        brand: "-",
        type: "Invoice",
        vehicle: "-",
        status: { state: "operational", level: 4 },
        endDate: "2024-12-01"
      },
      {
        id: "sub-2",
        serial: "SALE-2024-002",
        category: "Sales Record",
        brand: "-",
        type: "Receipt",
        vehicle: "-",
        status: { state: "operational", level: 4 },
        endDate: "2024-12-05"
      }
    ];
  }

  return mappedItems;
}

export default async function Home() {
  const assets = await getAssets();

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8 bg-gray-50">
      <div className="w-full max-w-7xl">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Asset Management</h1>
        <AssetTable data={assets} />
      </div>
    </main>
  );
}

