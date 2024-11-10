export function generateLocations(
  n: number,
  options: { center: L.LatLngTuple; radius: number }
) {
  const { center, radius } = options;
  var locations: L.LatLngTuple[] = [];
  for (var i = 0; i < n; i++) {
    locations.push([
      center[0] - Math.random() * radius,
      center[1] - Math.random() * radius,
    ]);
  }
  return locations;
}
