import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> } // In Next.js 15+, params is a Promise
) {
    try {
        const { id } = await params;
        const body = await req.json();

        const item = await db.item.update({
            where: { id },
            data: body,
        });

        return NextResponse.json(item);
    } catch (error) {
        console.error("Error updating item:", error);
        return NextResponse.json(
            { error: "Failed to update item" },
            { status: 500 }
        );
    }
}
