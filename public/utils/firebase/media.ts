import { httpsCallable } from 'firebase/functions';
import { getAuthToken, getLoggedInUser } from '../auth';
import { generateVideoThumbnail } from '../mediaUtils';
import { functions } from './config';

export async function uploadMedia(
  asset: any,
  userId: string,
  category: string,
  categoryId: string
) {
  const authToken = await getAuthToken();
  try {
    if (!userId) {
      userId = getLoggedInUser().user.id;
    }
    const {url, mediaId} = (await httpsCallable(functions, 'getUploadUrl')({
      authToken, userId, category, categoryId,
      mimeType: asset.mimeType,
    })).data as {url: string, mediaId: string};

    console.log('postUrl', url);

    const response = await fetch(url as string, {
      method: 'PUT',
      body: asset.file,
      headers: {
        "Content-Type": asset.mimeType,
        "x-goog-content-length-range": "0,20000000",
      },
    });

    // Generate thumbnail for videos
    let thumbnailBufferB64: string | undefined;
    if (asset.mimeType?.startsWith('video/')) {
      try {
        thumbnailBufferB64 = await generateVideoThumbnail(asset.file);
      } catch (error) {
        console.warn('Failed to generate video thumbnail:', error);
        // Continue without thumbnail if generation fails
      }
    }

    const processResult = (await httpsCallable(functions, 'processUploadedMedia')({
        authToken, 
        userId, 
        category, 
        categoryId, 
        mediaId,
        thumbnailBufferB64
      })).data;

    return response.status;
  } catch (error) {
    console.error('Error uploading media:', error);
    throw error;
  }
}

export async function getMedia(
  userId: string,
  category: string,
  categoryId: string,
  objectId: string
) {
  const authToken = await getAuthToken();

  return (await httpsCallable(functions, 'getMedia')({
    userId, category, categoryId, objectId, authToken
  }));
}

export async function deleteMedia(
  userId: string,
  category: string,
  categoryId: string,
  objectId: string
) {
  const authToken = await getAuthToken();
  if (!userId) {
    userId = getLoggedInUser().user.id;
  }
  return (await httpsCallable(functions, 'deleteMedia')({
    userId, category, categoryId, objectId, authToken
  }));
}

export async function listMedia(
  category: string,
  categoryId: string
) {
  const authToken = await getAuthToken();

  return (await httpsCallable(functions, 'listMedia')({
    userId: getLoggedInUser().user.id, category, categoryId, authToken
  })).data;
}

export async function getMediaFetchURL(
  userId: string,
  category: string,
  categoryId: string,
  objectId: string,
  isThumbnail: boolean = false
) {
  const authToken = await getAuthToken();

  return (await httpsCallable(functions, 'getMediaFetchUrl')({
    userId,
    category,
    categoryId,
    objectId,
    isThumbnail,
    authToken
  })).data;
} 