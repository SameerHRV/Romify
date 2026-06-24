import puter from "@heyputer/puter.js";
import {
  createHostingSlug,
  fetchBlobFromUrl,
  getHostedUrl,
  getImageExtension,
  HOSTING_CONFIG_KEY,
  imageUrlToPngBlob,
  isHostedUrl,
} from "./utils";

export const getOrCreateHostingConfig =
  async (): Promise<HostingConfig | null> => {
    const existing = (await puter.kv.get(
      HOSTING_CONFIG_KEY,
    )) as HostingConfig | null;
    if (existing?.subdomain) return { subdomain: existing.subdomain };

    const subdomain = createHostingSlug();

    try {
      const created = await puter.hosting.create(subdomain, ".");

      const record = { subdomain: created.subdomain };

      return record;
    } catch (error) {
      console.warn(`conuld not find subdomain: ${error}`);
      return null;
    }
  };

export const uploadImagesToHosting = async ({
  hosting,
  url,
  projectId,
  label,
}: StoreHostedImageParams): Promise<HostedAsset | null> => {
  if (!hosting || !url) return null;

  if (isHostedUrl(url)) return { url };

  try {
    const resolve =
      label === "rendered"
        ? await imageUrlToPngBlob(url).then((blob) =>
            blob ? { blob, contentType: "image/png" } : null,
          )
        : await fetchBlobFromUrl(url);

    if (!resolve) return null;

    const contentType = resolve.contentType || resolve.blob.type || "";
    const ext = getImageExtension(contentType, url);
    const dir = `projects/${projectId}/`;
    const fullFilePath = `${dir}${label}.${ext}`;

    const uploadFile = new File([resolve.blob], `${label}.${ext}`, {
      type: contentType,
    });

    await puter.fs.mkdir(dir, { createMissingParents: true });
    await puter.fs.write(fullFilePath, uploadFile);

    const hostedUrl = getHostedUrl(
      { subdomain: hosting.subdomain },
      fullFilePath,
    );
    return hostedUrl ? { url: hostedUrl } : null;
  } catch (error) {
    console.warn(`could not upload image to hosting: ${error}`);
    return null;
  }
};
