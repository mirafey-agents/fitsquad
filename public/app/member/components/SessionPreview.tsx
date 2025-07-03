import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Image, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { deleteSessionUser } from '@/utils/firebase';
import { getProfilePicThumbNailURL } from '@/utils/mediaUtils';

interface SessionPreviewProps {
  selectedWorkout: any;
  handleVote: (type: 'mvp' | 'toughest', sessionId: string, id: string, name: string) => void;
  refreshSessions: () => void;
}

const dateFormatOption = {
  weekday: 'short' as const,
  month: 'short' as const,
  day: '2-digit' as const,
  hour: '2-digit' as const,
  minute: '2-digit' as const,
  hour12: true
};

function getInitials(name: string) {
  if (!name) return '';
  const parts = name.split(' ');
  return parts[0][0] + (parts[1]?.[0] || '');
}

export default function SessionPreview({ selectedWorkout, handleVote, refreshSessions }: SessionPreviewProps) {
  const [showTrash, setShowTrash] = useState(false);
  const jiggleAnimation = new Animated.Value(0);
  const [
    moduleType,
    moduleIcon,
    goal,
    level
] = selectedWorkout.session_trainers_id ? 
    ['Barbell', 'barbell', 'Strength', 'Intermediate'] :
    ['Activity', 'heart', 'Cardio', selectedWorkout.exercises[0].level || 'Intermediate'];
  
  const handleDeleteSession = async () => {
    try {
      await deleteSessionUser(selectedWorkout.id);
      refreshSessions(); // Refresh sessions after deletion
      setShowTrash(false); // Hide trash can after deletion
    } catch (error) {
      console.error('Error deleting session:', error);
      alert('Failed to delete session');
    }
  };

  // Jiggle animation when showTrash is toggled
  useEffect(() => {
    if (showTrash) {
      Animated.sequence([
        Animated.timing(jiggleAnimation, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(jiggleAnimation, {
          toValue: -1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(jiggleAnimation, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showTrash]);

  return (
    <>
      <View style={styles.cardContainer}>
        <Animated.View
          style={[
            styles.workoutReviewCard,
            {
              transform: [{
                rotate: jiggleAnimation.interpolate({
                  inputRange: [-1, 0, 1],
                  outputRange: ['-2deg', '0deg', '2deg'],
                })
              }]
            }
          ]}
        >
          <Pressable
            style={styles.cardPressable}
            onLongPress={() => !selectedWorkout.session_trainers_id && setShowTrash(true)}
            onPress={() => showTrash && setShowTrash(false)}
          >
        <View style={styles.workoutCardContent}>
          {/* Header row with title and chevron */}
          <View style={styles.workoutHeaderRow}>
            <View style={{ flex: 1 }}>
              <View style={styles.workoutTitleRow}>
                <Text style={styles.workoutName}>{selectedWorkout?.session?.title || selectedWorkout.exercises[0].name}</Text>
                {selectedWorkout?.status === 'completed' && (
                  <View style={styles.completedBadgeRowInline}>
                    <Text style={styles.completedBadgeText}>Completed</Text>
                  </View>
                )}
              </View>
              <Text style={styles.workoutTime}>
                {new Date(selectedWorkout.start_time).toLocaleString('en-US', dateFormatOption)}
                {selectedWorkout?.session?.trainer && ( 
                  <Text style={styles.workoutTrainer}>  with {selectedWorkout?.session.trainer.display_name}</Text>
                )}
              </Text>
            </View>
            {selectedWorkout.session_trainers_id && (
              <Pressable
                onPress={() => router.push(`/member/insights/${selectedWorkout.id}`)}
                style={styles.chevronButton}
              >
                <Ionicons name="chevron-forward" size={24} color="#9BA9BD" />
              </Pressable>
            )}
          </View>

          {/* Summary Section */}
          <Text style={styles.sectionTitle}>Summary</Text>
          <View style={styles.workoutSummaryGrid}>
            <View style={styles.workoutSummaryGridRow}>
              <View style={styles.summaryPillRow}>
                <View style={[styles.summaryPillIcon, styles.summaryPillModule]}>
                  <Ionicons name={moduleIcon as any} size={16} color="#60D394" />
                </View>
                <Text style={styles.summaryPillLabel}>{moduleType}</Text>
              </View>
              <View style={styles.summaryPillRow}>
                <View style={[styles.summaryPillIcon, styles.summaryPillLevel]}>
                  <Text style={styles.summaryPillLevelNumber}>{level == 'Beginner' ? 1 : level == 'Intermediate' ? 2 : 3}</Text>
                </View>
                <Text style={styles.summaryPillLabel}>{level}</Text>
              </View>
            </View>
            <View style={styles.workoutSummaryGridRow}>
              <View style={styles.summaryPillRow}>
                <View style={[styles.summaryPillIcon, styles.summaryPillType]}>
                  <Ionicons name="flash" size={16} color="#A259FF" />
                </View>
                <Text style={styles.summaryPillLabel}>{goal}</Text>
              </View>
              <View style={styles.summaryPillRow}>
                <View style={[styles.summaryPillIcon, styles.summaryPillEnergy]}>
                  <Ionicons name="flame" size={16} color="#FF7A59" />
                </View>
                <Text style={styles.summaryPillLabel}>{selectedWorkout?.total_energy_points || 0} Points</Text>
              </View>
            </View>
          </View>

          {/* MVP Section: Only show if more than one participant */}
          {selectedWorkout.participants && selectedWorkout.participants.length > 1 && (
            <>
              <Text style={styles.sectionTitle}>MVP</Text>
              <View style={styles.mvpHeaderRow}>
                <Text style={styles.mvpSubtitle}>Cast Your Vote</Text>
              </View>
              <View style={styles.mvpAvatarsRow}>
                {selectedWorkout.participants.map((participant, idx) => {
                  const voted = selectedWorkout.vote_mvp_user_id === participant.id;
                  const isMVP = selectedWorkout.mvpUserId === participant.id;
                  return (
                    <Pressable
                      key={participant.id}
                      style={styles.mvpAvatarContainer}
                      onPress={() => {
                        handleVote('mvp', selectedWorkout.session.id, participant.id, participant.display_name);
                      }}
                    >
                      {/* Star icon at 4 o'clock if this is the MVP */}
                      {isMVP && (
                        <Ionicons name="star" size={28} color="#FFD600" style={styles.mvpStarIconFourOClock} />
                      )}
                      <View style={styles.mvpAvatarStack}>
                        <View style={styles.mvpAvatarFallback}>
                          <Text style={styles.mvpAvatarInitials}>{getInitials(participant.display_name)}</Text>
                        </View>
                        <Image
                          source={{ uri: getProfilePicThumbNailURL(participant.id) }}
                          style={voted ? [styles.mvpAvatarImage, styles.mvpAvatarVoted] : styles.mvpAvatarImage}
                        />
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </>
          )}
        </View>
        </Pressable>
        </Animated.View>
        
        {/* Trash icon positioned outside the card */}
        {!selectedWorkout.session_trainers_id && showTrash && (
          <Pressable
            style={styles.trashButton}
            onPress={handleDeleteSession}
          >
            <Ionicons name="trash" size={28} color="#FF3B30" />
          </Pressable>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    position: 'relative',
    marginBottom: 32,
  },
  workoutReviewCard: {
    backgroundColor: '#23262F',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  cardPressable: {
    flex: 1,
  },
  workoutCardContent: {
    // The inner card content (header, summary, etc.)
  },
  workoutHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  workoutTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  workoutName: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 2,
  },
  workoutTime: {
    color: "#959C9F",
    fontSize: 14,
    fontWeight: "bold",
  },
  workoutTrainer: {
    color: '#9AAABD',
    fontSize: 14,
    marginTop: 2,
  },
  chevronButton: {
    padding: 4,
    marginLeft: 8,
  },
  trashButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    padding: 8,
    zIndex: 10,
  },
  completedBadgeRowInline: {
    backgroundColor: '#24433E',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginLeft: 10,
  },
  completedBadgeText: {
    color: '#1CE90E',
    fontSize: 14,
    fontWeight: 'bold',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 12,
  },
  workoutSummaryGrid: {
    marginTop: 8,
  },
  workoutSummaryGridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryPillRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  summaryPillIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    backgroundColor: '#23262F',
  },
  summaryPillModule: {
    backgroundColor: '#1A2C22',
  },
  summaryPillLevel: {
    backgroundColor: '#393A1A',
  },
  summaryPillType: {
    backgroundColor: '#2B1A3A',
  },
  summaryPillEnergy: {
    backgroundColor: '#2B2321',
  },
  summaryPillLabel: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  summaryPillLevelNumber: {
    color: '#FFD600',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 4,
  },
  mvpHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mvpSubtitle: {
    color: '#9BA9BD',
    fontSize: 14,
    fontWeight: 'bold',
  },
  mvpAvatarsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  mvpAvatarContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  mvpStarIconFourOClock: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    zIndex: 2,
  },
  mvpAvatarStack: {
    position: 'relative',
    width: 48,
    height: 48,
  },
  mvpAvatarFallback: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#353D45',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  mvpAvatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  mvpAvatarVoted: {
    borderWidth: 2,
    borderColor: '#2563FF',
  },
  mvpAvatarInitials: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 