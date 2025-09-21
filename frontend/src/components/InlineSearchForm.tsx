"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    MapPin,
    CalendarDays,
    Minus,
    Plus,
    Search as SearchIcon,
} from "lucide-react";

export default function InlineSearchForm() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const getParam = (key: string, fallback = "") => searchParams?.get(key) ?? fallback;

    const [location, setLocation] = useState(getParam("location", "Mumbai"));
    const [checkIn, setCheckIn] = useState(getParam("checkInDate", ""));
    const [checkOut, setCheckOut] = useState(getParam("checkOutDate", ""));
    const [rooms, setRooms] = useState<number>(Number(getParam("rooms", "1")) || 1);
    const [guests, setGuests] = useState<number>(Number(getParam("guests", "1")) || 1);
    const [propertyType, setPropertyType] = useState(getParam("propertyType", "hotel"));

    const checkInRef = useRef<HTMLInputElement>(null);
    const checkOutRef = useRef<HTMLInputElement>(null);

    const [minCheckInDate, setMinCheckInDate] = useState("");
    const [minCheckOutDate, setMinCheckOutDate] = useState("");

    useEffect(() => {
        const today = new Date();
        const pad = (n: number) => String(n).padStart(2, "0");
        const formattedToday = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(
            today.getDate()
        )}`;
        setMinCheckInDate(formattedToday);
        setMinCheckOutDate(formattedToday);
    }, []);

    const updateParams = (overrides: Record<string, string>) => {
        const params = new URLSearchParams(searchParams?.toString() || "");
        Object.entries(overrides).forEach(([k, v]) => {
            if (v === "" || v == null) {
                params.delete(k);
            } else {
                params.set(k, v);
            }
        });
        const query = params.toString();
        const url = query ? `/search?${query}` : "/search";
        router.replace(url);
    };

    const incrementRooms = () => {
        const v = Math.min(5, rooms + 1);
        setRooms(v);
    };
    const decrementRooms = () => {
        const v = Math.max(1, rooms - 1);
        setRooms(v);
    };
    const incrementGuests = () => {
        const v = Math.min(guests + 1, 20);
        setGuests(v);
    };
    const decrementGuests = () => {
        const v = Math.max(1, guests - 1);
        setGuests(v);
    };

    const handleSearchClick = () => {
        const params = new URLSearchParams(searchParams?.toString() || "");
        params.set("location", location || "");
        if (checkIn) params.set("checkInDate", checkIn);
        if (checkOut) params.set("checkOutDate", checkOut);
        params.set("rooms", String(rooms));
        params.set("guests", String(guests));
        params.set("propertyType", propertyType || "hotel");
        const query = params.toString();
        router.push(query ? `/search?${query}` : "/search");
    };

    const fieldShell =
        "flex items-center flex-1 min-w-full md:min-w-[180px] p-2 border-b md:border-b-0 md:border-r border-gray-200";

    return (
        <form
            className="bg-white rounded-xl shadow-lg p-2 flex flex-col md:flex-row md:flex-wrap items-stretch md:items-center"
            onSubmit={(e) => {
                e.preventDefault();
                handleSearchClick();
            }}
        >
            {/* Location */}
            <div className={`${fieldShell} md:min-w-[220px]`}>
                <div className="flex flex-col flex-grow relative">
                    <label className="text-xs font-medium text-gray-500">Location</label>
                    <div className="relative">
                        <input
                            value={location}
                            onChange={(e) => {
                                setLocation(e.target.value);
                                // do not update URL on change; only on explicit Search
                            }}
                            className="outline-none text-sm w-full"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                            <MapPin className="h-4 w-4 text-black" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Check-in */}
            <div className={`${fieldShell}`}>
                <div className="flex flex-col flex-grow">
                    <label className="text-xs text-gray-500 font-medium">Check In Date</label>
                    <div
                        className="relative cursor-pointer"
                        onClick={() => checkInRef.current?.showPicker()}
                    >
                        <input
                            ref={checkInRef}
                            type="date"
                            className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                            value={checkIn}
                            min={minCheckInDate}
                            onChange={(e) => {
                                setCheckIn(e.target.value);
                                // do not update URL on change; only on explicit Search
                                if (checkOut && e.target.value && checkOut < e.target.value) {
                                    setCheckOut(e.target.value);
                                    // do not update URL on change; only on explicit Search
                                }
                            }}
                        />
                        <div className="flex items-center justify-between w-full pr-2">
                            <span className="text-sm">
                                {checkIn
                                    ? new Date(checkIn).toLocaleDateString(undefined, {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                    })
                                    : ""}
                            </span>
                            <CalendarDays className="h-4 w-4 text-black" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Check-out */}
            <div className={`${fieldShell}`}>
                <div className="flex flex-col flex-grow">
                    <label className="text-xs text-gray-500 font-medium">Check Out Date</label>
                    <div
                        className="relative cursor-pointer"
                        onClick={() => checkOutRef.current?.showPicker()}
                    >
                        <input
                            ref={checkOutRef}
                            type="date"
                            className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                            value={checkOut}
                            min={checkIn || minCheckOutDate}
                            onChange={(e) => {
                                setCheckOut(e.target.value);
                                // do not update URL on change; only on explicit Search
                            }}
                        />
                        <div className="flex items-center justify-between w-full pr-2">
                            <span className="text-sm">
                                {checkOut
                                    ? new Date(checkOut).toLocaleDateString(undefined, {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                    })
                                    : ""}
                            </span>
                            <CalendarDays className="h-4 w-4 text-black" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Rooms */}
            <div className={`${fieldShell} md:min-w-[140px] relative group`}>
                <div className="flex flex-col flex-grow">
                    <label className="text-xs text-gray-500 font-medium">Rooms</label>
                    <div className="flex items-center">
                        <button
                            type="button"
                            className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center"
                            onClick={decrementRooms}
                            disabled={rooms <= 1}
                        >
                            <Minus size={14} />
                        </button>
                        <span className="mx-2 text-sm">{rooms}</span>
                        <button
                            type="button"
                            className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center"
                            onClick={incrementRooms}
                            disabled={rooms >= 5}
                        >
                            <Plus size={14} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Guests */}
            <div className={`${fieldShell} md:min-w-[140px] relative group`}>
                <div className="flex flex-col flex-grow">
                    <label className="text-xs text-gray-500 font-medium">Guests</label>
                    <div className="flex items-center">
                        <button
                            type="button"
                            className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center"
                            onClick={decrementGuests}
                            disabled={guests <= 1}
                        >
                            <Minus size={14} />
                        </button>
                        <span className="mx-2 text-sm">{guests}</span>
                        <button
                            type="button"
                            className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center"
                            onClick={incrementGuests}
                        >
                            <Plus size={14} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Search Button */}
            <div className="flex-none p-2 w-full md:w-auto">
                <button
                    type="submit"
                    className="bg-black text-white p-3 rounded-full hover:bg-gray-800 transition-colors w-full md:w-auto flex items-center justify-center gap-2"
                >
                    <span className="md:hidden">Search</span>
                    <SearchIcon size={20} className="hidden md:block" />
                </button>
            </div>
        </form>
    );
}
