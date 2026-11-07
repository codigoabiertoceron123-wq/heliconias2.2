// eventos - state
// Refactor modular: lógica original preservada.

// Elementos del DOM
    const calendarGrid = document.getElementById("calendar-grid");

const monthYear = document.getElementById("month-year");

const historyToggle = document.getElementById("history-toggle");

const historySection = document.getElementById("history-section");

const eventsList = document.getElementById("events-list");

const historyTabs = document.querySelectorAll(".history-tab");

const currentDateTime = document.getElementById("current-date-time");

const logoutBtn = document.getElementById("logout-btn");

const floatingHelpBtn = document.getElementById("floating-help-btn");

const helpBtn = document.getElementById("help-btn");

// Variables globales
    const today = new Date();

let currentMonth = today.getMonth();

let currentYear = today.getFullYear();

let selectedDate = null;

let events = {};

let currentTab = "all";

let isEditing = false;

let originalDate = null;

let editingEventId = null;

const monthSelect = document.getElementById("month-select");

const yearSelect = document.getElementById("year-select");
