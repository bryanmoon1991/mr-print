import { NextResponse } from 'next/server';
import QueueManager from '@/lib/redis/qclient';
import sharp, {Sharp} from 'sharp';
import fetch from 'node-fetch';

export async function POST(
  request: Request,
  { params }: { params: { accountId: string } }
) {
  const { accountId } = params;
  const formData = await request.text();
  const urlParams = new URLSearchParams(formData);
  const webhookData: any = {};
  urlParams.forEach((value, key) => {
    webhookData[key] = value;
  });
  const httpRequest = webhookData?.ConnectionType;

  if (httpRequest === 'GetRequest') {
    console.log('in get request');
    try {
      const queue = await QueueManager.getJobs(accountId);
      if (queue.length > 0) {
        let response = await generateEposXML(queue[0]);
        return new Response(response, {
          headers: {
            'Content-Type': 'text/xml; charset=UTF-8',
          },
          status: 200,
        });
      } else {
        return NextResponse.json(
          {
            message: 'No jobs in queue',
          },
          { status: 201 }
        );
      }
    } catch (error) {
      console.error('Error in get:', error);
      return NextResponse.json({ success: false }, { status: 400 });
    }
  } else if (httpRequest === 'SetResponse') {
    console.log('in set response');
    try {
      const queue = await QueueManager.getJobs(accountId);
      if (queue.length > 0) {
        const justPrinted = queue[0];
        console.log('justPrinted', justPrinted);
        const recordId = justPrinted['id'];
        console.log('recordID', recordId);
        await QueueManager.removeJob(
          accountId,
          justPrinted,
          recordId
        );
        // console.log('redis after delete', deletion);
      }
      return NextResponse.json({
        success: true,
        message: 'Processed print job successfully',
      });
    } catch (error) {
      console.error('Error:', error);
      return NextResponse.json(
        { success: false, message: 'Error processing print job' },
        { status: 500 }
      );
    }
  } else {
    return NextResponse.json(
      { success: false, message: 'Invalid connection type' },
      { status: 400 }
    );
  }
}

async function convertImageToCustomFormat(
  url: string,
  widthScale: number,
  mode = 'gray16'
) {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const image = sharp(buffer).rotate();
  const metadata = await image.metadata();
  let { width, height } = metadata;

  if (width === undefined || height === undefined) {
    throw new Error('Image metadata is missing width or height.');
  }
  //compensate for rotation
  let temp = width;
  width = height;
  height = temp;

  console.log(`Original dimensions: width=${width}, height=${height}`);

  // Step 1: Resize the image if needed
  if (width > widthScale) {
    const scaleFactor = widthScale / width;
    width = widthScale;
    height = Math.round(height * scaleFactor);

    console.log(`Resized dimensions: width=${width}, height=${height}`);

    image.resize(width, height, { fit: 'contain' });
  }

  // Step 2: Process the image based on mode
  let byteArray;
  if (mode === 'mono') {
    byteArray = await convertTo1BitPerPixel(image, width, height);
  } else if (mode === 'gray16') {
    byteArray = await convertTo4BitPerPixel(image, width, height);
  } else {
    throw new Error("Unsupported mode. Use 'mono' or 'gray16'.");
  }

  // Step 3: Convert the byte array to Base64
  const base64Data = Buffer.from(byteArray).toString('base64');

  // Build the custom image tag
  return `<image width="${width}" height="${height}" color="color_1" mode="${mode}">${base64Data}</image>`;
}

