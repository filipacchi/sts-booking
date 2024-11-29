import Snackbar from "@mui/material/Snackbar";
import axios from "axios";
import { Button, Label, Modal, TextInput } from "flowbite-react";
import React, { useEffect, useState } from "react";
import { FaKey, FaUser } from "react-icons/fa";

import MuiAlert from "@mui/material/Alert";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});
let test_data = [
  {
    id: 16854,
    title: "test 2",
    presentation_datetime: "",
    booking_date: "2024-07-28",
    time_slots: [
      {
        time: "08:15",
        author: "Benim",
      },
      {
        time: "09:15",
        author: "",
      },
      {
        time: "10:15",
        author: "",
      },
      {
        time: "11:15",
        author: "",
      },
      {
        time: "",
        author: "",
      },
      {
        time: "",
        author: "",
      },
      {
        time: "",
        author: "",
      },
      {
        time: "",
        author: "",
      },
      {
        time: "",
        author: "",
      },
      {
        time: "",
        author: "",
      },
      {
        time: "",
        author: "",
      },
    ],
    link: "https://stsprogrammet.se/presentation-time/test-2/",
    permission_callback: "__return_true",
  },
  {
    id: 16855,
    title: "test 3",
    presentation_datetime: "",
    booking_date: "2024-08-15",
    time_slots: [
      {
        time: "08:15",
        author: "",
      },
      {
        time: "",
        author: "",
      },
      {
        time: "",
        author: "",
      },
      {
        time: "11:15",
        author: "",
      },
      {
        time: "",
        author: "",
      },
      {
        time: "",
        author: "",
      },
      {
        time: "",
        author: "",
      },
      {
        time: "",
        author: "",
      },
      {
        time: "",
        author: "",
      },
      {
        time: "",
        author: "",
      },
      {
        time: "",
        author: "",
      },
    ],
    link: "https://stsprogrammet.se/presentation-time/test-3/",
    permission_callback: "__return_true",
  },
  {
    id: 16876,
    title: "TEsty",
    presentation_datetime: "",
    booking_date: "2024-08-20",
    time_slots: [
      {
        time: "08:15",
        author: "",
      },
      {
        time: "09:15",
        author: "",
      },
      {
        time: "10:15",
        author: "Anders Andersson",
      },
      {
        time: "11:15",
        author: "",
      },
      {
        time: "12:15",
        author: "Ludvig Bennbom",
      },
      {
        time: "13:15",
        author: "",
      },
      {
        time: "14:15",
        author: "",
      },
      {
        time: "15:15",
        author: "Stefan Person",
      },
      {
        time: "16:15",
        author: "",
      },
      {
        time: "17:15",
        author: "",
      },
      {
        time: "18:15",
        author: "",
      },
    ],
    link: "https://stsprogrammet.se/presentation-time/testy/",
    permission_callback: "__return_true",
  },
  {
    id: 16860,
    title: "sfewr",
    presentation_datetime: "",
    booking_date: "2024-09-12",
    time_slots: [
      {
        time: "08:15",
        author: "",
      },
      {
        time: "09:15",
        author: "",
      },
      {
        time: "10:15",
        author: "",
      },
      {
        time: "11:15",
        author: "",
      },
      {
        time: "",
        author: "",
      },
      {
        time: "",
        author: "",
      },
      {
        time: "",
        author: "",
      },
      {
        time: "",
        author: "",
      },
      {
        time: "",
        author: "",
      },
      {
        time: "",
        author: "",
      },
      {
        time: "",
        author: "",
      },
    ],
    link: "https://stsprogrammet.se/presentation-time/sfewr/",
    permission_callback: "__return_true",
  },
  {
    id: 16859,
    title: "",
    presentation_datetime: "",
    booking_date: "2024-09-26",
    time_slots: [
      {
        time: "08:15",
        author: "",
      },
      {
        time: "09:15",
        author: "",
      },
      {
        time: "10:15",
        author: "",
      },
      {
        time: "11:15",
        author: "",
      },
      {
        time: "",
        author: "",
      },
      {
        time: "",
        author: "",
      },
      {
        time: "",
        author: "",
      },
      {
        time: "",
        author: "",
      },
      {
        time: "",
        author: "",
      },
      {
        time: "",
        author: "",
      },
      {
        time: "",
        author: "",
      },
    ],
    link: "https://stsprogrammet.se/presentation-time/16859/",
    permission_callback: "__return_true",
  },
];

