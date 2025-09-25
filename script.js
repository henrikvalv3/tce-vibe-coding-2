let map;
let markers = [];
let infoWindow;
let homeMarker;
let homeLocation;
let directionsService;
let directionsRenderer;
let selectedDestination;

async function initMap() {
    const { Map, InfoWindow } = await google.maps.importLibrary("maps");
    const { Autocomplete } = await google.maps.importLibrary("places");
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
    const { DirectionsService, DirectionsRenderer } = await google.maps.importLibrary("routes");

    map = new Map(document.getElementById("map"), {
        center: { lat: 37.7749, lng: -122.4194 }, // San Francisco coordinates
        zoom: 12,
        mapId: "DEMO_MAP_ID"
    });

    infoWindow = new InfoWindow();
    directionsService = new DirectionsService();
    directionsRenderer = new DirectionsRenderer();
    directionsRenderer.setMap(map);

    const searchInput = document.getElementById("search-input");
    const searchButton = document.getElementById("search-button");
    const homeInput = document.getElementById("home-input");
    const zoomToHomeButton = document.getElementById("zoom-to-home-button");

    const autocomplete = new Autocomplete(homeInput, {
        fields: ["geometry", "name"],
    });

    autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (!place.geometry) {
            window.alert("No details available for input: '" + place.name + "'");
            return;
        }

        if (homeMarker) {
            homeMarker.setMap(null);
        }

        homeLocation = place.geometry.location;

        homeMarker = new AdvancedMarkerElement({
            map,
            position: homeLocation,
            title: "Home",
            content: new google.maps.marker.PinElement({
                background: "#007BFF",
                borderColor: "#0056b3",
                glyphColor: "white",
            }).element,
        });

        map.panTo(homeLocation);
        zoomToHomeButton.disabled = false;

        if (selectedDestination) {
            calculateAndDisplayRoute(homeLocation, selectedDestination);
        }
    });

    zoomToHomeButton.addEventListener("click", () => {
        if (homeLocation) {
            map.panTo(homeLocation);
        }
    });

    searchButton.addEventListener("click", () => {
        const query = searchInput.value;
        if (query) {
            findPlaces(query);
        }
    });
}

async function findPlaces(query) {
    const { Place } = await google.maps.importLibrary("places");
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
    const sidebar = document.getElementById("sidebar");

    // Clear existing markers, sidebar and directions
    markers.forEach(marker => marker.setMap(null));
    markers = [];
    sidebar.innerHTML = "";
    directionsRenderer.setDirections({ routes: [] });
    selectedDestination = null;

    const request = {
        textQuery: query,
        fields: ["displayName", "location", "businessStatus", "rating", "formattedAddress", "photos"],
        locationBias: map.getBounds(),
    };

    //@ts-ignore
    const { places } = await Place.searchByText(request);

    if (places.length) {
        const { LatLngBounds } = await google.maps.importLibrary("core");
        const bounds = new LatLngBounds();

        places.forEach(place => {
            const marker = new AdvancedMarkerElement({
                map,
                position: place.location,
                title: place.displayName,
            });

            marker.addListener('gmp-click', () => {
                infoWindow.setContent(`
                    <div>
                        <h3>${place.displayName}</h3>
                        <p>Rating: ${place.rating || 'N/A'}</p>
                        <p>${place.formattedAddress}</p>
                    </div>
                `);
                infoWindow.open(map, marker);
            });

            markers.push(marker);

            const sidebarItem = document.createElement("div");
            sidebarItem.classList.add("sidebar-item");
            let photoHtml = '';
            if (place.photos && place.photos.length > 0) {
                const photoUrl = place.photos[0].getURI();
                photoHtml = `<img src="${photoUrl}" alt="${place.displayName}">`;
            }
            sidebarItem.innerHTML = `
                ${photoHtml}
                <h3>${place.displayName}</h3>
                <p>Rating: ${place.rating || 'N/A'}</p>
                <p>${place.formattedAddress}</p>
            `;
            sidebarItem.addEventListener("click", () => {
                selectedDestination = place.location;
                if (homeLocation) {
                    calculateAndDisplayRoute(homeLocation, selectedDestination);
                }
                map.panTo(place.location);
                infoWindow.setContent(`
                    <div>
                        <h3>${place.displayName}</h3>
                        <p>Rating: ${place.rating || 'N/A'}</p>
                        <p>${place.formattedAddress}</p>
                    </div>
                `);
                infoWindow.open(map, marker);
            });

            sidebar.appendChild(sidebarItem);

            bounds.extend(place.location);
        });
        map.fitBounds(bounds);
    } else {
        sidebar.innerHTML = "<p>No results found.</p>";
    }
}

function calculateAndDisplayRoute(origin, destination) {
    directionsService.route({
        origin: origin,
        destination: destination,
        travelMode: google.maps.TravelMode.DRIVING
    }, (response, status) => {
        if (status === 'OK') {
            directionsRenderer.setDirections(response);
        } else {
            window.alert('Directions request failed due to ' + status);
        }
    });
}

initMap();