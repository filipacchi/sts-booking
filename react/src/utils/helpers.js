// src/utils/helpers.js

export function truncateString(str, maxLength) {
    if (str.length > maxLength) {
      return str.slice(0, maxLength - 3) + "...";
    } else {
      return str;
    }
  }
  
  export function getFormattedDayString(dateString) {
    // Expected format "YYYY-MM-DD"
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    const dateObject = new Date(year, month - 1, day);
    const weekDayString = dateObject.toLocaleDateString("sv-SE", {
      weekday: "long",
    });
    const monthString = dateObject.toLocaleDateString("sv-SE", {
      month: "long",
    });
    const dayNumber = parseInt(day, 10);
    return (
      weekDayString.charAt(0).toUpperCase() +
      weekDayString.slice(1) +
      " " +
      dayNumber +
      " " +
      monthString.charAt(0).toUpperCase() +
      monthString.slice(1)
    );
  }
  