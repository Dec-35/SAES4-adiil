// Retrieve the ICS file for a specific category

// Close the modal when close button is clicked
const closeButtons = document.querySelectorAll('.close-button');
closeButtons.forEach(function (button) {
  button.addEventListener('click', function () {
    eventModal.style.display = 'none';
  });
});

const eventModal = document.getElementById('eventModal');
const modalTitle = document.getElementById('modalTitle');
const modalDescription = document.getElementById('modalDescription');
const modalStart = document.getElementById('modalStart');
const modalEnd = document.getElementById('modalEnd');

function hexValueFromName(title) {
  function generateSeedFromString(inputString) {
    let seed = 0; //change seed here to get different colors

    // Loop through each character in the input string
    for (let i = 0; i < inputString.length; i++) {
      // Get the character code of the current character
      const charCode = inputString.charCodeAt(i);

      // Update the seed by adding the character code
      seed = (seed * 31 + charCode) % 1000;
    }

    return seed;
  }

  // Ensure that the seed is within a valid range
  seed = generateSeedFromString(title) % 1000;

  // Set a seed value for the random number generator
  Math.seed = seed;

  // Custom random function with a seeded random generator
  Math.seededRandom = function () {
    Math.seed = (Math.seed * 9301 + 49297) % 233280;
    return Math.seed / 233280;
  };

  // Generate a random number and convert it to a hexadecimal string
  const randomValue = Math.floor(Math.seededRandom() * 16777215).toString(16);

  return '#' + randomValue;
}

const renderClassesCalendar = (events) => {
  const calendarEl = document.getElementById('calendar');

  //make calendar with events. It should be in the week view and each event should have the summary as the title, the start and end as the start and end, and the location and description as the extended props
  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'timeGridWeek',

    events: events,
    eventTimeFormat: {
      hour: 'numeric',
      minute: '2-digit',
      meridiem: false,
    },
    //set the today button to french
    buttonText: {
      today: "Aujourd'hui",
    },
    locale: 'fr',
    //24h format
    slotLabelFormat: {
      hour: 'numeric',
      minute: '2-digit',
      meridiem: false,
    },
    //set the first day of the week to monday
    firstDay: 1,
    //set the last day of the week to friday
    weekends: false,
    //start the calendar at 8:00 and end it at 19:00
    slotMinTime: '08:00:00',
    slotMaxTime: '20:00:00',
    nowIndicator: true,

    //add a class to the events
    eventClassNames: 'ClassEvent',

    //remove all day slot
    allDaySlot: false,
    //set the height of the calendar to auto
    height: 'auto',
    //when clicking on an event, open a modal with the event details
    eventClick: function (info) {
      modalTitle.textContent = info.event.title;
      modalDescription.textContent = info.event.extendedProps.description
        .replace('BUT INFO1', '')
        .trim()
        .replace(/\(Exported[^)]*\)/g, '')
        .trim()
        .replace(/Grp\s*\w+/g, '')
        .trim();
      modalStart.textContent = info.event.extendedProps.location;
      modalEnd.textContent =
        'De ' +
        info.event.start.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }) +
        ' à ' +
        info.event.end.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });

      eventModal.style.display = 'flex';
    },
  });

  calendar.setOption('eventContent', (eventInfo) => {
    const description = eventInfo.event.extendedProps.description;
    // remove the BUT INFO from the description
    const displayDescription = description.replace('BUT INFO1', '').trim();
    // remove the (Exported: xx/xx/xxxx xx:xx) from the description
    const displayDescription2 = displayDescription
      .replace(/\(Exported[^)]*\)/g, '')
      .trim();
    // remove the Grp xxx from the description
    const displayDescription3 = displayDescription2
      .replace(/Grp\s*\w+/g, '')
      .trim();

    if (eventInfo.event.extendedProps.location) {
      return (
        eventInfo.event.title +
        '\n' +
        eventInfo.event.extendedProps.location +
        '\n' +
        displayDescription3
      );
    } else {
      return eventInfo.event.title;
    }
  });

  calendarEl.style.width = '98%';

  calendar.render();
};

function renderTheCal(data) {
  const eventObjects = data;

  // Iterate over the event objects and extract necessary details
  const events = eventObjects.map((eventObject) => {
    return {
      title: eventObject.title,
      start: new Date(eventObject.start),
      end: new Date(eventObject.end),
      location: eventObject.location,
      description: eventObject.description,
      color: hexValueFromName(eventObject.title.toString().slice(0, 5)),
      // Add more properties as needed
    };
  });
  console.log(events);
  renderClassesCalendar(events);
}
