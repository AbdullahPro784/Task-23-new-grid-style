"use client";

import React, { useEffect, useState } from "react";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
    Header,
    ColumnOrderState,
    ColumnFiltersState,
    VisibilityState,
    getFilteredRowModel,
    ExpandedState,
    getExpandedRowModel,
} from "@tanstack/react-table";
import { StatusEditableCell } from "./StatusEditableCell";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    horizontalListSortingStrategy,
    useSortable,
    sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";
import {
    ChevronDown,
    ChevronUp,
    ChevronsUpDown,
    Wrench,
    Settings,
    CheckCircle,
    HardHat,
    GripHorizontal,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    MoreHorizontal,
    Trash2,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Asset, AssetStatus, DATA } from "./data";
import { cn } from "@/lib/utils";
import { DraggableTableHeader } from "./DraggableTableHeader";
import { EditableCell } from "./EditableCell";

import AddItemModal from "./AddItemModal";

// --- Main Component ---
export default function AssetTable({ data: initialData }: { data: Asset[] }) {
    const [isMounted, setIsMounted] = useState(false);

    // Extract unique categories from DATA for the dropdown
    const uniqueCategories = React.useMemo(() => {
        const categories = new Set(DATA.map(item => item.category));
        return Array.from(categories).sort();
    }, []);

    const [data, setData] = useState(initialData);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isColumnsMenuOpen, setIsColumnsMenuOpen] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [globalFilter, setGlobalFilter] = useState(""); // Global filter state
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [columnOrder, setColumnOrder] = useState<ColumnOrderState>([
        "select",
        "id",
        "serial",
        "category",
        "brand",
        "type",
        "vehicle",
        "status",
    ]);
    const [rowSelection, setRowSelection] = useState({});

    // Load column order from local storage
    useEffect(() => {
        const savedOrder = localStorage.getItem("assetTableColumnOrder");
        if (savedOrder) {
            try {
                const parsedOrder = JSON.parse(savedOrder);
                if (!parsedOrder.includes("select")) {
                    parsedOrder.unshift("select");
                }
                setColumnOrder(parsedOrder);
            } catch (e) {
                console.error("Failed to parse column order", e);
            }
        }
    }, []);

    // Save column order to local storage
    useEffect(() => {
        localStorage.setItem("assetTableColumnOrder", JSON.stringify(columnOrder));
    }, [columnOrder]);

    const columns = React.useMemo<ColumnDef<Asset>[]>(() => [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <div className="px-4 py-3 h-full flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(value) => row.toggleSelected(!!value)}
                        aria-label="Select row"
                    />
                    {row.getCanExpand() && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                row.toggleExpanded();
                            }}
                            className="p-1 hover:bg-gray-200 rounded cursor-pointer"
                        >
                            {row.getIsExpanded() ? (
                                <ChevronDown size={16} className="text-gray-500" />
                            ) : (
                                <ChevronRight size={16} className="text-gray-500" />
                            )}
                        </button>
                    )}
                </div>
            ),
            enableSorting: false,
            enableHiding: false,
            size: 50,
        },
        {
            accessorKey: "id",
            header: "Asset ID",
            cell: (info) => <div className="px-4 py-3 h-full">{info.getValue() as string}</div>,
            size: 100,
        },
        {
            accessorKey: "serial",
            header: "Serial",
            cell: EditableCell,
            size: 150,
        },
        {
            accessorKey: "category",
            header: "Category",
            cell: (props) => <EditableCell {...props} options={uniqueCategories} />,
            size: 140,
        },
        {
            accessorKey: "brand",
            header: "Brand",
            cell: EditableCell,
            size: 140,
        },
        {
            accessorKey: "type",
            header: "Type",
            cell: EditableCell,
            size: 140,
        },
        {
            accessorKey: "vehicle",
            header: "Vehicle",
            size: 140,
            cell: ({ row, getValue, table }) => {
                const value = getValue() as string;
                return (
                    <div
                        className="flex items-center justify-between px-4 py-3 h-full group"
                        onContextMenu={(e) => {
                            e.preventDefault();
                            alert("Please click the three dots menu to see options.");
                        }}
                    >
                        <span className="truncate">{value}</span>
                        <DropdownMenu modal={false}>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => {
                                    alert("Option selected: Assign Driver");
                                }}>
                                    Assign Driver
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => alert("Option selected: Check History")}>
                                    Check History
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            },
        },
        {
            accessorKey: "endDate",
            header: "End Date",
            cell: (props) => <EditableCell {...props} type="date" />,
            size: 140,
        },
        {
            accessorKey: "status",
            header: "Status",
            size: 180,
            cell: StatusEditableCell,
        },
    ], [uniqueCategories]);

    const table = useReactTable({
        data,
        columns,
        getRowId: (row) => row.id, // Ensure rows are identified by their ID
        state: {
            sorting,
            columnOrder,
            rowSelection,
            columnFilters,
            columnVisibility,
            globalFilter, // Pass global filter state
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter, // Handle global filter changes
        onColumnVisibilityChange: setColumnVisibility,
        onColumnOrderChange: setColumnOrder,
        onColumnOrderChange: setColumnOrder,
        onRowSelectionChange: setRowSelection,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        getSubRows: (row) => row.subRows,
        getPaginationRowModel: getPaginationRowModel(),
        autoResetPageIndex: false, // Prevent resetting to page 1 on update
        enableRowSelection: true,
        enableMultiRowSelection: true,
        meta: {
            updateData: async (itemId: string, columnId: string, value: any) => {
                const previousData = [...data];

                // Optimistic Update
                setData((old) =>
                    old.map((item) => {
                        if (item.id === itemId) {
                            return {
                                ...item,
                                [columnId]: value,
                            };
                        }
                        return item;
                    })
                );

                try {
                    let body;
                    if (columnId === "status") {
                        body = JSON.stringify({
                            statusState: value.state,
                            statusLevel: value.level
                        });
                    } else {
                        body = JSON.stringify({ [columnId]: value });
                    }

                    const response = await fetch(`/api/items/${itemId}`, {
                        method: "PATCH",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body,
                    });

                    if (!response.ok) {
                        const errorText = await response.text();
                        console.error("API Error:", errorText);
                        throw new Error(`Failed to update: ${response.statusText}`);
                    }
                } catch (error) {
                    console.error("Update failed", error);
                    // Revert on failure
                    setData(previousData);
                    alert(`Failed to save changes: ${(error as Error).message}. Reverting.`);
                }
            },
        },
    });

    const handleDeleteSelected = async () => {
        console.log("Delete button clicked");
        try {
            const selectedRowIds = table.getFilteredSelectedRowModel().rows.map(row => row.original.id);
            console.log("Selected IDs:", selectedRowIds);

            if (selectedRowIds.length === 0) {
                alert("No items selected!");
                return;
            }

            if (window.confirm(`Are you sure you want to delete ${selectedRowIds.length} item(s)?`)) {
                const response = await fetch("/api/items/batch", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ids: selectedRowIds }),
                });

                if (response.ok) {
                    setData(prev => prev.filter(item => !selectedRowIds.includes(item.id)));
                    setRowSelection({});
                } else {
                    const err = await response.text();
                    alert(`Failed to delete items: ${err}`);
                }
            }
        } catch (error) {
            console.error("Delete failed", error);
            alert(`Error deleting items: ${(error as Error).message}`);
        }
    };

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (active && over && active.id !== over.id) {
            setColumnOrder((order) => {
                const oldIndex = order.indexOf(active.id as string);
                const newIndex = order.indexOf(over.id as string);
                return arrayMove(order, oldIndex, newIndex);
            });
        }
    }

    if (!isMounted) {
        return null;
    }

    return (
        <div className="w-full max-w-6xl mx-auto p-4 bg-white rounded-lg shadow-sm border border-gray-200 font-sans">
            <div className="mb-4 flex items-center justify-between">
                {/* Search bar placeholder to match image */}
                <div className="flex gap-2 items-center">
                    <div className="relative w-64">
                        <input
                            type="text"
                            placeholder="Search all assets"
                            value={globalFilter} // Bind value
                            onChange={(e) => setGlobalFilter(e.target.value)} // Bind onChange
                            className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                        <span className="absolute left-2.5 top-2.5 text-gray-400">🔍</span>
                    </div>
                    {Object.keys(rowSelection).length > 0 && (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleDeleteSelected}
                            className="flex items-center gap-2"
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete ({Object.keys(rowSelection).length})
                        </Button>
                    )}
                </div>
                <div className="flex gap-2 relative">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-3 py-2 bg-orange-500 text-white rounded-md text-sm font-medium hover:bg-orange-600"
                    >
                        + Add Item
                    </button>
                    <div className="relative">
                        <button
                            onClick={() => setIsColumnsMenuOpen(!isColumnsMenuOpen)}
                            className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 flex items-center gap-2 shadow-sm transition-colors"
                        >
                            Columns <ChevronDown size={14} />
                        </button>
                        {/* Column Selection Dropdown */}
                        {isColumnsMenuOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setIsColumnsMenuOpen(false)}
                                />
                                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-20 p-2">
                                    <div className="font-semibold text-xs text-gray-500 mb-2 px-1">Toggle Columns</div>
                                    {table.getAllLeafColumns().map((column) => {
                                        return (
                                            <div key={column.id} className="flex items-center gap-2 px-2 py-1 hover:bg-gray-50 rounded">
                                                <input
                                                    type="checkbox"
                                                    checked={column.getIsVisible()}
                                                    onChange={column.getToggleVisibilityHandler()}
                                                    className="rounded border-gray-300 text-orange-500 focus:ring-orange-500 cursor-pointer"
                                                />
                                                <span className="text-sm text-gray-700 capitalize cursor-pointer" onClick={() => column.toggleVisibility(!column.getIsVisible())}>
                                                    {typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>

                </div>
            </div>

            <AddItemModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={(newItem) => {
                    const formattedItem: Asset = {
                        id: newItem.id,
                        serial: newItem.serial,
                        category: newItem.category,
                        brand: newItem.brand,
                        type: newItem.type,
                        vehicle: newItem.vehicle,
                        status: {
                            state: newItem.statusState,
                            level: newItem.statusLevel ? Number(newItem.statusLevel) : undefined
                        }
                    };
                    setData((prev) => [formattedItem, ...prev]);
                }}
            />

            <DndContext
                collisionDetection={closestCenter}
                modifiers={[restrictToHorizontalAxis]}
                onDragEnd={handleDragEnd}
                sensors={sensors}
            >
                <div className="overflow-x-auto border border-gray-200 rounded-md">
                    <table className="w-full text-sm text-left table-fixed">
                        <thead>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id}>
                                    <SortableContext
                                        items={columnOrder}
                                        strategy={horizontalListSortingStrategy}
                                    >
                                        {headerGroup.headers.map((header) => (
                                            <DraggableTableHeader key={header.id} header={header} />
                                        ))}
                                    </SortableContext>
                                </tr>
                            ))}
                        </thead>
                        <tbody>
                            {table.getRowModel().rows.map((row) => {
                                // Calculate days remaining
                                let rowClass = "hover:bg-slate-50";
                                let textClass = "text-gray-700";

                                if (row.original.endDate) {
                                    const end = new Date(row.original.endDate);
                                    const today = new Date();
                                    // Set time to midnight for accurate day calculation
                                    today.setHours(0, 0, 0, 0);
                                    end.setHours(0, 0, 0, 0);

                                    const diffTime = end.getTime() - today.getTime();
                                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                                    if (diffDays < 0) {
                                        // Passed: Black
                                        rowClass = "bg-slate-900 hover:bg-slate-800";
                                        textClass = "text-white";
                                    } else if (diffDays <= 2) {
                                        // <= 2 Days: Red
                                        rowClass = "bg-red-100 hover:bg-red-200";
                                        textClass = "text-red-900 font-medium";
                                    } else if (diffDays <= 5) {
                                        // <= 5 Days: Orange
                                        rowClass = "bg-orange-100 hover:bg-orange-200";
                                        textClass = "text-orange-900 font-medium";
                                    }
                                }

                                return (
                                    <tr
                                        key={row.id}
                                        onClick={() => row.toggleSelected()}
                                        className={cn(
                                            "border-b border-gray-100 cursor-pointer transition-colors",
                                            rowClass,
                                            // Selection override (optional, blending)
                                            row.getIsSelected() ? "bg-opacity-90 ring-1 ring-inset ring-orange-400" : "",
                                            "h-16"
                                        )}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <td key={cell.id} className={cn("p-0", textClass)}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </DndContext>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
                <div>
                    Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, data.length)} of {data.length} records
                </div>
                <div className="flex items-center gap-2">
                    <button
                        className="p-1 border rounded hover:bg-gray-100 disabled:opacity-50"
                        onClick={() => table.setPageIndex(0)}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <ChevronsLeft size={16} />
                    </button>
                    <button
                        className="p-1 border rounded hover:bg-gray-100 disabled:opacity-50"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <span className="flex items-center gap-1">
                        <div>Page</div>
                        <strong>
                            {table.getState().pagination.pageIndex + 1} of{" "}
                            {table.getPageCount()}
                        </strong>
                    </span>
                    <button
                        className="p-1 border rounded hover:bg-gray-100 disabled:opacity-50"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        <ChevronRight size={16} />
                    </button>
                    <button
                        className="p-1 border rounded hover:bg-gray-100 disabled:opacity-50"
                        onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                        disabled={!table.getCanNextPage()}
                    >
                        <ChevronsRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
