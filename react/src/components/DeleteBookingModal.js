import { Button, Modal } from "flowbite-react";
import React from "react";
import { FaClock } from "react-icons/fa";

const DeleteBookingModal = ({
  openModal,
  setOpenModal,
  selectedSlot: selectedSlots,
  error,
  makeDeleteRequest,
  deleteRequestLoading,
}) => {
  return (
    <Modal show={openModal} onClose={() => setOpenModal(false)}>
      <Modal.Header className="border-b border-gray-200 bg-gray-50">
        <h3 className="text-xl font-medium text-gray-800">
          {selectedSlots?.length > 1
            ? "Vill du avboka tiderna "
            : "Vill du avboka tiden "}
        </h3>
      </Modal.Header>
      
      <Modal.Body className="space-y-4">
        <div className="flex flex-col gap-3">
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
            <div className="space-y-3">
              {selectedSlots.map((time) => (
                <div
                  key={time.date + time.time}
                  className="flex items-center space-x-3 bg-white p-3 rounded-md border border-gray-100 shadow-sm"
                >
                  <div className="bg-purple-100 p-2 rounded-full">
                    <FaClock
                      size={14}
                      className="text-[#8738b7] flex-shrink-0"
                    />
                  </div>
                  <div className="flex-grow flex justify-between items-center">
                    <p className="text-sm font-medium text-gray-700">{time.date}</p>
                    <p className="text-sm bg-purple-100 text-[#8738b7] px-3 py-1 rounded-full font-medium">{time.time}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md border border-red-200 text-sm mt-3">
                Något gick fel med avbokningen. Vänligen försök igen.
              </div>
            )}
          </div>
        </div>
      </Modal.Body>
      
      <Modal.Footer className="border-t border-gray-200 bg-gray-50 gap-2">
        <Button
          isProcessing={deleteRequestLoading}
          size="md"
          className="bg-[#8738b7] enabled:hover:bg-[#5f2c89] text-white font-medium px-5 py-2.5 transition-colors duration-200"
          onClick={makeDeleteRequest}
        >
          {deleteRequestLoading ? "Avbokar..." : "Ja"}
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

export default DeleteBookingModal;