import {
  createElementObject,
  createPathComponent,
  extendContext,
} from "@react-leaflet/core";
import L from "leaflet";
import "leaflet.markercluster";

const createMarkerClusterGroup = (
  props: L.MarkerClusterGroupOptions,
  context: any
) => {
  const markerClusterGroup = new L.MarkerClusterGroup(props);
  return createElementObject(
    markerClusterGroup,
    extendContext(context, { layerContainer: markerClusterGroup })
  );
};

// TO DO: this function wasn't working but doesn't seem needed at the moment
// copied over from grommet-leaflet example
const updateMarkerClusterGroup = (
  instance: any,
  props: any,
  prevProps: any
) => {
  // if (props.children !== prevProps.children) {
  //   instance.clearLayers();
  //   instance.addLayers(props.children);
  // }
};

export interface CustomMarkerGroupProps extends L.MarkerClusterGroupOptions {
  children?: React.ReactNode;
}

const MarkerClusterGroup = createPathComponent<
  L.MarkerClusterGroup,
  CustomMarkerGroupProps
>(createMarkerClusterGroup, updateMarkerClusterGroup);

export default MarkerClusterGroup;
