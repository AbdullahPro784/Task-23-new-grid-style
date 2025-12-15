import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function DELETE(req: Request) {
    try {
        const body = await req.json();
        const { ids } = body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json(
                { error: "Invalid request: 'ids' array is required" },
                { status: 400 }
            );
        }

        const result = await db.item.deleteMany({
            where: {
                id: {
                    in: ids,
                },
            },
        });

        return NextResponse.json({ message: "Deleted successfully", count: result.count });
    } catch (error) {
        console.error("Error deleting items:", error);
        return NextResponse.json(
            { error: "Failed to delete items" },
            { status: 500 }
        );
    }
}
