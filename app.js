const pgData = [
  {
    name: "7+1 BOYS PG",
    city: "jorhat",
    address: "123 Ring Road",
    rent: 8000,
    available: true,
    amenities: ["WiFi", "AC", "Food"],
    rating: 4.9,
    lat: 28.6139,
    lng: 77.2090,
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
    owner: { name: "Mr. Parikshit", contact: "9876543210" }
  },
  {
    name: "Aidhan",
    city: "jorhat",
    address: "45 Residency Layout",
    rent: 14000,
    available: true,
    amenities: ["WiFi", "Laundry"],
    rating: 4.2,
    lat: 12.9716,
    lng: 77.5946,
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2",
    owner: { name: "Mrs. Iyer", contact: "9000012345" }
  },
  {
    name: "Abhinandan",
    city: "jorhat",
    address: "45 Residency Layout",
    rent: 6500,
    available: false,
    amenities: ["WiFi", "personal bathroom"],
    rating: 3.5,
    lat: 12.9716,
    lng: 77.5946,
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2",
    owner: { name: "Mrs. Iyer", contact: "9000012345" }
  },
  {
    name: "Adisa Girls PG",
    city: "jorhat",
    address: "45 Residency Layout",
    rent: 9500,
    available: false,
    amenities: ["WiFi", "Laundry", "AC", "personal bathroom"],
    rating: 4.2,
    lat: 12.9716,
    lng: 77.5946,
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2",
    owner: { name: "Mrs. Iyer", contact: "9000012345" }
  },
  {
    name: "Shiba PG",
    city: "jorhat",
    address: "45 Residency Layout",
    rent: 5500,
    available: true,
    amenities: ["personal bathroom"],
    rating: 2.5,
    lat: 12.9716,
    lng: 77.5946,
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2",
    owner: { name: "Mrs. Iyer", contact: "9000012345" }
  }
];

let currentFilteredData = [...pgData];
let currentIndex = 0;
const PAGE_SIZE = 3;

function renderPGs(data, append = false) {
  const container = document.getElementById("pgs");
  const loadMoreBtn = document.getElementById("loadMoreBtn");
  if (!append) {
    container.innerHTML = "";
    currentIndex = 0;
  }

  const chunk = data.slice(currentIndex, currentIndex + PAGE_SIZE);
  chunk.forEach(pg => {
    const stars = "★".repeat(Math.floor(pg.rating)) + "☆".repeat(5 - Math.floor(pg.rating));
    const card = document.createElement("div");
    card.className = "pg-card";
    card.innerHTML = `
      <img src="${pg.image}" alt="${pg.name}" />
      <div class="details">
        <h3>${pg.name}</h3>
        <p><strong>Rating:</strong> ${stars} (${pg.rating})</p>
        <p><strong>City:</strong> ${pg.city}</p>
        <p><strong>Rent:</strong> ₹${pg.rent}</p>
        <p><strong>Amenities:</strong> ${pg.amenities.join(", ")}</p>
        <p class="${pg.available ? 'available' : 'not-available'}">${pg.available ? '✅ Available' : '❌ Not Available'}</p>
        <button onclick="showDetails(${pgData.indexOf(pg)})">View Details</button>
      </div>
    `;
    container.appendChild(card);
  });

  currentIndex += PAGE_SIZE;
  loadMoreBtn.style.display = currentIndex < data.length ? "block" : "none";
}

function searchPGs() {
  const city = document.getElementById("searchInput").value.toLowerCase();
  const amenity = document.getElementById("amenityFilter").value;
  const maxRent = parseInt(document.getElementById("rentFilter").value);
  const sort = document.getElementById("sortFilter").value;
  const availableOnly = document.getElementById("availableOnly").checked;

  currentFilteredData = pgData.filter(pg =>
    pg.city.toLowerCase().includes(city) &&
    (!amenity || pg.amenities.includes(amenity)) &&
    (isNaN(maxRent) || pg.rent <= maxRent) &&
    (!availableOnly || pg.available)
  );

  if (sort === "low") currentFilteredData.sort((a, b) => a.rent - b.rent);
  if (sort === "high") currentFilteredData.sort((a, b) => b.rent - a.rent);

  renderPGs(currentFilteredData);
}

function loadMore() {
  renderPGs(currentFilteredData, true);
}

function showDetails(index) {
  const pg = pgData[index];
  const modal = document.getElementById("pgModal");
  const body = document.getElementById("modalBody");
  body.innerHTML = `
    <h2>${pg.name}</h2>
    <img src="${pg.image}" style="width:100%;max-height:200px;object-fit:cover;" />
    <p><strong>City:</strong> ${pg.city}</p>
    <p><strong>Address:</strong> ${pg.address}</p>
    <p><strong>Rent:</strong> ₹${pg.rent}</p>
    <p><strong>Amenities:</strong> ${pg.amenities.join(", ")}</p>
    <p><strong>Rating:</strong> ${pg.rating} ⭐</p>
    <p><strong>Owner:</strong> ${pg.owner.name}</p>
    <p><strong>Contact:</strong> ${pg.owner.contact}</p>
    <form onsubmit="submitBooking(event, '${pg.name}')">
      <h3>Book This PG</h3>
      <input type="text" name="name" placeholder="Your Name" required />
      <input type="email" name="email" placeholder="Email" required />
      <input type="tel" name="phone" placeholder="Phone" required />
      <button type="submit">Submit Booking</button>
    </form>
  `;
  modal.style.display = "block";
}

function closeModal() {
  document.getElementById("pgModal").style.display = "none";
}

function submitBooking(event, pgName) {
  event.preventDefault();
  const form = event.target;
  const booking = {
    pg: pgName,
    name: form.name.value,
    email: form.email.value,
    phone: form.phone.value,
    date: new Date().toLocaleString()
  };
  const allBookings = JSON.parse(localStorage.getItem("bookings") || "[]");
  allBookings.push(booking);
  localStorage.setItem("bookings", JSON.stringify(allBookings));
  alert("Booking submitted successfully for " + pgName);
  closeModal();
}

function openLogin() {
  document.getElementById("loginModal").style.display = "block";
}

function closeLogin() {
  document.getElementById("loginModal").style.display = "none";
}

function submitLogin() {
  const user = document.getElementById("ownerUsername").value;
  const pass = document.getElementById("ownerPassword").value;
  const msg = document.getElementById("loginMsg");
  if (user === "admin" && pass === "admin123") {
    msg.style.color = "green";
    msg.textContent = "Login successful!";
  } else {
    msg.style.color = "red";
    msg.textContent = "Invalid credentials.";
  }
}

function populateCitySuggestions() {
  const cities = [...new Set(pgData.map(pg => pg.city.toLowerCase()))];
  const datalist = document.getElementById("cityList");
  datalist.innerHTML = "";
  cities.forEach(city => {
    const option = document.createElement("option");
    option.value = city;
    datalist.appendChild(option);
  });
}

document.getElementById("darkModeToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
});

populateCitySuggestions();
renderPGs(pgData);
