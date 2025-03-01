import React from 'react';
import { FaClock, FaUser } from 'react-icons/fa';
import { IoIosDocument } from 'react-icons/io';
import { MdCancel } from 'react-icons/md';

const ThesisCard = ({ 
  thesisTitle, 
  authors, 
  alreadyBookedTimes, 
  setOpenDeleteModal 
}) => {
  // Helper function to truncate strings
  const truncateString = (str, num) => {
    if (str.length <= num) return str;
    return str.slice(0, num) + '...';
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 max-w-md w-full transition-all duration-300 hover:shadow-lg">
      <div className="p-5 flex flex-col space-y-4">
        {/* Thesis Title */}
        <div className="flex items-center space-x-3 pb-3 border-b border-gray-100">
          <div className="bg-emerald-100 p-2 rounded-lg">
            <IoIosDocument
              size={18}
              className="text-emerald-600"
            />
          </div>
          <h3 className="text-gray-800 font-medium text-lg tracking-tight line-clamp-1">
            {truncateString(thesisTitle, 40)}
          </h3>
        </div>

        {/* Authors */}
        <div className="space-y-2">
          {authors.slice(0, 2).map((author, index) => (
            <div
              key={index}
              className="flex items-center space-x-3 text-gray-700"
            >
              <div className="bg-gray-100 p-1.5 rounded-full">
                <FaUser
                  size={14}
                  className="text-emerald-600"
                />
              </div>
              <p className="text-sm font-medium truncate">{author}</p>
            </div>
          ))}
          {authors.length > 2 && (
            <p className="text-xs text-gray-500 ml-8">
              +{authors.length - 2} more authors
            </p>
          )}
        </div>

        {/* Booked Times */}
        {alreadyBookedTimes.length > 0 && (
          <div className="pt-4 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <span className="bg-emerald-100 p-1 rounded-md mr-2">
                <FaClock size={12} className="text-emerald-600" />
              </span>
              Bokade tider
            </h3>

            <div className="space-y-2 mb-4">
              {alreadyBookedTimes.map((time) => (
                <div
                  key={time.date + time.time}
                  className="flex items-center justify-between bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <p className="text-sm font-medium text-gray-700">{time.date}</p>
                  </div>
                  <p className="text-sm font-mono text-emerald-600 bg-emerald-50 px-2 py-1 rounded">{time.time}</p>
                </div>
              ))}
            </div>

            {/* Cancel All Times Button */}
            <button
              onClick={() => setOpenDeleteModal(true)}
              type="button"
              className="
                w-full 
                flex justify-center items-center 
                text-red-600
                bg-white
                hover:bg-red-50 
                border border-red-200 
                rounded-lg
                py-2.5
                px-4 
                text-sm 
                font-medium 
                transition-all 
                duration-300 
                ease-in-out 
                hover:border-red-300 
                focus:outline-none
                focus:ring-2
                focus:ring-red-200
                active:bg-red-100
              "
            >
              <MdCancel
                size={18}
                className="mr-2 text-red-500 group-hover:scale-110 transition-transform"
              />
              Avboka alla tider
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ThesisCard;