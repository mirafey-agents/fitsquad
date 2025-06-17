import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/theme';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import { rzpCreateOrder, getSubscriptionPlans } from '@/utils/firebase';
import { loadRazorpayScript } from '@/utils/loadRazorpay';

declare let Razorpay: any;

interface SubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  userId: string;
  role: string;
}

export default function SubscriptionModal({ visible, onClose, userId, role }: SubscriptionModalProps) {
  const [plans, setPlans] = useState([]);
  
  useEffect(() => {
    getSubscriptionPlans({role}).then(plans => {
      setPlans(plans as []);
    });
  }, []);

  const handlePurchase = async (billingPlan: string) => {
    try {
      await loadRazorpayScript();
      const response: any = await rzpCreateOrder({userId, billingPlan});
      const options = {
        key: 'rzp_live_8fckgFR5JV9x13',
        order_id: response.id,
        name: 'MyFitWave',
        description: plans.filter(x=>x.id == billingPlan)[0].name,
        image: 'https://www.myfitwave.com/assets/images/logo_with_text_1024.svg',
        handler(response) {
          console.log('handler', response);
          router.push('./', {relativeToDirectory: true})
        },
        prefill: {},
        notes: {userId, billingPlan},
        theme: {color: colors.primary.dark}
      };
  
      const rzp1 = new Razorpay(options);
      rzp1.open();
    } catch (error) {
      console.error('Error creating order:', error);
      Alert.alert('Error', 'Failed to create payment order. Please try again.');
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <BlurView intensity={80} tint="dark" style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Choose Your Plan</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#94A3B8" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.plansList}>
            {plans.map((plan) => (
              <View key={plan.id} style={styles.planCard}>
                <View style={styles.planInfo}>
                  <Text style={styles.planName}>{plan.name}</Text>
                  {plan.validityDays>0 && (<Text style={styles.planName}>{Math.round(plan.validityDays/31)} month</Text>)}
                  {plan.amount>0 && (<Text style={styles.planPrice}>₹{plan.amount}</Text>)}
                  <Text style={styles.planValidity}>{plan.description}</Text>
                </View>
                {plan.amount > 0 && (
                  <TouchableOpacity 
                    style={styles.purchaseButton}
                    onPress={() => handlePurchase(plan.id)}
                  >
                    <Text style={styles.purchaseButtonText}>Go!</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
  },
  modalContent: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  plansList: {
    marginBottom: 20,
  },
  planCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 28,
    fontWeight: '700',
    color: '#818CF8',
    marginBottom: 4,
  },
  planValidity: {
    fontSize: 14,
    color: '#94A3B8',
  },
  purchaseButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  purchaseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 