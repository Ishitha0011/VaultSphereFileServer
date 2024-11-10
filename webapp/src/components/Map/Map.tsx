import ReactDOMServer from "react-dom/server";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { Box } from "grommet-exp";
import { generateLocations } from "./utils";
import MarketClusterGroup from "./MarkerClusterGroup";
import L from "leaflet";

const initialStyle = {
  height: "100%",
};

const icon = L.divIcon({
  // 'grommet-marker' class prevents leaflet default divIcon styles
  className: "grommet-marker",
  html: ReactDOMServer.renderToString(
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
    >
      <path
        fill="none"
        stroke="#000"
        stroke-width="2"
        d="M12,22 C12,22 4,16 4,10 C4,5 8,2 12,2 C16,2 20,5 20,10 C20,16 12,22 12,22 Z M12,13 C13.657,13 15,11.657 15,10 C15,8.343 13.657,7 12,7 C10.343,7 9,8.343 9,10 C9,11.657 10.343,13 12,13 L12,13 Z"
      />
    </svg>
  ),
});

export const Map = () => {
  // for now, hard coded to San Francisco
  const geolocation: L.LatLngTuple = [38.7749, -118.4194];

  return (
    <Box
      background="contrast"
      round="xlarge"
      overflow="hidden"
      height="full"
      width="full"
    >
      <MapContainer
        id="map"
        center={geolocation}
        zoom={4}
        scrollWheelZoom={false}
        style={initialStyle}
      >
        <TileLayer
          attribution={`
       &copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, 
       &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> 
       &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors`}
          url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png"
        />
        <MarketClusterGroup>
          {generateLocations(50, { center: geolocation, radius: 5 }).map(
            (location, index) => (
              <Marker key={index} position={location} icon={icon} />
            )
          )}
        </MarketClusterGroup>
      </MapContainer>
    </Box>
  );
};
