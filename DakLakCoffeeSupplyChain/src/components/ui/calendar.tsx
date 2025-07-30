"use client";

import * as React from "react";
import {
    DayPicker as ReactDayPicker,
    type DayPickerProps as ReactDayPickerProps,
} from "react-day-picker";
import "react-day-picker/dist/style.css";
import { cn } from "@/lib/utils";
function Calendar({ className, ...props }: ReactDayPickerProps) {
    const fallbackMonth =
        props.defaultMonth ??
        (props.mode === "single" && props.selected instanceof Date
            ? props.selected
            : new Date());

    return (
        <ReactDayPicker
            className={cn("p-3 bg-white rounded-md", className)}
            showOutsideDays
            fixedWeeks
            captionLayout="dropdown"
            defaultMonth={fallbackMonth}
            hidden={{
                before: new Date(2015, 0, 1),
                after: new Date(2030, 11, 31),
            }}
            {...props}
        />
    );
}


Calendar.displayName = "Calendar";
export { Calendar };
