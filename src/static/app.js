document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");
  
  // Meetup elements
  const meetupsList = document.getElementById("meetups-list");
  const locationFilter = document.getElementById("location-filter");
  const createMeetupForm = document.getElementById("create-meetup-form");
  const meetupMessageDiv = document.getElementById("meetup-message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft =
          details.max_participants - details.participants.length;

        // Create participants HTML with delete icons instead of bullet points
        const participantsHTML =
          details.participants.length > 0
            ? `<div class="participants-section">
              <h5>Participants:</h5>
              <ul class="participants-list">
                ${details.participants
                  .map(
                    (email) =>
                      `<li><span class="participant-email">${email}</span><button class="delete-btn" data-activity="${name}" data-email="${email}">❌</button></li>`
                  )
                  .join("")}
              </ul>
            </div>`
            : `<p><em>No participants yet</em></p>`;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants-container">
            ${participantsHTML}
          </div>
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });

      // Add event listeners to delete buttons
      document.querySelectorAll(".delete-btn").forEach((button) => {
        button.addEventListener("click", handleUnregister);
      });
    } catch (error) {
      activitiesList.innerHTML =
        "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle unregister functionality
  async function handleUnregister(event) {
    const button = event.target;
    const activity = button.getAttribute("data-activity");
    const email = button.getAttribute("data-email");

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(
          activity
        )}/unregister?email=${encodeURIComponent(email)}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";

        // Refresh activities list to show updated participants
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to unregister. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error unregistering:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(
          activity
        )}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();

        // Refresh activities list to show updated participants
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
  fetchMeetups();

  // Function to fetch meetups from API
  async function fetchMeetups(location = null) {
    try {
      const url = location ? `/meetups?location=${encodeURIComponent(location)}` : "/meetups";
      const response = await fetch(url);
      const meetups = await response.json();

      // Clear loading message
      meetupsList.innerHTML = "";

      // Populate location filter
      populateLocationFilter(meetups);

      // Populate meetups list
      if (Object.keys(meetups).length === 0) {
        meetupsList.innerHTML = "<p><em>No meetups found for the selected location.</em></p>";
        return;
      }

      Object.entries(meetups).forEach(([meetupId, details]) => {
        const meetupCard = document.createElement("div");
        meetupCard.className = "meetup-card";

        const spotsLeft = details.max_participants - details.participants.length;
        const categoryBadge = `<span class="category-badge ${details.category}">${details.category}</span>`;

        // Create participants HTML with join/leave buttons
        const participantsHTML =
          details.participants.length > 0
            ? `<div class="participants-section">
              <h5>Participants (${details.participants.length}/${details.max_participants}):</h5>
              <ul class="participants-list">
                ${details.participants
                  .map((email) => {
                    const isOrganizer = email === details.organizer_email;
                    const organizerLabel = isOrganizer ? " (Organizer)" : "";
                    const leaveBtn = !isOrganizer 
                      ? `<button class="leave-btn" data-meetup="${meetupId}" data-email="${email}">Leave</button>`
                      : "";
                    return `<li><span class="participant-email">${email}${organizerLabel}</span>${leaveBtn}</li>`;
                  })
                  .join("")}
              </ul>
            </div>`
            : `<p><em>No participants yet</em></p>`;

        meetupCard.innerHTML = `
          <div class="meetup-header">
            <h4>${details.name}</h4>
            ${categoryBadge}
          </div>
          <p>${details.description}</p>
          <p><strong>Location:</strong> ${details.location}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <p><strong>Organizer:</strong> ${details.organizer_email}</p>
          <div class="participants-container">
            ${participantsHTML}
          </div>
          <div class="meetup-actions">
            <button class="join-meetup-btn" data-meetup="${meetupId}" ${spotsLeft === 0 ? 'disabled' : ''}>
              ${spotsLeft === 0 ? 'Full' : 'Join Meetup'}
            </button>
            <button class="delete-meetup-btn" data-meetup="${meetupId}" data-organizer="${details.organizer_email}">
              Delete Meetup
            </button>
          </div>
        `;

        meetupsList.appendChild(meetupCard);
      });

      // Add event listeners to join buttons
      document.querySelectorAll(".join-meetup-btn").forEach((button) => {
        button.addEventListener("click", handleJoinMeetup);
      });

      // Add event listeners to leave buttons
      document.querySelectorAll(".leave-btn").forEach((button) => {
        button.addEventListener("click", handleLeaveMeetup);
      });

      // Add event listeners to delete buttons
      document.querySelectorAll(".delete-meetup-btn").forEach((button) => {
        button.addEventListener("click", handleDeleteMeetup);
      });

    } catch (error) {
      meetupsList.innerHTML =
        "<p>Failed to load meetups. Please try again later.</p>";
      console.error("Error fetching meetups:", error);
    }
  }

  // Populate location filter dropdown
  function populateLocationFilter(meetups) {
    const locations = new Set();
    Object.values(meetups).forEach(meetup => {
      locations.add(meetup.location);
    });

    // Clear existing options except "All Locations"
    locationFilter.innerHTML = '<option value="">All Locations</option>';
    
    // Add location options
    locations.forEach(location => {
      const option = document.createElement("option");
      option.value = location;
      option.textContent = location;
      locationFilter.appendChild(option);
    });
  }

  // Handle location filter change
  locationFilter.addEventListener("change", (event) => {
    const selectedLocation = event.target.value;
    fetchMeetups(selectedLocation || null);
  });

  // Handle join meetup
  async function handleJoinMeetup(event) {
    const button = event.target;
    const meetupId = button.getAttribute("data-meetup");
    
    // Get email from user input
    const email = prompt("Enter your email to join this meetup:");
    if (!email || !email.includes("@")) {
      showMessage(meetupMessageDiv, "Please enter a valid email address.", "error");
      return;
    }

    try {
      const response = await fetch(
        `/meetups/${encodeURIComponent(meetupId)}/join?email=${encodeURIComponent(email)}`,
        { method: "POST" }
      );

      const result = await response.json();

      if (response.ok) {
        showMessage(meetupMessageDiv, result.message, "success");
        fetchMeetups(locationFilter.value || null);
      } else {
        showMessage(meetupMessageDiv, result.detail || "An error occurred", "error");
      }
    } catch (error) {
      showMessage(meetupMessageDiv, "Failed to join meetup. Please try again.", "error");
      console.error("Error joining meetup:", error);
    }
  }

  // Handle leave meetup
  async function handleLeaveMeetup(event) {
    const button = event.target;
    const meetupId = button.getAttribute("data-meetup");
    const email = button.getAttribute("data-email");

    if (!confirm(`Are you sure you want to leave this meetup?`)) {
      return;
    }

    try {
      const response = await fetch(
        `/meetups/${encodeURIComponent(meetupId)}/leave?email=${encodeURIComponent(email)}`,
        { method: "DELETE" }
      );

      const result = await response.json();

      if (response.ok) {
        showMessage(meetupMessageDiv, result.message, "success");
        fetchMeetups(locationFilter.value || null);
      } else {
        showMessage(meetupMessageDiv, result.detail || "An error occurred", "error");
      }
    } catch (error) {
      showMessage(meetupMessageDiv, "Failed to leave meetup. Please try again.", "error");
      console.error("Error leaving meetup:", error);
    }
  }

  // Handle delete meetup
  async function handleDeleteMeetup(event) {
    const button = event.target;
    const meetupId = button.getAttribute("data-meetup");
    const organizerEmail = button.getAttribute("data-organizer");
    
    // Get email from user input
    const email = prompt("Enter your email to confirm deletion (only organizer can delete):");
    if (!email || !email.includes("@")) {
      showMessage(meetupMessageDiv, "Please enter a valid email address.", "error");
      return;
    }

    if (email !== organizerEmail) {
      showMessage(meetupMessageDiv, "Only the organizer can delete this meetup.", "error");
      return;
    }

    if (!confirm(`Are you sure you want to delete this meetup? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(
        `/meetups/${encodeURIComponent(meetupId)}?email=${encodeURIComponent(email)}`,
        { method: "DELETE" }
      );

      const result = await response.json();

      if (response.ok) {
        showMessage(meetupMessageDiv, result.message, "success");
        fetchMeetups(locationFilter.value || null);
      } else {
        showMessage(meetupMessageDiv, result.detail || "An error occurred", "error");
      }
    } catch (error) {
      showMessage(meetupMessageDiv, "Failed to delete meetup. Please try again.", "error");
      console.error("Error deleting meetup:", error);
    }
  }

  // Handle create meetup form submission
  createMeetupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const meetupData = {
      name: document.getElementById("meetup-name").value,
      description: document.getElementById("meetup-description").value,
      location: document.getElementById("meetup-location").value,
      schedule: document.getElementById("meetup-schedule").value,
      max_participants: parseInt(document.getElementById("meetup-max-participants").value),
      category: document.getElementById("meetup-category").value,
      organizer_email: document.getElementById("meetup-organizer-email").value
    };

    try {
      const response = await fetch("/meetups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(meetupData),
      });

      const result = await response.json();

      if (response.ok) {
        showMessage(meetupMessageDiv, result.message, "success");
        createMeetupForm.reset();
        fetchMeetups(locationFilter.value || null);
      } else {
        showMessage(meetupMessageDiv, result.detail || "An error occurred", "error");
      }
    } catch (error) {
      showMessage(meetupMessageDiv, "Failed to create meetup. Please try again.", "error");
      console.error("Error creating meetup:", error);
    }
  });

  // Helper function to show messages
  function showMessage(messageElement, text, type) {
    messageElement.textContent = text;
    messageElement.className = type;
    messageElement.classList.remove("hidden");

    // Hide message after 5 seconds
    setTimeout(() => {
      messageElement.classList.add("hidden");
    }, 5000);
  }
});
