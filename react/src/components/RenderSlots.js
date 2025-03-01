// src/components/RenderSlots.js
import React, { useState } from "react";

const RenderSlots = ({ date, data, thesis_id, authors, handleBooking, getFormattedDayString, alreadyBookedTimes }) => {
  const [hoverIndex, setHoverIndex] = useState(null);

  const handleMouseEnter = (index) => setHoverIndex(index);
  const handleMouseLeave = () => setHoverIndex(null);

  const isConsecutive = (time1, time2) => {
    const timeDiff =
      (new Date(`1970-01-01T${time2}:00Z`) -
        new Date(`1970-01-01T${time1}:00Z`)) /
      3600000;
    return timeDiff === 1;
  };

  return (
    <div className="flex flex-col gap-2 bg-white rounded-xl shadow-md border border-gray-200 p-5">
       <div className="flex items-center">
        <h2 className="text-gray-800 font-semibold">
          {getFormattedDayString(date)}
        </h2>
        <div className="flex ml-1">
          <p className="text-gray-600">, via</p>
          <p className="text-purple-700 font-medium ml-1">Zoom.</p>
        </div>
      </div>
      {data.map((slot, index) => {
        if (!slot.time) return null;

        const usersBooking =
          slot.thesis !== null && slot.thesis === thesis_id;

        const isUserHighlighted =
          hoverIndex !== null &&
          authors.length > 1 &&
          slot.thesis === thesis_id &&
          slot.thesis === data[hoverIndex].thesis &&
          ((index === hoverIndex && isConsecutive(slot.time, data[index + 1]?.time)) ||
           (index === hoverIndex && isConsecutive(data[index - 1]?.time, slot.time)));

        const isHighlighted =
          hoverIndex !== null &&
          authors.length > 1 &&
          slot.thesis_author === "" &&
          slot.thesis === data[hoverIndex].thesis &&
          ((index === hoverIndex && isConsecutive(slot.time, data[index + 1]?.time)) ||
           (index === hoverIndex + 1 && isConsecutive(data[index - 1]?.time, slot.time)));

        let isDisabled =
          slot.thesis_author !== "" ||
          (authors.length > 1 &&
            data[index + 1]?.thesis_author !== "" &&
            data[index - 1]?.thesis_author !== "");

        let secondDisabled =
          alreadyBookedTimes.length > 0 ||
          (authors.length > 1 &&
            (data[index + 1]?.thesis_author !== "" ||
             data[index + 1] === undefined ||
             data[index + 1]?.time === "" ||
             !isConsecutive(slot.time, data[index + 1]?.time)));

        return (
          <div className="flex items-center" key={index}>
            <button
              className={`group relative flex items-stretch justify-center p-0.5 text-center font-medium w-20 rounded-md transition-all duration-300 ease-in-out ${
                isHighlighted ? "bg-[#8738b7] ml-2" : ""
              } ${
                secondDisabled
                  ? "enabled:hover:bg-transparent hover:opacity-50 enabled:hover:text-black"
                  : "enabled:hover:bg-[#8738b7] enabled:hover:text-white enabled:hover:ml-2"
              } border-2 ${
                isUserHighlighted
                  ? "border-red-700 bg-red-700 ml-2 text-white"
                  : "border-[#8738b7]"
              } ${
                usersBooking
                  ? "border-green-500 enabled:hover:border-red-700 enabled:hover:bg-red-700"
                  : "border-[#8738b7]"
              } ${isHighlighted ? "text-white" : "text-black "}  ${
                secondDisabled ? "cursor-not-allowed" : ""
              } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={isDisabled || secondDisabled}
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseLeave={handleMouseLeave}
              onClick={() => handleBooking(data, index, date)}
            >
              {slot.time}
            </button>
            {slot.thesis_author !== "" && (
              <span className={`ml-2 ${usersBooking ? "text-gray-800" : "text-gray-500"}`}>
                {slot.thesis_author}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default RenderSlots;
