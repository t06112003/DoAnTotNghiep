export const HEADER = () => {
  let TOKEN = localStorage.getItem("userData") !== "{}"
    ? JSON.parse(localStorage.getItem("userData")).token
    : "";
  return {
    "Content-Type": "application/json",
    "Authorization": "Bearer " + TOKEN,
  };
};

export const HEADERFORM = () => {
  let TOKEN = localStorage.getItem("userData") !== "{}"
    ? JSON.parse(localStorage.getItem("userData")).token
    : "";
  return {
    "Authorization": "Bearer " + TOKEN,
  };
};