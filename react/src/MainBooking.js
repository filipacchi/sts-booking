import Snackbar from "@mui/material/Snackbar";
import axios from "axios";
import { Button, Modal, TextInput } from "flowbite-react";
import React, { useEffect, useState } from "react";
import { FaClock, FaInfo } from "react-icons/fa";
import { HiOutlineSwitchVertical } from "react-icons/hi";
import ThesisCard from "./InfoCard";

import MuiAlert from "@mui/material/Alert";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function truncateString(str, maxLength) {
  if (str.length > maxLength) {
    return str.slice(0, maxLength - 3) + "...";
  } else {
    return str;
  }
}

const BookModal = ({
  openModal,
  setOpenModal,
  selectedSlot: selectedSlots,
  uniqueCode,
  handleInputChange,
  error,
  makeBookRequest,
  selectedId,
  bookRequestLoading,
  authors,
  thesisTitle,
  viaZoom,
  switchAuthorIndex,
  selectedDate,
  getFormattedDayString,
}) => {
  return (
    <Modal show={openModal} onClose={() => setOpenModal(false)}>
      <Modal.Header>
        {selectedSlots?.length > 1
          ? "Vill du boka tiderna "
          : "Vill du boka tiden "}
      </Modal.Header>
      <Modal.Body>
        <div className="flex max-w-md flex-col gap-1">
          <div className="flex flex-col gap-2">
            <span className="flex gap-1">
              <p className="font-medium">
                {getFormattedDayString(selectedDate)}
              </p>
            </span>
            <span className="flex gap-1">
              <p className="font-medium">Exjobb:</p>
              <p className="font-normal text-gray-500">
                {truncateString(thesisTitle, 35)}
              </p>
            </span>
            <div className="flex">
              <div className="gap-2 flex flex-col">
                {selectedSlots?.map((slot, index) => (
                  <span className="flex gap-1" key={index}>
                    <p className="flex gap-1 font-medium">{slot + ": "}</p>
                    <p className="font-normal text-gray-500">
                      {authors[index]}
                    </p>
                  </span>
                ))}
                {error === "booking_error" && (
                  <p className="text-red-500">Något gick fel med bokningen.</p>
                )}
              </div>
              {selectedSlots?.length > 1 && (
                <button
                  onClick={() => switchAuthorIndex()}
                  type="button"
                  className="text-black hover:text-[#8738b7] p-2.5 text-center inline-flex items-center me-2 transition-transform duration-300 ease-in-out transform hover:scale-110"
                >
                  <HiOutlineSwitchVertical size={22} />
                </button>
              )}
            </div>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button
          isProcessing={bookRequestLoading}
          size={"md"}
          className=" bg-[#8738b7] enabled:hover:bg-[#5f2c89]"
          onClick={() => makeBookRequest(selectedId, selectedSlots, uniqueCode)}
        >
          {bookRequestLoading ? "Bokar..." : "Boka"}
        </Button>
        <Button color="gray" onClick={() => setOpenModal(false)}>
          Avbryt
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

const DeleteBookingModal = ({
  openModal,
  setOpenModal,
  selectedSlot: selectedSlots,
  error,
  makeDeleteRequest,
  deleteRequestLoading,
  authors,
  thesisTitle,
  viaZoom,
}) => {
  return (
    <Modal show={openModal} onClose={() => setOpenModal(false)}>
      <Modal.Header>
        {selectedSlots?.length > 1
          ? "Vill du avboka tiderna "
          : "Vill du avboka tiden "}
      </Modal.Header>
      <Modal.Body>
        <div className="flex flex-col gap-1">
          <div className="flex flex-col gap-2">
            <div className="space-y-2 mb-3">
              {selectedSlots.map((time) => (
                <div
                  key={time.date + time.time}
                  className="flex items-center space-x-2 bg-gray-50 p-2 rounded-md"
                >
                  <FaClock
                    size={14}
                    color="#0e9f6e"
                    className="flex-shrink-0"
                  />
                  <div className="flex-grow flex justify-between items-center">
                    <p className="text-sm text-gray-600">{time.date}</p>
                    <p className="text-sm text-gray-600">{time.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button
          isProcessing={deleteRequestLoading}
          size={"md"}
          className=" bg-[#8738b7] enabled:hover:bg-[#5f2c89]"
          onClick={() => makeDeleteRequest()}
        >
          {deleteRequestLoading ? "Avbokar..." : "Ja"}
        </Button>
        <Button color="gray" onClick={() => setOpenModal(false)}>
          Avbryt
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

const MainBooking = () => {
  const [bookingData, setBookingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookRequestLoading, setBookRequestLoading] = useState(false);
  const [checkCodeLoading, setCheckCodeLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState(null);
  const [selectedIds, setSelectedIds] = useState(null);
  const [viaZoom, setViaZoom] = useState(true);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [checkedCode, setCheckedCode] = useState(false);
  const [uniqueCode, setUniqueCode] = useState("");
  const [authors, setAuthors] = useState([]);
  const [thesisTitle, setThesisTitle] = useState("");
  const [thesis_id, setThesisId] = useState(null);
  const [alreadyBookedTimes, setAlreadyBookedTimes] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [reverse_author, setReverseAuthor] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [deleteRequestLoading, setDeleteRequestLoading] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("Bokning lyckades!");

  const URLDEV = "http://sts-dev.local";
  const URL = "https://stsprogrammet.se";

  useEffect(() => {
    if (error === "booking_error") {
      setError(null);
    }
  }, [openModal]);

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  const switchAuthorIndex = () => {
    setAuthors([authors[1], authors[0]]);

    setReverseAuthor(!reverse_author);
  };
  // Event handler for input change
  const handleInputChange = (event) => {
    if (event.target.value.length > 5) return;
    setUniqueCode(event.target.value);
  };

  useEffect(() => {
    getPresentationTimes();
  }, []);

  const getPresentationTimes = async () => {
    const username = "webamanuens";
    const password = "";

    // Endpoint
    const url = URL + "/wp-json/custom/v1/get-bookings";

    // Basic Auth token
    const token = btoa(`${username}:${password}`);
    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Basic ${token}`,
          "Content-Type": "application/json",
        },
      });

      // Handle response

      setBookingData(response.data);
      /* setBookingData(test_data); */
    } catch (error) {
      // Handle error
      console.error("Error fetching presentation times:", error);
    } finally {
      // Set loading to false
      setLoading(false);
    }
  };

  const getFormattedDayString = (dateString) => {
    // Expected format "2024-07-27"
    if (!dateString) return;
    const [year, month, day] = dateString.split("-");

    const dateObject = new Date(year, month - 1, day);
    const weekDayString = dateObject.toLocaleDateString("sv-SE", {
      weekday: "long",
    });
    const monthString = dateObject.toLocaleDateString("sv-SE", {
      month: "long",
    });

    // Convert day to a number to remove leading zeros
    const dayNumber = parseInt(day, 10);

    const fullDateString =
      weekDayString.slice(0, 1).toUpperCase() +
      weekDayString.slice(1) +
      " " +
      dayNumber +
      " " +
      monthString.slice(0, 1).toUpperCase() +
      monthString.slice(1);

    return fullDateString;
  };

  const makeDeleteRequest = async () => {
    setError(null);
    /*  {
      "bookings": [
         {
             "id": 197
             
         },
         {
             "id": 198
         }
     ],
     "unique_code": "94946"
 } */ //this is the body format
    console.log({
      unique_code: uniqueCode,
    });
    try {
      setDeleteRequestLoading(true);
      const response = await axios.post(
        URL + "/wp-json/custom/v1/delete-all-bookings",
        {
          unique_code: uniqueCode,
        }
      );
      console.log(response);
      await getPresentationTimes();
      setAlreadyBookedTimes([]);
      setOpenDeleteModal(false);
      setDeleteRequestLoading(false);
      setSnackbarMessage("Avbokning lyckades!");
      setSnackbarOpen(true);
    } catch (error) {
      setError("booking_error");
      setDeleteRequestLoading(false);
      console.error("Error deleting time:", error);
    }
  };

  const makeCodeCheck = async (code, triggerloading = true) => {
    setError(null);
    if (code.length !== 5) {
      setError("invalid_code");
      return;
    }
    try {
      if (triggerloading) {
        setCheckCodeLoading(true);
        console.log("loading");
      }
      const response = await axios.post(URL + "/wp-json/custom/v1/check-code", {
        unique_code: code,
      });
      if (response.status === 200) {
        if (response.data.bookings.length > 0) {
          setAlreadyBookedTimes(response.data.bookings);
        }
        setAuthors(response.data.authors);
        setThesisTitle(response.data.title);
        setThesisId(response.data.thesis_id);
        console.log(response.data.thesis_id);

        setCheckedCode(true);
      }
    } catch (error) {
      setError("invalid_code");
      setUniqueCode("");
    } finally {
      setCheckCodeLoading(false);
    }
  };

  const makeBookRequest = async () => {
    setError(null);

    try {
      setBookRequestLoading(true);
      const response = await axios.post(
        URL + "/wp-json/custom/v1/make-booking",
        {
          date: selectedDate,
          unique_code: uniqueCode,
          reverse_author: reverse_author,
          bookings: selectedIds.map((t, index) => ({ id: selectedIds[index] })),
        }
      );
      console.log(response);
      await getPresentationTimes();
      await makeCodeCheck(uniqueCode, false);
      setOpenModal(false);
      setBookRequestLoading(false);
      setError(null);
      setSnackbarMessage("Bokning lyckades!");
      setSnackbarOpen(true);
    } catch (error) {
      setError("booking_error");
      setBookRequestLoading(false);
      console.error("Error booking time:", error);
    }
  };

  const handleBooking = (data, index, date) => {
    if (!checkedCode) {
      setError("no_code");
      return;
    }

    let viaZoom = data.on_site;
    let time_slots = [data[index].time];
    let booking_ids = [data[index].id];
    if (authors.length > 1) {
      time_slots.push(data[index + 1].time);
      booking_ids.push(data[index + 1].id);
    }
    if (viaZoom === "1") {
      setViaZoom(false);
    }

    setSelectedIds(booking_ids);
    setSelectedSlots(time_slots);
    setSelectedDate(date);
    setOpenModal(true);
  };

  const Spacer = () => {
    return <div className="w-full h-px bg-gray-300 my-2"></div>;
  };

  const RenderSlots = ({ date, data }) => {
    const [hoverIndex, setHoverIndex] = useState(null);

    const handleMouseEnter = (index) => {
      setHoverIndex(index);
    };

    const handleMouseLeave = () => {
      setHoverIndex(null);
    };
    const isConsecutive = (time1, time2) => {
      // Sort times first
      console.log(time1, time2);
      const timeDiff =
        (new Date(`1970-01-01T${time2}:00Z`) -
          new Date(`1970-01-01T${time1}:00Z`)) /
        3600000;
      // take absolute value of time difference
      console.log(timeDiff);
      return timeDiff === 1;
    };

    return (
      <div className="flex flex-col gap-2">
        <div className="flex">
          <h2 className="text-gray-800 font-medium">
            {getFormattedDayString(date)}
          </h2>

          <div className="flex">
            <p>,&nbsp;via</p>
            <p className="text-purple-700 ml-1">Zoom.</p>
          </div>
        </div>

        {data.map((slot, index) => {
          if (!slot.time) {
            return null;
          }

          // Also make usersBooking true if the slot before or after is booked by the user

          const usersBooking =
            slot.thesis !== null && slot.thesis === thesis_id;

          // Make a is highlighted but only if the both slots is booked by the user (== thesis_id)

          const isUserHighlighted =
            hoverIndex !== null &&
            authors.length > 1 &&
            slot.thesis === thesis_id &&
            slot.thesis === data[hoverIndex].thesis &&
            ((index === hoverIndex &&
              isConsecutive(slot.time, data[index + 1]?.time)) ||
              (index === hoverIndex &&
                isConsecutive(data[index - 1]?.time, slot.time)));

          const isHighlighted =
            hoverIndex !== null &&
            authors.length > 1 &&
            slot.thesis_author === "" &&
            slot.thesis === data[hoverIndex].thesis &&
            ((index === hoverIndex &&
              isConsecutive(slot.time, data[index + 1]?.time)) ||
              (index === hoverIndex + 1 &&
                isConsecutive(data[index - 1]?.time, slot.time)));

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
                size="xs"
                className={`group relative flex items-stretch justify-center p-0.5 text-center font-medium w-20 rounded-md transition-all duration-300 ease-in-out ${
                  isHighlighted ? "bg-[#8738b7] ml-2" : null
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
                  secondDisabled ? "cursor-not-allowed" : null
                } ${isDisabled ? "opacity-50 cursor-not-allowed" : null} `}
                disabled={isDisabled || secondDisabled}
                onMouseEnter={() => handleMouseEnter(index)}
                onMouseLeave={handleMouseLeave}
                onClick={() => handleBooking(data, index, date)}
              >
                {slot.time}
              </button>

              {slot.thesis_author !== "" && (
                <span
                  className={`${
                    usersBooking ? "text-gray-800" : "text-gray-500"
                  } ml-2`}
                >
                  {slot.thesis_author}
                </span>
              )}

              {/*   {slot.thesis === thesis_id && slot.thesis != null && (
               <button
               onClick={() => console.log("Avboka clicked")}
               type="button"
               className="text-red-700 hover:text-red-700  text-center inline-flex items-center transition-transform duration-300 ease-in-out transform hover:scale-105"
               >
               Avboka
               </button>)} */}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Boka tid för presentation
        </h1>
        <div className="flex items-center">
          <button
            data-popover-target="popover-default"
            type="button"
            class="text-[#8738b7] border border-[#8738b7] hover:bg-[#8738b7] hover:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:focus:ring-blue-800 dark:hover:bg-blue-500"
          >
            <FaInfo size={16} color="currentColor" className="flex-shrink-0" />
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-4 max-w-[400px] ">
        <div className="flex items-center gap-4 ">
          <TextInput
            type="text"
            placeholder="Exjobbs kod"
            value={checkedCode ? "•••••" : uniqueCode}
            onChange={handleInputChange}
            disabled={checkCodeLoading || checkedCode}
            onFocus={() => {
              setError(null);
            }}
            className="flex-grow"
          />
          <Button
            className="bg-[#8738b7] enabled:hover:bg-[#5f2c89]"
            onClick={() => makeCodeCheck(uniqueCode)}
            disabled={checkCodeLoading || checkedCode}
          >
            {checkCodeLoading ? "Kontrollerar..." : "Kontrollera kod"}
          </Button>
        </div>
        {error === "invalid_code" && (
          <p className="text-red-500">Ogiltig kod. Vänligen försök igen.</p>
        )}
        {error === "no_code" && (
          <p className="text-red-500">
            Vänligen kontrollera din exjobbs kod först.
          </p>
        )}
        {checkedCode && (
          <ThesisCard authors={authors} thesisTitle={thesisTitle} alreadyBookedTimes={alreadyBookedTimes} setOpenDeleteModal={setOpenDeleteModal}/>
        )}
        {loading ? (
          <p>Laddar bokningar...</p>
        ) : Object.keys(bookingData).length > 0 ? (
          <div className="flex flex-col gap-4">
            {Object.keys(bookingData).map((date, index) => (
              <div key={date}>
                <RenderSlots date={date} data={bookingData[date]} />
                {index < bookingData.length - 1 && <Spacer />}
              </div>
            ))}
          </div>
        ) : (
          <p>Det finns inga lediga presentationstider ännu.</p>
        )}
      </div>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="success"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
      <BookModal
        getFormattedDayString={getFormattedDayString}
        selectedDate={selectedDate}
        openModal={openModal}
        setOpenModal={setOpenModal}
        selectedSlot={selectedSlots}
        uniqueCode={uniqueCode}
        handleInputChange={handleInputChange}
        error={error}
        makeBookRequest={makeBookRequest}
        selectedId={selectedIds}
        bookRequestLoading={bookRequestLoading}
        authors={authors}
        thesisTitle={thesisTitle}
        viaZoom={viaZoom}
        switchAuthorIndex={switchAuthorIndex}
      />
      <DeleteBookingModal
        openModal={openDeleteModal}
        setOpenModal={setOpenDeleteModal}
        selectedSlot={alreadyBookedTimes}
        error={error}
        makeDeleteRequest={makeDeleteRequest}
        deleteRequestLoading={deleteRequestLoading}
        authors={authors}
        thesisTitle={thesisTitle}
        viaZoom={viaZoom}
      />
    </div>
  );
};

export default MainBooking;
