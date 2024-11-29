import Snackbar from "@mui/material/Snackbar";
import axios from "axios";
import { Button, Modal, TextInput } from "flowbite-react";
import React, { useEffect, useState } from "react";
import { FaUser } from "react-icons/fa";
import { HiOutlineSwitchVertical } from "react-icons/hi";
import { IoIosDocument } from "react-icons/io";



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
            <div className="flex">
              <p className="font-medium">{viaZoom ? "Via " : "På "}</p>
              <p className="text-purple-700 ml-1 font-medium">
                {viaZoom ? "Zoom" : "plats "}
              </p>
            </div>
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
                    <p className="font-normal text-gray-500">{authors[index]}</p>
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

const MainBooking = () => {
  const [bookingData, setBookingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookRequestLoading, setBookRequestLoading] = useState(false);
  const [checkCodeLoading, setCheckCodeLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [viaZoom, setViaZoom] = useState(true);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [checkedCode, setCheckedCode] = useState(false);
  const [uniqueCode, setUniqueCode] = useState("");
  const [authors, setAuthors] = useState([]);
  const [thesisTitle, setThesisTitle] = useState("");
  const [booking_id, setBookingId] = useState(null);
  const [alreadyBookedTimes, setAlreadyBookedTimes] = useState([]);

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
    const url = "https://stsprogrammet.se/wp-json/custom/v1/presentation-times";

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
    //Expected format "2024-07-27"

    const [year, month, day] = dateString.split("-");

    const dateObject = new Date(year, month - 1, day);
    const weekDayString = dateObject.toLocaleDateString("sv-SE", {
      weekday: "long",
    });
    const monthString = dateObject.toLocaleDateString("sv-SE", {
      month: "long",
    });

    const fullDateString =
      weekDayString.slice(0, 1).toUpperCase() +
      weekDayString.slice(1) +
      " " +
      day +
      " " +
      monthString.slice(0, 1).toUpperCase() +
      monthString.slice(1);

    return fullDateString;
  };

  const makeCodeCheck = async (code) => {
    if (code.length !== 5) {
      setError("invalid_code");
      return;
    }
    try {
      setCheckCodeLoading(true);

      const response = await axios.post(
        "https://stsprogrammet.se/wp-json/custom/v1/check-code",
        {
          unique_code: code,
        }
      );
      if (response.status === 200) {
        setAuthors(response.data.authors);
        setThesisTitle(response.data.title);
        setBookingId(response.data.presentation_post_id);
        setAlreadyBookedTimes(response.data.booked_times);

        setCheckedCode(true);
      }
    } catch (error) {
      setError("invalid_code");
      setUniqueCode("");
    } finally {
      setCheckCodeLoading(false);
    }
  };

  const makeBookRequest = async (post_id, time, code) => {
    setError(null);

    if (code.length !== 5) {
      setError("invalid_code");
      return;
    }
    if (time === null) {
      console.error("Invalid time");
      return;
    }
    if (post_id === null) {
      console.error("Invalid post_id");
      return;
    }

    try {
      setBookRequestLoading(true);
      const response = await axios.post(
        "https://stsprogrammet.se/wp-json/custom/v1/book-time",
        {
          post_id: post_id,
          time1: time[0],
          time2: time[1] ? time[1] : null,
          unique_code: code,
        }
      );
      await getPresentationTimes();
      setOpenModal(false);
      setBookRequestLoading(false);
      setError(null);
      setSnackbarOpen(true);
    } catch (error) {
      setError("booking_error");
      setBookRequestLoading(false);
      console.error("Error booking time:", error);
    }
  };

  const handleBooking = (data, index) => {
    if (!checkedCode) {
      setError("no_code");
      return;
    }
    let post_id = data.id;
    console.log("Post ID:", post_id);
    let viaZoom = data.on_site;
    let time_slots = [data.time_slots[index].time];
    if (authors.length > 1) {
      time_slots.push(data.time_slots[index + 1].time);
    }
    if (viaZoom === "1") {
      setViaZoom(false);
    }

    console.log("Booking:", post_id, time_slots);
    setSelectedId(post_id);
    setSelectedSlots(time_slots);
    setOpenModal(true);
  };

  const Spacer = () => {
    return <div className="w-full h-px bg-gray-300 my-2"></div>;
  };

  const RenderSlots = ({ data }) => {
    const [hoverIndex, setHoverIndex] = useState(null);

    const handleMouseEnter = (index) => {
      setHoverIndex(index);
    };

    const handleMouseLeave = () => {
      setHoverIndex(null);
    };

    return (
      <div className="flex flex-col gap-2">
        <div className="flex">
          <h2 className="text-gray-800 font-medium">
            {getFormattedDayString(data.booking_date)}
          </h2>
          
          
          {data.on_site === "1" ? (
            <p>.&nbsp;På plats, se lokal ovan.</p>
          ) : (
            <div className="flex">
              <p>,&nbsp;via</p>
              <p className="text-purple-700 ml-1">Zoom.</p>
            </div>
          )}
        </div>

        {data.time_slots.map((slot, index) => {
          if (!slot.time) {
            return null;
          }

          const isHighlighted =
            hoverIndex !== null &&
            authors.length > 1 &&
            slot.author === "" &&
            (index === hoverIndex || index === hoverIndex + 1);

          const isDisabled =
            slot.author !== "" ||
            (authors.length > 1 &&
              data.time_slots[index + 1]?.author !== "" &&
              data.time_slots[index - 1]?.author !== "");

          const secondDisabled =
            authors.length > 1 &&
            (data.time_slots[index + 1]?.author !== "" ||
              data.time_slots[index + 1] === undefined ||
              data.time_slots[index + 1]?.time === "");

          return (
            <div className="flex items-center" key={index}>
              <button
                size="xs"
                className={`group relative flex items-stretch justify-center p-0.5 text-center font-medium w-20 rounded-md transition-all duration-300 ease-in-out ${
                  isHighlighted ? "bg-[#8738b7] ml-2"  : "bg-transparent"
                } ${
                  secondDisabled
                    ? "enabled:hover:bg-transparent hover:opacity-50 enabled:hover:text-black"
                    : "enabled:hover:bg-[#8738b7] enabled:hover:text-white enabled:hover:ml-2"
                } border-[#8738b7] border-2 ${
                  isHighlighted ? "text-white" : "text-black "
                }  ${secondDisabled ? "cursor-not-allowed" : null} ${
                  isDisabled ? "opacity-50 cursor-not-allowed" : null
                } `}
                disabled={isDisabled || secondDisabled}
                onMouseEnter={() => handleMouseEnter(index)}
                onMouseLeave={handleMouseLeave}
                onClick={() => handleBooking(data, index)}
              >
                {slot.time}
              </button>

              {slot.author !== "" && (
                <span className="text-gray-500 ml-2">{slot.author}</span>
              )}
              
              {data.id === booking_id && alreadyBookedTimes["tid_"+slot.time.slice(0,2)] && (
                <span className="text-red-500 ml-2">Avboka</span>)}
              
              
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Bokningar</h1>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <TextInput
            type="text"
            placeholder="Exjobbs kod"
            value={checkedCode ? "•••••" : uniqueCode}
            onChange={handleInputChange}
            disabled={checkCodeLoading || checkedCode}
            onFocus={() => {
              setError(null);
            }}
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
          <div className="flex flex-col pl-2 ">
            <div className="flex flex-col gap-1">
              <div className="flex gap-2 items-center">
                <IoIosDocument size={14} color="#0e9f6e" />
                <p className="text-green-500">
                  {truncateString(thesisTitle, 35)}
                </p>
              </div>
              <div className="flex gap-2 items-center">
                <FaUser size={14} color="#0e9f6e" />
                <p className="text-green-500">{authors[0]}</p>
              </div>
              {authors[1] && (
                <div className="flex gap-2 items-center">
                  <FaUser size={14} color="#0e9f6e" />
                  <p className="text-green-500">{authors[1]}</p>
                </div>
              )}
            </div>
            {/* <p className="text-green-500">Kod godkänd. Vänligen välj en tid.</p> */}
            <Spacer />
          </div>
        )}
        {loading ? (
          <p>Laddar bokningar...</p>
        ) : bookingData.length > 0 ? (
          <div className="flex flex-col gap-4">
            {bookingData.map((item, index) => (
              <div key={index}>
                <RenderSlots data={item} />
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
          Bokning lyckades!
        </Alert>
      </Snackbar>
      <BookModal
        openModal={openModal}
        setOpenModal={setOpenModal}
        selectedSlot={selectedSlots}
        uniqueCode={uniqueCode}
        handleInputChange={handleInputChange}
        error={error}
        makeBookRequest={makeBookRequest}
        selectedId={selectedId}
        bookRequestLoading={bookRequestLoading}
        authors={authors}
        thesisTitle={thesisTitle}
        viaZoom={viaZoom}
        switchAuthorIndex={switchAuthorIndex}
      />
    </div>
  );
};

export default MainBooking;
