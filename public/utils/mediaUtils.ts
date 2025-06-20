export const getMediaThumbnailURL = (userId: string, category: string,categoryId: string, mediaId: string) => {
    return `https://storage.googleapis.com/fit-squad-club.firebasestorage.app/media/${userId}/${category}/${categoryId}/${mediaId}-thumbnail`
}

export const getProfilePicThumbNailURL = (userId: string) => {
    return getMediaThumbnailURL(userId, 'profilepic', '1', '1')
}

export const generateVideoThumbnail = async (videoFile: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.muted = true;
    video.crossOrigin = 'anonymous';
    
    video.onloadedmetadata = () => {
      // Seek to 1 second or 25% of the video duration, whichever is smaller
      const seekTime = Math.min(1, video.duration * 0.25);
      video.currentTime = seekTime;
    };
    
    video.onseeked = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 150;
        canvas.height = 150;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        // Calculate aspect ratio to maintain video proportions
        const videoAspectRatio = video.videoWidth / video.videoHeight;
        const canvasAspectRatio = canvas.width / canvas.height;
        
        let drawWidth = canvas.width;
        let drawHeight = canvas.height;
        let offsetX = 0;
        let offsetY = 0;
        
        if (videoAspectRatio > canvasAspectRatio) {
          // Video is wider than canvas
          drawHeight = canvas.width / videoAspectRatio;
          offsetY = (canvas.height - drawHeight) / 2;
        } else {
          // Video is taller than canvas
          drawWidth = canvas.height * videoAspectRatio;
          offsetX = (canvas.width - drawWidth) / 2;
        }
        
        ctx.drawImage(video, offsetX, offsetY, drawWidth, drawHeight);
        
        // Convert to base64 JPEG
        const thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        const base64Data = thumbnailDataUrl.split(',')[1]; // Remove data:image/jpeg;base64, prefix
        
        resolve(base64Data);
      } catch (error) {
        reject(error);
      }
    };
    
    video.onerror = () => {
      reject(new Error('Failed to load video for thumbnail generation'));
    };
    
    // Create object URL from file
    const videoUrl = URL.createObjectURL(videoFile);
    video.src = videoUrl;
    
    // Clean up object URL after thumbnail is generated
    video.onended = () => {
      URL.revokeObjectURL(videoUrl);
    };
  });
};