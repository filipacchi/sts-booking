import { Button, Modal } from "flowbite-react";
import React from "react";
import { HiOutlineSwitchVertical } from "react-icons/hi";
import { truncateString } from "../utils/helpers";

const BookModal = ({
  openModal,
  setOpenModal,
  selectedSlot: selectedSlots,
  uniqueCode,
  error,
  makeBookRequest,
  selectedId,
  bookRequestLoading,
  authors,
  thesisTitle,
  switchAuthorIndex,
  selectedDate,
  getFormattedDayString,
}) => {

    const isMobile = window.innerWidth <= 768;
  return (
    <Modal show={openModal} onClose={() => setOpenModal(false)} className="dark:bg-gray-800">
      <Modal.Header className="border-b border-gray-200 bg-gray-50">
        <h3 className="text-xl font-medium text-gray-800">
          {selectedSlots?.length > 1
            ? "Vill du boka tiderna "
            : "Vill du boka tiden "}
        </h3>
      </Modal.Header>
      
      <Modal.Body className="space-y-4">
        <div className="flex  flex-col gap-3">
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
            <div className="flex flex-col gap-3">
              <div className="flex items-center">
                <span className="font-medium text-gray-700">
                  {getFormattedDayString(selectedDate)}
                </span>
              </div>
              
              <div className="flex items-center">
                <span className="font-medium text-gray-700 w-20">Exjobb:</span>
                <span className="text-gray-600">
                  {truncateString(thesisTitle, isMobile ? 20 : 60)}
                </span>
              </div>
              
              <div className="flex justify-between items-start border-t border-purple-100 pt-3">
                <div className="space-y-2">
                  {selectedSlots?.map((slot, index) => (
                    <div className="flex items-center" key={index}>
                      <span className="font-medium text-gray-700 w-16">{slot}:</span>
                      <span className="text-gray-600 ml-2">
                        {authors[index]}
                      </span>
                    </div>
                  ))}
                </div>
                
                {selectedSlots?.length > 1 && (
                  <button
                    onClick={switchAuthorIndex}
                    type="button"
                    className="text-purple-600 hover:text-purple-800 p-2 bg-purple-50 hover:bg-purple-100 rounded-full flex items-center justify-center transition-all duration-200"
                    aria-label="Switch authors"
                    title="Byt ordning på författare"
                  >
                    <HiOutlineSwitchVertical size={20} />
                  </button>
                )}
              </div>
              
              {error === "booking_error" && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md border border-red-200 text-sm mt-2">
                  Något gick fel med bokningen. Vänligen försök igen.
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal.Body>
      
      <Modal.Footer className="border-t border-gray-200 bg-gray-50 gap-2">
        <Button
          isProcessing={bookRequestLoading}
          size="md"
          className="bg-[#8738b7] enabled:hover:bg-[#5f2c89] text-white font-medium px-5 py-2.5 transition-colors duration-200"
          onClick={() => makeBookRequest(selectedId, selectedSlots, uniqueCode)}
        >
          {bookRequestLoading ? "Bokar..." : "Boka"}
        </Button>
        <Button 
          color="gray" 
          onClick={() => setOpenModal(false)}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium px-5 py-2.5 transition-colors duration-200"
        >
          Avbryt
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default BookModal;