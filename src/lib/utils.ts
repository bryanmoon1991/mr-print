import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// export function generateEposXML(data: any) {
//   let xml = `<?xml version="1.0" encoding="utf-8"?>
// <PrintRequestInfo>
//   <ePOSPrint>
//     <Parameter>
//       <devid>local_printer</devid>
//       <timeout>10000</timeout>
//     </Parameter>
//     <PrintData>
//       <epos-print xmlns="http://www.epson-pos.com/schemas/2011/03/epos-print">
//         <text lang="en"/>
//         <text smooth="true"/>
//         <text align="center"/>
//         <text font="font_b"/>
//         <text width="2" height="2"/>
//         <text reverse="false" ul="false" em="true" color="color_1"/>
//         <text>Kiln Request&#10;</text>
//         <feed unit="12"/>
//         <text align="left"/>
//         <text font="font_a"/>
//         <text width="1" height="1"/>
//         <text>First Name: ${data.first_name}&#10;</text>
//         <text>Last Name: ${data.last_name}&#10;</text>
//         <text>Length: ${data.length}&#10;</text>
//         <text>Width: ${data.width}&#10;</text>
//         <text>Height: ${data.height}&#10;</text>
//         <text>Quantity: ${data.quantity}&#10;</text>
//         <text>Cost: ${data.cost}&#10;</text>
//         <text>Firing Type: ${data.firing_type}&#10;</text>`;

//   // Conditionally add non-null values
//   if (data.email) {
//     xml += `<text>Email: ${data.email}&#10;</text>`;
//   }

//   if (data.non_member) {
//     xml += `<text>Non-member: ${data.non_member}&#10;</text>`;
//   }

//   if (data.photo_url) {
//     xml += `<image width="400" height="400" color="color_1" mode="mono">${data.photo_url}</image>`;
//   }

//   // Closing tags
//   xml += `
//         <feed unit="12"/>
//         <cut type="feed"/>
//       </epos-print>
//     </PrintData>
//   </ePOSPrint>
// </PrintRequestInfo>`;

//   return xml;
// }

