import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Platform } from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { uploadMedia } from '@/utils/firebase';
import { getUserProfile } from '@/utils/storage';

export default function MirrorMomentCapture() {
  const cameraRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [hasPermission, setHasPermission] = useState(null);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [cameraAvailable, setCameraAvailable] = useState(false);
  const [stream, setStream] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      if (Platform.OS === 'web') {
        try {
          const mediaStream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
              facingMode: 'user',
              width: { ideal: 1280 },
              height: { ideal: 720 }
            } 
          });
          setStream(mediaStream);
          setHasPermission(true);
          setIsCameraReady(true);
          setCameraAvailable(true);
        } catch (error) {
          console.error('Error accessing web camera:', error);
          setHasPermission(false);
        }
      } else {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === 'granted');
      }
    })();
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      console.log('Component mounted, checking camera availability...');
      CameraView.isAvailableAsync().then(available => {
        setCameraAvailable(available);
      }).catch(error => {
        console.error('Error checking camera availability:', error);
      });
    }
  }, []);

  // Cleanup stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      // Clean up blob URLs for web
      if (Platform.OS === 'web' && capturedPhoto?.uri) {
        URL.revokeObjectURL(capturedPhoto.uri);
      }
    };
  }, [stream, capturedPhoto]);

  // Connect stream to video element on web
  useEffect(() => {
    if (Platform.OS === 'web' && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const takePicture = async () => {
    console.log('Take picture called, camera ready:', isCameraReady, 'ref:', !!cameraRef.current);
    if (Platform.OS === 'web') {
      if (videoRef.current && canvasRef.current) {
        try {
          const video = videoRef.current;
          const canvas = canvasRef.current;
          const context = canvas.getContext('2d');
          
          // Set canvas size to match video
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          // Draw video frame to canvas
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          // Convert to blob
          canvas.toBlob((blob) => {
            const photo = {
              uri: URL.createObjectURL(blob),
              width: canvas.width,
              height: canvas.height,
            };
            console.log('Web photo taken:', photo);
            setCapturedPhoto(photo);
          }, 'image/jpeg', 0.7);
        } catch (error) {
          console.error('Error taking web picture:', error);
          alert('Failed to take picture. Please try again.');
        }
      }
    } else if (cameraRef.current && isCameraReady) {
      try {
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.7, base64: false });
        console.log('Photo taken:', photo);
        setCapturedPhoto(photo);
      } catch (error) {
        console.error('Error taking picture:', error);
        alert('Failed to take picture. Please try again.');
      }
    } else {
      console.log('Camera not ready:', { cameraRef: !!cameraRef.current, isCameraReady });
      alert('Camera is not ready yet. Please wait a moment.');
    }
  };

  const handleRetake = () => {
    setCapturedPhoto(null);
  };

  const handleConfirm = async () => {
    setIsUploading(true);
    try {
      let asset;
      
      if (Platform.OS === 'web') {
        // For web, we need to convert the blob URL to a file
        const response = await fetch(capturedPhoto.uri);
        const blob = await response.blob();
        const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' });
        
        asset = {
          mimeType: 'image/jpeg',
          file: file
        };
      } else {
        // For mobile, the photo already has the correct structure
        asset = {
          mimeType: 'image/jpeg',
          file: {
            uri: capturedPhoto.uri,
            type: 'image/jpeg',
            name: 'selfie.jpg',
          }
        };
      }
      
      // Clean up camera before uploading
      cleanupCamera();
      
      // Upload the photo directly
      const userId = (await getUserProfile()).id;
      await uploadMedia(
        asset,
        userId,
        'mirrormoment',
        '1'
      );
      
      alert('Photo uploaded successfully!');
      
      // Navigate back to the main page
      router.replace('/member/mirrormoment');
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Failed to upload photo. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCameraReady = () => {
    console.log('Camera is ready');
    setIsCameraReady(true);
  };

  const handleMountError = (error) => {
    console.error('Camera mount error:', error);
    alert('Failed to start camera. Please check permissions.');
  };

  const cleanupCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    if (Platform.OS === 'web' && capturedPhoto?.uri) {
      URL.revokeObjectURL(capturedPhoto.uri);
    }
  };

  // Cleanup on component unmount
  useEffect(() => {
    return cleanupCamera;
  }, []);

  console.log('Render state:', { hasPermission, isCameraReady, capturedPhoto: !!capturedPhoto, cameraAvailable });

  return (
    <View style={styles.container}>
      {/* Back button */}
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => {
          cleanupCamera();
          router.back();
        }}
      >
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>
      
      {!capturedPhoto ? (
        hasPermission === true && (Platform.OS === 'web' || cameraAvailable) ? (
          Platform.OS === 'web' ? (
            <View style={styles.cameraContainer}>
              <video
                ref={videoRef}
                style={styles.webCamera}
                autoPlay
                playsInline
                muted
              />
              <canvas
                ref={canvasRef}
                style={styles.hiddenCanvas}
              />
              <View style={styles.captureButtonContainer}>
                <TouchableOpacity 
                  style={styles.captureButton} 
                  onPress={takePicture}
                >
                  <Ionicons name="camera" size={36} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.cameraContainer}>
              <CameraView
                ref={cameraRef}
                style={styles.camera}
                facing="front"
                onCameraReady={handleCameraReady}
                onMountError={handleMountError}
              />
              <View style={styles.captureButtonContainer}>
                <TouchableOpacity 
                  style={[styles.captureButton, !isCameraReady && styles.captureButtonDisabled]} 
                  onPress={takePicture}
                  disabled={!isCameraReady}
                >
                  <Ionicons name="camera" size={36} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          )
        ) : hasPermission === false || !cameraAvailable ? (
          <View style={styles.centered}>
            <Text style={styles.permissionText}>
              {Platform.OS === 'web' ? 'No access to camera. Please allow camera permissions.' : 
               (!cameraAvailable ? 'Camera not available on this device' : 'No access to camera')}
            </Text>
          </View>
        ) : (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#2563FF" />
            <Text style={styles.loadingText}>Initializing camera...</Text>
          </View>
        )
      ) : (
        <View style={styles.previewContainer}>
          <Image source={{ uri: capturedPhoto.uri }} style={styles.previewImage} />
          <View style={styles.previewActions}>
            <TouchableOpacity style={styles.previewButton} onPress={handleRetake}>
              <Ionicons name="refresh" size={24} color="#2563FF" />
              <Text style={styles.previewButtonText}>Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.previewButton, styles.confirmButton]} 
              onPress={handleConfirm}
              disabled={isUploading}
            >
              {isUploading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="checkmark" size={24} color="#fff" />
              )}
              <Text style={styles.previewButtonText}>
                {isUploading ? 'Uploading...' : 'Confirm'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0C16',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1000,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  camera: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  captureButtonContainer: {
    position: 'absolute',
    bottom: 32,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  captureButton: {
    backgroundColor: '#2563FF',
    borderRadius: 32,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButtonDisabled: {
    backgroundColor: '#555',
  },
  previewContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 32,
  },
  previewImage: {
    width: '80%',
    aspectRatio: 4 / 5,
    borderRadius: 24,
    marginBottom: 24,
    backgroundColor: '#23262F',
  },
  previewActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  previewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#23262F',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginHorizontal: 8,
  },
  confirmButton: {
    backgroundColor: '#2563FF',
  },
  previewButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0B0C16',
  },
  permissionText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 16,
  },
  webCamera: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  hiddenCanvas: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0,
    pointerEvents: 'none',
  },
}); 