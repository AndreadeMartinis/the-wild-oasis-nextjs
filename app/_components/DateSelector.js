"use client";

import {
  differenceInDays,
  isPast,
  isSameDay,
  isWithinInterval,
} from "date-fns";

import { useReservation } from "./ReservationsContext";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

function isAlreadyBooked(range, datesArr) {
  return (
    range.from &&
    range.to &&
    datesArr.some((date) =>
      isWithinInterval(date, { start: range.from, end: range.to })
    )
  );
}

function DateSelector({ settings, cabin, bookedDates }) {
  const { range, setRange, resetRange } = useReservation();

  // Funzione per gestire la selezione della data
  const handleSelect = (selectedRange) => {
    if (!selectedRange) return; // Evita di aggiornare se `selectedRange` è undefined

    setRange((prevRange) => {
      // Verifica se si tratta di un doppio clic sulla stessa data e mantieni il precedente `range`
      if (
        prevRange?.from?.getTime() === selectedRange?.from?.getTime() &&
        prevRange?.to === undefined &&
        selectedRange?.to === undefined
      ) {
        return prevRange;
      }

      return {
        ...prevRange, // Mantieni i valori esistenti
        ...selectedRange, // Aggiorna solo i valori definiti
      };
    });
  };

  const displayRange = isAlreadyBooked(range, bookedDates) ? {} : range;
  const { regularPrice, discount } = cabin;

  const numNights = differenceInDays(displayRange.to, displayRange.from);
  const cabinPrice = numNights * (regularPrice - discount);

  // SETTINGS
  const { minBookingLength, maxBookingLength } = settings;

  return (
    <div className="flex flex-col justify-between">
      <DayPicker
        className="pt-12 place-self-center"
        mode="range"
        onSelect={handleSelect} // Usa la nuova funzione `handleSelect`
        selected={displayRange}
        min={minBookingLength}
        max={maxBookingLength}
        // OLD API
        // fromMonth={new Date()}
        // fromDate={new Date()}
        // toYear={new Date().getFullYear() + 5}
        // BASED ON NEW API
        startMonth={new Date()}
        startDate={new Date()}
        endMonth={new Date(new Date().getFullYear() + 5, 11)} // Dicembre dell'anno 5 anni avanti
        captionLayout="dropdown"
        numberOfMonths={2}
        disabled={(curDate) =>
          isPast(curDate) ||
          bookedDates.some((date) => isSameDay(date, curDate))
        }
      />

      <div className="flex items-center justify-between px-8 bg-accent-500 text-primary-800 h-[72px]">
        <div className="flex items-baseline gap-6">
          <p className="flex gap-2 items-baseline">
            {discount > 0 ? (
              <>
                <span className="text-2xl">${regularPrice - discount}</span>
                <span className="line-through font-semibold text-primary-700">
                  ${regularPrice}
                </span>
              </>
            ) : (
              <span className="text-2xl">${regularPrice}</span>
            )}
            <span className="">/night</span>
          </p>
          {numNights ? (
            <>
              <p className="bg-accent-600 px-3 py-2 text-2xl">
                <span>&times;</span> <span>{numNights}</span>
              </p>
              <p>
                <span className="text-lg font-bold uppercase">Total</span>{" "}
                <span className="text-2xl font-semibold">${cabinPrice}</span>
              </p>
            </>
          ) : null}
        </div>

        {range.from || range.to ? (
          <button
            className="border border-primary-800 py-2 px-4 text-sm font-semibold"
            onClick={resetRange}
          >
            Clear
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default DateSelector;
