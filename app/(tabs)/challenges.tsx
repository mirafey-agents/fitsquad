import { View, Text, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { colors, typography, spacing, borderRadius, shadows } from '../constants/theme';

const FEATURED_JOURNEYS = [
  {
    id: '1',
    title: 'Marathon Prep Program',
    trainer: 'Sarah Chen',
    trainerImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop',
    price: 149.99,
    duration: '12 weeks',
    level: 'Intermediate',
    participants: 128,
    rating: 4.9,
    reviews: 86,
    image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=800&auto=format&fit=crop',
    tags: ['Running', 'Endurance', 'Coaching'],
    description: 'Comprehensive 12-week program to prepare you for your first marathon. Includes personalized training plans, nutrition guidance, and weekly check-ins.',
  },
  {
    id: '2',
    title: 'Posture Perfect',
    trainer: 'Mike Ross',
    trainerImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop',
    price: 79.99,
    duration: '4 weeks',
    level: 'All Levels',
    participants: 256,
    rating: 4.8,
    reviews: 124,
    image: 'https://images.unsplash.com/photo-1616699002805-0741e1e4a9c5?q=80&w=800&auto=format&fit=crop',
    tags: ['Posture', 'Mobility', 'Wellness'],
    description: 'Fix your posture and relieve back pain with this specialized program. Perfect for desk workers and anyone looking to improve their posture.',
  },
];

const FREE_CHALLENGES = [
  {
    id: '3',
    title: '30-Day HIIT Challenge',
    trainer: 'Alex Wong',
    participants: 1240,
    duration: '30 days',
    level: 'All Levels',
    image: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=800&auto=format&fit=crop',
    tags: ['HIIT', 'Cardio', 'Weight Loss'],
  },
  {
    id: '4',
    title: '7-Day Mindfulness',
    trainer: 'Emma Chen',
    participants: 890,
    duration: '7 days',
    level: 'Beginner',
    image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=800&auto=format&fit=crop',
    tags: ['Meditation', 'Wellness', 'Mental Health'],
  },
];

const GROUP_CLASSES = [
  {
    id: '5',
    title: 'Morning Yoga Flow',
    trainer: 'Lisa Park',
    trainerImage: 'https://images.unsplash.com/photo-1594751543129-6701ad444259?q=80&w=200&auto=format&fit=crop',
    time: '7:00 AM',
    duration: '60 min',
    price: 15,
    participants: 12,
    maxParticipants: 20,
    level: 'All Levels',
    image: 'https://images.unsplash.com/photo-1599447421416-3414500d18a5?q=80&w=800&auto=format&fit=crop',
    tags: ['Yoga', 'Morning', 'Live'],
  },
  {
    id: '6',
    title: 'Power Hour',
    trainer: 'John Smith',
    trainerImage: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=200&auto=format&fit=crop',
    time: '6:00 PM',
    duration: '45 min',
    price: 12,
    participants: 15,
    maxParticipants: 25,
    level: 'Intermediate',
    image: 'https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?q=80&w=800&auto=format&fit=crop',
    tags: ['HIIT', 'Strength', 'Live'],
  },
];

export default function Challenges() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={[colors.accent.coral, colors.accent.mint]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Discover</Text>
        <Text style={styles.headerSubtitle}>Expert-led programs & live classes</Text>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Featured Programs</Text>
          <Text style={styles.sectionSubtitle}>Transform your fitness journey with expert guidance</Text>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredContainer}
          >
            {FEATURED_JOURNEYS.map((journey, index) => (
              <Animated.View
                key={journey.id}
                entering={FadeInUp.delay(index * 200)}
                style={styles.featuredCard}
              >
                <Image source={{ uri: journey.image }} style={styles.featuredImage} />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.8)']}
                  style={styles.imageOverlay}
                />
                
                <View style={styles.featuredContent}>
                  <View style={styles.featuredHeader}>
                    <View style={styles.trainerInfo}>
                      <Image source={{ uri: journey.trainerImage }} style={styles.trainerImage} />
                      <Text style={styles.trainerName}>{journey.trainer}</Text>
                    </View>
                    <BlurView intensity={80} style={styles.priceBadge}>
                      <Text style={styles.priceText}>${journey.price}</Text>
                    </BlurView>
                  </View>

                  <Text style={styles.featuredTitle}>{journey.title}</Text>
                  
                  <View style={styles.featuredStats}>
                    <View style={styles.statItem}>
                      <Ionicons name="time-outline" size={16} color={colors.primary.light} />
                      <Text style={styles.statText}>{journey.duration}</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Ionicons name="star" size={16} color={colors.primary.light} />
                      <Text style={styles.statText}>{journey.rating} ({journey.reviews})</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Ionicons name="fitness-outline" size={16} color={colors.primary.light} />
                      <Text style={styles.statText}>{journey.level}</Text>
                    </View>
                  </View>

                  <View style={styles.tagContainer}>
                    {journey.tags.map((tag) => (
                      <BlurView key={tag} intensity={80} style={styles.tag}>
                        <Text style={styles.tagText}>{tag}</Text>
                      </BlurView>
                    ))}
                  </View>

                  <Text style={styles.description} numberOfLines={2}>
                    {journey.description}
                  </Text>

                  <Pressable 
                    style={styles.enrollButton}
                    onPress={() => {
                      // Handle enrollment
                    }}
                  >
                    <Text style={styles.enrollButtonText}>Enroll Now</Text>
                    <Ionicons name="arrow-forward" size={20} color={colors.primary.light} />
                  </Pressable>
                </View>
              </Animated.View>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Free Challenges</Text>
          <Text style={styles.sectionSubtitle}>Join community challenges and track your progress</Text>
          
          {FREE_CHALLENGES.map((challenge, index) => (
            <Animated.View
              key={challenge.id}
              entering={FadeInUp.delay(300 + index * 100)}
            >
              <Pressable style={styles.challengeCard}>
                <Image source={{ uri: challenge.image }} style={styles.challengeImage} />
                <View style={styles.challengeContent}>
                  <View style={styles.challengeHeader}>
                    <View>
                      <Text style={styles.challengeTitle}>{challenge.title}</Text>
                      <Text style={styles.challengeTrainer}>with {challenge.trainer}</Text>
                    </View>
                    <BlurView intensity={80} style={styles.freeBadge}>
                      <Text style={styles.freeText}>Free</Text>
                    </BlurView>
                  </View>

                  <View style={styles.challengeStats}>
                    <View style={styles.statItem}>
                      <Ionicons name="time-outline" size={14} color={colors.gray[500]} />
                      <Text style={styles.challengeStatText}>{challenge.duration}</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Ionicons name="people-outline" size={14} color={colors.gray[500]} />
                      <Text style={styles.challengeStatText}>{challenge.participants} joined</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Ionicons name="fitness-outline" size={14} color={colors.gray[500]} />
                      <Text style={styles.challengeStatText}>{challenge.level}</Text>
                    </View>
                  </View>

                  <View style={styles.tagContainer}>
                    {challenge.tags.map((tag) => (
                      <View key={tag} style={styles.challengeTag}>
                        <Text style={styles.challengeTagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </Pressable>
            </Animated.View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Live Group Classes</Text>
          <Text style={styles.sectionSubtitle}>Join live sessions with friends and trainers</Text>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.classesContainer}
          >
            {GROUP_CLASSES.map((classItem, index) => (
              <Animated.View
                key={classItem.id}
                entering={FadeInUp.delay(500 + index * 100)}
                style={styles.classCard}
              >
                <Image source={{ uri: classItem.image }} style={styles.classImage} />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.8)']}
                  style={styles.classOverlay}
                />
                
                <View style={styles.classContent}>
                  <View style={styles.classHeader}>
                    <BlurView intensity={80} style={styles.liveTag}>
                      <View style={styles.liveDot} />
                      <Text style={styles.liveText}>Live</Text>
                    </BlurView>
                    <BlurView intensity={80} style={styles.classPriceBadge}>
                      <Text style={styles.classPriceText}>${classItem.price}</Text>
                    </BlurView>
                  </View>

                  <View style={styles.classInfo}>
                    <Text style={styles.classTitle}>{classItem.title}</Text>
                    <View style={styles.trainerInfo}>
                      <Image source={{ uri: classItem.trainerImage }} style={styles.classTrainerImage} />
                      <Text style={styles.classTrainerName}>{classItem.trainer}</Text>
                    </View>

                    <View style={styles.classStats}>
                      <View style={styles.statItem}>
                        <Ionicons name="time-outline" size={16} color={colors.primary.light} />
                        <Text style={styles.classStatText}>{classItem.time}</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Ionicons name="people-outline" size={16} color={colors.primary.light} />
                        <Text style={styles.classStatText}>
                          {classItem.participants}/{classItem.maxParticipants}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.tagContainer}>
                      {classItem.tags.map((tag) => (
                        <BlurView key={tag} intensity={80} style={styles.classTag}>
                          <Text style={styles.classTagText}>{tag}</Text>
                        </BlurView>
                      ))}
                    </View>

                    <Pressable style={styles.joinButton}>
                      <Text style={styles.joinButtonText}>Join Class</Text>
                      <Ionicons name="arrow-forward" size={20} color={colors.primary.light} />
                    </Pressable>
                  </View>
                </View>
              </Animated.View>
            ))}
          </ScrollView>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.light,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: typography.size['3xl'],
    fontWeight: typography.weight.bold as any,
    color: colors.primary.dark,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: typography.size.lg,
    color: colors.primary.dark,
    opacity: 0.8,
  },
  content: {
    flex: 1,
    marginTop: -20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: colors.primary.light,
    paddingTop: 20,
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold as any,
    color: colors.primary.dark,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: typography.size.md,
    color: colors.gray[500],
    marginBottom: 20,
  },
  featuredContainer: {
    paddingBottom: 16,
  },
  featuredCard: {
    width: 300,
    height: 480,
    marginRight: 16,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: colors.primary.dark,
    ...shadows.lg,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
  },
  featuredContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  featuredHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  trainerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trainerImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  trainerName: {
    fontSize: typography.size.sm,
    color: colors.primary.light,
    fontWeight: typography.weight.medium as any,
  },
  priceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  priceText: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold as any,
    color: colors.primary.light,
  },
  featuredTitle: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold as any,
    color: colors.primary.light,
    marginBottom: 12,
  },
  featuredStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: typography.size.sm,
    color: colors.primary.light,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  tagText: {
    fontSize: typography.size.sm,
    color: colors.primary.light,
  },
  description: {
    fontSize: typography.size.sm,
    color: colors.primary.light,
    opacity: 0.8,
    marginBottom: 16,
  },
  enrollButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.accent.coral,
    paddingVertical: 12,
    borderRadius: borderRadius.lg,
  },
  enrollButtonText: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold as any,
    color: colors.primary.light,
  },
  challengeCard: {
    flexDirection: 'row',
    backgroundColor: colors.primary.light,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    ...shadows.md,
  },
  challengeImage: {
    width: 120,
    height: 160,
  },
  challengeContent: {
    flex: 1,
    padding: 16,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  challengeTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold as any,
    color: colors.primary.dark,
    marginBottom: 4,
  },
  challengeTrainer: {
    fontSize: typography.size.sm,
    color: colors.gray[500],
  },
  freeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    backgroundColor: `${colors.semantic.success}20`,
  },
  freeText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold as any,
    color: colors.semantic.success,
  },
  challengeStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  challengeStatText: {
    fontSize: typography.size.sm,
    color: colors.gray[500],
  },
  challengeTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    backgroundColor: colors.gray[100],
  },
  challengeTagText: {
    fontSize: typography.size.sm,
    color: colors.primary.dark,
  },
  classesContainer: {
    paddingBottom: 16,
  },
  classCard: {
    width: 280,
    height: 400,
    marginRight: 16,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: colors.primary.dark,
    ...shadows.lg,
  },
  classImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  classOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
  },
  classContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.semantic.error,
  },
  liveText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold as any,
    color: colors.semantic.error,
  },
  classPriceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  classPriceText: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold as any,
    color: colors.primary.light,
  },
  classInfo: {
    gap: 12,
  },
  classTitle: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold as any,
    color: colors.primary.light,
  },
  classTrainerImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  classTrainerName: {
    fontSize: typography.size.sm,
    color: colors.primary.light,
    fontWeight: typography.weight.medium as any,
  },
  classStats: {
    flexDirection: 'row',
    gap: 16,
  },
  classStatText: {
    fontSize: typography.size.sm,
    color: colors.primary.light,
  },
  classTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  classTagText: {
    fontSize: typography.size.sm,
    color: colors.primary.light,
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.accent.mint,
    paddingVertical: 12,
    borderRadius: borderRadius.lg,
    marginTop: 16,
  },
  joinButtonText: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold as any,
    color: colors.primary.light,
  },
});