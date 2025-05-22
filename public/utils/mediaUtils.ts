export const getMediaThumbnailURL = (userId: string, category: string,categoryId: string, mediaId: string) => {
    return `https://storage.googleapis.com/fit-squad-club.firebasestorage.app/media/${userId}/${category}/${categoryId}/${mediaId}-thumbnail`
}

export const getProfilePicThumbNailURL = (userId: string) => {
    return getMediaThumbnailURL(userId, 'profilepic', '1', '1')
}