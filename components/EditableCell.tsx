import React, { useState, useEffect } from "react";

export const EditableCell = ({
    getValue,
    row,
    column,
    table,
    options,
    type = "text",
}: {
    getValue: () => any;
    row: any;
    column: any;
    table: any;
    options?: string[];
    type?: "text" | "date" | "select";
}) => {
    const initialValue = getValue();
    const [value, setValue] = useState(initialValue ?? "");
    const [isEditing, setIsEditing] = useState(false);
    const saveInitiated = React.useRef(false);

    // Sync state with initialValue prop change
    useEffect(() => {
        setValue(initialValue ?? "");
    }, [initialValue]);

    const handleSave = (currentValue: any) => {
        if (saveInitiated.current) return;
        saveInitiated.current = true;

        if (type === "date" && currentValue) {
            // Strict ISO format check (YYYY-MM-DD)
            const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!isoDateRegex.test(currentValue)) {
                alert("Invalid date value. Please ensure date is selected correctly.");
                setValue(initialValue ?? "");
                setIsEditing(false);
                saveInitiated.current = false;
                return;
            }

            const [year, month, day] = currentValue.split("-").map(Number);

            // Logical Year Validation
            if (year < 2024) {
                alert("Invalid date: Year must be 2024 or later.");
                setValue(initialValue ?? "");
                setIsEditing(false);
                saveInitiated.current = false;
                return;
            }
            if (year > 2100) {
                alert("Invalid date: Year is too far in the future.");
                setValue(initialValue ?? "");
                setIsEditing(false);
                saveInitiated.current = false;
                return;
            }
        }

        if (currentValue !== initialValue) {
            const confirmSave = window.confirm("You have changed the data. Do you want to save the changes?");
            if (confirmSave) {
                table.options.meta?.updateData(row.original.id, column.id, currentValue);
                setIsEditing(false);
            } else {
                setValue(initialValue ?? "");
                setIsEditing(false);
            }
        } else {
            setIsEditing(false);
        }

        setTimeout(() => {
            saveInitiated.current = false;
        }, 100);
    };

    const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
        if (!saveInitiated.current) {
            handleSave(e.target.value);
        }
    };

    if (isEditing) {
        if (options) {
            return (
                <select
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onBlur={onBlur}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") handleSave(e.currentTarget.value);
                        else if (e.key === "Escape") {
                            setValue(initialValue ?? "");
                            setIsEditing(false);
                        }
                    }}
                    autoFocus
                    className="w-full h-full px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    style={{ margin: 0, border: 'none' }}
                >
                    {options.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>
            );
        }

        return (
            <input
                type={type} // Use the passed type (e.g. "date")
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onBlur={onBlur}
                onKeyDown={(e) => {
                    if (e.key === "Enter") handleSave(e.currentTarget.value);
                    else if (e.key === "Escape") {
                        setValue(initialValue ?? "");
                        setIsEditing(false);
                    }
                }}
                autoFocus
                className="w-full h-full px-4 py-3 bg-transparent focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent font-sans"
                style={{ margin: 0, border: 'none' }}
            />
        );
    }

    // Read Mode Display
    let displayValue = value;
    if (type === "date" && value) {
        // Format ISO YYYY-MM-DD to dd/mm/yyyy for display
        const [y, m, d] = (value as string).split("-");
        if (y && m && d) {
            displayValue = `${d}/${m}/${y}`;
        }
    }

    return (
        <div onDoubleClick={() => setIsEditing(true)} className="cursor-text w-full h-full px-4 py-3 flex items-center">
            {displayValue}
        </div>
    );
};

