import { Attachment } from "nodemailer/lib/mailer";
import Pageres from "pageres";
import { Coordinates, SmsReady } from "../types";

type Resolution = "1024x768" | "640x360" | "1366x768" | "1920x1080";

export class SmsAttachments {
  private readonly pageres = new Pageres({ delay: 5 });
  private attachments: Attachment[] = [];

  async preload(data?: SmsReady) {
    try {
      const [
        googleMapScreenshot,
        arcgisMapScreenshot
      ] = await this.setGoogleMap(data?.location.coordinates as Coordinates)
        .setArcgisMap()
        .takeScreenshots();
      this.attachments = [
        {
          filename: "google.png",
          content: googleMapScreenshot
        },
        {
          filename: "arcgis.png",
          content: arcgisMapScreenshot
        }
      ];
    } catch (error) {
      console.error("Failed to preload attachments. REASON:", error);
    }
    return this.attachments;
  }

  setGoogleMap(
    { latitude, longitude }: Coordinates,
    zoom = "7",
    url = `https://www.google.com/maps/d/viewer?mid=1a04iBi41DznkMaQRnICO40ktROfnMfMx&ll=${latitude}%2C${longitude}&z=${zoom}`,
    resolution: Resolution = "1920x1080"
  ) {
    this.pageres.src(url, [resolution]);
    return this;
  }

  setArcgisMap(
    url = "https://www.arcgis.com/apps/opsdashboard/index.html#/bda7594740fd40299423467b48e9ecf6",
    resolution: Resolution = "1920x1080"
  ) {
    this.pageres.src(url, [resolution]);
    return this;
  }

  async takeScreenshots() {
    return await this.pageres.run();
  }
}