// Helper function to convert image to 1-bit per pixel (mono)
async function convertTo1BitPerPixel(image: Sharp, width: number, height: number) {
  const data = await image
    .threshold(128) // Convert to black and white
    .raw()
    .toBuffer();

  const byteArray = [];
  for (let y = 0; y < height; y++) {
    let byte = 0;
    let bitCount = 0;
    for (let x = 0; x < width; x++) {
      const pixelIndex = y * width + x;
      const pixelValue = data[pixelIndex]; // 0 or 255 for monochrome

      // Set bit (1 for black, 0 for white)
      byte = (byte << 1) | (pixelValue === 0 ? 1 : 0);
      bitCount++;

      // Add byte to array every 8 bits
      if (bitCount === 8) {
        byteArray.push(byte);
        byte = 0;
        bitCount = 0;
      }
    }

    // Pad the remaining bits if width is not a multiple of 8
    if (bitCount > 0) {
      byte = byte << (8 - bitCount); // Pad with 0s
      byteArray.push(byte);
    }
  }
  return byteArray;
}

// Helper function to convert image to 4-bit per pixel (gray16)
async function convertTo4BitPerPixel(image: Sharp, width: number, height: number) {
  const data = await image.greyscale().raw().toBuffer();

  const byteArray = [];
  for (let y = 0; y < height; y++) {
    let byte = 0;
    let nibbleCount = 0;
    for (let x = 0; x < width; x++) {
      const pixelIndex = y * width + x;
      const pixelValue = data[pixelIndex];

      // Map pixel intensity to 4-bit grayscale (0-15)
      const grayValue = Math.floor((pixelValue / 255) * 15);

      // Pack two 4-bit values into one byte
      if (nibbleCount === 0) {
        byte = grayValue << 4; // Place in high nibble
        nibbleCount = 1;
      } else {
        byte |= grayValue; // Place in low nibble
        byteArray.push(byte);
        byte = 0;
        nibbleCount = 0;
      }
    }

    // Pad with a nibble if width is not even
    if (nibbleCount === 1) {
      byteArray.push(byte);
    }
  }
  return byteArray;
}

async function generateEposXML(data: any) {
  let xml = `<?xml version="1.0" encoding="utf-8"?>
<PrintRequestInfo>
  <ePOSPrint>
    <Parameter>
      <devid>local_printer</devid>
      <timeout>10000</timeout>
    </Parameter>
    <PrintData>
      <epos-print xmlns="http://www.epson-pos.com/schemas/2011/03/epos-print">
      <text width="2" height="2"/>
      <text>Kiln Request&#10;</text>
      <feed line="1"/>
      <text align="left"/>
      <text font="font_d"/>
      <text width="1" height="1"/>
      <text reverse="false" ul="true" em="false" color="color_1"/>
      <text>Date:</text>
      <text reverse="false" ul="false" em="false" color="color_1"/>
      <text> ${new Date(data.created_at).toLocaleString()}&#10;</text>
      <text reverse="false" ul="true" em="false" color="color_1"/>
      <text>Name:</text>
      <text reverse="false" ul="false" em="false" color="color_1"/>
      <text> ${data.first_name} ${data.last_name}&#10;</text>
      <text reverse="false" ul="true" em="false" color="color_1"/>
      <text>Dimensions:</text>
      <text reverse="false" ul="false" em="false" color="color_1"/>
      <text> ${data.length}in x ${data.width}in x ${data.height}in &#10;</text>
      <text reverse="false" ul="true" em="false" color="color_1"/>
      <text>Quantity:</text>
      <text reverse="false" ul="false" em="false" color="color_1"/>
      <text> ${data.quantity}&#10;</text>
      <text reverse="false" ul="true" em="false" color="color_1"/>
      <text>Cost:</text>
      <text reverse="false" ul="false" em="false" color="color_1"/>
      <text> ${data.cost}&#10;</text>
      <text reverse="false" ul="true" em="false" color="color_1"/>
      ${
        data.photo_url
          ? `<text>Image:&#10;</text>
      <text align="center"/>
      ${await convertImageToCustomFormat(data.photo_url, 500)}
      `
          : `
      <text reverse="false" ul="true" em="false" color="color_1"/>
      <text>Doodle:</text>
      <feed line="20"/>
      `
      }
      `;
  xml += `
        <cut type="feed"/>
      </epos-print>
    </PrintData>
  </ePOSPrint>
</PrintRequestInfo>`;

  return xml;
}
