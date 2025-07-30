"use client";

import * as React from "react";
import {
    DayPicker as ReactDayPicker,
    type DayPickerProps as ReactDayPickerProps,
} from "react-day-picker";
import "react-day-picker/dist/style.css";
import { cn } from "@/lib/utils";

function Calendar({ className, ...props }: ReactDayPickerProps) {
    return (
        <ReactDayPicker
            className={cn("p-3 bg-white rounded-md", className)}
            showOutsideDays
            fixedWeeks
            {...props}
        />
    );
}

Calendar.displayName = "Calendar";

export { Calendar };
