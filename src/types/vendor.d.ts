declare module "leaflet" {
  const L: any;
  export default L;
}

declare module "topojson-client" {
  export function feature(topology: any, object: any): any;
}