const BookModal = ({
  openModal,
  setOpenModal,
  selectedSlot,
  uniqueCode,
  handleInputChange,
  error,
  makeBookRequest,
  selectedId,
  bookRequestLoading,
}) => {
  return (
    <Modal show={openModal} onClose={() => setOpenModal(false)}>
      <Modal.Header>Boka tid: {selectedSlot}</Modal.Header>
      <Modal.Body>
        <div className="flex max-w-md flex-col gap-4"></div>
      </Modal.Body>
      <Modal.Footer>
        <Button
          isProcessing={bookRequestLoading}
          size={"md"}
          className=" bg-[#8738b7] enabled:hover:bg-[#5f2c89]"
          onClick={() => makeBookRequest(selectedId, selectedSlot, uniqueCode)}
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
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [checkedCode, setCheckedCode] = useState(false);
  const [uniqueCode, setUniqueCode] = useState("");
  const [authors, setAuthors] = useState(["Ludvig Bennbom", "Joel Andersson"]);

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
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
        console.log(response.data);
        setAuthors(response.data["authors"]);
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
          time: time,
          unique_code: code,
        }
      );
      setOpenModal(false);
      setBookRequestLoading(false);
      setError(null);
      setUniqueCode("");
      getPresentationTimes();
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error booking time:", error);
    }
  };

  const handleBooking = (post_id, time) => {
    if (!checkedCode) {
      setError("no_code");
      return;
    }
    setSelectedId(post_id);
    setSelectedSlot(time);
    setOpenModal(true);
  };

  function truncateString(str, maxLength) {
    if (str.length > maxLength) {
      return str.slice(0, maxLength - 3) + "...";
    } else {
      return str;
    }
  }
  const Spacer = () => {
    return <div className="w-full h-px bg-gray-300 my-2"></div>;
  };

  const RenderSlots = ({ data }) => {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex">
          <h2 className="text-gray-800 font-medium">
            {getFormattedDayString(data.booking_date)},
          </h2>
          {data.on_site === 1 ? (
            <p> på plats.</p>
          ) : (
            <div className="flex">
              <p> via</p>
              <p className="text-purple-700 ml-1">Zoom.</p>
            </div>
          )}
        </div>

        {data.time_slots.map((slot, index) => {
          if (!slot.time) {
            return null;
          }

          return (
            <div className="flex items-center">
              <Button
                size="xs"
                className="w-20 bg-[#8738b7] enabled:hover:bg-[#8738b7]"
                key={index}
                disabled={slot.author !== ""}
                outline
                onClick={() => handleBooking(data.id, slot.time)}
              >
                {slot.time}
              </Button>
              {slot.author !== "" && (
                <span className="text-gray-500 ml-2">{slot.author}</span>
              )}
            </div>
          );
        })}
      </div>
    );
  };
  return (
    <div className="p-5 flex flex-col">
      <div className="mb-2 block">
        <Label
          htmlFor="username3"
          value="Skriv in din exjobbsnyckel för att kunna boka"
        />
      </div>
      <div className="flex gap-3">
        <TextInput
          id="unique_code"
          rightIcon={FaKey}
          value={uniqueCode}
          onChange={handleInputChange}
          onFocus={() => setError(null)}
          placeholder="12345"
          required
          color={error === "invalid_code" ? "failure" : "gray"}
        />
        <div>
          <Button
            isProcessing={checkCodeLoading}
            disabled={uniqueCode.length !== 5}
            size={"md"}
            className=" bg-[#8738b7] enabled:hover:bg-[#5f2c89]"
            onClick={() => makeCodeCheck(uniqueCode)}
          >
            {checkCodeLoading ? "Kollar kod..." : "Kolla kod"}
          </Button>
        </div>
      </div>
      {error === "invalid_code" && (
        <p className="text-sm text-red-600 mt-2">
          <span className="font-medium">Oops!</span> Koden verkar inte vara
          korrekt. Försök igen.
        </p>
      )}
      {error === "no_code" && (
        <p className="text-sm text-red-600 mt-2">
          <span className="font-medium">Oops!</span> Du måste ange en kod för
          att kunna boka.
        </p>
      )}

      {checkedCode && (
        <div className="flex flex-col pl-2 ">
          <Spacer />
          <h2 className="text-lg text-gray-800 font-medium">
            Bokningsinformation
          </h2>
          <div className="flex flex-col gap-1">
            <div className="flex gap-2 items-center">
              <FaKey size={14} color="#6b7280" />
              <p className="text-gray-500">•••••</p>
            </div>

            <div className="flex gap-2 items-center">
              <FaUser size={14} color="#6b7280" />
              <p className="text-gray-500">{authors[0]}</p>
            </div>
            {authors[1] && (
              <div className="flex gap-2 items-center">
                <FaUser size={14} color="#6b7280" />
                <p className="text-gray-500">{authors[1]}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <Spacer />
      <div className="flex  flex-col  gap-3">
        {loading && <h2 className="animate-bounce text-lg">Laddar...</h2>}
        {!loading && (
          <>
            {bookingData.length === 0 && (
              <h2 className="text-lg">Inga bokningsbara tider just nu.</h2>
            )}
            {bookingData?.map((data, index) => (
              <React.Fragment key={index}>
                <RenderSlots data={data} />
              </React.Fragment>
            ))}
          </>
        )}
      </div>
      <BookModal
        openModal={openModal}
        setOpenModal={setOpenModal}
        selectedSlot={selectedSlot}
        uniqueCode={uniqueCode}
        handleInputChange={handleInputChange}
        error={error}
        makeBookRequest={makeBookRequest}
        selectedId={selectedId}
        bookRequestLoading={bookRequestLoading}
      />
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="success"
          sx={{ width: "100%" }}
        >
          Bokningen lyckades!
        </Alert>
      </Snackbar>
    </div>
  );
};

export default MainBooking;
