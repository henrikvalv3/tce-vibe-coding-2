let map;

async function initMap() {
    const { Map } = await google.maps.importLibrary("maps");

    map = new Map(document.getElementById("map"), {
        center: { lat: 37.7749, lng: -122.4194 }, // San Francisco coordinates
        zoom: 12,
    });
}

initMap();