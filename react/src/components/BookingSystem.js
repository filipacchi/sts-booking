// src/components/MainBooking.js
import MuiAlert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import axios from "axios";
import { Button, TextInput } from "flowbite-react";
import React, { useEffect, useState } from "react";
import { FaInfo } from "react-icons/fa";
import { getFormattedDayString } from "../utils/helpers";
import BookModal from "./BookModal";
import DeleteBookingModal from "./DeleteBookingModal";
import RenderSlots from "./RenderSlots";
import ThesisCard from "./ThesisCard";

const AlertComponent = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const BookingSystem = () => {
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
    if (error === "booking_error") setError(null);
  }, [openModal]);

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
  };

  const switchAuthorIndex = () => {
    setAuthors([authors[1], authors[0]]);
    setReverseAuthor(!reverse_author);
  };

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
    const url = URL + "/wp-json/custom/v1/get-bookings";
    const token = btoa(`${username}:${password}`);
    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Basic ${token}`,
          "Content-Type": "application/json",
        },
      });
      setBookingData(response.data);
    } catch (error) {
      console.error("Error fetching presentation times:", error);
    } finally {
      setLoading(false);
    }
  };

  const makeDeleteRequest = async () => {
    setError(null);
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
      if (triggerloading) setCheckCodeLoading(true);
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
          bookings: selectedIds.map((id) => ({ id })),
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
    if (viaZoom === "1") setViaZoom(false);

    setSelectedIds(booking_ids);
    setSelectedSlots(time_slots);
    setSelectedDate(date);
    setOpenModal(true);
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
            className="text-[#8738b7] border border-[#8738b7] hover:bg-[#8738b7] hover:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center"
          >
            <FaInfo size={16} color="currentColor" className="flex-shrink-0" />
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-4 max-w-[400px]">
        <div className="flex items-center gap-4">
          <TextInput
            type="text"
            placeholder="Exjobbs kod"
            value={checkedCode ? "•••••" : uniqueCode}
            onChange={handleInputChange}
            disabled={checkCodeLoading || checkedCode}
            onFocus={() => setError(null)}
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
          <p className="text-red-500">
            Ogiltig kod. Vänligen försök igen.
          </p>
        )}
        {error === "no_code" && (
          <p className="text-red-500">
            Vänligen kontrollera din exjobbs kod först.
          </p>
        )}
        {checkedCode && (
          <ThesisCard
            authors={authors}
            thesisTitle={thesisTitle}
            alreadyBookedTimes={alreadyBookedTimes}
            setOpenDeleteModal={setOpenDeleteModal}
          />
        )}
        {loading ? (
          <p>Laddar bokningar...</p>
        ) : Object.keys(bookingData).length > 0 ? (
          <div className="flex flex-col gap-4">
            {Object.keys(bookingData).map((date, index) => (
              <div key={date}>
                <RenderSlots
                  date={date}
                  data={bookingData[date]}
                  thesis_id={thesis_id}
                  authors={authors}
                  handleBooking={handleBooking}
                  getFormattedDayString={getFormattedDayString}
                  alreadyBookedTimes={alreadyBookedTimes}
                />
                {/* {index < Object.keys(bookingData).length - 1 && (
                  <div className="w-full h-px bg-gray-300 my-2"></div>
                )} */}
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
        <AlertComponent
          onClose={handleSnackbarClose}
          severity="success"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </AlertComponent>
      </Snackbar>
      <BookModal
        getFormattedDayString={getFormattedDayString}
        selectedDate={selectedDate}
        openModal={openModal}
        setOpenModal={setOpenModal}
        selectedSlot={selectedSlots}
        uniqueCode={uniqueCode}
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
      />
    </div>
  );
};

export default BookingSystem;
